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
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nama_makanan: '',
    lokasi: '',
    deskripsi: '',
    foto: ''
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        nama_makanan: initialData.nama_makanan || '',
        lokasi: initialData.lokasi || '',
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
    const { name, value, files } = e.target
    if (name === 'foto') setForm({ ...form, foto: files[0] })
    else setForm({ ...form, [name]: value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('nama_makanan', form.nama_makanan)
      formData.append('lokasi', form.lokasi)
      formData.append('deskripsi', form.deskripsi)
      formData.append('foto', form.foto)

      const res = await axios.patch(
        `http://localhost:3000/api/kuliner/${initialData.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      console.log('initialData di modal:', initialData)

      toast.success('Data kuliner berhasil ditambahkan!')
      console.log('Add success:', res.data)

      refreshData?.()
      onClose()
      navigate('/admin/kuliner')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal menyimpan data kuliner!')
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

        <div className='space-y-4 mt-4'>
          {/* Nama Makanan */}
          <div className='flex flex-col gap-2'>
            <Label>Nama Makanan</Label>
            <Input
              name='nama_makanan'
              value={form.nama_makanan}
              onChange={handleChange}
              placeholder='Masukkan nama makanan'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Daerah</Label>
            <Input
              name='lokasi'
              value={form.lokasi}
              onChange={handleChange}
              placeholder='Masukkan daerah makanan'
            />
          </div>

          {/* Deskripsi */}
          <div className='flex flex-col gap-2'>
            <Label>Deskripsi</Label>
            <Textarea
              name='deskripsi'
              value={form.deskripsi}
              onChange={handleChange}
              placeholder='Tuliskan deskripsi makanan...'
            />
          </div>

          {/* Foto */}
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

          {/* Tombol */}
          <div className='flex justify-end gap-2 mt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {initialData ? 'Simpan Perubahan' : 'Tambah Data'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditDataModal
