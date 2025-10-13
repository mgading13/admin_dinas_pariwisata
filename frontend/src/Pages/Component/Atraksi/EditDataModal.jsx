import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

const EditDataModal = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    namaAtraksi: "",
    deskripsi: "",
    foto: null,
    tanggalMulai: "",
    tanggalBerakhir: "",
    lokasi: "",
  });

  // isi otomatis form jika sedang edit
  useEffect(() => {
    if (initialData) {
      setForm({
        namaAtraksi: initialData.namaAtraksi || "",
        deskripsi: initialData.deskripsi || "",
        foto: initialData.foto || null,
        tanggalMulai: initialData.tanggalMulai || "",
        tanggalBerakhir: initialData.tanggalBerakhir || "",
        lokasi: initialData.lokasi || "",
      });
    } else {
      setForm({
        namaAtraksi: "",
        deskripsi: "",
        foto: null,
        tanggalMulai: "",
        tanggalBerakhir: "",
        lokasi: "",
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
          <DialogTitle>Edit Data Atraksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Nama Atraksi</Label>
            <Input
              name="namaAtraksi"
              value={form.namaAtraksi}
              onChange={handleChange}
              placeholder="Masukkan nama atraksi"
            />
          </div>

          <div>
            <Label>Deskripsi</Label>
            <Textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Tulis deskripsi atraksi..."
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

          <div>
            <Label>Tanggal Mulai</Label>
            <Input
              name="tanggalMulai"
              type="date"
              value={form.tanggalMulai}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Tanggal Berakhir</Label>
            <Input
              name="tanggalBerakhir"
              type="date"
              value={form.tanggalBerakhir}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Lokasi</Label>
            <Input
              name="lokasi"
              value={form.lokasi}
              onChange={handleChange}
              placeholder="Masukkan lokasi atraksi"
            />
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
