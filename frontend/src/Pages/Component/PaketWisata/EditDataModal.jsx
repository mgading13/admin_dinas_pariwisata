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
    nama_wisata_id: "",
    nama_wisata_en: "",
    lokasi_id: "",
    lokasi_en: "",
    deskripsi_id: "",
    deskripsi_en: "",
    harga: "",
    hargaDisplay: "",
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

  const formatToRupiah = (num) => {
    if (!num) return "";
    return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const extractNumber = (str) => {
    if (!str) return "";
    return str.replace(/\D/g, "");
  };

  const formatPhoneDisplay = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, "").slice(0, 13); // max 13 digit

    return cleaned.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) =>
      c ? `${a}-${b}-${c}` : `${a}-${b}`,
    );
  };

  const formatPhoneToDB = (value) => {
    if (!value) return "";
    let cleaned = value.replace(/\D/g, "");

    if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
    if (cleaned.startsWith("62")) return cleaned;

    return "62" + cleaned;
  };

  useEffect(() => {
    if (open) {
      setLoading(false);
      if (initialData) {
        const rawHarga = initialData.harga?.toString() || "";
        const formattedHarga = formatToRupiah(rawHarga);

        const rawPhone = initialData.kontak?.toString() || "";
        const displayPhone = rawPhone.startsWith("62")
          ? "0" + rawPhone.slice(2)
          : rawPhone;

        setForm({
          nama_wisata_id: initialData.nama_wisata_id || "",
          nama_wisata_en: initialData.nama_wisata_en || "",
          lokasi_id: initialData.lokasi_id || "",
          lokasi_en: initialData.lokasi_en || "",
          deskripsi_id: initialData.deskripsi_id || "",
          deskripsi_en: initialData.deskripsi_en || "",
          harga: rawHarga,
          hargaDisplay: formattedHarga,
          kontak: formatPhoneDisplay(displayPhone.replace(/\D/g, "")),
          kontak_raw: displayPhone.replace(/\D/g, ""),
          media: initialData.media || "",
          link_video: initialData.link_video || "",
        });
      } else {
        setForm({
          nama_wisata_id: "",
          lokasi_id: "",
          deskripsi_id: "",
          harga: "",
          hargaDisplay: "",
          kontak: "",
          kontak_raw: "",
          media: "",
          link_video: "",
        });
      }
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nama_wisata_id") debouncedTranslate(value, "nama_wisata_en");

    if (name === "lokasi_id") debouncedTranslate(value, "lokasi_en");

    if (name === "deskripsi_id") debouncedTranslate(value, "deskripsi_en");

    if (name === "harga") {
      const raw = extractNumber(value);
      setForm((prev) => ({
        ...prev,
        harga: raw,
        hargaDisplay: formatToRupiah(raw),
      }));
      return;
    }

    if (name === "kontak") {
      const raw = value.replace(/\D/g, "");
      setForm((prev) => ({
        ...prev,
        kontak: formatPhoneDisplay(raw),
        kontak_raw: raw,
      }));
      return;
    }

    if (name === "link_video") {
      setForm((prev) => ({
        ...prev,
        link_video: value,
        media: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        media: file,
        link_video: "",
      }));
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
      await API.delete(`/tourPackage/media/${initialData.id}`);

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
    setForm((prev) => ({
      ...prev,
      link_video: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!initialData?.id) {
      toast.error("ID data tidak ditemukan!");
      return;
    }
    if (
      (!form.media || form.media === "") &&
      (!form.link_video || form.link_video.trim() === "")
    ) {
      toast.warning("Harap isi salah satu antara Foto/Video atau Link Video ");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nama_wisata_id", form.nama_wisata_id);
      formData.append("nama_wisata_en", form.nama_wisata_en);
      formData.append("lokasi_id", form.lokasi_id);
      formData.append("lokasi_en", form.lokasi_en);
      formData.append("deskripsi_id", form.deskripsi_id);
      formData.append("deskripsi_en", form.deskripsi_en);
      formData.append("harga", form.harga); // angka mentah
      formData.append("kontak", formatPhoneToDB(form.kontak_raw));

      if (form.media instanceof File) {
        formData.append("media", form.media);
      }

      formData.append("link_video", form.link_video);

      const res = await API.patch(`/tourPackage/${initialData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("🟢 Respons backend:", res.data);
      console.log("initialData:", initialData);
      toast.success("Paket Wisata berhasil diperbarui!");
      refreshData?.();
      onClose();
    } catch (error) {
      console.error("❌ Gagal memperbarui data:", error);
      toast.error("Gagal memperbarui Paket Wisata!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Paket Wisata</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label>Nama Wisata</Label>
            <Input
              name="nama_wisata_id"
              value={form.nama_wisata_id}
              onChange={handleChange}
              placeholder="Masukkan nama paket wisata"
              required
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Lokasi</Label>
            <Input
              name="lokasi_id"
              value={form.lokasi_id}
              onChange={handleChange}
              placeholder="Masukkan lokasi wisata"
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
              placeholder="Tulis deskripsi paket wisata..."
              required
              className="w-full resize-none break-all whitespace-pre-wrap overflow-x-hidden"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Harga</Label>
            <Input
              name="harga"
              value={form.hargaDisplay}
              onChange={handleChange}
              placeholder="Masukkan harga wisata"
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
              placeholder="Masukkan kontak paket wisata"
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
                      src={`http://localhost:3000${form.media}`}
                      controls
                      className="w-32 h-32 rounded-md border object-cover"
                    />
                  ) : (
                    <img
                      src={`http://localhost:3000${form.media}`}
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

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Simpan Perubahan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataModal;
