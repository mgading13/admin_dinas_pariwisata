import { useState, useMemo, useEffect } from "react";
import AddDataModal from "./AddDataModal";
import EditDataModal from "./EditDataModal";
import SideBar from "../SideBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import axios from "axios";

function Dashboard() {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [search, setSearch] = useState("");
  const [filterLokasi, setFilterLokasi] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/hotel/");
      console.log("📦 Data dari backend:", res.data);
      const result = Array.isArray(res.data) ? res.data : [res.data];
      setData(result);
    } catch (err) {
      console.error("Gagal fetch data hotel:", err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/hotel/${id}`);
      console.log("Detail hotel:", res.data);
      setSelectedData(res.data);

      setOpenDetailModal(true);
    } catch (error) {
      console.error("Gagal ambil detail hotel:", error);
    }
  };

  // 🧮 Filter dan pencarian
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.lokasi?.toLowerCase().includes(search.toLowerCase()) ||
        item.nama_hotel?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filterLokasi === "all" || item.lokasi === filterLokasi;
      return matchSearch && matchFilter;
    });
  }, [data, search, filterLokasi]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditData = (updatedData) => {
    setData((prev) =>
      prev.map((d) => (d.id === updatedData.id ? updatedData : d))
    );
    toast.success("Data berhasil diperbarui.");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/hotel/${id}`);
      toast.success("Data Hotel berhasil dihapus!");
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error("Gagal menghapus data!");
      console.error(err);
    }
  };

  return (
    <SideBar>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center pt-10 mb-6">
          <h1 className="text-2xl font-bold">Daftar Hotel</h1>
          <Button onClick={() => setOpenAddModal(true)}>Tambah Data</Button>
        </div>

        {/* Search */}
        <div className="mb-5 flex justify-between items-center">
          <Input
            placeholder="Cari berdasarkan nama hotel atau lokasi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-1/3"
          />

          <Select
            value={filterLokasi}
            onValueChange={(val) => {
              setFilterLokasi(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-1/4">
              <SelectValue placeholder="Filter Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokasi</SelectItem>
              {[...new Set(data.map((d) => d.lokasi))].map((lokasi, index) => (
                <SelectItem key={lokasi || index} value={lokasi || "unknown"}>
                  {lokasi || "Tidak diketahui"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 📊 Tabel Data */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Hotel</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Jumlah Kamar</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan="7"
                    className="text-center py-6 text-gray-500"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{item.nama_hotel}</TableCell>
                    <TableCell>{item.lokasi}</TableCell>
                    <TableCell>{item.jumlah_kamar}</TableCell>
                    <TableCell>{item.telepon}</TableCell>

                    <TableCell className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleOpenDetail(item.id);
                          setOpenDetailModal(true);
                        }}
                      >
                        Detail
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedData(item);
                          setOpenEditModal(true);
                        }}
                      >
                        Edit
                      </Button>

                      {/* Hapus */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Hapus
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Konfirmasi Hapus
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Yakin ingin menghapus{" "}
                              <strong>{item.nama_hotel}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan="7"
                    className="text-center py-6 text-gray-500"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 📄 Pagination */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-gray-600">
            Halaman {currentPage} dari {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Selanjutnya
          </Button>
        </div>

        {/* 🪄 Modal Tambah */}
        <AddDataModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          refreshData={fetchData}
        />

        {/* ✏️ Modal Edit */}
        <EditDataModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onSubmit={handleEditData}
          initialData={selectedData}
          refreshData={fetchData}
        />

        {/* 👁️ Modal Detail */}
        <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Rumah Makan</DialogTitle>
            </DialogHeader>

            {selectedData && (
              <div className="space-y-2 mt-3 flex justify-between gap-7 text-md">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <Label className="font-bold">Nama Hotel :</Label>
                    <p>{selectedData.nama_hotel}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="font-bold">Lokasi :</Label>
                    <p>{selectedData.lokasi}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="font-bold">Alamat :</Label>
                    <p className="text-justify">{selectedData.alamat}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="font-bold">Deskripsi :</Label>
                    <p>{selectedData.deskripsi}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="font-bold">Jumlah Kamar :</Label>
                    <p>{selectedData.jumlah_kamar}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <Label className="font-bold">Jumlah Tempat Tidur :</Label>
                    <p>{selectedData.jumlah_tempatTidur}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="font-bold">Harga per Malam</Label>
                    <p>
                      Start from Rp.{" "}
                      {Number(selectedData.harga).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex flex-col ">
                    <Label className="font-bold">Link Website :</Label>
                    <p>{selectedData.website}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="font-bold">Link Google Maps</Label>
                    <p>{selectedData.link_gmaps}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="font-bold">Kontak</Label>
                    <p>{selectedData.telepon}</p>
                  </div>
                </div>
              </div>
            )}
            {selectedData && (
              <img
                src={
                  selectedData.foto
                    ? `http://localhost:3000${selectedData.foto}`
                    : "/no-image.jpg"
                }
                alt={selectedData.nama_hotel}
                className="w-full h-100 object-cover rounded-lg mt-2"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SideBar>
  );
}

export default Dashboard;
