import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import API from "@/lib/api";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log(formData);
    try {
      const res = await API.post("/user/login", formData);

      console.log("✅ Login berhasil:", res.data);

      const admin = res.data.data?.admin;
      const token = res.data.data?.token;

      if (admin && token) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("admin", JSON.stringify(admin));

        toast.success("Login Berhasil");
        navigate("/admin/grafik-pengunjung");
        console.log(res.data);
      }
    } catch (err) {
      console.error("❌ Login gagal:", err);
      toast.error(
        err.response?.data?.message || "Username atau Password Salah",
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px] shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="username"
              placeholder="Username"
              value={formData.username}
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

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button className="w-full" type="submit">
              Login
            </Button>
          </form>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
