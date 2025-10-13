import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Register = () => {
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register Data:", formData);
    // TODO: tambahkan logika register
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
              name="nama"
              placeholder="Nama Lengkap"
              value={formData.nama}
              onChange={handleChange}
              required
            />
            <Input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button className="w-full" type="submit">
              Register
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun?{" "}
            <a href="/" className="text-blue-600 hover:underline">
              Login
            </a>
            <a href="/admin/atraksi" className="text-blue-600 hover:underline">
              Lihat Tabel
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
