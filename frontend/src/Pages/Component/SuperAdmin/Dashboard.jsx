import { useState, useEffect } from "react";
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

import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import API from "@/lib/api";

function Dashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  const [selectedData, setSelectedData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/user");
      console.log("Response:", res.data);
      console.log("Type:", typeof res.data);
      setData(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = async (id) => {
    try {
      const res = await API.get(`/user/${id}`);
      setSelectedData(res.data.data || res.data);
      setOpenDetailModal(true);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil detail user");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/user/${id}`);
      toast.success("Data user berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus user");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.nama_Lengkap?.toLowerCase().includes(search.toLowerCase()) ||
      item.username?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <SideBar>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center pt-10 mb-6">
          <h1 className="text-2xl font-bold">Daftar Admin</h1>
          <Button onClick={() => setOpenAddModal(true)}>Tambah Data</Button>
        </div>

        {/* SEARCH */}
        <div className="mb-5">
          <Input
            placeholder="Cari berdasarkan nama atau username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-1/3"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center py-6">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>

                    <TableCell>{item.nama_Lengkap}</TableCell>
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{item.jenis_kelamin}</TableCell>
                    <TableCell>{item.role}</TableCell>

                    <TableCell className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetail(item.id)}
                      >
                        Detail
                      </Button>

                      {/* Jika bukan superAdmin maka tampilkan edit & hapus */}
                      {item.role !== "superAdmin" && (
                        <>
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
                                  Yakin ingin menghapus user
                                  <strong> {item.nama_Lengkap}</strong> ?
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
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="6" className="text-center py-6">
                    Tidak ada data ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Sebelumnya
          </Button>

          <span className="text-sm">
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

        {/* MODAL TAMBAH */}
        <AddDataModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          refreshData={fetchData}
        />

        {/* MODAL EDIT */}
        <EditDataModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          initialData={selectedData}
          refreshData={fetchData}
        />

        {/* MODAL DETAIL */}
        <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
          <DialogContent className="max-w-md">
            {selectedData && (
              <>
                <DialogHeader>
                  <DialogTitle>Detail User</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 mt-3">
                  <div>
                    <Label className="font-bold">Nama Lengkap</Label>
                    <p>{selectedData.nama_Lengkap}</p>
                  </div>

                  <div>
                    <Label className="font-bold">Username</Label>
                    <p>{selectedData.username}</p>
                  </div>

                  <div>
                    <Label className="font-bold">Jenis Kelamin</Label>
                    <p>{selectedData.jenis_kelamin}</p>
                  </div>

                  <div>
                    <Label className="font-bold">Role</Label>
                    <p>{selectedData.role}</p>
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
