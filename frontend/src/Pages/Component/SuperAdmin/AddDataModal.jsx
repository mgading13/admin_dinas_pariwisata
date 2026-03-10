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
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import API from "@/lib/api";

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    nama_Lengkap: "",
    jenis_kelamin: "",
    username: "",
    password: "",
    role: "Admin",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        role: "Admin",
      };

      const res = await API.post("/user/insert", payload);

      console.log("Add success:", res.data);
      toast.success("Data user berhasil ditambahkan!");
      refreshData?.();
      onClose();
    } catch (error) {
      console.error("Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Gagal menambahkan user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit User" : "Tambah User"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label>Nama Lengkap</Label>
            <Input
              name="nama_Lengkap"
              value={form.nama_Lengkap}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              required
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Jenis Kelamin</Label>
            <Select
              name="jenis_kelamin"
              value={form.jenis_kelamin || ""}
              onValueChange={(value) =>
                handleChange({ target: { name: "jenis_kelamin", value } })
              }
              required
            >
              <SelectTrigger className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm">
                <SelectValue placeholder="Pilih Jenis Kelamin" />
              </SelectTrigger>

              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="Laki-laki" className="text-sm">
                  Laki-laki
                </SelectItem>
                <SelectItem value="Perempuan" className="text-sm">
                  Perempuan
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Username</Label>
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              required
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Password</Label>

            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                required
                className="w-full pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Role</Label>
              <Select value="Admin" disabled>
                <SelectTrigger className="w-full h-10 border border-input bg-gray-100 rounded-md px-3 text-sm cursor-not-allowed">
                  <SelectValue placeholder="Admin" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default AddDataModal;
