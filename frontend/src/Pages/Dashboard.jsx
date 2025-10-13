import { useState, useMemo } from "react";
import AddDataModal from "./Component/AddDataModal";
import EditDataModal from "./Component/EditDataModal";
import SideBar from "./Component/SideBar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

function Dashboard() {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  const [data, setData] = useState([
    {
      id: 1,
      namaAtraksi: "Festival Danau Poso",
      deskripsi: "Perayaan tahunan di Danau Poso",
      foto: "https://example.com/danauposo.jpg",
      tanggalMulai: "2025-10-01",
      tanggalBerakhir: "2025-10-05",
      lokasi: "Poso",
    },
    {
      id: 2,
      namaAtraksi: "Pesta Rakyat Palu Nomoni",
      deskripsi: "Festival budaya di Palu",
      foto: "https://example.com/palu.jpg",
      tanggalMulai: "2025-11-10",
      tanggalBerakhir: "2025-11-12",
      lokasi: "Palu",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterLokasi, setFilterLokasi] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🧮 Filter dan pencarian
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.namaAtraksi.toLowerCase().includes(search.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(search.toLowerCase());
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

  const handleAddData = (newData) => {
    setData([...data, { id: Date.now(), ...newData }]);
    toast.success("Data baru telah ditambahkan.");
  };

  const handleEditData = (updatedData) => {
    setData((prev) =>
      prev.map((d) => (d.id === updatedData.id ? updatedData : d))
    );
    toast.success("Data berhasil diperbarui.");
  };

  const handleDelete = (id) => {
    setData((prev) => prev.filter((d) => d.id !== id));
    toast.error("Data berhasil dihapus.");
  };

  return (
    <>
      <SideBar />
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Atraksi</h1>
        <Button onClick={() => setOpenAddModal(true)}>Tambah Data</Button>
      </div>

      {/* 🔍 Search dan Filter */}
      <div className="flex flex-col md:flex-row justify-between gap-3 mb-5">
        <Input
          placeholder="Cari berdasarkan nama atau lokasi..."
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
            {[...new Set(data.map((d) => d.lokasi))].map((lokasi) => (
              <SelectItem key={lokasi} value={lokasi}>
                {lokasi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 📊 Tabel Data */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <Table>
          {/* <TableCaption>Data atraksi wisata di Sulawesi Tengah</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nama Atraksi</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Foto</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>{item.namaAtraksi}</TableCell>
                  <TableCell>{item.lokasi}</TableCell>
                  <TableCell>
                    {item.tanggalMulai} - {item.tanggalBerakhir}
                  </TableCell>
                  <TableCell>
                    <img
                      src={item.foto}
                      alt={item.namaAtraksi}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </TableCell>
                  <TableCell className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedData(item);
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
                    <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete.bind(null, item.id)}
                        >
                          Hapus
                        </Button>

                    {/* Konfirmasi Hapus */}
                    {/* <AlertDialog
                      open={confirmDelete === item.id}
                      onOpenChange={() => setConfirmDelete(null)}
                    >
                      <AlertDialogTrigger asChild>
                        
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Konfirmasi Hapus Data
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus{" "}
                            <b>{item.namaAtraksi}</b>? Tindakan ini tidak dapat
                            dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              handleDelete(item.id);
                              setConfirmDelete(null);
                            }}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog> */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan="6"
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

      {/* 🪄 Modal Tambah Data */}
      <AddDataModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSubmit={handleAddData}
      />

      {/* ✏️ Modal Edit Data */}
      <EditDataModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        onSubmit={handleEditData}
        initialData={selectedData}
      />

      {/* 👁️ Modal Detail Data */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Atraksi</DialogTitle>
          </DialogHeader>
          {selectedData && (
            <div className="space-y-2 text-sm mt-3">
              <p>
                <strong>Nama Atraksi:</strong> {selectedData.namaAtraksi}
              </p>
              <p>
                <strong>Deskripsi:</strong> {selectedData.deskripsi}
              </p>
              <p>
                <strong>Lokasi:</strong> {selectedData.lokasi}
              </p>
              <p>
                <strong>Tanggal:</strong> {selectedData.tanggalMulai} -{" "}
                {selectedData.tanggalBerakhir}
              </p>
              <img
                src={selectedData.foto}
                alt={selectedData.namaAtraksi}
                className="w-full h-48 object-cover rounded-lg mt-2"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}

export default Dashboard;
