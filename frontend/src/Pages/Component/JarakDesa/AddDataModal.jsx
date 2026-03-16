import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import API from "@/lib/api";

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [desaList, setDesaList] = useState([]);
  const [existingRoutes, setExistingRoutes] = useState([]);
  const [form, setForm] = useState({
    titikKota: "",
    jalur_darat: "",
    jalur_laut: "",
    jalur_udara: "",
    desaId: "",
  });

  // fetch desa
  useEffect(() => {
    async function fetchDesa() {
      try {
        const res = await API.get("/desaWisata/");
        setDesaList(res.data);
      } catch (error) {
        console.error("Gagal ambil list desa wisata:", error);
      }
    }

    fetchDesa();
  }, []);

  // fetch route berdasarkan desa
  useEffect(() => {
    if (!form.desaId) {
      setExistingRoutes([]);
      return;
    }

    let isCurrent = true;

    API.get(`/jarak?desaId=${form.desaId}`)
      .then((res) => {
        if (isCurrent) {
          setExistingRoutes(res.data);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setExistingRoutes([]);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [form.desaId]);

  // edit mode
  useEffect(() => {
    if (initialData) {
      setForm({
        titikKota: initialData.titikKota || "",
        jalur_darat: initialData.jalur_darat || "",
        jalur_laut: initialData.jalur_laut || "",
        jalur_udara: initialData.jalur_udara || "",
        desaId: initialData.desaId || "",
      });
    } else {
      setForm({
        titikKota: "",
        jalur_darat: "",
        jalur_laut: "",
        jalur_udara: "",
        desaId: "",
      });
    }
  }, [initialData, open]);

  // kota yang sudah digunakan
  const usedCities = existingRoutes
    .filter((r) => Number(r.desaId) === Number(form.desaId))
    .map((r) => r.titikKota?.toUpperCase());

  // kota yang dipilih user
  const selectedCity = form.titikKota?.toUpperCase();

  // cek duplicate
  const isDuplicateCity = usedCities.includes(selectedCity);

  // cek apakah sudah lengkap
  const isFull =
    form.desaId && usedCities.includes("PALU") && usedCities.includes("LUWUK");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.desaId) {
      toast.warning("Pilih desa terlebih dahulu");
      return;
    }

    if (isDuplicateCity) {
      toast.warning("Titik kota sudah ada untuk desa ini");
      return;
    }

    if (isFull) {
      toast.warning("Desa ini sudah memiliki rute Palu dan Luwuk");
      return;
    }

    try {
      const payload = {
        desaId: Number(form.desaId),
        titikKota: form.titikKota,
        jalur_darat: form.jalur_darat,
        jalur_laut: form.jalur_laut,
        jalur_udara: form.jalur_udara,
      };

      await API.post("/jarak/insert", payload);

      toast.success("Jalur desa berhasil ditambahkan");

      refreshData?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambahkan jalur desa");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Jalur Desa" : "Tambah Jalur Desa"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* PILIH DESA */}
          <div className="flex flex-col gap-2">
            <Label>Pilih Desa</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {form.desaId
                    ? desaList.find((d) => String(d.id) === String(form.desaId))
                        ?.namaDesa_id
                    : "Pilih Desa"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Cari nama desa..." />

                  <CommandEmpty>Desa tidak ditemukan</CommandEmpty>

                  <CommandGroup className="max-h-60 overflow-y-auto">
                    {desaList.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.namaDesa_id}
                        onSelect={() =>
                          setForm((prev) => ({
                            ...prev,
                            desaId: item.id,
                            titikKota: "",
                          }))
                        }
                      >
                        {item.namaDesa_id}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* TITIK KOTA */}
          <div className="flex flex-col gap-2">
            <Label>Titik Kota</Label>

            <Select
              value={form.titikKota}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  titikKota: value,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Titik Kota" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="PALU">Palu</SelectItem>
                <SelectItem value="LUWUK">Luwuk</SelectItem>
              </SelectContent>
            </Select>

            {/* WARNING DUPLICATE */}
            {isDuplicateCity && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                Titik kota {form.titikKota} sudah pernah ditambahkan untuk desa
                ini
              </div>
            )}

            {/* WARNING FULL */}
            {isFull && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                Desa ini sudah memiliki rute dari Palu dan Luwuk
              </div>
            )}
          </div>

          {/* JALUR DARAT */}
          <div className="flex flex-col gap-2">
            <Label>Jalur Darat</Label>

            <Textarea
              name="jalur_darat"
              value={form.jalur_darat}
              onChange={handleChange}
              placeholder="Masukkan jalur menuju desa"
              required
            />
          </div>

          {/* JALUR LAUT */}
          <div className="flex flex-col gap-2">
            <Label>Jalur Laut</Label>

            <Textarea
              name="jalur_laut"
              value={form.jalur_laut}
              onChange={handleChange}
              placeholder="Masukkan jalur menuju desa"
              required
            />
          </div>

          {/* JALUR UDARA */}
          <div className="flex flex-col gap-2">
            <Label>Jalur Udara</Label>

            <Textarea
              name="jalur_udara"
              value={form.jalur_udara}
              onChange={handleChange}
              placeholder="Masukkan jalur menuju desa"
              required
            />
          </div>

          {/* BUTTON */}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>

            <Button onClick={handleSubmit}>
              {initialData ? "Simpan Perubahan" : "Tambah Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataModal;
