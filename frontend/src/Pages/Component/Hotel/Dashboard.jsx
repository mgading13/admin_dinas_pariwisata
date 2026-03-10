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
import API from "@/lib/api";

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
      const res = await API.get("/hotel");
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
      const res = await API.get(`/hotel/${id}`);
      console.log("Detail hotel:", res.data);
      setSelectedData(res.data);

      setOpenDetailModal(true);
    } catch (error) {
      console.error("Gagal ambil detail hotel:", error);
    }
  };

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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getYoutubeId = (url) => {
    if (!url) return null;

    try {
      const urlObj = new URL(url);

      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }

      if (urlObj.searchParams.get("v")) {
        return urlObj.searchParams.get("v");
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleEditData = (updatedData) => {
    setData((prev) =>
      prev.map((d) => (d.id === updatedData.id ? updatedData : d)),
    );
    toast.success("Data berhasil diperbarui.");
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/hotel/${id}`);
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
        <div className="flex justify-between items-center pt-10 mb-6">
          <h1 className="text-2xl font-bold">Daftar Hotel</h1>
          <Button onClick={() => setOpenAddModal(true)}>Tambah Data</Button>
        </div>

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

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Hotel</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Harga per Malam</TableHead>
                <TableHead>Jumlah Kamar</TableHead>
                <TableHead>Jumlah Tempat Tidur</TableHead>
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
                    <TableCell>{item.telepon}</TableCell>
                    <TableCell>
                      Rp. {Number(item.harga).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>{item.jumlah_kamar}</TableCell>
                    <TableCell>{item.jumlah_tempatTidur}</TableCell>

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

        <AddDataModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          refreshData={fetchData}
        />

        <EditDataModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onSubmit={handleEditData}
          initialData={selectedData}
          refreshData={fetchData}
        />

        <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
          <DialogContent className="max-w-4xl w-full">
            {selectedData && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    Detail Hotel {selectedData.nama_hotel}
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  <div className="flex flex-col gap-4">
                    <div>
                      <Label className="font-bold">Nama Hotel :</Label>
                      <p>{selectedData.nama_hotel}</p>
                    </div>

                    <div>
                      <Label className="font-bold">Lokasi :</Label>
                      <p>{selectedData.lokasi}</p>
                    </div>

                    <div>
                      <Label className="font-bold">Jumlah Kamar :</Label>
                      <p>{selectedData.jumlah_kamar}</p>
                    </div>

                    <div>
                      <Label className="font-bold">Jumlah Tempat Tidur :</Label>
                      <p>{selectedData.jumlah_tempatTidur}</p>
                    </div>

                    <div>
                      <Label className="font-bold">Harga per Malam :</Label>
                      <p>
                        Start from Rp{" "}
                        {Number(selectedData.harga).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <Label className="font-bold">Website :</Label>
                      {selectedData.website ? (
                        <a
                          href={selectedData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {selectedData.website}
                        </a>
                      ) : (
                        <p>-</p>
                      )}
                    </div>

                    <div>
                      <Label className="font-bold">Google Maps :</Label>
                      {selectedData.link_gmaps ? (
                        <a
                          href={selectedData.link_gmaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          Lihat Lokasi
                        </a>
                      ) : (
                        <p>-</p>
                      )}
                    </div>

                    <div>
                      <Label className="font-bold">Kontak :</Label>
                      <p>{selectedData.telepon || "-"}</p>
                    </div>

                    {/* PRIORITAS 1: FOTO / VIDEO LOKAL */}
                    {selectedData.foto ? (
                      selectedData.foto.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={`http://localhost:3000${selectedData.foto}`}
                          controls
                          className="w-full aspect-video object-cover rounded-lg mt-2"
                        />
                      ) : (
                        <img
                          src={`http://localhost:3000${selectedData.foto}`}
                          alt={selectedData.nama_hotel}
                          className="w-full aspect-video object-cover rounded-lg mt-2"
                        />
                      )
                    ) : null}

                    {!selectedData.foto && selectedData.link_video && (
                      <iframe
                        className="w-full aspect-video rounded-lg mt-2"
                        src={`https://www.youtube.com/embed/${getYoutubeId(
                          selectedData.link_video,
                        )}`}
                        title="YouTube video"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SideBar>
  );
}

export default Dashboard;
