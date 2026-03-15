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
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import debounce from "lodash.debounce";
import API from "@/lib/api";

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nama_wisata: "",
    nama_wisata_en: "",
    lokasi: "",
    lokasi_en: "",
    harga: "",
    deskripsi: "",
    deskripsi_en: "",
    kontak: "",
    media: "",
    link_video: "",
  });

  const translateText = async (text, fieldTarget) => {
    if (!text || text.length < 3) return;
    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURI(text)}`,
      );
      if (res.data && res.data[0]) {
        const fullTranslation = res.data[0]
          .map((item) => item[0])
          .filter((item) => item !== null)
          .join(" ");

        setForm((prev) => ({ ...prev, [fieldTarget]: fullTranslation }));
      }
    } catch (error) {
      console.error("Translate error:", error);
    }
  };

  const debouncedTranslate = useCallback(
    debounce((text, fieldTarget) => {
      translateText(text, fieldTarget);
    }, 1500),
    [],
  );

  useEffect(() => {
    if (initialData) {
      setForm({
        nama_wisata: initialData.nama_wisata_id || "",
        nama_wisata_en: initialData.nama_wisata_en || "",
        lokasi: initialData.lokasi_id || "",
        lokasi_en: initialData.lokasi_en || "",
        deskripsi: initialData.deskripsi_id || "",
        deskripsi_en: initialData.deskripsi_en || "",
        harga: initialData.harga || "",
        kontak: initialData.kontak || "",
        media: initialData.media || "",
        link_video: initialData.link_video || "",
      });
    } else {
      setForm({
        nama_wisata: "",
        nama_wisata_en: "",
        lokasi: "",
        lokasi_en: "",
        deskripsi: "",
        deskripsi_en: "",
        harga: "",
        kontak: "",
        media: "",
        link_video: "",
      });
    }
  }, [initialData, open]);

  const formatCurrency = (value) => {
    if (!value) return "";
    return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatPhoneDisplay = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, "").slice(0, 12); // max 12 digit
    return cleaned.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) =>
      c ? `${a}-${b}-${c}` : `${a}-${b}`,
    );
  };

  const formatPhoneToDB = (value) => {
    if (!value) return "";
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
    return cleaned;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nama_wisata") debouncedTranslate(value, "nama_wisata_en");
    if (name === "lokasi") debouncedTranslate(value, "lokasi_en");
    if (name === "deskripsi") debouncedTranslate(value, "deskripsi_en");
    if (name === "harga") {
      const raw = value.replace(/\D/g, "");
      setForm({
        ...form,
        harga: raw,
        hargaDisplay: formatCurrency(raw),
      });
      return;
    }

    if (name === "kontak") {
      const raw = value.replace(/\D/g, ""); // remove non numbers
      setForm({
        ...form,
        kontak: formatPhoneDisplay(raw), // UI
        kontak_raw: raw, // storage
      });
      return;
    }

    if (name === "link_video") {
      setForm({
        ...form,
        link_video: value,
        media: "",
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        media: file,
        link_video: "",
      });
    }
  };

  const handleRemoveFile = async () => {
    if (form.media && typeof form.media === "object") {
      setForm((prev) => ({
        ...prev,
        media: "",
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    try {
      await API.delete(
        `/tourPackage/media/${initialData.id}`,
      );

      setForm((prev) => ({
        ...prev,
        media: "",
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("File berhasil dihapus");
    } catch (error) {
      console.error("❌ Gagal menghapus file:", error);
      toast.error("Gagal menghapus file");
    }
  };

  const handleRemoveLink = () => {
    setForm({
      ...form,
      link_video: "",
    });
  };


  const handleSubmit = async (e) => {
    const kontakDB = formatPhoneToDB(form.kontak_raw);
    e.preventDefault();
    if (!form.media && !form.link_video) {
      toast.warning("Harap isi salah satu antara Foto/Video atau Link Video ");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nama_wisata_id", form.nama_wisata);
      formData.append("nama_wisata_en", form.nama_wisata_en);
      formData.append("lokasi_id", form.lokasi);
      formData.append("lokasi_en", form.lokasi_en);
      formData.append("deskripsi_id", form.deskripsi);
      formData.append("deskripsi_en", form.deskripsi_en);
      formData.append("harga", form.harga);
      formData.append("kontak", kontakDB);
      if (form.media && typeof form.media === "object") {
        formData.append("media", form.media);
      }
      formData.append("link_video", form.link_video);

      const res = await API.post(
        "/tourPackage/insert",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log("Response:", res.data);
      toast.success("Data berhasil ditambahkan!");
      navigate("/admin/paket-wisata");
      refreshData?.();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menyimpan data!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Wisata" : "Tambah Paket Wisata"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Jenis Wisata */}
          <div className="flex flex-col gap-2">
            <Label>Nama Wisata</Label>
            <Input
              name="nama_wisata"
              value={form.nama_wisata}
              onChange={handleChange}
              placeholder="Masukkan nama wisata"
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
              placeholder="Masukkan lokasi wisata"
              required
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Deskripsi</Label>
            <Textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Tuliskan deskripsi tentang wisata..."
              required
              className="w-full resize-none break-all whitespace-pre-wrap overflow-x-hidden"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Harga (Rp)</Label>
            <Input
              name="harga"
              value={form.hargaDisplay ?? ""}
              onChange={handleChange}
              placeholder="Masukkan Harga Paket Wisata"
              required
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Kontak</Label>
            <Input
              name="kontak"
              value={form.kontak}
              onChange={handleChange}
              placeholder="Masukkan Kontak Paket Wisata"
              required
              className="w-full"
            />
          </div>

           <div className="flex flex-col gap-2">
              <Label>Foto / Video</Label>

              <Input
                ref={fileInputRef}
                name="media"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.mkv"
                onChange={handlePhoto}
                disabled={!!form.link_video}
                className="w-full"
              />

              {/* PREVIEW FILE */}
              {form.media && (
                <div className="relative w-fit mt-2">
                  {typeof form.media === "string" ? (
                    form.media.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={`${import.meta.env.VITE_BASE_URL}${form.media}`}
                        controls
                        className="w-32 h-32 rounded-md border object-cover"
                      />
                    ) : (
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${form.media}`}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    )
                  ) : form.media.type.startsWith("video/") ? (
                    <video
                      src={URL.createObjectURL(form.media)}
                      controls
                      className="w-32 h-32 rounded-md border object-cover"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(form.media)}
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
                  disabled={!!form.media}
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

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {initialData ? "Simpan Perubahan" : "Tambah Data"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataModal;
