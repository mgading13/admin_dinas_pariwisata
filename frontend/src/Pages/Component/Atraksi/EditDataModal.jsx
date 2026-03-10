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
import axios from "axios";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import debounce from "lodash.debounce";
import API from "@/lib/api";

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    nameEvent: "",
    description_id: "",
    description_en: "",
    foto: "",
    startdate: "",
    enddate: "",
    location_id: "",
    location_en: "",
    link_video: "",
  });

  const translateText = async (text, fieldTarget) => {
    if (!text || text.trim().length < 3) return;
    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURI(text)}`,
      );
      if (res.data && res.data[0]) {
        const fullTranslation = res.data[0]
          .map((item) => item[0])
          .filter((item) => item !== null)
          .join("");

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
    if (open) {
      setLoading(false);
      if (initialData) {
        setForm({
          nameEvent: initialData.nameEvent || "",
          description_id: initialData.description_id || "",
          description_en: initialData.description_en || "",
          foto: initialData.foto || "",
          startdate: initialData.startdate?.split("T")[0] || "",
          enddate: initialData.enddate?.split("T")[0] || "",
          location_id: initialData.location_id || "",
          location_en: initialData.location_en || "",
          link_video: initialData.link_video || "",
        });
      } else {
        setForm({
          nameEvent: "",
          description_id: "",
          foto: "",
          startdate: "",
          enddate: "",
          location_id: "",
          link_video: "",
        });
      }
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "link_video") {
      setForm({
        ...form,
        link_video: value,
        foto: "",
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));

    // Trigger translate otomatis untuk deskripsi dan lokasi
    if (name === "description_id") debouncedTranslate(value, "description_en");
    if (name === "location_id") debouncedTranslate(value, "location_en");
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        foto: file,
        link_video: "", // kosongkan link video jika upload file
      });
    }
  };

  const handleRemoveFile = async () => {
    // Kalau file baru
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
      await API.delete(
        `/atraksi/foto/${initialData.id}`,
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

  // 🟢 Submit perubahan ke backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!initialData?.id) {
      toast.error("ID data tidak ditemukan!");
      return;
    }

    if (!form.foto && !form.link_video) {
      toast.warning("Harap isi salah satu antara Foto/Video atau Link Video ");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nameEvent", form.nameEvent);
      formData.append("description_id", form.description_id);
      formData.append("description_en", form.description_en);
      formData.append("startdate", form.startdate);
      formData.append("enddate", form.enddate);
      formData.append("location_id", form.location_id);
      formData.append("location_en", form.location_en);
      if (form.foto && typeof form.foto === "object") {
        formData.append("foto", form.foto);
      }
      formData.append("link_video", form.link_video);

      const res = await API.patch(
        `/atraksi/${initialData.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      // console.log('🟡 Mengirim data edit ke backend:', form)
      console.log("🟢 Respons backend:", res.data);
      toast.success("Data atraksi berhasil diperbarui!");
      refreshData?.();
      onClose();
    } catch (error) {
      console.error("❌ Gagal memperbarui data:", error);
      toast.error("Gagal memperbarui data!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Atraksi</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Atraksi</Label>
              <Input
                name="nameEvent"
                value={form.nameEvent}
                onChange={handleChange}
                placeholder="Masukkan nama atraksi"
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Lokasi</Label>
              <Input
                name="location_id"
                value={form.location_id}
                onChange={handleChange}
                placeholder="Masukkan lokasi atraksi (Contoh: Kabupaten Banggai"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Deskripsi</Label>
              <Textarea
                name="description_id"
                value={form.description_id}
                onChange={handleChange}
                placeholder="Tulis deskripsi atraksi..."
                required
                className="w-full resize-none break-all whitespace-pre-wrap overflow-x-hidden"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tanggal Mulai</Label>
              <Input
                name="startdate"
                type="date"
                value={form.startdate}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tanggal Berakhir</Label>
              <Input
                name="enddate"
                type="date"
                value={form.enddate}
                onChange={handleChange}
                className="w-full"
                required
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
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataModal;
