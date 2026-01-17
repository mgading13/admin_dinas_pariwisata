import { useState, useMemo, useEffect } from 'react'
import AddDataModal from './AddDataModal'
import EditDataModal from './EditDataModal'
import SideBar from '../SideBar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

import { toast } from 'sonner'
import axios from 'axios'

function Dashboard () {
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [search, setSearch] = useState('')
  const [filterLokasi, setFilterLokasi] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/tourPackage')
      console.log('📦 Data dari backend:', res.data)
      setData(res.data.data || res.data)
    } catch (err) {
      console.error('Gagal fetch data paket wisata:', err)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenDetail = async id => {
    try {
      const res = await axios.get(`http://localhost:3000/api/tourPackage/${id}`)
      console.log('Detail paket wisata:', res.data)
      setSelectedData(res.data)
      setOpenDetailModal(true)
    } catch (error) {
      console.error('Gagal ambil detail wisata:', error)
    }
  }

  // 🧮 Filter dan pencarian
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        item.nama_wisata_id?.toLowerCase().includes(search.toLowerCase()) ||
        item.lokasi_id?.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filterLokasi === 'all' || item.lokasi === filterLokasi
      return matchSearch && matchFilter
    })
  }, [data, search, filterLokasi])

  // 📄 Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEditData = updatedData => {
    setData(prev => prev.map(d => (d.id === updatedData.id ? updatedData : d)))
    toast.success('Data berhasil diperbarui.')
  }

  const handleDelete = async id => {
    try {
      await axios.delete(`http://localhost:3000/api/tourPackage/${id}`)
      toast.success('Data berhasil dihapus.')
      setData(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      toast.error('Gagal menghapus data.')
      console.error(err)
    }
  }

  return (
    <SideBar>
      <div className='p-8 bg-gray-50 min-h-screen'>
        {/* Header */}
        <div className='flex justify-between items-center pt-10 mb-6'>
          <h1 className='text-2xl font-bold'>Daftar Paket Wisata</h1>
          <Button onClick={() => setOpenAddModal(true)}>Tambah Data</Button>
        </div>

        {/* Search */}
        <div className='mb-5 flex justify-between items-center'>
          <Input
            placeholder='Cari berdasarkan nama wisata dan lokasi'
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className='w-full md:w-1/3'
          />

          <Select
            value={filterLokasi}
            onValueChange={val => {
              setFilterLokasi(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='w-full md:w-1/4'>
              <SelectValue placeholder='Filter Lokasi' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua Lokasi</SelectItem>
              {[...new Set(data.map(d => d.lokasi))].map((lokasi, index) => (
                <SelectItem key={lokasi || index} value={lokasi || 'unknown'}>
                  {lokasi || 'Tidak diketahui'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 📊 Tabel Data */}
        <div className='bg-white rounded-xl shadow-md overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Wisata</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead className='text-center'>Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan='7'
                    className='text-center py-6 text-gray-500'
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{item.nama_wisata_id}</TableCell>
                    <TableCell>{item.lokasi_id}</TableCell>
                    <TableCell className='max-w-[300px] max-h-[100px] overflow-y-auto whitespace-normal break-words'>
                      {item.deskripsi_id}
                    </TableCell>
                    <TableCell>
                      Rp. {Number(item.harga).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>{item.kontak}</TableCell>

                    <TableCell>
                      <img
                        src={`http://localhost:3000${item.media}`}
                        alt={item.nama_wisata}
                        className='w-16 h-16 object-cover rounded-lg border'
                      />
                    </TableCell>

                    <TableCell className='flex justify-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          handleOpenDetail(item.id)
                          setOpenDetailModal(true)
                        }}
                      >
                        Detail
                      </Button>

                      <Button
                        variant='secondary'
                        size='sm'
                        onClick={() => {
                          setSelectedData(item)
                          setOpenEditModal(true)
                        }}
                      >
                        Edit
                      </Button>

                      {/* Hapus */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant='destructive' size='sm'>
                            Hapus
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Konfirmasi Hapus
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Yakin ingin menghapus{' '}
                              <strong>{item.nama_wisata}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan='7'
                    className='text-center py-6 text-gray-500'
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 📄 Pagination */}
        <div className='flex justify-end items-center gap-2 mt-4'>
          <Button
            variant='outline'
            size='sm'
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Sebelumnya
          </Button>
          <span className='text-sm text-gray-600'>
            Halaman {currentPage} dari {totalPages || 1}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Selanjutnya
          </Button>
        </div>

        {/* 🪄 Modal Tambah */}
        <AddDataModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          refreshData={fetchData}
        />

        {/* ✏️ Modal Edit */}
        <EditDataModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onSubmit={handleEditData}
          initialData={selectedData}
          refreshData={fetchData}
        />

        {/* 👁️ Modal Detail */}
        <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
          <DialogContent>
            <DialogHeader>
              {selectedData && (
                <DialogTitle>
                  Detail Paket Wisata {selectedData.nama_wisata}
                </DialogTitle>
              )}
            </DialogHeader>

            {selectedData && (
              <div className='space-y-2 mt-3 gap-2 flex flex-col text-md'>
                <div className='flex flex-col gap-1'>
                  <Label className='font-bold'>Nama Wisata :</Label>
                  <p>{selectedData.nama_wisata_id}</p>
                  <Label className='font-bold text-gray-400 mt-1 italic font-normal'>
                    Nama Wisata (EN) :
                  </Label>
                  <p className='text-gray-500 italic'>
                    {selectedData.nama_wisata_en}
                  </p>
                </div>
                <div className='flex flex-col gap-1'>
                  <Label className='font-bold'>Deskripsi :</Label>
                  <p className='text-justify'>{selectedData.deskripsi_id}</p>
                  <Label className='font-bold text-gray-400 mt-1 italic font-normal'>
                    Deskripsi (EN) :
                  </Label>
                  <p className='text-gray-500 italic'>
                    {selectedData.deskripsi_en}
                  </p>
                </div>
                <div className='flex flex-col'>
                  <Label className='font-bold'>Lokasi :</Label>
                  <p>{selectedData.lokasi_id}</p>
                  <Label className='font-bold text-gray-400 mt-1 italic font-normal'>
                    Lokasi (EN) :
                  </Label>
                  <p className='text-gray-500 italic'>
                    {selectedData.lokasi_en}
                  </p>
                </div>
                <div className='flex flex-col gap-1'>
                  <Label className='font-bold'>Harga :</Label>
                  <p>
                    Rp. {Number(selectedData.harga).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className='flex flex-col gap-1'>
                  <Label className='font-bold'>Kontak :</Label>
                  <p>{selectedData.kontak}</p>
                </div>
                <img
                  src={`http://localhost:3000${selectedData.media}`}
                  alt={selectedData.nama_wisata}
                  className='w-full h-100 object-cover rounded-lg mt-2'
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SideBar>
  )
}

export default Dashboard
