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
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/atraksi");
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
    setSelectedData(null);
    try {
      const res = await API.get(`/atraksi/${id}`);
      console.log("Detail atraksi:", res.data);
      const eventData = res.data.data || res.data.event || res.data;
      setSelectedData(eventData);
      setOpenDetailModal(true);
    } catch (error) {
      console.error("Gagal ambil detail atraksi:", error);
      toast.error("Gagal memuat data");
    }
  };

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
      await API.delete(`/atraksi/${id}`);
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

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Atraksi</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Foto/Video</TableHead>
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
                        {(() => {
                          if (item.foto) {
                            if (item.foto.match(/\.(mp4|webm|ogg)$/i)) {
                              return (
                                <div
                                  className="relative cursor-pointer w-24 aspect-video"
                                  onClick={() =>
                                    setSelectedVideo(
                                      `${import.meta.env.VITE_BASE_URL}${item.foto}`
                                    )
                                  }
                                >
                                  <video
                                    src={`${import.meta.env.VITE_BASE_URL}${item.foto}`}
                                    className="w-full h-full object-cover rounded-lg border"
                                    preload="metadata"
                                  />

                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg text-white">
                                    ▶
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="relative w-24 aspect-video">
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${item.foto}`}
                                  alt={item.nameEvent}
                                  className="w-full h-full object-cover rounded-lg border"
                                />
                              </div>
                            );
                          }

                          const videoId = getYoutubeId(item.link_video);

                          if (videoId) {
                            return (
                              <div
                                className="relative cursor-pointer w-24 aspect-video"
                                onClick={() =>
                                  setSelectedVideo(item.link_video)
                                }
                              >
                                <img
                                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                  className="w-full h-full object-cover rounded-lg border"
                                />

                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg text-white">
                                  ▶
                                </div>
                              </div>
                            );
                          }

                          return null;
                        })()}
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
            <DialogContent>
              {selectedData && (
                <>
                  <DialogHeader>
                    <DialogTitle>Detail Atraksi</DialogTitle>
                  </DialogHeader>

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
                  {selectedData.foto ? (
                    selectedData.foto.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={`${import.meta.env.VITE_BASE_URL}${selectedData.foto}`}
                        controls
                        className="w-full aspect-video object-cover rounded-lg mt-2"
                      />
                    ) : (
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${selectedData.foto}`}
                        alt={selectedData.nameEvent}
                        className="w-full aspect-video object-cover rounded-lg mt-2"
                      />
                    )
                  ) : selectedData.link_video ? (
                    <iframe
                      className="w-full aspect-video rounded-lg mt-2"
                      src={`https://www.youtube.com/embed/${getYoutubeId(
                        selectedData.link_video,
                      )}`}
                      title="YouTube video"
                      allowFullScreen
                    />
                  ) : null}
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!selectedVideo}
            onOpenChange={() => setSelectedVideo(null)}
          >
            <DialogContent className="max-w-5xl w-full">
              <DialogHeader>
                <DialogTitle>Preview Video</DialogTitle>
              </DialogHeader>

              {selectedVideo && (
                <div className="w-full aspect-video">
                  {selectedVideo.includes("youtube.com") ||
                  selectedVideo.includes("youtu.be") ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo)}`}
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    />
                  ) : (
                    <video
                      src={selectedVideo}
                      controls
                      autoPlay
                      className="w-full h-full rounded-lg"
                    />
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SideBar>
    </>
  );
}

export default Dashboard;
