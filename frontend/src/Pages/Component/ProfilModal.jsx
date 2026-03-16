import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import API from "@/lib/api";

export default function ProfilModal({ open, onOpenChange, adminId }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nama_Lengkap: "",
    jenis_kelamin: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    if (!open || !adminId) return;

    API.get(`/user/${adminId}`)
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const isChangePassword = form.password.trim() !== "";

      const payload = {
        nama_Lengkap: form.nama_Lengkap,
        jenis_kelamin: form.jenis_kelamin,
        username: form.username,
      };

      if (isChangePassword) {
        payload.password = form.password;
      }

      await API.patch(`/user/${adminId}`, payload);

      // ✅ Jika password diubah
      if (isChangePassword) {
        toast.success("Password berhasil diubah. Silakan login kembali.");

        setTimeout(() => {
          localStorage.removeItem("token");
          sessionStorage.clear();
          window.location.href = "/";
        }, 1500);

        return;
      }

      toast.success("Data berhasil diperbarui");
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
          {/* Nama Lengkap */}
          <div className="flex flex-col gap-2">
            <Label>Nama Lengkap</Label>
            <Input
              name="nama_Lengkap"
              value={form.nama_Lengkap}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          {/* Jenis Kelamin */}
          <div className="flex flex-col gap-2">
            <Label>Jenis Kelamin</Label>

            <Select
              value={form.jenis_kelamin || ""}
              onValueChange={(value) =>
                handleChange({ target: { name: "jenis_kelamin", value } })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Jenis Kelamin" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                <SelectItem value="Perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2">
            <Label>Username</Label>
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label>Password</Label>

            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin mengganti"
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
