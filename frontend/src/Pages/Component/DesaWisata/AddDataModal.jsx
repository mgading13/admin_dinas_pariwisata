import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    namaDesa: "",
    namaDesa_en: "",
    lokasi: "",
    lokasi_en: "",
    deskripsi: "",
    deskripsi_en: "",
    foto: "",
    longitude: "",
    latitude: "",
    jenisDesa: "",
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
        namaDesa: initialData.namaDesa_id || "",
        namaDesa_en: initialData.namaDesa_en || "",
        lokasi: initialData.lokasi_id || "",
        lokasi_en: initialData.lokasi_en || "",
        deskripsi: initialData.deskripsi_id || "",
        deskripsi_en: initialData.deskripsi_en || "",
        foto: initialData.foto || "",
        longitude: initialData.longitude || "",
        latitude: initialData.latitude || "",
        jenisDesa: initialData.jenisDesa || "",
        link_video: initialData.link_video || "",
      });
    } else {
      setForm({
        namaDesa: "",
        namaDesa_en: "",
        lokasi: "",
        lokasi_en: "",
        deskripsi: "",
        deskripsi_en: "",
        foto: "",
        longitude: "",
        latitude: "",
        jenisDesa: "",
        link_video: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "namaDesa") debouncedTranslate(value, "namaDesa_en");
    if (name === "lokasi") debouncedTranslate(value, "lokasi_en");
    if (name === "deskripsi") debouncedTranslate(value, "deskripsi_en");
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
      await API.delete(
        `/desaWisata/foto/${initialData.id}`,
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
      formData.append("namaDesa_id", form.namaDesa);
      formData.append("namaDesa_en", form.namaDesa_en);
      formData.append("lokasi_id", form.lokasi);
      formData.append("lokasi_en", form.lokasi_en);
      formData.append("deskripsi_id", form.deskripsi);
      formData.append("deskripsi_en", form.deskripsi_en);

      if (form.foto && typeof form.foto === "object") {
        formData.append("foto", form.foto);
      }

      formData.append("longitude", form.longitude);
      formData.append("latitude", form.latitude);
      formData.append("jenisDesa", form.jenisDesa);
      formData.append("link_video", form.link_video);

      const res = await API.post(
        "/desaWisata/insert",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log("Response:", res.data);
      toast.success("Data berhasil ditambahkan!");
      refreshData?.();
      onClose();
    } catch (error) {
      console.error("Error:", error.response?.data);
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
            {initialData ? "Edit Data Desa Wisata" : "Tambah Data Desa Wisata"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Desa</Label>
              <Input
                name="namaDesa"
                value={form.namaDesa}
                onChange={handleChange}
                placeholder="Masukkan nama desa"
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
                placeholder="Masukkan lokasi desa wisata"
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
                placeholder="Tulis deskripsi desa wisata..."
                required
                className="w-full resize-none break-all whitespace-pre-wrap overflow-x-hidden"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Latitude</Label>
              <Input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="Masukkan koordinat latitude desa wisata"
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Longitude</Label>
              <Input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="Masukkan koordinat longitude desa wisata"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Select
                name="jenisDesa"
                value={form.jenisDesa || ""}
                onValueChange={(value) =>
                  handleChange({ target: { name: "jenisDesa", value } })
                }
                required
              >
                <SelectTrigger className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm">
                  <SelectValue placeholder="Jenis Desa" />
                </SelectTrigger>
                <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem className="text-md" value="DESA_WISATA">
                    Desa Wisata
                  </SelectItem>
                  <SelectItem className="text-md" value="DESA_UNGGULAN">
                    Wisata Unggulan
                  </SelectItem>
                </SelectContent>
              </Select>
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
                {initialData ? "Simpan Perubahan" : "Tambah Data"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataModal;
