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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    namaDesa: "",
    lokasi: "",
    deskripsi: "",
    foto: "",
    longitude: "",
    latitude: "",
    jenisDesa: "",
    jalur_darat: "",
    jalur_laut: "",
    jalur_udara: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        namaDesa: initialData.namaDesa || "",
        lokasi: initialData.lokasi || "",
        deskripsi: initialData.deskripsi || "",
        foto: initialData.foto || "",
        longitude: initialData.longitude || "",
        latitude: initialData.latitude || "",
        jenisDesa: initialData.jenisDesa || "",
        jalur_darat: initialData.jalur_darat || "",
        jalur_laut: initialData.jalur_laut || "",
        jalur_udara: initialData.jalur_udara || "",
      });
    } else {
      setForm({
        namaDesa: "",
        lokasi: "",
        deskripsi: "",
        foto: "",
        longitude: "",
        latitude: "",
        jenisDesa: "",
        jalur_darat: "",
        jalur_laut: "",
        jalur_udara: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

      formData.append("namaDesa", form.namaDesa);
      formData.append("lokasi", form.lokasi);
      formData.append("deskripsi", form.deskripsi);

      // 👉 FIX TERPENTING
      if (form.foto && typeof form.foto === "object") {
        formData.append("foto", form.foto);
      }

      formData.append("longitude", form.longitude);
      formData.append("latitude", form.latitude);
      formData.append("jenisDesa", form.jenisDesa);
      formData.append("jalur_darat", form.jalur_darat);
      formData.append("jalur_laut", form.jalur_laut);
      formData.append("jalur_udara", form.jalur_udara);

      const res = await axios.post(
        "http://localhost:3000/api/desaWisata/insert",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
      <DialogContent className="max-w-md">
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
                <SelectContent>
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
              <Label>Jalur Via Darat</Label>
              <Input
                name="jalur_darat"
                value={form.jalur_darat}
                onChange={handleChange}
                placeholder="Masukkan jalur via darat menuju desa"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Jalur Via Laut</Label>
              <Input
                name="jalur_laut"
                value={form.jalur_laut}
                onChange={handleChange}
                placeholder="Masukkan jalur via laut menuju desa"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Jalur Via Udara</Label>
              <Input
                name="jalur_udara"
                value={form.jalur_udara}
                onChange={handleChange}
                placeholder="Masukkan jalur via darat menuju desa"
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
