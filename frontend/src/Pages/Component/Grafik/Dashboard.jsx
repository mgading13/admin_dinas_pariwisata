import { useState, useEffect } from 'react'
import axios from 'axios'
import SideBar from '../SideBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Users,
  CalendarDays,
  TrendingUp,
  BarChart3,
  Clock,
  Globe
} from 'lucide-react'

export default function Dashboard () {
  const [filter, setFilter] = useState('daily')

  const [summaryData, setSummaryData] = useState([
    {
      title: 'Today',
      visitors: 0,
      visits: 0,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Yesterday',
      visitors: 0,
      visits: 0,
      icon: Clock,
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'This Week',
      visitors: 0,
      visits: 0,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Last Week',
      visitors: 0,
      visits: 0,
      icon: BarChart3,
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'This Month',
      visitors: 0,
      visits: 0,
      icon: CalendarDays,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'All Days',
      visitors: 0,
      visits: 0,
      icon: Globe,
      gradient: 'from-rose-500 to-rose-600'
    }
  ])

  const [chartData, setChartData] = useState([])
  const fetchSummary = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/pageview/summary')

      const data = res.data

      setSummaryData(prev =>
        prev.map(item => {
          switch (item.title) {
            case 'Today':
              return { ...item, ...data.today }
            case 'Yesterday':
              return { ...item, ...data.yesterday }
            case 'This Week':
              return { ...item, ...data.thisWeek }
            case 'Last Week':
              return { ...item, ...data.lastWeek }
            case 'This Month':
              return { ...item, ...data.thisMonth }
            case 'All Days':
              return { ...item, ...data.allDays }
            default:
              return item
          }
        })
      )
    } catch (err) {
      console.error('Gagal fetch summary', err)
    }
  }

  /* =======================
      FETCH CHART
  ======================= */
  const fetchChart = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/pageview/chart?filter=${filter}`
      )
      setChartData(res.data)
    } catch (err) {
      console.error('Gagal fetch chart', err)
    }
  }

  useEffect(() => {
    fetchSummary()
    fetchChart()
  }, [filter])

  return (
    <SideBar>
      <div className='p-6 space-y-8 bg-slate-50 min-h-screen'>
        {/* ===== SUMMARY ===== */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {summaryData.map((item, i) => {
            const Icon = item.icon
            return (
              <Card
                key={i}
                className={`text-white bg-gradient-to-br ${item.gradient} shadow-lg`}
              >
                <CardContent className='flex items-center justify-between p-6'>
                  <div>
                    <p className='text-sm opacity-80'>{item.title}</p>

                    {/* TOTAL KUNJUNGAN */}
                    <h2 className='text-3xl font-bold'>
                      {item.visits.toLocaleString()}
                    </h2>

                    {/* VISITOR UNIK */}
                    <p className='text-xs opacity-80'>
                      {item.visitors.toLocaleString()} visitors
                    </p>
                  </div>

                  <Icon className='w-10 h-10 opacity-80' />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* ===== FILTER ===== */}
        <div className='flex justify-end'>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className='w-[180px] bg-white shadow'>
              <SelectValue placeholder='Pilih Filter' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='daily'>Per Hari</SelectItem>
              <SelectItem value='monthly'>Per Bulan</SelectItem>
              <SelectItem value='yearly'>Per Tahun</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ===== CHART ===== */}
        <Card className='bg-white shadow-xl'>
          <CardHeader>
            <CardTitle>Grafik Kunjungan</CardTitle>
          </CardHeader>
          <CardContent className='h-[320px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={chartData}>
                <XAxis dataKey='label' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='views' radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </SideBar>
  )
}
