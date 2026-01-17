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
    nama_wisata_id: '',
    lokasi_id: '',
    deskripsi_id: '',
    harga: '',
    hargaDisplay: '',
    kontak: '',
    media: ''
  })

  // Utility Format Rupiah
  const formatToRupiah = num => {
    if (!num) return ''
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const extractNumber = str => {
    if (!str) return ''
    return str.replace(/\D/g, '')
  }

  // Format tampilan UI -> 0821-1234-5678
  const formatPhoneDisplay = value => {
    if (!value) return ''
    const cleaned = value.replace(/\D/g, '').slice(0, 13) // max 13 digit

    return cleaned.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) =>
      c ? `${a}-${b}-${c}` : `${a}-${b}`
    )
  }

  // Format yang dikirim ke DB -> 6282112345678
  const formatPhoneToDB = value => {
    if (!value) return ''
    let cleaned = value.replace(/\D/g, '')

    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1)
    if (cleaned.startsWith('62')) return cleaned

    return '62' + cleaned
  }

  // Isi otomatis form saat edit
  useEffect(() => {
    if (initialData) {
      const rawHarga = initialData.harga?.toString() || ''
      const formattedHarga = formatToRupiah(rawHarga)

      const rawPhone = initialData.kontak?.toString() || ''
      const displayPhone = rawPhone.startsWith('62')
        ? '0' + rawPhone.slice(2)
        : rawPhone

      setForm({
        nama_wisata_id: initialData.nama_wisata_id || '',
        lokasi_id: initialData.lokasi_id || '',
        deskripsi_id: initialData.deskripsi_id || '',
        harga: rawHarga,
        hargaDisplay: formattedHarga,

        kontak: formatPhoneDisplay(displayPhone.replace(/\D/g, '')),
        kontak_raw: displayPhone.replace(/\D/g, ''),

        media: initialData.media || ''
      })
    } else {
      setForm({
        nama_wisata_id: '',
        lokasi_id: '',
        deskripsi_id: '',
        harga: '',
        hargaDisplay: '',
        kontak: '',
        kontak_raw: '',
        media: ''
      })
    }
  }, [initialData, open])

  const handleChange = e => {
    const { name, value, files } = e.target

    // Harga tetap sama seperti sebelumnya
    if (name === 'harga') {
      const raw = extractNumber(value)
      setForm({
        ...form,
        harga: raw,
        hargaDisplay: formatToRupiah(raw)
      })
      return
    }

    // Format nomor telepon
    if (name === 'kontak') {
      const raw = value.replace(/\D/g, '')
      setForm({
        ...form,
        kontak: formatPhoneDisplay(raw), // UI
        kontak_raw: raw // mentah
      })
      return
    }

    // Media (foto)
    if (name === 'media') {
      setForm({ ...form, media: files[0] })
      return
    }

    setForm({ ...form, [name]: value })
  }

  // Submit
  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append('nama_wisata_id', form.nama_wisata_id)
      formData.append('nama_wisata_en', form.nama_wisata_id)
      formData.append('lokasi_id', form.lokasi_id)
      formData.append('lokasi_en', form.lokasi_id)
      formData.append('deskripsi_id', form.deskripsi_id)
      formData.append('deskripsi_en', form.deskripsi_id)
      formData.append('harga', form.harga) // angka mentah
      formData.append('kontak', formatPhoneToDB(form.kontak_raw))

      if (form.media instanceof File) {
        formData.append('media', form.media)
      }

      console.log('🟡 Mengirim data edit ke backend:', form)

      const res = await axios.patch(
        `http://localhost:3000/api/tourPackage/${initialData.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      console.log('🟢 Respons backend:', res.data)
      toast.success('Paket Wisata berhasil diperbarui!')
      await refreshData?.()
      onClose()
    } catch (error) {
      console.error('❌ Gagal memperbarui data:', error)
      toast.error('Gagal memperbarui Paket Wisata!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Paket Wisata</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 mt-4'>
          <div className='flex flex-col gap-2'>
            <Label>Nama Wisata</Label>
            <Input
              name='nama_wisata'
              value={form.nama_wisata_id}
              onChange={handleChange}
              placeholder='Masukkan jenis wisata'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Lokasi</Label>
            <Input
              name='lokasi'
              value={form.lokasi_id}
              onChange={handleChange}
              placeholder='Masukkan lokasi wisata'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Deskripsi</Label>
            <Textarea
              name='deskripsi'
              value={form.deskripsi_id}
              onChange={handleChange}
              placeholder='Tulis deskripsi wisata...'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Harga</Label>
            <Input
              name='harga'
              value={form.hargaDisplay}
              onChange={handleChange}
              placeholder='Masukkan harga wisata'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Kontak</Label>
            <Input
              name='kontak'
              value={form.kontak}
              onChange={handleChange}
              placeholder='Masukkan kontak paket wisata'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Foto</Label>
            <Input
              name='media'
              type='file'
              accept='image/*'
              onChange={handleChange}
            />

            {form.media && typeof form.media === 'string' && (
              <img
                src={`http://localhost:3000${form.media}`}
                alt='Preview'
                className='mt-2 w-24 h-24 object-cover rounded-md border'
              />
            )}
          </div>

          <div className='flex justify-end gap-2 mt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Simpan Perubahan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditDataModal
