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

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const navigate = useNavigate();
  const [kulinerList, setKulinerList] = useState([]);

  const [form, setForm] = useState({
    resto: "",
    lokasi: "",
    link_gmaps: "",
    kulinerId: "",
    foto: "",
  });

  useEffect(() => {
    async function fetchKuliner() {
      try {
        const res = await axios.get("http://localhost:3000/api/kuliner/");
        setKulinerList(res.data);
      } catch (error) {
        console.error("Gagal ambil kuliner:", error);
      }
    }
    fetchKuliner();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        resto: initialData.resto || "",
        lokasi: initialData.lokasi || "",
        link_gmaps: initialData.link_gmaps || "",
        kulinerId: initialData.kulinerId || "",
        foto: initialData.foto || "",
      });
    } else {
      setForm({
        resto: "",
        lokasi: "",
        link_gmaps: "",
        kulinerId: "",
        foto: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "foto") setForm({ ...form, foto: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("resto", form.resto);
      formData.append("lokasi", form.lokasi);
      formData.append("link_gmaps", form.link_gmaps);
      formData.append("kulinerId", form.kulinerId);
      formData.append("foto", form.foto);

      const res = await axios.patch(
        `http://localhost:3000/api/rumahMakan/${initialData.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Data rumah makan berhasil ditambahkan!");
      console.log("Add success:", res.data);

      refreshData?.();
      onClose();
      navigate("/admin/rumah-makan");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menyimpan data rumah makan!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Kuliner" : "Tambah Data Kuliner"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Nama Restoran */}
          <div className="flex flex-col gap-2">
            <Label>Nama Restoran</Label>
            <Input
              name="resto"
              value={form.resto}
              onChange={handleChange}
              placeholder="Masukkan nama restoran"
              required
            />
          </div>

          {/* Dropdown Kuliner */}
          <div className="flex flex-col gap-2">
            <Label>Pilih Jenis Makanan</Label>
            <select
              name="kulinerId"
              value={form.kulinerId}
              onChange={handleChange}
              className="border p-2 rounded-md"
              required
            >
              <option value="">-- Pilih Makanan --</option>
              {kulinerList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_makanan}
                </option>
              ))}
            </select>
          </div>

          {/* Lokasi */}
          <div className="flex flex-col gap-2">
            <Label>Lokasi</Label>
            <Input
              name="lokasi"
              value={form.lokasi}
              onChange={handleChange}
              placeholder="Masukkan lokasi restoran"
              required
            />
          </div>

          {/* Link Gmaps */}
          <div className="flex flex-col gap-2">
            <Label>Link Google Maps</Label>
            <Input
              name="link_gmaps"
              value={form.link_gmaps}
              onChange={handleChange}
              placeholder="Tempelkan link Google Maps..."
            />
          </div>

          {/* Foto */}
          <div className="flex flex-col gap-2">
            <Label>Foto</Label>
            <Input
              name="foto"
              type="file"
              accept="image/*"
              onChange={handleChange}
              required={!initialData}
            />

            {form.foto && typeof form.foto === "string" && (
              <img
                src={`http://localhost:3000${form.foto}`}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded-md border"
              />
            )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataModal;
