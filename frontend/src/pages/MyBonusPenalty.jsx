import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, TrendingDown, Gift, AlertCircle, Filter, CalendarDays, FileText, User } from 'lucide-react'

const mockBonusPenalty = [
  { id: 1, type: 'BONUS', date: '15/10/2023', period: 'Tháng 10/2023', reason: 'Phục vụ tốt, khách khen', amount: 500000, approvedBy: 'Nguyễn Văn A' },
  { id: 2, type: 'PENALTY', date: '08/10/2023', period: 'Tháng 10/2023', reason: 'Đi trễ 2 lần', amount: 100000, approvedBy: 'Nguyễn Văn A' },
  { id: 3, type: 'BONUS', date: '28/09/2023', period: 'Tháng 09/2023', reason: 'Hoàn thành tốt tháng 9', amount: 200000, approvedBy: 'Trần Thị B' },
  { id: 4, type: 'BONUS', date: '05/08/2023', period: 'Tháng 08/2023', reason: 'Nhân viên xuất sắc tháng', amount: 300000, approvedBy: 'Nguyễn Văn A' },
  { id: 5, type: 'PENALTY', date: '12/08/2023', period: 'Tháng 08/2023', reason: 'Vi phạm quy định đồng phục', amount: 50000, approvedBy: 'Trần Thị B' },
  { id: 6, type: 'BONUS', date: '20/07/2023', period: 'Tháng 07/2023', reason: 'Tăng ca cuối tuần', amount: 400000, approvedBy: 'Nguyễn Văn A' },
]

export default function MyBonusPenalty() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('ALL')

  const displayed = mockBonusPenalty.filter(item => filter === 'ALL' || item.type === filter)

  const totalBonus = mockBonusPenalty.filter(i => i.type === 'BONUS').reduce((s, i) => s + i.amount, 0)
  const totalPenalty = mockBonusPenalty.filter(i => i.type === 'PENALTY').reduce((s, i) => s + i.amount, 0)
  const totalBonus3m = mockBonusPenalty.filter(i => i.type === 'BONUS').slice(0, 3).reduce((s, i) => s + i.amount, 0)

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
        {displayed.map(item => (
          <div
            key={item.id}
            className={`glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-start gap-5 rounded-2xl transition-all hover:shadow-md ${item.type === 'BONUS'
              ? 'border-l-4 border-l-green-500'
              : 'border-l-4 border-l-red-500'
              }`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${item.type === 'BONUS'
              ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
              }`}>
              {item.type === 'BONUS' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${item.type === 'BONUS'
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                    {item.type === 'BONUS' ? 'THƯỞNG' : 'PHẠT'}
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white text-base">{item.reason}</p>
                </div>
                <p className={`text-lg font-bold shrink-0 ${item.type === 'BONUS' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                  {item.type === 'BONUS' ? '+' : '-'}{item.amount.toLocaleString()}đ
                </p>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><CalendarDays size={12} /> {item.date}</span>
                <span className="flex items-center gap-1"><FileText size={12} /> {item.period}</span>
                <span className="flex items-center gap-1"><User size={12} /> Duyệt bởi: {item.approvedBy}</span>
              </div>
            </div>
          </div>
        ))}

        {displayed.length === 0 && (
          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-10 text-center text-slate-400">
            Không có dữ liệu phù hợp.
          </div>
        )}
      </div>
    </div>
  )
}
