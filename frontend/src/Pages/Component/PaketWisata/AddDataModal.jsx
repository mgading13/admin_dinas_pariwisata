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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama_wisata: "",
    lokasi: "",
    harga: "",
    deskripsi: "",
    kontak: "",
    media: "",
  });

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

  const formatCurrency = (value) => {
    if (!value) return "";
    return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatPhoneDisplay = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, "").slice(0, 12); // max 12 digit
    return cleaned.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) =>
      c ? `${a}-${b}-${c}` : `${a}-${b}`
    );
  };

  const formatPhoneToDB = (value) => {
    if (!value) return "";
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
    return cleaned;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "harga") {
      const raw = value.replace(/\D/g, "");
      setForm({
        ...form,
        harga: raw,
        hargaDisplay: formatCurrency(raw),
      });
      return;
    }

    if (name === "kontak") {
      const raw = value.replace(/\D/g, ""); // remove non numbers
      setForm({
        ...form,
        kontak: formatPhoneDisplay(raw), // UI
        kontak_raw: raw, // storage
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, media: file });
  };

  const handleSubmit = async (e) => {
    const kontakDB = formatPhoneToDB(form.kontak_raw);
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nama_wisata", form.nama_wisata);
      formData.append("lokasi", form.lokasi);
      formData.append("deskripsi", form.deskripsi);
      formData.append("harga", form.harga);
      formData.append("kontak", kontakDB);
      formData.append("media", form.media);

      // 🟢 Mode Tambah
      const res = await axios.post(
        "http://localhost:3000/api/tourPackage/insert",
        formData
      );
      toast.success("Data berhasil ditambahkan!");
      navigate("/admin/paket-wisata");
      onClose();
      console.log("Add success:", res.data);

      refreshData?.();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menyimpan data!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Wisata" : "Tambah Data Wisata"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Jenis Wisata */}
          <div>
            <Label>Nama Wisata</Label>
            <Input
              name="nama_wisata"
              value={form.nama_wisata}
              onChange={handleChange}
              placeholder="Masukkan nama wisata"
              required
            />
          </div>
          <div>
            <Label>Lokasi</Label>
            <Input
              name="lokasi"
              value={form.lokasi}
              onChange={handleChange}
              placeholder="Masukkan lokasi wisata"
              required
            />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Tuliskan deskripsi tentang wisata..."
              required
            />
          </div>

          <div>
            <Label>Harga (Rp)</Label>
            <Input
              name="harga"
              value={form.hargaDisplay ?? ""}
              onChange={handleChange}
              placeholder="Masukkan Harga Paket Wisata"
              required
            />
          </div>

          <div>
            <Label>Kontak</Label>
            <Input
              name="kontak"
              value={form.kontak}
              onChange={handleChange}
              placeholder="Masukkan Kontak Paket Wisata"
              required
            />
          </div>

          {/* Foto */}
          <div>
            <Label>Foto</Label>
            <Input
              name="media"
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              required={!initialData}
            />
            {form.media && typeof form.media === "string" && (
              <img
                src={form.media}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded-md border"
              />
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {initialData ? "Simpan Perubahan" : "Tambah Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataModal;
