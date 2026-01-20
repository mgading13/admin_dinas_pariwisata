import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import debounce from "lodash.debounce";

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nameEvent: '',
    description_id: '',
    description_en: '',
    foto: '',
    startdate: '',
    enddate: '',
    location_id: '',
    location_en: ''
  })

  // --- START LOGIKA DEBOUNCE ---
  const translateText = async (text, fieldTarget) => {
    if (!text || text.trim().length < 3) return;
    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURI(text)}`
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
    []
  );
  // --- END LOGIKA DEBOUNCE ---

  // 🟢 Saat modal dibuka, isi otomatis form dengan data lama
  useEffect(() => {
    if (open) {
      setLoading(false);
    if (initialData) {
      setForm({
        nameEvent: initialData.nameEvent || '',
        description_id: initialData.description_id || '',
        description_en: initialData.description_en || '',
        foto: initialData.foto || '',
        startdate: initialData.startdate?.split('T')[0] || '',
        enddate: initialData.enddate?.split('T')[0] || '',
        location_id: initialData.location_id || '',
        location_en: initialData.location_en || ''
      })
    } else {
      setForm({
        nameEvent: '',
        description_id: '',
        foto: '',
        startdate: '',
        enddate: '',
        location_id: ''
      });
    }}
  }, [initialData, open])

  // 🟡 Update state saat input berubah
  const handleChange = e => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }));

    // Trigger translate otomatis untuk deskripsi dan lokasi
    if (name === "description_id") debouncedTranslate(value, "description_en");
    if (name === "location_id") debouncedTranslate(value, "location_en");
  };

  // 🟢 Submit perubahan ke backend
  const handleSubmit = async e => {
    e.preventDefault()
    
    if (!initialData?.id) {
      toast.error("ID data tidak ditemukan!");
      return;
    } 
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData()
      formData.append('nameEvent', form.nameEvent)
      formData.append('description_id', form.description_id)
      formData.append('description_en', form.description_en)
      formData.append('startdate', form.startdate)
      formData.append('enddate', form.enddate)
      formData.append('location_id', form.location_id)
      formData.append('location_en', form.location_en)
      if (form.foto && typeof form.foto === 'object') {
        formData.append('foto', form.foto)
      }

      const res = await axios.patch(
        `http://localhost:3000/api/atraksi/${initialData.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      // console.log('🟡 Mengirim data edit ke backend:', form)
      console.log('🟢 Respons backend:', res.data)
      toast.success('Data atraksi berhasil diperbarui!')
      refreshData?.()
      onClose()
    } catch (error) {
      console.error('❌ Gagal memperbarui data:', error)
      toast.error('Gagal memperbarui data!')
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Data Atraksi</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='space-y-4 mt-4'>
            <div className='flex flex-col gap-2'>
              <Label>Nama Atraksi</Label>
              <Input
                name='nameEvent'
                value={form.nameEvent}
                onChange={handleChange}
                placeholder='Masukkan nama atraksi'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Lokasi</Label>
              <Input
                name='location_id'
                value={form.location_id}
                onChange={handleChange}
                placeholder='Masukkan lokasi atraksi'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Deskripsi</Label>
              <Textarea
                name='description_id'
                value={form.description_id}
                onChange={handleChange}
                placeholder='Tulis deskripsi atraksi...'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Tanggal Mulai</Label>
              <Input
                name='startdate'
                type='date'
                value={form.startdate}
                onChange={handleChange}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Tanggal Berakhir</Label>
              <Input
                name='enddate'
                type='date'
                value={form.enddate}
                onChange={handleChange}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Foto</Label>
              <Input
                name='foto'
                type='file'
                accept='image/*'
                onChange={handleChange}
              />
              {form.foto && typeof form.foto === 'string' && (
                <img
                  src={`http://localhost:3000${form.foto}`}
                  alt='Preview'
                  className='mt-2 w-24 h-24 object-cover rounded-md border'
                />
              )}
            </div>

            <div className='flex justify-end gap-2 mt-4'>
              <Button type='button' variant='outline' onClick={onClose}>
                Batal
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDataModal
