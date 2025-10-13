import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

const EditDataModal = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    jenisWisata: "",
    lokasi: "",
    deskripsi: "",
    harga: "",
    foto: null,
  });

  // Isi otomatis form jika sedang edit
  useEffect(() => {
    if (initialData) {
      setForm({
        jenisWisata: initialData.jenisWisata || "",
        lokasi: initialData.lokasi || "",
        deskripsi: initialData.deskripsi || "",
        harga: initialData.harga || "",
        foto: initialData.foto || null,
      });
    } else {
      setForm({
        jenisWisata: "",
        lokasi: "",
        deskripsi: "",
        harga: "",
        foto: null,
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "foto") setForm({ ...form, foto: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Data Wisata</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Jenis Wisata</Label> 
            <Input
              name="jenisWisata"
              value={form.jenisWisata}
              onChange={handleChange}
              placeholder="Masukkan jenis wisata"
            />
          </div>

          <div>
            <Label>Lokasi</Label>
            <Input
              name="lokasi"
              value={form.lokasi}
              onChange={handleChange}
              placeholder="Masukkan lokasi wisata"
            />
          </div>

          <div>
            <Label>Deskripsi</Label>
            <Textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Tulis deskripsi wisata..."
            />
          </div>

          <div>
            <Label>Harga</Label>
            <Input
              name="harga"
              type="number"
              value={form.harga}
              onChange={handleChange}
              placeholder="Masukkan harga wisata"
            />
          </div>

          <div>
            <Label>Foto</Label>
            <Input
              name="foto"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
            {form.foto && typeof form.foto === "string" && (
              <img
                src={form.foto}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded-md border"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
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
