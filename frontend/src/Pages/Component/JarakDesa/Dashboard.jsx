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
  const [filterDesa, setFilterDesa] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/jarak/");
      console.log("📦 Data dari backend:", res.data);
      const result = Array.isArray(res.data) ? res.data : [res.data];
      setData(result);
    } catch (err) {
      console.error("Gagal fetch data jarak desa:", err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/jarak/${id}`);
      console.log("Detail jarak desa:", res.data);
      setSelectedData(res.data);

      setOpenDetailModal(true);
    } catch (error) {
      console.error("Gagal ambil jarak desa:", error);
    }
  };

  // 🧮 Filter dan pencarian
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = item.titikKota
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchFilter = filterDesa === "all" || item.namaDesa === filterDesa;
      return matchSearch && matchFilter;
    });
  }, [data, search, filterDesa]);

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
      await axios.delete(`http://localhost:3000/api/rumahMakan/${id}`);
      toast.success("Data berhasil dihapus.");
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error("Gagal menghapus data.");
      console.error(err);
    }
  };

  return (
    <SideBar>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center pt-10 mb-6">
          <h1 className="text-2xl font-bold">Daftar Jalur Desa</h1>
          <Button onClick={() => setOpenAddModal(true)}>Tambah Data</Button>
        </div>

        {/* Search */}
        <div className="mb-5 flex justify-between items-center">
          <Input
            placeholder="Cari berdasarkan asal titik kota"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-1/3"
          />

          <Select
            value={filterDesa}
            onValueChange={(val) => {
              setFilterDesa(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-1/4">
              <SelectValue placeholder="Filter Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Desa</SelectItem>
              {[...new Set(data.map((d) => d.namaDesa))].map((desa, index) => (
                <SelectItem key={desa || index} value={desa || "unknown"}>
                  {desa || "Tidak diketahui"}
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
                <TableHead>Nama Desa</TableHead>
                <TableHead>Titik</TableHead>
                <TableHead>Jalur Darat</TableHead>
                <TableHead>Jalur Laut</TableHead>
                <TableHead>Jalur Udara</TableHead>
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
                    <TableCell>{item.namaDesa}</TableCell>
                    <TableCell>{item.titikKota}</TableCell>
                    <TableCell className="max-w-[300px] max-h-[100px] overflow-y-auto whitespace-normal break-words">{item.jalur_darat}</TableCell>
                    <TableCell className="max-w-[300px] max-h-[100px] overflow-y-auto whitespace-normal break-words">{item.jalur_laut}</TableCell>
                    <TableCell className="max-w-[300px] max-h-[100px] overflow-y-auto whitespace-normal break-words">{item.jalur_udara}</TableCell>

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
                              Yakin ingin menghapus jalur menuju Desa {""}
                              <strong>{item.namaDesa}</strong> Via{" "}
                              <strong>{item.titikKota}</strong>?
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
            {selectedData && (
              <DialogHeader>
                <DialogTitle>
                  Detail Jalur Menuju Desa {selectedData.namaDesa}
                </DialogTitle>
              </DialogHeader>
            )}

            {selectedData && (
              <div className="space-y-2 mt-3 gap-2 flex flex-col text-md">
                <div className="flex flex-col gap-1">
                  <Label className="font-bold">Nama Desa :</Label>
                  <p>{selectedData.namaDesa}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="font-bold"> Via Kota :</Label>
                  <p>{selectedData.titikKota}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="font-bold"> Jalur Darat :</Label>
                  <p>{selectedData.jalur_darat}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="font-bold"> Jalur Laut :</Label>
                  <p>{selectedData.jalur_laut}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="font-bold"> Jalur Udara :</Label>
                  <p>{selectedData.jalur_udara}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SideBar>
  );
}

export default Dashboard;
