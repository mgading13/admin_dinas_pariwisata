import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, MapPin, Package, User } from "lucide-react";
import { toast } from "sonner";
import ProfilModal from "./ProfilModal";
import axios from "axios";

export default function Sidebar({ children }) {
  const [open, setOpen] = useState(false);
  const [openProfil, setOpenProfil] = useState(false);
  const localUser = JSON.parse(localStorage.getItem("admin"));
  const userId = localUser?.id;
  const navigate = useNavigate();
  const location = useLocation();
  const [adminData, setAdminData] = useState({
    nama_Lengkap: "",
    jenis_kelamin: "",
    username: "",
  });

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:3000/api/user/${userId}`)
      .then((res) => {
        const admin = res.data.data || res.data;

        setAdminData({
          nama_Lengkap: admin.nama_Lengkap,
          jenis_kelamin: admin.jenis_kelamin,
          username: admin.username,
        });
      })
      .catch(() => toast.error("Gagal memuat data admin"));
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    toast.success("Logout Berhasil", {
      className: "bg-emerald-500 text-white font-medium",
    });
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;
  // Mendapatkan inisial nama
  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Mengatur warna avatar berdasarkan gender
  const getAvatarColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case "laki-laki":
        return "bg-blue-500 text-white";
      case "perempuan":
        return "bg-pink-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm">
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>

        {/* Scrollable Menu */}
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            <Link
              to="/admin/atraksi"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition
                ${
                  isActive("/admin/atraksi")
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <MapPin
                className={`h-5 w-5 ${
                  isActive("/admin/atraksi") ? "text-blue-600" : "text-blue-500"
                }`}
              />
              Atraksi
            </Link>
            <Link
              to="/admin/paket-wisata"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition
                ${
                  isActive("/admin/paket-wisata")
                    ? "bg-green-50 text-green-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Package
                className={`h-5 w-5 ${
                  isActive("/admin/paket-wisata")
                    ? "text-green-600"
                    : "text-green-500"
                }`}
              />
              Paket Wisata
            </Link>
          </nav>
        </ScrollArea>

        {/* Profil Pengguna */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start gap-3"
              >
                <Avatar>
                  <AvatarFallback
                    className={`${getAvatarColor(
                      adminData.jenis_kelamin
                    )} font-medium`}
                  >
                    {getInitials(adminData.nama_Lengkap)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-left">
                  <p className="text-sm font-semibold text-black">
                    {adminData.nama_Lengkap}
                  </p>
                  <p className="text-xs text-gray-500">{adminData.username}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Profil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenProfil(true)}>
                <User className="mr-2 h-4 w-4" /> Lihat Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MOBILE NAVBAR */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b flex items-center justify-between px-4 h-14 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex flex-col h-full">
              <div className="h-16 flex items-center justify-center border-b">
                <h2 className="text-xl font-bold text-gray-800">Admin Menu</h2>
              </div>

              <ScrollArea className="flex-1 px-4 py-6">
                <nav className="space-y-3">
                  <Link
                    to="/admin/atraksi"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition
                      ${
                        isActive("/admin/atraksi")
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <MapPin
                      className={`h-5 w-5 ${
                        isActive("/admin/atraksi")
                          ? "text-blue-600"
                          : "text-blue-500"
                      }`}
                    />
                    Atraksi
                  </Link>

                  <Link
                    to="/admin/paket-wisata"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition
                      ${
                        isActive("/admin/paket-wisata")
                          ? "bg-green-50 text-green-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Package
                      className={`h-5 w-5 ${
                        isActive("/admin/paket-wisata")
                          ? "text-green-600"
                          : "text-green-500"
                      }`}
                    />
                    Paket Wisata
                  </Link>
                </nav>
              </ScrollArea>

              {/* Profil & Logout di mobile */}
              <div className="border-t p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 mb-3 cursor-pointer">
                      <Avatar>
                        <AvatarFallback
                          className={`${getAvatarColor(
                            adminData.jenis_kelamin
                          )} font-medium`}
                        >
                          {getInitials(adminData.nama_Lengkap)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-semibold text-black">
                          {adminData.nama_Lengkap}
                        </p>
                        <p className="text-xs text-gray-500">
                          {adminData.username}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Akun</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setOpenProfil(true)}>
                      <User className="mr-2 h-4 w-4" /> Lihat Profil
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Profil Modal */}
      <ProfilModal
        open={openProfil}
        onOpenChange={setOpenProfil}
        adminId={userId}
      />
    </div>
  );
}
