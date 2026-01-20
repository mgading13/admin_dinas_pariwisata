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
import debounce from "lodash.debounce";
import axios from "axios";
import { toast } from "sonner";

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    namaDesa_id: "",
    namaDesa_en: "",
    lokasi_id: "",
    lokasi_en: "",
    deskripsi_id: "",
    deskripsi_en: "",
    foto: "",
    longitude: "",
    latitude: "",
    jenisDesa: "",
  });
  
  // --- START LOGIKA DEBOUNCE ---
  const translateText = async (text, fieldTarget) => {
    if (!text || text.length < 3) return;
    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURI(text)}`
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
    []
  );
  // --- END LOGIKA DEBOUNCE ---

  useEffect(() => {
    if (open) {
      setLoading(false);
    if (initialData) {
      setForm({
        namaDesa_id: initialData.namaDesa_id || "",
        namaDesa_en: initialData.namaDesa_en || "",
        lokasi_id: initialData.lokasi_id || "",
        lokasi_en: initialData.lokasi_en || "",
        deskripsi_id: initialData.deskripsi_id || "",
        deskripsi_en: initialData.deskripsi_en || "",
        foto: initialData.foto || "",
        longitude: initialData.longitude || "",
        latitude: initialData.latitude || "",
        jenisDesa: initialData.jenisDesa || "",
      });
    } else {
      setForm({
        namaDesa_id: "",
        lokasi_id: "",
        deskripsi_id: "",
        foto: "",
        longitude: "",
        latitude: "",
        jenisDesa: "",
      });
    }}
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // PERUBAHAN DI SINI: Trigger translate saat edit kolom Indonesia
    if (name === "namaDesa_id") debouncedTranslate(value, "namaDesa_en");
    if (name === "lokasi_id") debouncedTranslate(value, "lokasi_en");
    if (name === "deskripsi_id") debouncedTranslate(value, "deskripsi_en");
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, foto: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Proteksi agar ID tidak undefined
    if (!initialData?.id) {
      toast.error("ID data tidak ditemukan!");
      return;
    } 
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      // OTOMATISASI: Mengisi field _en dengan nilai dari field _id
      formData.append("namaDesa_id", form.namaDesa_id);
      formData.append("namaDesa_en", form.namaDesa_en); // Otomatis sama
      
      formData.append("lokasi_id", form.lokasi_id);
      formData.append("lokasi_en", form.lokasi_en); // Otomatis sama

      formData.append("deskripsi_id", form.deskripsi_id);
      formData.append("deskripsi_en", form.deskripsi_en); // Otomatis sama

      // 👉 FIX TERPENTING
      if (form.foto && typeof form.foto === "object") {
        formData.append("foto", form.foto);
      }

      formData.append("longitude", form.longitude);
      formData.append("latitude", form.latitude);
      formData.append("jenisDesa", form.jenisDesa);

      const res = await axios.patch(
        `http://localhost:3000/api/desaWisata/${initialData.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log("respons backend", res.data);
      toast.success("Data berhasil ditambahkan!");
      refreshData?.();
      onClose();
    } catch (error) {
      // Untuk melihat detail kenapa 400 Bad Request
      console.error("Detail Error Backend:", error.response?.data);
      toast.error("Gagal menyimpan data!");
    } finally {-
      setLoading(false); // Button kembali ke "Simpan Perubahan"
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
                name="namaDesa_id"
                value={form.namaDesa_id}
                onChange={handleChange}
                placeholder="Masukkan nama desa"
                className="w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Lokasi</Label>
              <Input
                name="lokasi_id"
                value={form.lokasi_id}
                onChange={handleChange}
                placeholder="Masukkan lokasi desa wisata"
                className="w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Deskripsi</Label>
              <Textarea
                name="deskripsi_id"
                value={form.deskripsi_id}
                onChange={handleChange}
                placeholder="Tulis deskripsi desa wisata..."
                className="w-full resize-none break-all whitespace-pre-wrap overflow-x-hidden"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Latitude</Label>
              <Input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="Masukkan koordinat latitude desa wisata"
                className="w-full"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Longitude</Label>
              <Input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="Masukkan koordinat longitude desa wisata"
                className="w-full"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Select
                name="jenisDesa"
                value={form.jenisDesa || ""}
                onValueChange={(value) =>
                  handleChange({ target: { name: "jenisDesa", value } })
                }
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
              <Label>Foto</Label>
              <Input
                name="foto"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full"
              />
              {form.foto && typeof form.foto === "string" && (
                <img
                  src={`http://localhost:3000${form.foto}`}
                  alt="Preview"
                  className="mt-2 w-24 h-24 object-cover rounded-md border"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataModal;
