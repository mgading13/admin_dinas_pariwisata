import axios from 'axios'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Register = () => {
  const [formData, setFormData] = useState({
    nama_Lengkap: '',
    jenis_kelamin: '',
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await axios.post(
        'http://localhost:3000/api/user/register',
        formData
      )
      setMessage('✅ Registrasi berhasil!')
      console.log('Response:', res.data)
      setFormData({ nama: '', username: '', password: '' })
    } catch (err) {
      console.error('❌ Error register:', err)
      setMessage(err.response?.data?.message || 'Terjadi kesalahan server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <Card className='w-[400px] shadow-md'>
        <CardHeader>
          <CardTitle className='text-center text-xl font-semibold'>
            Admin Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              name='nama_Lengkap'
              placeholder='Nama Lengkap'
              value={formData.nama_Lengkap || ''}
              onChange={handleChange}
              required
            />
            <Input
              name='jenis_Kelamin'
              placeholder='Jenis Kelamin'
              value={formData.jenis_Kelamin || ''}
              onChange={handleChange}
              required
            />
            <Input
              name='username'
              placeholder='Username'
              value={formData.username || ''}
              onChange={handleChange}
              required
            />
            <Input
              name='password'
              type='password'
              placeholder='Password'
              value={formData.password || ''}
              onChange={handleChange}
              required
            />
            <Button className='w-full' type='submit' disabled={loading}>
              {loading ? 'Mendaftar...' : 'Register'}
            </Button>
          </form>

          {message && (
            <p className='text-center text-sm mt-3 text-gray-700'>{message}</p>
          )}

          <p className='text-center text-sm text-gray-600 mt-4'>
            Sudah punya akun?{' '}
            <a href='/' className='text-blue-600 hover:underline'>
              Login
            </a>
            <a href='/admin/atraksi' className='text-blue-600 hover:underline'>
              Lihat Tabel
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
