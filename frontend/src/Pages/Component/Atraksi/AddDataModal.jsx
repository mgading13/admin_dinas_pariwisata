import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nameEvent: "",
    description: "",
    foto: "",
    startdate: "",
    enddate: "",
    location: "",
  });

  // 🟢 Saat modal dibuka, isi form dengan data lama (jika edit)
  useEffect(() => {
    if (initialData) {
      setForm({
        nameEvent: initialData.nameEvent || "",
        description: initialData.description || "",
        foto: initialData.foto || "",
        startdate: initialData.startdate?.split("T")[0] || "",
        enddate: initialData.enddate?.split("T")[0] || "",
        location: initialData.location || "",
      });
    } else {
      setForm({
        nameEvent: "",
        description: "",
        foto: "",
        startdate: "",
        enddate: "",
        location: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, foto: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nameEvent", form.nameEvent);
      formData.append("description", form.description);
      formData.append("foto", form.foto);
      formData.append("startdate", form.startdate);
      formData.append("enddate", form.enddate);
      formData.append("location", form.location);

      if (initialData) {
        console.log("🟡 Mulai edit data dengan ID:", initialData.id);
        console.log("🟡 Data yang dikirim:", form);
        // 🟢 Mode Edit
        const res = await axios.put(
          `http://localhost:3000/api/atraksi/${initialData.id}`,
          formData
        );
        toast.success("Data berhasil diperbarui!");
        console.log("🟢 Respons backend:", res.data);
        navigate("/admin/atraksi");
        onClose();
        console.log("Edit success:", res.data);
      } else {
        // 🟢 Mode Tambah
        const res = await axios.post(
          "http://localhost:3000/api/atraksi/insert",
          formData
        );
        toast.success("Data berhasil ditambahkan!");
        navigate("/admin/atraksi");
        onClose();
        console.log("Add success:", res.data);
      }

      refreshData?.();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menyimpan data!");
    }
  };

  // const createData = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const formData = new FormData();
  //     formData.append("nameEvent", form.nameEvent);
  //     formData.append("description", form.description);
  //     formData.append("foto", form.foto);
  //     formData.append("startdate", form.startdate);
  //     formData.append("enddate", form.enddate);
  //     formData.append("location", form.location);
  //     const response = await axios.post(
  //       "http://localhost:3000/api/atraksi/insert",
  //       formData
  //     );

  //     const res = response.data;
  //     setForm(res);
  //     console.log(res);

  //     setForm({
  //       nameEvent: "",
  //       description: "",
  //       foto: "",
  //       startdate: "",
  //       enddate: "",
  //       location: "",
  //     });
  //     if (refreshData) refreshData();
  //     console.log("tambah data berhasil:", response.data);
  //     toast.success("Data Atraksi berhasil ditambahkan");
  //     onClose();
  //     navigate("/admin/atraksi");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // Set form sesuai initialData jika ada (mode edit)
  // useEffect(() => {
  //   if (initialData) {
  //     setForm({
  //       namaAtraksi: initialData.namaAtraksi || '',
  //       deskripsi: initialData.deskripsi || '',
  //       foto: initialData.foto || '',
  //       tanggalMulai: initialData.tanggalMulai || '',
  //       tanggalBerakhir: initialData.tanggalBerakhir || '',
  //       lokasi: initialData.lokasi || ''
  //     })
  //   } else {
  //     setForm({
  //       namaAtraksi: '',
  //       deskripsi: '',
  //       foto: '',
  //       tanggalMulai: '',
  //       tanggalBerakhir: '',
  //       lokasi: ''
  //     })
  //   }
  // }, [initialData, open])

  // const handleChange = e => {
  //   const { name, value, files } = e.target
  //   if (name === 'foto') setForm({ ...form, foto: files[0] })
  //   else setForm({ ...form, [name]: value })
  // }

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setForm({ ...form, [name]: value });
  // };

  // const handlePhoto = (e) => {
  //   const photo = e.target.files[0];
  //   setForm({ ...form, foto: photo });
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const formData = new FormData();
  //     formData.append("nameEvent", form.nameEvent);
  //     formData.append("description", form.description);
  //     formData.append("foto", form.foto);
  //     formData.append("startdate", form.startdate);
  //     formData.append("enddate", form.enddate);
  //     formData.append("location", form.location);

  //     if (initialData) {
  //       const res = await axios.put(
  //         `http://localhost:3000/api/atraksi/${id}`,
  //         formData
  //       );
  //       toast.success("Data Atraksi berhasil diperbarui");
  //       console.log("Edit data berhasil:", res.data);
  //     } else {
  //       // 🔹 Mode Tambah
  //       const res = await axios.post(
  //         "http://localhost:3000/api/atraksi/insert",
  //         formData
  //       );
  //       toast.success("Data Atraksi berhasil ditambahkan");
  //       console.log("Tambah data berhasil:", res.data);
  //     }

  //     if (refreshData) refreshData();
  //     onClose();
  //     navigate("/admin/atraksi");
  //   } catch (error) {
  //     console.error("Gagal menyimpan data:", error);
  //     toast.error("Gagal menyimpan data!");
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Atraksi" : "Tambah Data Atraksi"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nama Atraksi</Label>
              <Input
                name="nameEvent"
                value={form.nameEvent}
                onChange={handleChange}
                placeholder="Masukkan nama atraksi"
              />
            </div>

            <div>
              <Label>Deskripsi</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tulis deskripsi atraksi..."
              />
            </div>

            <div>
              <Label>Foto</Label>
              <Input
                name="foto"
                type="file"
                accept="image/*"
                onChange={handlePhoto}
              />
              {form.foto && typeof form.foto === "string" && (
                <img
                  src={form.foto}
                  alt="Preview"
                  className="mt-2 w-24 h-24 object-cover rounded-md border"
                />
              )}
            </div>

            <div>
              <Label>Tanggal Mulai</Label>
              <Input
                name="startdate"
                type="date"
                value={form.startdate}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Tanggal Berakhir</Label>
              <Input
                name="enddate"
                type="date"
                value={form.enddate}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Lokasi</Label>
              <Input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Masukkan lokasi atraksi"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit">Tambah Data</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataModal;
