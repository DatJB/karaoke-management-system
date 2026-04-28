import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Grid, DollarSign, Clock } from 'lucide-react'
import { getDashboardData } from '../api/dashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData()
        setData(result)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = [
    {
      label: 'Doanh thu hôm nay',
      value: data ? `${(data.todayTotalRevenue).toLocaleString()} VND` : '0 VND',
      icon: DollarSign,
      trend: data ? data.revenueChange : 0,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      label: 'Số phòng đang hát',
      value: data ? data.activeRooms : '0',
      icon: Grid,
      trend: null,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      label: 'Lượt khách hôm nay',
      value: data ? data.todayTotalCustomers.toLocaleString() : '0',
      icon: Users,
      trend: data ? data.customersChange : 0,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Số đơn đặt hôm nay',
      value: data ? data.todayTotalBookings.toLocaleString() : '0',
      icon: TrendingUp,
      trend: data ? data.bookingsChange : 0,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
  ]

  const dayMapping = {
    'Monday': 'T2',
    'Tuesday': 'T3',
    'Wednesday': 'T4',
    'Thursday': 'T5',
    'Friday': 'T6',
    'Saturday': 'T7',
    'Sunday': 'CN'
  }

  const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const chartData = defaultDays.map(day => {
    const found = data?.thisWeekRevenue?.find(item => item.dayOfWeek === day)
    return {
      name: dayMapping[day],
      revenue: found ? found.revenue / 1000 : 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">
          Tổng quan
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Theo dõi hoạt động kinh doanh ngày hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {stat.trend !== null && (
                <div className={`px-2 py-1 rounded-lg text-sm font-bold flex items-center ${stat.trend > 0 ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : stat.trend < 0 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'}`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(1)}%
                </div>
              )}
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              {stat.label}
              {stat.trend !== null && <span className="text-[10px] text-slate-400 font-normal"></span>}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Doanh thu tuần này (K VNĐ)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#8ca1af', opacity: 0.1 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {data?.recentActivities?.length > 0 ? data.recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${activity.type === 'BOOKING' ? 'bg-primary' :
                    activity.type === 'PAYMENT' ? 'bg-green-500' : 'bg-amber-500'
                  }`} />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                    {activity.description}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={10} /> {new Date(activity.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-400 text-sm py-10">Chưa có hoạt động nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
