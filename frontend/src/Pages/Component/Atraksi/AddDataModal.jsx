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
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import debounce from "lodash.debounce";

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nameEvent: '',
    description: '', // Gunakan _id agar sinkron
    description_en: '',
    location: '',    // Gunakan _id agar sinkron
    location_en: '',
    startdate: '',
    enddate: '',
    foto: ''
  })

  // --- LOGIKA DEBOUNCE TRANSLATE ---
  const translateText = async (text, fieldTarget) => {
    if (!text || text.trim().length < 3) return;
    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURI(text)}`
      );
      if (res.data && res.data[0]) {
        const fullTranslation = res.data[0]
          .map((item) => item[0])
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

  useEffect(() => {
    if (initialData) {
      setForm({
        nameEvent: initialData.nameEvent || '',
        description: initialData.description_id || '',
        description_en: initialData.description_en || '',
        foto: initialData.foto || '',
        startdate: initialData.startdate?.split('T')[0] || '',
        enddate: initialData.enddate?.split('T')[0] || '',
        location: initialData.location_id || '',
        location_en: initialData.location_en || ''
      })
    } else {
      setForm({
        nameEvent: '',
        description: '',
        description_en: '',
        foto: '',
        startdate: '',
        enddate: '',
        location: '',
        location_en: ''
      })
    }
  }, [initialData, open])

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    // TRIGGER TRANSLATE OTOMATIS
    if (name === "description") {
      debouncedTranslate(value, "description_en");
    }
    if (name === "location") {
      debouncedTranslate(value, "location_en");
    }
  }

  const handlePhoto = e => {
    const file = e.target.files[0]
    setForm({ ...form, foto: file })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('nameEvent', form.nameEvent)
      formData.append('description_id', form.description)
      formData.append('description_en', form.description_en)
      formData.append('startdate', form.startdate)
      formData.append('enddate', form.enddate)
      formData.append('location_id', form.location)
      formData.append('location_en', form.location_en)
      if (form.foto && typeof form.foto === 'object') {
        formData.append('foto', form.foto)
      }

      // 🟢 Mode Tambah
      const res = await axios.post(
        'http://localhost:3000/api/atraksi/insert',
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log("Response:", res.data);
      toast.success('Data berhasil ditambahkan!')
      navigate('/admin/atraksi')
      console.log('Add success:', res.data)
      refreshData?.()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal menyimpan data!')
    } finally {
      setLoading(false); // Matikan loading
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Data Atraksi' : 'Tambah Data Atraksi'}
          </DialogTitle>
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
                required
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Lokasi</Label>
              <Input
                name='location'
                value={form.location}
                onChange={handleChange}
                placeholder='Masukkan lokasi atraksi'
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Deskripsi</Label>
              <Textarea
                name='description'
                value={form.description}
                onChange={handleChange}
                placeholder='Tulis deskripsi atraksi...'
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Tanggal Mulai</Label>
              <Input
                name='startdate'
                type='date'
                value={form.startdate}
                onChange={handleChange}
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Tanggal Berakhir</Label>
              <Input
                name='enddate'
                type='date'
                value={form.enddate}
                onChange={handleChange}
                required
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Foto</Label>
              <Input
                name='foto'
                type='file'
                accept='image/*'
                onChange={handlePhoto}
                required={!initialData}
              />
              {form.foto && typeof form.foto === 'string' && (
                <img
                  src={form.foto}
                  alt='Preview'
                  className='mt-2 w-24 h-24 object-cover rounded-md border'
                />
              )}
            </div>

            <div className='flex justify-end gap-2 mt-4'>
              <Button type='button' variant='outline' onClick={onClose}>
                Batal
              </Button>
              <Button onClick={handleSubmit}>
                {initialData ? 'Simpan Perubahan' : 'Tambah Data'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddDataModal
