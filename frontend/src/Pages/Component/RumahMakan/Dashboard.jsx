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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/rumahMakan/");
      console.log("📦 Data dari backend:", res.data);
      const result = Array.isArray(res.data) ? res.data : [res.data];
      setData(result);
    } catch (err) {
      console.error("Gagal fetch data rumah makan:", err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/rumahMakan/${id}`);
      console.log("Detail rumah makan:", res.data);
      setSelectedData(res.data);

      setOpenDetailModal(true);
    } catch (error) {
      console.error("Gagal ambil rumah makan:", error);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return item.resto?.toLowerCase().includes(search.toLowerCase());
    });
  }, [data, search]);

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
        <div className="flex justify-between items-center pt-10 mb-6">
          <h1 className="text-2xl font-bold">Daftar Rumah Makan</h1>
          <Button onClick={() => setOpenAddModal(true)}>Tambah Data</Button>
        </div>

        <div className="mb-5 flex justify-between items-center">
          <Input
            placeholder="Cari berdasarkan nama makanan"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-1/3"
          />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Rumah Makan</TableHead>
                <TableHead>Link Google Maps</TableHead>
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
                    <TableCell>{item.resto}</TableCell>
                    <TableCell>
                      <a
                        href={item.link_gmaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {item.link_gmaps}
                      </a>
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
                              <strong>{item.resto}</strong>?
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
          <DialogContent>
            {selectedData && (
              <DialogHeader>
                <DialogTitle>
                  Detail Rumah Makan {selectedData.resto}
                </DialogTitle>
              </DialogHeader>
            )}

            {selectedData && (
              <div className="space-y-2 mt-3 gap-2 flex flex-col text-md">
                <div className="flex flex-col gap-1">
                  <Label className="font-bold">Nama Rumah Makan :</Label>
                  <p>{selectedData.resto}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="font-bold">Link Google Maps :</Label>
                  <a
                    href={selectedData.link_gmaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {selectedData.link_gmaps}
                  </a>
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
