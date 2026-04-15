import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Grid, DollarSign } from 'lucide-react'

const mockData = [
  { name: 'T2', revenue: 4000 },
  { name: 'T3', revenue: 3000 },
  { name: 'T4', revenue: 2000 },
  { name: 'T5', revenue: 2780 },
  { name: 'T6', revenue: 6890 },
  { name: 'T7', revenue: 8390 },
  { name: 'CN', revenue: 7490 },
]

export default function Dashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Doanh thu hôm nay', value: '34,550K', icon: DollarSign, trend: '+12%', color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Phòng đang hát', value: '12', icon: Grid, trend: '+2', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Lượt khách', value: '1,234', icon: Users, trend: '+18%', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Số booking', value: '45', icon: TrendingUp, trend: '+5%', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Tổng quan thông tin</h1>
        <p className="text-slate-500 dark:text-slate-400">Tình hình hoạt động kinh doanh ngày hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-sm font-medium text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Doanh thu tuần này</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#8b5cf6', opacity: 0.1}}
                  contentStyle={{borderRadius: '12px', border: 'none', background: '#1e293b', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(idx => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Phòng 10{idx} đã bắt đầu hát</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{idx * 10} phút trước</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
