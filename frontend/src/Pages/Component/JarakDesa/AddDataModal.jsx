import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

const AddDataModal = ({ open, onClose, initialData, refreshData }) => {
  const [desaList, setDesaList] = useState([])
  const [existingRoutes, setExistingRoutes] = useState([])

  const [form, setForm] = useState({
    titikKota: '',
    jalur_darat: '',
    jalur_laut: '',
    jalur_udara: '',
    desaId: ''
  })

  useEffect(() => {
    async function fetchDesa () {
      try {
        const res = await axios.get('http://localhost:3000/api/desaWisata/')
        setDesaList(res.data)
      } catch (error) {
        console.error('Gagal ambil list desa wisata:', error)
      }
    }
    fetchDesa()
  }, [])

  useEffect(() => {
    if (!form.desaId) {
      setExistingRoutes([])
      return
    }

    axios
      .get(`http://localhost:3000/api/jarak?desaId=${form.desaId}`)
      .then(res => setExistingRoutes(res.data))
      .catch(() => setExistingRoutes([]))
  }, [form.desaId])

  // Set initial data jika mode edit
  useEffect(() => {
    if (initialData) {
      setForm({
        titikKota: initialData.titikKota || '',
        jalur_darat: initialData.jalur_darat || '',
        jalur_laut: initialData.jalur_laut || '',
        jalur_udara: initialData.jalur_udara || '',
        desaId: initialData.desaId || ''
      })
    } else {
      setForm({
        titikKota: '',
        jalur_darat: '',
        jalur_laut: '',
        jalur_udara: '',
        desaId: ''
      })
    }
  }, [initialData, open])

  const usedCities = existingRoutes.map(r => r.titikKota)
  const isFull = usedCities.includes('PALU') && usedCities.includes('LUWUK')

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.desaId) {
      toast.warning('Pilih desa terlebih dahulu')
      return
    }

    if (isFull) {
      toast.warning('Desa ini sudah memiliki rute Palu & Luwuk')
      return
    }

    try {
      const payload = {
        desaId: Number(form.desaId),
        titikKota: form.titikKota,
        jalur_darat: form.jalur_darat,
        jalur_laut: form.jalur_laut,
        jalur_udara: form.jalur_udara
      }

      const res = await axios.post(
        'http://localhost:3000/api/jarak/insert',
        payload
      )
      toast.success('Jalur desa berhasil ditambahkan!')
      console.log('Add success:', res.data)
      refreshData?.()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal menambahkan jalur-jalur desa!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Jalur Desa' : 'Tambah Jalur Desa'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 mt-4'>
          {/* Dropdown Kuliner */}
          <div className='flex flex-col gap-2'>
            <Label>Pilih Desa</Label>

            <Select
              value={form.desaId ? String(form.desaId) : ''}
              onValueChange={value =>
                handleChange({
                  target: { name: 'desaId', value }
                })
              }
              required
            >
              <SelectTrigger className='w-full h-10 border border-input bg-background rounded-md px-3 text-sm'>
                <SelectValue placeholder='Pilih Desa' />
              </SelectTrigger>

              <SelectContent>
                {desaList.map(item => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.namaDesa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TITIK KOTA */}
          <div className='flex flex-col gap-2'>
            <Label>Titik Kota</Label>
            <Select
              value={form.titikKota}
              onValueChange={value => setForm({ ...form, titikKota: value })}
              disabled={isFull}
              required
            >
              <SelectTrigger
                className='w-full
                h-10
                border
                border-input
                bg-background
                rounded-md
                px-3
                text-sm'
              >
                <SelectValue placeholder='Pilih Titik Kota' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='PALU' disabled={usedCities.includes('PALU')}>
                  Palu {usedCities.includes('PALU') && '✓'}
                </SelectItem>
                <SelectItem
                  value='LUWUK'
                  disabled={usedCities.includes('LUWUK')}
                >
                  Luwuk {usedCities.includes('LUWUK') && '✓'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isFull && (
            <div className='rounded-md bg-red-50 p-3 text-sm text-red-600'>
              Desa ini sudah memiliki rute dari Palu dan Luwuk
            </div>
          )}
          <div className='flex flex-col gap-2'>
            <Label>Jalur Darat</Label>
            <Textarea
              name='jalur_darat'
              value={form.jalur_darat}
              onChange={handleChange}
              placeholder='Masukkan jalur menuju desa'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Jalur Laut</Label>
            <Textarea
              name='jalur_laut'
              value={form.jalur_laut}
              onChange={handleChange}
              placeholder='Masukkan jalur menuju desa'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Jalur Udara</Label>
            <Textarea
              name='jalur_udara'
              value={form.jalur_udara}
              onChange={handleChange}
              placeholder='Masukkan jalur menuju desa'
              required
            />
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

export default AddDataModal
