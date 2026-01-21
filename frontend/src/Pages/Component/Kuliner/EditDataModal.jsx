import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import debounce from "lodash.debounce";

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama_makanan: "",
    lokasi: "",
    deskripsi_id: "",
    deskripsi_en: "",
    foto: "",
  });

  // --- START LOGIKA DEBOUNCE ---
  const translateText = async (text, fieldTarget) => {
    if (!text || text.length < 3) return;
    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURI(text)}`,
      );
      // PERBAIKAN: Jangan cuma ambil [0][0][0]
      // Kita looping semua potongan kalimat yang dipisah oleh titik/newline
      if (res.data && res.data[0]) {
        const fullTranslation = res.data[0]
          .map((item) => item[0]) // Ambil hasil translasinya saja
          .filter((item) => item !== null) // Buang yang kosong
          .join(" "); // Gabungkan kembali menjadi satu paragraf utuh

        setForm((prev) => ({ ...prev, [fieldTarget]: fullTranslation }));
      }
    } catch (error) {
      console.error("Translate error:", error);
    }
  };

  const debouncedTranslate = useCallback(
    debounce((text, fieldTarget) => {
      translateText(text, fieldTarget);
    }, 1500),
    [],
  );
  // --- END LOGIKA DEBOUNCE ---

  useEffect(() => {
    if (initialData) {
      setForm({
        nama_makanan: initialData.nama_makanan || "",
        lokasi: initialData.lokasi || "",
        deskripsi_id: initialData.deskripsi_id || "",
        deskripsi_en: initialData.deskripsi_en || "",
        foto: initialData.foto || "",
      });
    } else {
      setForm({
        nama_makanan: "",
        lokasi: "",
        deskripsi_id: "",
        foto: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // PERUBAHAN DI SINI: Trigger translate saat edit kolom Indonesia
    if (name === "deskripsi_id") {
      debouncedTranslate(value, "deskripsi_en");
    }
  };

   const handlePhoto = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, foto: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nama_makanan", form.nama_makanan);
      formData.append("lokasi", form.lokasi);
      formData.append("deskripsi_id", form.deskripsi_id);
      formData.append("deskripsi_en", form.deskripsi_en);

      // Hanya append foto jika user memilih file baru (berupa object)
      if (form.foto && typeof form.foto === "object") {
        formData.append("foto", form.foto);
      }

      const res = await axios.patch(
        `http://localhost:3000/api/kuliner/${initialData.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log("initialData di modal:", initialData);

      console.log("Add success:", res.data);
      toast.success("Data kuliner berhasil ditambahkan!");

      refreshData?.();
      onClose();
      navigate("/admin/kuliner");
    } catch (error) {
      console.error("Error:", error);
      // Untuk melihat detail kenapa 400 Bad Request
      console.error("Detail Error Backend:", error.response?.data);
      toast.error("Gagal menyimpan data kuliner!");
    } finally {
      // --- INI BAGIAN TERPENTING ---
      setLoading(false); // Button kembali ke "Simpan Perubahan"
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Kuliner" : "Tambah Data Kuliner"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4 mt-4">
          {/* Nama Makanan */}
          <div className="flex flex-col gap-2">
            <Label>Nama Makanan</Label>
            <Input
              name="nama_makanan"
              value={form.nama_makanan}
              onChange={handleChange}
              placeholder="Masukkan nama makanan"
              required
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Daerah</Label>
            <Input
              name="lokasi"
              value={form.lokasi}
              onChange={handleChange}
              placeholder="Masukkan asal daerah makanan"
              required
              className="w-full"
            />
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-2">
            <Label>Deskripsi</Label>
            <Textarea
              name="deskripsi_id"
              value={form.deskripsi_id}
              onChange={handleChange}
              placeholder="Tuliskan deskripsi makanan..."
              required
              className="w-full resize-none break-all whitespace-pre-wrap overflow-x-hidden"
            />
          </div>

          {/* Foto */}
          <div className="flex flex-col gap-2">
              <Label>Foto / Video</Label>

              <Input
                name="foto"
                type="file"
                accept="image/*,video/*"
                onChange={handlePhoto}
                className="w-full"
              />

              {/* PREVIEW FILE LAMA */}
              {form.foto &&
                typeof form.foto === "string" &&
                (form.foto.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={`http://localhost:3000${form.foto}`}
                    controls
                    className="mt-2 w-32 h-32 rounded-md border object-cover"
                  />
                ) : (
                  <img
                    src={`http://localhost:3000${form.foto}`}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-md border"
                  />
                ))}

              {/* PREVIEW FILE BARU */}
              {form.foto &&
                typeof form.foto === "object" &&
                (form.foto.type.startsWith("video/") ? (
                  <video
                    src={URL.createObjectURL(form.foto)}
                    controls
                    className="mt-2 w-32 h-32 rounded-md border object-cover"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(form.foto)}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-md border"
                  />
                ))}
            </div>

          {/* Tombol */}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {initialData ? "Simpan Perubahan" : "Tambah Data"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataModal;
