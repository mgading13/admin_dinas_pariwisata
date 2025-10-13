import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    try {
      const res = await axios.post(
        'http://localhost:3000/api/user/login',
        formData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )

      console.log('✅ Login berhasil:', res.data)

      // contoh: simpan token ke localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
      }

      // arahkan ke halaman dashboard
      navigate('/admin/dashboard')
    } catch (err) {
      console.error('❌ Login gagal:', err)
      setError(err.response?.data?.message || 'Username atau password salah')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <Card className='w-[400px] shadow-md'>
        <CardHeader>
          <CardTitle className='text-center text-xl font-semibold'>
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              name='username'
              placeholder='Username'
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Input
              name='password'
              type='password'
              placeholder='Password'
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && (
              <p className='text-red-500 text-sm text-center'>{error}</p>
            )}

            <Button className='w-full' type='submit'>
              Login
            </Button>
          </form>
          <p className='text-center text-sm text-gray-600 mt-4'>
            Belum punya akun?{' '}
            <a href='/admin/register' className='text-blue-600 hover:underline'>
              Register
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
