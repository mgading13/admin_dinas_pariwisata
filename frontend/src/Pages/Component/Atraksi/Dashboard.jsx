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
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/atraksi");
      console.log("📦 Data dari backend:", res.data);

      // Ambil data array untuk tabel
      setData(res.data.data || res.data);
    } catch (err) {
      console.error("Gagal fetch data event:", err);
      toast.error("Gagal memuat data detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = async (id) => {
    // 1. Reset data lama agar tidak muncul data lama saat loading
    setSelectedData(null);
    try {
      const res = await axios.get(`http://localhost:3000/api/atraksi/${id}`);
      console.log("Detail atraksi:", res.data);
      // Perbaikan: Ambil properti 'data' dari response (sesuai log konsol Anda)
      const eventData = res.data.data || res.data.event || res.data;
      setSelectedData(eventData);
      setOpenDetailModal(true);
    } catch (error) {
      console.error("Gagal ambil detail atraksi:", error);
      toast.error("Gagal memuat data");
    }
  };

  // 🧮 Filter dan pencarian
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.nameEvent?.toLowerCase().includes(search.toLowerCase()) ||
        item.location_id?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filterLokasi === "all" || item.location_id === filterLokasi;

      return matchSearch && matchFilter;
    });
  }, [data, search, filterLokasi]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEditData = (updatedData) => {
    setData((prev) =>
      prev.map((d) => (d.id === updatedData.id ? updatedData : d)),
    );
    toast.success("Data berhasil diperbarui.");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/atraksi/${id}`);
      toast.success("Data berhasil dihapus.");
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error("Gagal menghapus data.");
      console.error(err);
    }
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <SideBar>
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center pt-10 mb-6">
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
                {[...new Set(data.map((d) => d.location_id))].map(
                  (location, index) => (
                    <SelectItem
                      key={location || index}
                      value={location || "unknown"}
                    >
                      {location || "Tidak diketahui"}
                    </SelectItem>
                  ),
                )}
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
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Foto</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan="6"
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
                      <TableCell>{item.nameEvent}</TableCell>
                      <TableCell className="whitespace-normal break-words max-w-[300px] text-justify">
                        {item.description_id}
                      </TableCell>
                      <TableCell>{item.location_id}</TableCell>
                      <TableCell>
                        {formatTanggal(item.startdate)} -{" "}
                        {formatTanggal(item.enddate)}
                      </TableCell>
                      <TableCell>
                        {item.foto &&
                          (item.foto.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video
                              src={`http://localhost:3000${item.foto}`}
                              className="w-16 h-16 object-cover rounded-lg border"
                              muted
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={`http://localhost:3000${item.foto}`}
                              alt={item.nameEvent}
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          ))}
                      </TableCell>
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
                                <strong>{item.nameEvent}</strong>?
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
            refreshData={fetchData}
          />

          {/* ✏️ Modal Edit Data */}
          <EditDataModal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={handleEditData}
            initialData={selectedData}
            refreshData={fetchData}
          />

          {/* 👁️ Modal Detail Data */}
          <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detail Atraksi</DialogTitle>
              </DialogHeader>

              {selectedData && (
                <div className="space-y-2 mt-3 gap-2 flex flex-col text-md">
                  <div className="flex flex-col gap-1">
                    <Label className="font-bold">Nama Atraksi :</Label>
                    <p>{selectedData.nameEvent}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="font-bold">Deskripsi :</Label>
                    <p className="max-w-[300px] max-h-[100px] overflow-y-auto whitespace-normal break-words text-justify">
                      {selectedData.description_id}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="font-bold">Lokasi :</Label>
                    <p>{selectedData.location_id}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="font-bold">Tanggal :</Label>
                    {selectedData.startdate
                      ? formatTanggal(selectedData.startdate)
                      : "-"}{" "}
                    -{" "}
                    {selectedData.enddate
                      ? formatTanggal(selectedData.enddate)
                      : "-"}
                  </div>
                </div>
              )}

              {selectedData?.foto &&
                (selectedData.foto.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={`http://localhost:3000${selectedData.foto}`}
                    controls
                    className="w-full max-h-[400px] object-cover rounded-lg mt-2"
                  />
                ) : (
                  <img
                    src={`http://localhost:3000${selectedData.foto}`}
                    alt={selectedData?.nameEvent}
                    className="w-full max-h-[400px] object-cover rounded-lg mt-2"
                  />
                ))}
            </DialogContent>
          </Dialog>
        </div>
      </SideBar>
    </>
  );
}

export default Dashboard;
