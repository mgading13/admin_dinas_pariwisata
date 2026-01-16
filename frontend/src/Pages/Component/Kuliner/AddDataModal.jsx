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
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nama_makanan: '',
    lokasi: '',
    deskripsi: '',
    foto: ''
  })

  // 🔁 SET FORM SAAT EDIT / OPEN MODAL
  useEffect(() => {
    if (initialData) {
      setForm({
        nama_makanan: initialData.nama_makanan || '',
        lokasi: initialData.lokasi || '',
        // 🔥 PENTING: AMBIL deskripsi_id
        deskripsi: initialData.deskripsi_id || '',
        foto: initialData.foto || ''
      })
    } else {
      setForm({
        nama_makanan: '',
        lokasi: '',
        deskripsi: '',
        foto: ''
      })
    }
  }, [initialData, open])

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
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
      formData.append('nama_makanan', form.nama_makanan)
      formData.append('lokasi', form.lokasi)

      // 🔥 KIRIM SATU DESKRIPSI (INDONESIA)
      // BACKEND YANG TERJEMAHKAN
      formData.append('deskripsi', form.deskripsi)

      if (form.foto && typeof form.foto === 'object') {
        formData.append('foto', form.foto)
      }

      const res = await axios.post(
        'http://localhost:3000/api/kuliner/insert',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      console.log('Response:', res.data)
      toast.success('Data kuliner berhasil ditambahkan!')
      refreshData?.()
      onClose()
    } catch (error) {
      console.error('Error:', error.response?.data)
      toast.error('Gagal menyimpan data kuliner!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Data Kuliner' : 'Tambah Data Kuliner'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='space-y-4 mt-4'>
            <div className='flex flex-col gap-2'>
              <Label>Nama Makanan</Label>
              <Input
                name='nama_makanan'
                value={form.nama_makanan}
                onChange={handleChange}
                placeholder='Masukkan nama makanan'
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Daerah</Label>
              <Input
                name='lokasi'
                value={form.lokasi}
                onChange={handleChange}
                placeholder='Masukkan daerah kuliner'
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Deskripsi</Label>
              <Textarea
                name='deskripsi'
                value={form.deskripsi}
                onChange={handleChange}
                placeholder='Tulis deskripsi kuliner...'
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Foto</Label>
              <Input
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
              <Button disabled={loading}>
                {loading
                  ? 'Menyimpan...'
                  : initialData
                  ? 'Simpan Perubahan'
                  : 'Tambah Data'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddDataModal
