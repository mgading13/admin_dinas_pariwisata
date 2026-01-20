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
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_wisata: '',
    nama_wisata_en: '',
    lokasi: '',
    lokasi_en: '',
    harga: '',
    deskripsi: '',
    deskripsi_en: '',
    kontak: '',
    media: ''
  })

  // --- LOGIKA DEBOUNCE TRANSLATE ---
  
  const translateText = async (text, fieldTarget) => {
    if (!text || text.length < 3) return;
    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURI(text)}`
      );
    // PERBAIKAN: Jangan cuma ambil [0][0][0]
    // Kita looping semua potongan kalimat yang dipisah oleh titik/newline
      if (res.data && res.data[0]) {
        const fullTranslation = res.data[0]
          .map((item) => item[0]) // Ambil hasil translasinya saja
          .filter((item) => item !== null) // Buang yang kosong
          .join(" "); // Gabungkan kembali menjadi satu paragraf utuh
      
        setForm((prev) => ({ ...prev, [fieldTarget]: fullTranslation }));
      }
    } catch (error) {
        console.error("Translate error:", error);
      }
  };

  const debouncedTranslate = useCallback(
    debounce((text, fieldTarget) => {
      translateText(text, fieldTarget);
    }, 1500), // Tunggu 1 detik setelah berhenti mengetik
    []
  );

  // --- END LOGIKA DEBOUNCE ---

  useEffect(() => {
    if (initialData) {
      setForm({
        nama_wisata: initialData.nama_wisata_id || '',
        nama_wisata_en: initialData.nama_wisata_en || '',
        lokasi: initialData.lokasi_id || '',
        lokasi_en: initialData.lokasi_en || '',
        deskripsi: initialData.deskripsi_id || '',
        deskripsi_en: initialData.deskripsi_en || '',
        harga: initialData.harga || '',
        kontak: initialData.kontak || '',
        media: initialData.media || ''
      })
    } else {
      setForm({
        nama_wisata: '', nama_wisata_en: '',
        lokasi: '', lokasi_en: '',
        deskripsi: '', deskripsi_en: '',
        harga: '',
        kontak: '',
        media: ''
      })
    }
  }, [initialData, open])

  const formatCurrency = value => {
    if (!value) return ''
    return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const formatPhoneDisplay = value => {
    if (!value) return ''
    const cleaned = value.replace(/\D/g, '').slice(0, 12) // max 12 digit
    return cleaned.replace(/(\d{4})(\d{4})(\d{0,4})/, (_, a, b, c) =>
      c ? `${a}-${b}-${c}` : `${a}-${b}`
    )
  }

  const formatPhoneToDB = value => {
    if (!value) return ''
    let cleaned = value.replace(/\D/g, '')
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1)
    return cleaned
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'nama_wisata') debouncedTranslate(value, 'nama_wisata_en');
    if (name === 'lokasi') debouncedTranslate(value, 'lokasi_en');
    if (name === 'deskripsi') debouncedTranslate(value, 'deskripsi_en');
    if (name === 'harga') {
      const raw = value.replace(/\D/g, '')
      setForm({
        ...form,
        harga: raw,
        hargaDisplay: formatCurrency(raw)
      })
      return
    }

    if (name === 'kontak') {
      const raw = value.replace(/\D/g, '') // remove non numbers
      setForm({
        ...form,
        kontak: formatPhoneDisplay(raw), // UI
        kontak_raw: raw // storage
      })
      return
    }
  }

  const handlePhoto = e => {
    const file = e.target.files[0]
    setForm({ ...form, media: file })
  }

  const handleSubmit = async e => {
    const kontakDB = formatPhoneToDB(form.kontak_raw)
    e.preventDefault()
    setLoading(true);
    try {
      const formData = new FormData()
      formData.append('nama_wisata_id', form.nama_wisata)
      formData.append('nama_wisata_en', form.nama_wisata_en)
      formData.append('lokasi_id', form.lokasi)
      formData.append('lokasi_en', form.lokasi_en)
      formData.append('deskripsi_id', form.deskripsi)
      formData.append('deskripsi_en', form.deskripsi_en)
      formData.append('harga', form.harga)
      formData.append('kontak', kontakDB)
      if (form.media && typeof form.media === 'object') {
        formData.append('media', form.media)
      }

      // 🟢 Mode Tambah
      const res = await axios.post(
        'http://localhost:3000/api/tourPackage/insert',
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      console.log("Response:", res.data);
      toast.success('Data berhasil ditambahkan!')
      navigate('/admin/paket-wisata')
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
            {initialData ? 'Edit Data Wisata' : 'Tambah Data Wisata'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 mt-4'>
          {/* Jenis Wisata */}
          <div className='flex flex-col gap-2'>
            <Label>Nama Wisata</Label>
            <Input
              name='nama_wisata'
              value={form.nama_wisata}
              onChange={handleChange}
              placeholder='Masukkan nama wisata'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Lokasi</Label>
            <Input
              name='lokasi'
              value={form.lokasi}
              onChange={handleChange}
              placeholder='Masukkan lokasi wisata'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Deskripsi</Label>
            <Textarea
              name='deskripsi'
              value={form.deskripsi}
              onChange={handleChange}
              placeholder='Tuliskan deskripsi tentang wisata...'
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Harga (Rp)</Label>
            <Input
              name='harga'
              value={form.hargaDisplay ?? ''}
              onChange={handleChange}
              placeholder='Masukkan Harga Paket Wisata'
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Kontak</Label>
            <Input
              name='kontak'
              value={form.kontak}
              onChange={handleChange}
              placeholder='Masukkan Kontak Paket Wisata'
              required
            />
          </div>

          {/* Foto */}
          <div className='flex flex-col gap-2'>
            <Label>Foto</Label>
            <Input
              name='media'
              type='file'
              accept='image/*'
              onChange={handlePhoto}
              required={!initialData}
            />
            {form.media && typeof form.media === 'string' && (
              <img
                src={form.media}
                alt='Preview'
                className='mt-2 w-24 h-24 object-cover rounded-md border'
              />
            )}
          </div>

          {/* Tombol Aksi */}
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

export default AddDataModal
