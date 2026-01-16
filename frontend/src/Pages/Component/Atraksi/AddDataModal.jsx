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

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nameEvent: '',
    description: '',
    foto: '',
    startdate: '',
    enddate: '',
    location: ''
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        nameEvent: initialData.nameEvent || '',
        description: initialData.description_id || '',
        foto: initialData.foto || '',
        startdate: initialData.startdate?.split('T')[0] || '',
        enddate: initialData.enddate?.split('T')[0] || '',
        location: initialData.location_id || ''
      })
    } else {
      setForm({
        nameEvent: '',
        description: '',
        foto: '',
        startdate: '',
        enddate: '',
        location: ''
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
    try {
      const formData = new FormData()
      formData.append('nameEvent', form.nameEvent)
      formData.append('description', form.description)
      if (form.foto && typeof form.foto === 'object') {
        formData.append('foto', form.foto)
      }
      formData.append('startdate', form.startdate)
      formData.append('enddate', form.enddate)
      formData.append('location', form.location)

      // 🟢 Mode Tambah
      const res = await axios.post(
        'http://localhost:3000/api/atraksi/insert',
        formData
      )
      toast.success('Data berhasil ditambahkan!')
      navigate('/admin/atraksi')
      onClose()
      console.log('Add success:', res.data)

      refreshData?.()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal menyimpan data!')
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
