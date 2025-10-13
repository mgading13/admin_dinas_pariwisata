import { useState, useMemo } from "react";
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
import { toast } from "sonner";

function Dashboard() {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const [data, setData] = useState([
    {
      id: 1,
      jenisWisata: "Wisata Alam - Danau Poso",
      lokasi: "Kabupaten Poso",
      deskripsi: "Menikmati pemandangan indah danau dan pegunungan di sekitar Poso.",
      harga: 250000,
      foto: "https://example.com/danauposo.jpg",
    },
    {
      id: 2,
      jenisWisata: "Wisata Budaya - Palu Nomoni",
      lokasi: "Kota Palu",
      deskripsi: "Festival budaya khas masyarakat Palu dengan pertunjukan musik tradisional.",
      harga: 150000,
      foto: "https://example.com/palu.jpg",
    },
  ]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔍 Filter & Pencarian
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.jenisWisata.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ➕ Tambah Data
  const handleAddData = (newData) => {
    setData([...data, { id: Date.now(), ...newData }]);
    toast.success("Paket wisata berhasil ditambahkan!");
  };

  // ✏️ Edit Data
  const handleEditData = (updatedData) => {
    setData((prev) =>
      prev.map((d) => (d.id === updatedData.id ? updatedData : d))
    );
    toast.success("Data berhasil diperbarui!");
  };

  // ❌ Hapus Data
  const handleDelete = (id) => {
    setData((prev) => prev.filter((d) => d.id !== id));
    toast.error("Data berhasil dihapus!");
  };

  return (
    <SideBar>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Daftar Paket Wisata</h1>
          <Button onClick={() => setOpenAddModal(true)}>Tambah Data</Button>
        </div>

        {/* Search */}
        <div className="mb-5 flex justify-between items-center">
          <Input
            placeholder="Cari berdasarkan jenis wisata..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-1/3"
          />
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Jenis Wisata</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Harga</TableHead>
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
                    <TableCell>{item.jenisWisata}</TableCell>
                    <TableCell>{item.lokasi}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.deskripsi}
                    </TableCell>
                    <TableCell>
                      Rp {item.harga.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <img
                        src={item.foto}
                        alt={item.jenisWisata}
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

                      {/* Konfirmasi Hapus */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Hapus
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                            <AlertDialogDescription>
                              Yakin ingin menghapus{" "}
                              <strong>{item.jenisWisata}</strong>? Data ini akan
                              hilang secara permanen.
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

        {/* Pagination */}
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

        {/* Modal Tambah */}
        <AddDataModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onSubmit={handleAddData}
        />

        {/* Modal Edit */}
        <EditDataModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onSubmit={handleEditData}
          initialData={selectedData}
        />

        {/* Modal Detail */}
        <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Paket Wisata</DialogTitle>
            </DialogHeader>
            {selectedData && (
              <div className="space-y-2 text-sm mt-3">
                <p>
                  <strong>Jenis Wisata:</strong> {selectedData.jenisWisata}
                </p>
                <p>
                  <strong>Lokasi:</strong> {selectedData.lokasi}
                </p>
                <p>
                  <strong>Deskripsi:</strong> {selectedData.deskripsi}
                </p>
                <p>
                  <strong>Harga:</strong> Rp{" "}
                  {selectedData.harga.toLocaleString("id-ID")}
                </p>
                <img
                  src={selectedData.foto}
                  alt={selectedData.jenisWisata}
                  className="w-full h-48 object-cover rounded-lg mt-2"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SideBar>
  );
}

export default Dashboard;
