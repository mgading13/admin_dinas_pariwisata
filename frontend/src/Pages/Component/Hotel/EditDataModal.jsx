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
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [form, setForm] = useState({
    nama_hotel: "",
    lokasi: "",
    jumlah_kamar: "",
    jumlah_tempatTidur: "",
    harga: "",
    website: "",
    link_gmaps: "",
    telepon: "",
    foto: "",
  });

  useEffect(() => {
    if (initialData) {
      const rawHarga = initialData.harga?.toString() || "";
      const formattedHarga = formatToRupiah(rawHarga);

      setForm({
        nama_hotel: initialData.nama_hotel || "",
        lokasi: initialData.lokasi || "",
        jumlah_kamar: initialData.jumlah_kamar || "",
        jumlah_tempatTidur: initialData.jumlah_tempatTidur || "",
        harga: rawHarga,
        hargaDisplay: formattedHarga,
        website: initialData.website || "",
        link_gmaps: initialData.link_gmaps || "",
        telepon: initialData.telepon || "",
        foto: initialData.foto || "",
      });
    } else {
      setForm({
        nama_hotel: "",
        lokasi: "",
        jumlah_kamar: "",
        jumlah_tempatTidur: "",
        harga: "",
        hargaDisplay: "",
        website: "",
        link_gmaps: "",
        telepon: "",
        foto: "",
      });
    }
  }, [initialData, open]);

  const formatToRupiah = (num) => {
    if (!num) return "";
    return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const extractNumber = (str) => {
    if (!str) return "";
    return str.replace(/\D/g, ""); // hapus semua kecuali angka
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "harga") {
      const raw = extractNumber(value); // angka bersih
      setForm({
        ...form,
        harga: raw,
        hargaDisplay: formatToRupiah(raw),
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, foto: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("nama_hotel", form.nama_hotel);
      formData.append("lokasi", form.lokasi);
      formData.append("jumlah_kamar", form.jumlah_kamar);
      formData.append("jumlah_tempatTidur", form.jumlah_tempatTidur);
      formData.append("harga", form.harga);
      formData.append("website", form.website);
      formData.append("link_gmaps", form.link_gmaps);
      formData.append("telepon", form.telepon);
      if (form.foto && typeof form.foto === "object") {
        formData.append("foto", form.foto);
      }

      const res = await axios.patch(
        `http://localhost:3000/api/hotel/${initialData.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Response:", res.data);
      toast.success("Data berhasil ditambahkan!");
      refreshData?.();
      onClose();
    } catch (error) {
      console.error("Error:", error.response?.data);
      toast.error("Gagal menyimpan data!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Hotel" : "Tambah Data Hotel"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Hotel</Label>
              <Input
                name="nama_hotel"
                value={form.nama_hotel}
                onChange={handleChange}
                placeholder="Masukkan nama hotel"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Lokasi</Label>
              <Input
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                placeholder="Masukkan lokasi hotel"
                required
              />
            </div>


            <div className="flex flex-col gap-2">
              <Label>Jumlah Kamar</Label>
              <Input
                type="number"
                name="jumlah_kamar"
                value={form.jumlah_kamar}
                onChange={handleChange}
                placeholder="Masukkan jumlah kamar"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Jumlah Tempat Tidur</Label>
              <Input
                type="number"
                name="jumlah_tempatTidur"
                value={form.jumlah_tempatTidur}
                onChange={handleChange}
                placeholder="Masukkan jumlah tempat tidur"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Harga per Malam</Label>
              <Input
                name="harga"
                value={form.hargaDisplay}
                onChange={handleChange}
                placeholder="Masukkan harga per malam"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Website</Label>
              <Input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="Masukkan website hotel"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Link Google Maps</Label>
              <Input
                name="link_gmaps"
                value={form.link_gmaps}
                onChange={handleChange}
                placeholder="Masukkan link Google Maps"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>No. Telepon</Label>
              <Input
                name="telepon"
                value={form.telepon}
                onChange={handleChange}
                placeholder="Masukkan nomor telepon hotel"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Foto</Label>
              <Input
                name="foto"
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                required={!initialData}
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
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit">
                {initialData ? "Simpan Perubahan" : "Tambah Data"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataModal;
