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
import { useState } from 'react'
import axios from 'axios'

const AddDataModal = ({ open, onClose, initialData }) => {
  const [form, setForm] = useState({
    nameEvent: '',
    description: '',
    foto: '',
    startdate: '',
    enddate: '',
    location: ''
  })

  const createData = async e => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('nameEvent', form.nameEvent)
      formData.append('description', form.description)
      formData.append('foto', form.foto)
      formData.append('startdate', form.startdate)
      formData.append('enddate', form.enddate)
      formData.append('location', form.location)
      const response = await axios.post(
        'http://localhost:3000/api/atraksi/insert',
        formData
        // {
        //   headers: { 'Content-Type': 'application/json' }
        // }
      )

      const res = response.data
      setForm(res)
      console.log(res)

      setForm({
        nameEvent: '',
        description: '',
        foto: '',
        startdate: '',
        enddate: '',
        location: ''
      })
      console.log('berhasil kah?')
    } catch (error) {
      console.log(error)
    }
  }

  // Set form sesuai initialData jika ada (mode edit)
  // useEffect(() => {
  //   if (initialData) {
  //     setForm({
  //       namaAtraksi: initialData.namaAtraksi || '',
  //       deskripsi: initialData.deskripsi || '',
  //       foto: initialData.foto || '',
  //       tanggalMulai: initialData.tanggalMulai || '',
  //       tanggalBerakhir: initialData.tanggalBerakhir || '',
  //       lokasi: initialData.lokasi || ''
  //     })
  //   } else {
  //     setForm({
  //       namaAtraksi: '',
  //       deskripsi: '',
  //       foto: '',
  //       tanggalMulai: '',
  //       tanggalBerakhir: '',
  //       lokasi: ''
  //     })
  //   }
  // }, [initialData, open])

  // const handleChange = e => {
  //   const { name, value, files } = e.target
  //   if (name === 'foto') setForm({ ...form, foto: files[0] })
  //   else setForm({ ...form, [name]: value })
  // }

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handlePhoto = e => {
    const photo = e.target.files[0]
    setForm({ ...form, foto: photo })
  }

  // const handleSubmit = () => {
  //   onSubmit(form)
  //   onClose()
  // }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Data Atraksi' : 'Tambah Data Atraksi'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={createData}>
          <div className='space-y-4 mt-4'>
            <div>
              <Label>Nama Atraksi</Label>
              <Input
                name='nameEvent'
                value={form.nameEvent}
                onChange={handleChange}
                placeholder='Masukkan nama atraksi'
              />
            </div>

            <div>
              <Label>Deskripsi</Label>
              <Textarea
                name='description'
                value={form.description}
                onChange={handleChange}
                placeholder='Tulis deskripsi atraksi...'
              />
            </div>

            <div>
              <Label>Foto</Label>
              <Input
                name='foto'
                type='file'
                accept='image/*'
                onChange={handlePhoto}
              />
              {form.foto && typeof form.foto === 'string' && (
                <img
                  src={form.foto}
                  alt='Preview'
                  className='mt-2 w-24 h-24 object-cover rounded-md border'
                />
              )}
            </div>

            <div>
              <Label>Tanggal Mulai</Label>
              <Input
                name='startdate'
                type='date'
                value={form.startdate}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Tanggal Berakhir</Label>
              <Input
                name='enddate'
                type='date'
                value={form.enddate}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Lokasi</Label>
              <Input
                name='location'
                value={form.location}
                onChange={handleChange}
                placeholder='Masukkan lokasi atraksi'
              />
            </div>

            <div className='flex justify-end gap-2 mt-4'>
              <Button variant='outline' onClick={onClose}>
                Batal
              </Button>
              <Button type='submit'>Tambah Data</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddDataModal
