import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Menu,
  MapPin,
  Package,
  User,
} from "lucide-react";
import Dashboard from "../Dashboard" ;

export default function SidebarAdmin() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Contoh data pengguna login
  const user = {
    name: "Admin Sulteng",
    email: "admin@banksulteng.com",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=Admin",
  };

  const handleLogout = () => {
    // Tambahkan logika logout sesuai kebutuhanmu
    alert("Logout berhasil!");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm">
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        {/* Scrollable Menu */}
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            <Link
              to="/admin/atraksi"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            >
              <MapPin className="h-5 w-5 text-blue-500" />
              Atraksi
            </Link>
            <Link
              to="/admin/paket-wisata"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            >
              <Package className="h-5 w-5 text-green-500" />
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
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Profil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/profil")}>
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
                <h2 className="text-xl font-bold text-gray-800">
                  Admin Menu
                </h2>
              </div>

              <ScrollArea className="flex-1 px-4 py-6">
                <nav className="space-y-3">
                  <Link
                    to="/admin/atraksi"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                  >
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Atraksi
                  </Link>
                  <Link
                    to="/admin/paket-wisata"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                  >
                    <Package className="h-5 w-5 text-green-500" />
                    Paket Wisata
                  </Link>
                </nav>
              </ScrollArea>

              {/* Profil & Logout di mobile */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-6 md:ml-64 mt-14 md:mt-0">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Selamat datang, {user.name.split(" ")[0]} 👋
        </h2>
        <p className="text-gray-600">
          Ini adalah halaman dashboard admin Anda.
        </p>
      </main>
    </div>
  );
}
