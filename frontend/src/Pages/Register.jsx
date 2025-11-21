import axios from "axios";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nama_Lengkap: "",
    jenis_kelamin: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/user/register",
        formData
      );
      toast.success("Registrasi Berhasil");
      console.log("Response:", res.data);
      setFormData({ nama: "", username: "", jenis_kelamin: "", password: "" });
      navigate("/");
    } catch (err) {
      toast.error("Registrasi Gagal");
      console.error("❌ Error register:", err);
      setMessage(err.response?.data?.message || "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px] shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Admin Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="nama_Lengkap"
              placeholder="Nama Lengkap"
              value={formData.nama_Lengkap || ""}
              onChange={handleChange}
              required
            />
        
            <Select
              name="jenis_kelamin"
              value={formData.jenis_kelamin || ""}
              onValueChange={(value) =>
                handleChange({ target: { name: "jenis_kelamin", value } })
              }
              required
            >
              <SelectTrigger className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm">
                <SelectValue placeholder="Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent >
                <SelectItem className="text-md" value="laki-laki">Laki-Laki</SelectItem>
                <SelectItem className="text-md" value="perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            <Input
              name="username"
              placeholder="Username"
              value={formData.username || ""}
              onChange={handleChange}
              required
            />
            <div className="relative">
              <Input
                name="password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
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
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Mendaftar..." : "Register"}
            </Button>
          </form>

          {message && (
            <p className="text-center text-sm mt-3 text-gray-700">{message}</p>
          )}

          <p className="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun?{" "}
            <a href="/" className="text-blue-600 hover:underline">
              Login
            </a>{" "}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
