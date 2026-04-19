import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, TrendingDown, Gift, AlertCircle, Filter, CalendarDays, FileText, User } from 'lucide-react'
import bonusPenaltyApi from '../api/bonusPenaltyApi'
import TypeBadge from '../components/bonus/BonusTypeConfig'

export default function MyBonusPenalty() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('ALL')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyCombined()
  }, [])

  const fetchMyCombined = async () => {
    setLoading(true)
    try {
      const res = await bonusPenaltyApi.getMyCombined(0, 100)
      if (res.data) {
        setData(res.data.content)
      }
    } catch (error) {
      console.error("Failed to fetch my bonus penalty", error)
    } finally {
      setLoading(false)
    }
  }

  const displayed = data.filter(item => filter === 'ALL' || item.itemType === filter)

  const totalBonus = data.filter(i => i.itemType === 'BONUS').reduce((s, i) => s + i.amount, 0)
  const totalPenalty = data.filter(i => i.itemType === 'PENALTY').reduce((s, i) => s + i.amount, 0)
  const totalBonus3m = data.filter(i => i.itemType === 'BONUS').slice(0, 3).reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Thưởng & Phạt</h1>
        <p className="text-slate-500 dark:text-slate-400">Lịch sử tất cả các lần được thưởng và bị phạt của bạn.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-500 shrink-0">
            <Gift size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng thưởng tích lũy</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">+{totalBonus.toLocaleString()}đ</p>
          </div>
        </div>
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng phạt tích lũy</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">-{totalPenalty.toLocaleString()}đ</p>
          </div>
        </div>
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Thưởng 3 tháng gần nhất</p>
            <p className="text-xl font-bold text-primary">+{totalBonus3m.toLocaleString()}đ</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-3">
        <Filter size={16} className="text-slate-400" />
        <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { value: 'ALL', label: 'Tất cả' },
            { value: 'BONUS', label: 'Thưởng' },
            { value: 'PENALTY', label: 'Phạt' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === tab.value
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-start gap-5 rounded-2xl">
              <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
              </div>
            </div>
          ))
        ) : displayed.length > 0 ? displayed.map(item => (
          <div
            key={item.id}
            className={`glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-start gap-5 rounded-2xl transition-all hover:shadow-md ${item.itemType === 'BONUS'
              ? 'border-l-4 border-l-green-500'
              : 'border-l-4 border-l-red-500'
              }`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${item.itemType === 'BONUS'
              ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
              }`}>
              {item.itemType === 'BONUS' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <TypeBadge kind={item.itemType} type={item.type} />
                  <p className="font-semibold text-slate-900 dark:text-white text-base mt-2">{item.description}</p>
                </div>
                <p className={`text-lg font-bold shrink-0 ${item.itemType === 'BONUS' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                  {item.itemType === 'BONUS' ? '+' : '-'}{item.amount.toLocaleString()}đ
                </p>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><CalendarDays size={12} /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                <span className="flex items-center gap-1"><FileText size={12} /> Bảng lương / Phiếu</span>
                <span className="flex items-center gap-1"><User size={12} /> {item.bookingId ? `Booking: ${item.bookingId}` : 'Khác'}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-10 text-center text-slate-400">
            Không có dữ liệu phù hợp.
          </div>
        )}
      </div>
    </div>
  )
}
