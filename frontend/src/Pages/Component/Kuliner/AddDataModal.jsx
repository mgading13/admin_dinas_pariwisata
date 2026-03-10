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
import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Trash } from "lucide-react";

import debounce from "lodash.debounce";

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    nama_makanan: "",
    lokasi: "",
    deskripsi_id: "",
    deskripsi_en: "",
    foto: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "deskripsi_id") {
      debouncedTranslate(value, "deskripsi_en");
    }
    if (name === "link_video") {
      setForm({
        ...form,
        link_video: value,
        foto: "",
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
        foto: file,
        link_video: "",
      });
    }
  };

  const handleRemoveFile = async () => {
    if (form.foto && typeof form.foto === "object") {
      setForm((prev) => ({
        ...prev,
        foto: "",
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    try {
      await axios.delete(
        `http://localhost:3000/api/kuliner/foto/${initialData.id}`,
      );

      setForm((prev) => ({
        ...prev,
        foto: "",
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
    e.preventDefault();
    if (!form.foto && !form.link_video) {
      toast.warning("Harap isi salah satu antara Foto/Video atau Link Video ");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nama_makanan", form.nama_makanan);
      formData.append("lokasi", form.lokasi);
      formData.append("deskripsi_id", form.deskripsi_id);
      formData.append("deskripsi_en", form.deskripsi_en);

      if (form.foto && typeof form.foto === "object") {
        formData.append("foto", form.foto);
      }
      formData.append("link_video", form.link_video);

      const res = await axios.post(
        "http://localhost:3000/api/kuliner/insert",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      console.log("Response:", res.data);
      toast.success("Data kuliner berhasil ditambahkan!");
      refreshData?.();
      onClose();
    } catch (error) {
      console.error("Error:", error.response?.data);
      toast.error("Gagal menyimpan data kuliner!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Kuliner" : "Tambah Data Kuliner"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Makanan</Label>
              <Input
                name="nama_makanan"
                value={form.nama_makanan}
                onChange={handleChange}
                placeholder="Masukkan nama makanan"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Asal Daerah</Label>
              <Input
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                placeholder="Masukkan asal daerah kuliner"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Deskripsi</Label>
              <Textarea
                name="deskripsi_id"
                value={form.deskripsi_id}
                onChange={handleChange}
                placeholder="Tulis deskripsi kuliner..."
                required
                className="w-full resize-none break-all whitespace-pre-wrap overflow-x-hidden"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Foto / Video</Label>

              <Input
                ref={fileInputRef}
                name="foto"
                type="file"
                accept="image/*,video/*"
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
                        src={`http://localhost:3000${form.foto}`}
                        controls
                        className="w-32 h-32 rounded-md border object-cover"
                      />
                    ) : (
                      <img
                        src={`http://localhost:3000${form.foto}`}
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
              <Button disabled={loading}>
                {loading
                  ? "Menyimpan..."
                  : initialData
                    ? "Simpan Perubahan"
                    : "Tambah Data"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataModal;
