import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [form, setForm] = useState({
    nama_wisata: "",
    lokasi: "",
    deskripsi: "",
    harga: "",
    kontak: "",
    media: "",
  });

  // Isi otomatis form jika sedang edit
  useEffect(() => {
    if (initialData) {
      setForm({
        nama_wisata: initialData.nama_wisata || "",
        lokasi: initialData.lokasi || "",
        deskripsi: initialData.deskripsi || "",
        harga: initialData.harga || "",
        kontak: initialData.kontak || "",
        media: initialData.media || "",
      });
    } else {
      setForm({
        nama_wisata: "",
        lokasi: "",
        deskripsi: "",
        harga: "",
        kontak: "",
        media: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media") setForm({ ...form, media: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("nama_wisata", form.nama_wisata);
      formData.append("lokasi", form.lokasi);
      formData.append("deskripsi", form.deskripsi);
      formData.append("harga", form.harga);
      formData.append("kontak", form.kontak);
      formData.append("media", form.media);

      console.log("🟡 Mengirim data edit ke backend:", form);

      const res = await axios.patch(
        `http://localhost:3000/api/tourPackage/${initialData.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("🟢 Respons backend:", res.data);
      toast.success("Paket Wisata berhasil diperbarui!");
      await refreshData?.();
      onClose();
    } catch (error) {
      console.error("❌ Gagal memperbarui data:", error);
      toast.error("Gagal memperbarui Paket Wisata!");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Paket Wisata</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label>Nama Wisata</Label> 
            <Input
              name="nama_wisata"
              value={form.nama_wisata}
              onChange={handleChange}
              placeholder="Masukkan jenis wisata"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Lokasi</Label> 
            <Input
              name="lokasi"
              value={form.lokasi}
              onChange={handleChange}
              placeholder="Masukkan lokasi wisata"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Deskripsi</Label>
            <Textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Tulis deskripsi wisata..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Harga</Label>
            <Input
              name="harga"
              type="number"
              value={form.harga}
              onChange={handleChange}
              placeholder="Masukkan harga wisata"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Kontak</Label>
            <Input
              name="kontak"
              type="number"
              value={form.kontak}
              onChange={handleChange}
              placeholder="Masukkan kontak paket wisata"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Foto</Label>
            <Input
              name="media"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
            {form.media && typeof form.media === "string" && (
              <img
                src={`http://localhost:3000${form.media}`}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded-md border"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Simpan Perubahan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataModal;
