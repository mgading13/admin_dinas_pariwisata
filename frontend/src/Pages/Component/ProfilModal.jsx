import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilModal({ open, onOpenChange, adminId }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nama_Lengkap: "",
    jenis_kelamin: "",
    username: "",
    password: "",
  });

  // GET DATA ADMIN
  useEffect(() => {
    if (!open || !adminId) return;

    axios
      .get(`http://localhost:3000/api/user/${adminId}`)
      .then((res) => {
        setForm({
          nama_Lengkap: res.data.nama_Lengkap || "",
          jenis_kelamin: res.data.jenis_kelamin || "",
          username: res.data.username || "",
          password: "",
        });
      })
      .catch(() => toast.error("Tidak dapat memuat data admin"));
  }, [open, adminId]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // PATCH (UPDATE DATA)
  const handleSave = async () => {
    try {
      const payload = {
        nama_Lengkap: form.nama_Lengkap,
        jenis_kelamin: form.jenis_kelamin,
        username: form.username,
      };

      // Hanya kirim password jika user mengisi
      if (form.password.trim() !== "") {
        payload.password = form.password;
      }

      await axios.patch(`http://localhost:3000/api/user/${adminId}`, payload);

      toast.success("Data berhasil diperbarui");

      // Jika password diupdate, logout otomatis
      if (form.password.trim() !== "") {
        // hapus token / session
        localStorage.removeItem("token"); // contoh jika pakai JWT
        sessionStorage.clear(); // hapus session storage
        window.location.href = "/"; // redirect ke halaman login
        return;
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal update data");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profil Admin</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            name="nama_Lengkap"
            value={form.nama_Lengkap}
            onChange={handleChange}
            placeholder="Nama Lengkap"
          />

          <Select
            value={form.jenis_kelamin}
            onValueChange={(val) => setForm({ ...form, jenis_kelamin: val })}
          >
            <SelectTrigger className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm">
              <SelectValue placeholder="Jenis Kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="laki-laki">Laki-Laki</SelectItem>
              <SelectItem value="perempuan">Perempuan</SelectItem>
            </SelectContent>
          </Select>

          <Input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
          />

          <div className="relative">
            <Input
              name="password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={form.password || ""}
              onChange={handleChange}
              required
              className="pr-10"
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
