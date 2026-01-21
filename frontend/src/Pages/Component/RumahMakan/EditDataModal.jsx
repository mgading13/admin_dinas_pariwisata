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
        link_gmaps: initialData.link_gmaps || "",
        kulinerId: initialData.kulinerId
          ? String(initialData.kulinerId) // ⭐ WAJIB
          : "",
      });
    } else {
      setForm({
        resto: "",
        link_gmaps: "",
        kulinerId: "",
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
      formData.append("link_gmaps", form.link_gmaps);
      formData.append("kulinerId", form.kulinerId);

      const res = await axios.patch(
        `http://localhost:3000/api/rumahMakan/${initialData.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
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
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              className="w-full"
            />
          </div>

          {/* Dropdown Kuliner */}
          <div className="flex flex-col gap-2">
            <Label>Pilih Jenis Makanan</Label>
            <Select
              name="kulinerId"
              value={form.kulinerId || ""}
              onValueChange={(value) =>
                handleChange({ target: { name: "kulinerId", value } })
              }
              required
            >
              <SelectTrigger className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm">
                <SelectValue placeholder="-- Pilih Makanan --" />
              </SelectTrigger>

              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                {kulinerList.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={String(item.id)} // ⚠️ HARUS string
                    className="text-sm"
                  >
                    {item.nama_makanan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Link Google Maps</Label>
            <Input
              name="link_gmaps"
              value={form.link_gmaps}
              onChange={handleChange}
              placeholder="Tempelkan link Google Maps..."
              required
              className="w-full"
            />
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
