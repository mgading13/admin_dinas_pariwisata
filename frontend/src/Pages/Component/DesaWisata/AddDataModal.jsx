import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import debounce from "lodash.debounce";

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [loading, setLoading] = useState(false); // 1. Tambah state loading

  const [form, setForm] = useState({
    namaDesa: "",
    namaDesa_en: "",
    lokasi: "",
    lokasi_en: "",
    deskripsi: "",
    deskripsi_en: "",
    foto: "",
    longitude: "",
    latitude: "",
    jenisDesa: "",
  });

  // --- LOGIKA DEBOUNCE TRANSLATE ---

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
    }, 1500), // Tunggu 1 detik setelah berhenti mengetik
    [],
  );

  // --- END LOGIKA DEBOUNCE ---

  useEffect(() => {
    if (initialData) {
      setForm({
        // 2. Ambil dari kolom _id karena itu versi Indonesianya
        namaDesa: initialData.namaDesa_id || "",
        namaDesa_en: initialData.namaDesa_en || "",
        lokasi: initialData.lokasi_id || "",
        lokasi_en: initialData.lokasi_en || "",
        deskripsi: initialData.deskripsi_id || "",
        deskripsi_en: initialData.deskripsi_en || "",
        foto: initialData.foto || "",
        longitude: initialData.longitude || "",
        latitude: initialData.latitude || "",
        jenisDesa: initialData.jenisDesa || "",
      });
    } else {
      setForm({
        namaDesa: "",
        namaDesa_en: "",
        lokasi: "",
        lokasi_en: "",
        deskripsi: "",
        deskripsi_en: "",
        foto: "",
        longitude: "",
        latitude: "",
        jenisDesa: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Trigger Debounce Translate jika yang diketik kolom ID
    if (name === "namaDesa") debouncedTranslate(value, "namaDesa_en");
    if (name === "lokasi") debouncedTranslate(value, "lokasi_en");
    if (name === "deskripsi") debouncedTranslate(value, "deskripsi_en");
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, foto: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 3. Mulai loading
    try {
      const formData = new FormData();
      // Kirim field sesuai yang diminta Prisma (ID dan EN)
      formData.append("namaDesa_id", form.namaDesa);
      formData.append("namaDesa_en", form.namaDesa_en);
      formData.append("lokasi_id", form.lokasi);
      formData.append("lokasi_en", form.lokasi_en);
      formData.append("deskripsi_id", form.deskripsi);
      formData.append("deskripsi_en", form.deskripsi_en);

      // 👉 FIX TERPENTING
      if (form.foto && typeof form.foto === "object") {
        formData.append("foto", form.foto);
      }

      formData.append("longitude", form.longitude);
      formData.append("latitude", form.latitude);
      formData.append("jenisDesa", form.jenisDesa);

      const res = await axios.post(
        "http://localhost:3000/api/desaWisata/insert",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log("Response:", res.data);
      toast.success("Data berhasil ditambahkan!");
      refreshData?.();
      onClose();
    } catch (error) {
      console.error("Error:", error.response?.data);
      toast.error("Gagal menyimpan data!");
    } finally {
      setLoading(false); // Matikan loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Desa Wisata" : "Tambah Data Desa Wisata"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Desa</Label>
              <Input
                name="namaDesa"
                value={form.namaDesa}
                onChange={handleChange}
                placeholder="Masukkan nama desa"
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Lokasi</Label>
              <Input
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                placeholder="Masukkan lokasi desa wisata"
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Deskripsi</Label>
              <Textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                placeholder="Tulis deskripsi desa wisata..."
                required
                className="w-full resize-none break-all whitespace-pre-wrap overflow-x-hidden"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Latitude</Label>
              <Input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="Masukkan koordinat latitude desa wisata"
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Longitude</Label>
              <Input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="Masukkan koordinat longitude desa wisata"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Select
                name="jenisDesa"
                value={form.jenisDesa || ""}
                onValueChange={(value) =>
                  handleChange({ target: { name: "jenisDesa", value } })
                }
                required
              >
                <SelectTrigger className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm">
                  <SelectValue placeholder="Jenis Desa" />
                </SelectTrigger>
                <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem className="text-md" value="DESA_WISATA">
                    Desa Wisata
                  </SelectItem>
                  <SelectItem className="text-md" value="DESA_UNGGULAN">
                    Wisata Unggulan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Foto / Video</Label>

              <Input
                name="foto"
                type="file"
                accept="image/*,video/*"
                onChange={handlePhoto}
                required={!initialData}
                className="w-full"
              />

              {/* Preview file lama */}
              {form.foto &&
                typeof form.foto === "string" &&
                (form.foto.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={form.foto}
                    controls
                    className="mt-2 w-32 h-32 rounded-md border object-cover"
                  />
                ) : (
                  <img
                    src={form.foto}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-md border"
                  />
                ))}

              {/* Preview file baru */}
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

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button onClick={handleSubmit}>
                {initialData ? "Simpan Perubahan" : "Tambah Data"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataModal;
