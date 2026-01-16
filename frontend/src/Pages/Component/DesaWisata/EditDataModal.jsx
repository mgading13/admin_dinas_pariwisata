import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [form, setForm] = useState({
    namaDesa_id: '',
    lokasi_id: '',
    deskripsi_id: '',
    foto: '',
    longitude: '',
    latitude: '',
    jenisDesa: ''
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        namaDesa_id: initialData.namaDesa_id || '',
        lokasi_id: initialData.lokasi_id || '',
        deskripsi_id: initialData.deskripsi_id || '',
        foto: initialData.foto || '',
        longitude: initialData.longitude || '',
        latitude: initialData.latitude || '',
        jenisDesa: initialData.jenisDesa || ''
      })
    } else {
      setForm({
        namaDesa_id: '',
        lokasi_id: '',
        deskripsi_id: '',
        foto: '',
        longitude: '',
        latitude: '',
        jenisDesa: ''
      })
    }
  }, [initialData, open])

  const handleChange = e => {
    const { name, value, files } = e.target
    if (name === 'foto') setForm({ ...form, foto: files[0] })
    else setForm({ ...form, [name]: value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    // Proteksi agar ID tidak undefined
    if (!initialData?.id) {
      toast.error('ID data tidak ditemukan!')
      return
    }
    try {
      const formData = new FormData()
      // OTOMATISASI: Mengisi field _en dengan nilai dari field _id
      formData.append('namaDesa_id', form.namaDesa_id)
      formData.append('namaDesa_en', form.namaDesa_id) // Otomatis sama

      formData.append('lokasi_id', form.lokasi_id)
      formData.append('lokasi_en', form.lokasi_id) // Otomatis sama

      formData.append('deskripsi_id', form.deskripsi_id)
      formData.append('deskripsi_en', form.deskripsi_id) // Otomatis sama

      // 1. Data Indonesia dari Input Form
      // formData.append("namaDesa_id", form.namaDesa_id);
      // formData.append("namaDesa_en", form.namaDesa_id); // Otomatis sama dengan ID
      // formData.append("lokasi_id", form.lokasi_id);
      // formData.append("lokasi_en", form.lokasi_id); // Otomatis sama dengan ID
      // formData.append("deskripsi_id", form.deskripsi_id);
      // formData.append("deskripsi_en", form.deskripsi_id); // Otomatis sama dengan ID

      // // 2. Data Inggris (Diambil dari data lama agar tidak hilang di DB)
      // // Jika kamu ingin bahasa Inggris otomatis SAMA dengan Indonesia,
      // // ganti initialData.namaDesa_en menjadi form.namaDesa_id
      // formData.append("namaDesa_en", initialData.namaDesa_en || form.namaDesa_id);
      // formData.append("lokasi_en", initialData.lokasi_en || form.lokasi_id);
      // formData.append("deskripsi_en", initialData.deskripsi_en || form.deskripsi_id);

      // formData.append("namaDesa", form.namaDesa);
      // formData.append("lokasi", form.lokasi);
      // formData.append("deskripsi", form.deskripsi);

      // 👉 FIX TERPENTING
      if (form.foto && typeof form.foto === 'object') {
        formData.append('foto', form.foto)
      }

      formData.append('longitude', form.longitude)
      formData.append('latitude', form.latitude)
      formData.append('jenisDesa', form.jenisDesa)

      const res = await axios.patch(
        `http://localhost:3000/api/desaWisata/${initialData.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      console.log('respons backend', res.data)
      toast.success('Data berhasil ditambahkan!')
      refreshData?.()
      onClose()
    } catch (error) {
      console.error('Error:', error.response?.data)
      // Untuk melihat detail kenapa 400 Bad Request
      console.error('Detail Error Backend:', error.response?.data)
      toast.error('Gagal menyimpan data!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md max-h-[95vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Data Desa Wisata' : 'Tambah Data Desa Wisata'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4 mt-4'>
            <div className='flex flex-col gap-2'>
              <Label>Nama Desa</Label>
              <Input
                name='namaDesa_id'
                value={form.namaDesa_id}
                onChange={handleChange}
                placeholder='Masukkan nama desa'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Lokasi</Label>
              <Input
                name='lokasi_id'
                value={form.lokasi_id}
                onChange={handleChange}
                placeholder='Masukkan lokasi desa wisata'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Deskripsi</Label>
              <Textarea
                name='deskripsi_id'
                value={form.deskripsi_id}
                onChange={handleChange}
                placeholder='Tulis deskripsi desa wisata...'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Latitude</Label>
              <Input
                name='latitude'
                value={form.latitude}
                onChange={handleChange}
                placeholder='Masukkan koordinat latitude desa wisata'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Longitude</Label>
              <Input
                name='longitude'
                value={form.longitude}
                onChange={handleChange}
                placeholder='Masukkan koordinat longitude desa wisata'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Select
                name='jenisDesa'
                value={form.jenisDesa || ''}
                onValueChange={value =>
                  handleChange({ target: { name: 'jenisDesa', value } })
                }
              >
                <SelectTrigger className='w-full h-10 border border-input bg-background rounded-md px-3 text-sm'>
                  <SelectValue placeholder='Jenis Desa' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className='text-md' value='DESA_WISATA'>
                    Desa Wisata
                  </SelectItem>
                  <SelectItem className='text-md' value='DESA_UNGGULAN'>
                    Wisata Unggulan
                  </SelectItem>
                </SelectContent>
              </Select>
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
              <Button type='submit'>
                {initialData ? 'Simpan Perubahan' : 'Tambah Data'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditDataModal
