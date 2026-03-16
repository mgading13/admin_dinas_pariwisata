import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import API from "@/lib/api";

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_hotel: "",
    lokasi: "",
    jumlah_kamar: "",
    jumlah_tempatTidur: "",
    harga_minimum: "",
    harga_maximum: "",
    harga_minimumDisplay: "",
    harga_maximumDisplay: "",
    website: "",
    link_gmaps: "",
    telepon: "",
    foto: "",
    link_video: "",
  });

  const formatCurrency = (value) => {
    if (!value) return "";
    return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        nama_hotel: initialData.nama_hotel || "",
        lokasi: initialData.lokasi || "",
        jumlah_kamar: initialData.jumlah_kamar || "",
        jumlah_tempatTidur: initialData.jumlah_tempatTidur || "",
        harga_minimum: initialData.harga_minimum || "",
        harga_maximum: initialData.harga_maximum || "",
        harga_minimumDisplay: formatCurrency(initialData.harga_minimum),
        harga_maximumDisplay: formatCurrency(initialData.harga_maximum),
        website: initialData.website || "",
        link_gmaps: initialData.link_gmaps || "",
        telepon: initialData.telepon || "",
        foto: initialData.foto || "",
        link_video: initialData.link_video || "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "harga_minimum") {
      const raw = value.replace(/\D/g, "");
      setForm((prev) => ({
        ...prev,
        harga_minimum: raw,
        harga_minimumDisplay: formatCurrency(raw),
      }));
      return;
    }

    if (name === "harga_maximum") {
      const raw = value.replace(/\D/g, "");
      setForm((prev) => ({
        ...prev,
        harga_maximum: raw,
        harga_maximumDisplay: formatCurrency(raw),
      }));
      return;
    }

    if (name === "link_video") {
      setForm((prev) => ({
        ...prev,
        link_video: value,
        foto: "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        foto: file,
        link_video: "",
      }));
    }
  };

  const handleRemoveFile = async () => {
    if (form.foto && typeof form.foto === "object") {
      setForm((prev) => ({ ...prev, foto: "" }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      await API.delete(`/hotel/foto/${initialData.id}`);
      setForm((prev) => ({ ...prev, foto: "" }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("File berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus file");
    }
  };

  const handleRemoveLink = () => {
    setForm((prev) => ({ ...prev, link_video: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.foto && !form.link_video) {
      toast.warning("Harap isi salah satu Foto/Video atau Link Video");
      return;
    }

    if (Number(form.harga_minimum) > Number(form.harga_maximum)) {
      toast.warning("Harga minimum tidak boleh lebih besar dari maksimum");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("nama_hotel", form.nama_hotel);
      formData.append("lokasi", form.lokasi);
      formData.append("jumlah_kamar", form.jumlah_kamar);
      formData.append("jumlah_tempatTidur", form.jumlah_tempatTidur);
      formData.append("harga_minimum", form.harga_minimum);
      formData.append("harga_maximum", form.harga_maximum);
      formData.append("website", form.website);
      formData.append("link_gmaps", form.link_gmaps);
      formData.append("telepon", form.telepon);

      if (form.foto && typeof form.foto === "object") {
        formData.append("foto", form.foto);
      }

      formData.append("link_video", form.link_video);

      await API.patch(`/hotel/${initialData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Data hotel berhasil diperbarui");
      refreshData?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Hotel" : "Tambah Data Hotel"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Hotel</Label>
              <Input
                name="nama_hotel"
                value={form.nama_hotel}
                onChange={handleChange}
                placeholder="Masukkan nama hotel"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Lokasi</Label>
              <Input
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                placeholder="Masukkan lokasi hotel"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Jumlah Kamar</Label>
              <Input
                type="number"
                name="jumlah_kamar"
                value={form.jumlah_kamar}
                onChange={handleChange}
                placeholder="Masukkan jumlah kamar"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Jumlah Tempat Tidur</Label>
              <Input
                type="number"
                name="jumlah_tempatTidur"
                value={form.jumlah_tempatTidur}
                onChange={handleChange}
                placeholder="Masukkan jumlah tempat tidur"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Harga Minimum</Label>
              <Input
                name="harga_minimum"
                value={form.harga_minimumDisplay}
                onChange={handleChange}
                required
              />
            </div>

            {/* harga maximum */}
            <div className="flex flex-col gap-2">
              <Label>Harga Maximum</Label>
              <Input
                name="harga_maximum"
                value={form.harga_maximumDisplay}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Link Website Hotel</Label>
              <Input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="Masukkan link website hotel"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Link Google Maps Hotel</Label>
              <Input
                name="link_gmaps"
                value={form.link_gmaps}
                onChange={handleChange}
                placeholder="Masukkan link Google Maps hotel"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Kontak</Label>
              <Input
                name="telepon"
                value={form.telepon}
                onChange={handleChange}
                placeholder="Masukkan kontak hotel"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Foto / Video</Label>

              <Input
                ref={fileInputRef}
                name="foto"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.mkv"
                onChange={handlePhoto}
                disabled={!!form.link_video}
                className="w-full"
              />

              {/* PREVIEW FILE */}
              {form.foto && (
                <div className="relative w-fit mt-2">
                  {typeof form.foto === "string" ? (
                    form.foto.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={`${import.meta.env.VITE_BASE_URL}${form.foto}`}
                        controls
                        className="w-32 h-32 rounded-md border object-cover"
                      />
                    ) : (
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${form.foto}`}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    )
                  ) : form.foto.type.startsWith("video/") ? (
                    <video
                      src={URL.createObjectURL(form.foto)}
                      controls
                      className="w-32 h-32 rounded-md border object-cover"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(form.foto)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md border"
                    />
                  )}

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="
    absolute -top-2 -right-2
    flex items-center justify-center
    w-7 h-7
    rounded-full
    bg-red-500
    text-white
    shadow-md
    hover:bg-red-600
    hover:scale-110
    transition-all duration-200
  "
                  >
                    <Trash size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Link Video</Label>

              <div className="flex gap-2">
                <Input
                  name="link_video"
                  value={form.link_video}
                  onChange={handleChange}
                  placeholder="Masukkan link YouTube"
                  disabled={!!form.foto}
                  className="w-full"
                />

                {form.link_video && (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="
      flex items-center justify-center
      w-9 h-9
      rounded-md
      bg-red-500
      text-white
      shadow-md
      hover:bg-red-600
      hover:scale-105
      transition-all duration-200
    "
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit">
                {initialData ? "Simpan Perubahan" : "Tambah Data"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataModal;
