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

import { useState, useEffect } from "react";
import { toast } from "sonner";
import API from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

const EditUserModal = ({ open, onClose, initialData, refreshData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nama_Lengkap: "",
    jenis_kelamin: "",
    username: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        nama_Lengkap: initialData.nama_Lengkap || "",
        jenis_kelamin: initialData.jenis_kelamin || "",
        username: initialData.username || "",
        password: "",
        role: initialData.role || "",
      });
    } else {
      setForm({
        nama_Lengkap: "",
        jenis_kelamin: "",
        username: "",
        password: "",
        role: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.patch(`/user/${initialData.id}`, form);

      toast.success("Data admin berhasil diperbarui");

      refreshData?.();
      onClose();
    } catch (error) {
      const message =
        error.response?.data?.message || "Gagal memperbarui data admin";

      toast.error(message);

      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit User" : "Tambah User"}</DialogTitle>
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

          {/* Role */}

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
                placeholder="Masukkan password"
                required={!initialData} // wajib saat tambah
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
          <div className="flex flex-col gap-2">
            <Label>Role</Label>

            <Select value="Admin" disabled>
              <SelectTrigger className="w-full bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder="Admin" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Button */}
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

export default EditUserModal;
