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

const EditDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [form, setForm] = useState({
    nameEvent: '',
    description_id: '',
    foto: '',
    startdate: '',
    enddate: '',
    location_id: ''
  })

  // 🟢 Saat modal dibuka, isi otomatis form dengan data lama
  useEffect(() => {
    if (initialData) {
      setForm({
        nameEvent: initialData.nameEvent || '',
        description_id: initialData.description_id || '',
        foto: initialData.foto || '',
        startdate: initialData.startdate?.split('T')[0] || '',
        enddate: initialData.enddate?.split('T')[0] || '',
        location_id: initialData.location_id || ''
      })
    } else {
      setForm({
        nameEvent: '',
        description_id: '',
        foto: '',
        startdate: '',
        enddate: '',
        location_id: ''
      })
    }
  }, [initialData, open])

  // 🟡 Update state saat input berubah
  const handleChange = e => {
    const { name, value, files } = e.target
    if (name === 'foto') setForm({ ...form, foto: files[0] })
    else setForm({ ...form, [name]: value })
  }

  // 🟢 Submit perubahan ke backend
  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append('nameEvent', form.nameEvent)
      formData.append('description_id', form.description_id)
      formData.append('description_en', form.description_id)
      formData.append('startdate', form.startdate)
      formData.append('enddate', form.enddate)
      formData.append('location_id', form.location_id)
      formData.append('location_en', form.location_en)
      if (form.foto && typeof form.foto !== 'string') {
        formData.append('foto', form.foto)
      }

      console.log('🟡 Mengirim data edit ke backend:', form)

      const res = await axios.put(
        `http://localhost:3000/api/atraksi/${initialData.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      console.log('🟢 Respons backend:', res.data)
      toast.success('Data atraksi berhasil diperbarui!')
      await refreshData?.()
      onClose()
    } catch (error) {
      console.error('❌ Gagal memperbarui data:', error)
      toast.error('Gagal memperbarui data!')
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
                name='location'
                value={form.location_id}
                onChange={handleChange}
                placeholder='Masukkan lokasi atraksi'
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Deskripsi</Label>
              <Textarea
                name='description'
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
              <Button type='submit'>Simpan Perubahan</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditDataModal
