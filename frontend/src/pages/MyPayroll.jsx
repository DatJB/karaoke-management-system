import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ChevronDown, ChevronRight, Clock, TrendingUp, TrendingDown, Wallet, DollarSign, Gift, AlertCircle } from 'lucide-react'

const mockMyPayroll = [
  {
    id: 1, period: 'Tháng 10/2023', startDate: '01/10/2023', endDate: '31/10/2023',
    base: 5000000, hourPay: 2400000, bonus: 500000, penalty: 100000, total: 7800000,
    status: 'APPROVED',
    roomServices: [
      { date: '10/10/2023', room: 'Phòng 102', startTime: '19:00', endTime: '22:00', duration: 3, payPerHour: 50000, total: 150000 },
      { date: '12/10/2023', room: 'Phòng VIP 1', startTime: '20:00', endTime: '23:30', duration: 3.5, payPerHour: 60000, total: 210000 },
      { date: '15/10/2023', room: 'Phòng 205', startTime: '21:00', endTime: '01:00', duration: 4, payPerHour: 50000, total: 200000 },
    ],
    bonuses: [{ reason: 'Phục vụ tốt, khách khen', amount: 500000 }],
    penalties: [{ reason: 'Đi trễ 2 lần', amount: 100000 }],
  },
  {
    id: 2, period: 'Tháng 09/2023', startDate: '01/09/2023', endDate: '30/09/2023',
    base: 5000000, hourPay: 1800000, bonus: 200000, penalty: 0, total: 7000000,
    status: 'APPROVED',
    roomServices: [
      { date: '05/09/2023', room: 'Phòng 103', startTime: '18:00', endTime: '22:00', duration: 4, payPerHour: 50000, total: 200000 },
      { date: '20/09/2023', room: 'Phòng 201', startTime: '19:00', endTime: '22:00', duration: 3, payPerHour: 50000, total: 150000 },
    ],
    bonuses: [{ reason: 'Hoàn thành tốt tháng 9', amount: 200000 }],
    penalties: [],
  },
  {
    id: 3, period: 'Tháng 11/2023', startDate: '01/11/2023', endDate: '30/11/2023',
    base: 5000000, hourPay: 0, bonus: 0, penalty: 0, total: 5000000,
    status: 'DRAFT',
    roomServices: [],
    bonuses: [],
    penalties: [],
  },
]

export default function MyPayroll() {
  const { user } = useAuth()
  const [expandedRow, setExpandedRow] = useState(null)

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id)

  const approved = mockMyPayroll.filter(p => p.status === 'APPROVED')
  const totalEarned = approved.reduce((s, p) => s + p.total, 0)
  const totalBonus = approved.reduce((s, p) => s + p.bonus, 0)
  const totalPenalty = approved.reduce((s, p) => s + p.penalty, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Lương của tôi</h1>
        <p className="text-slate-500 dark:text-slate-400">Xem lịch sử phiếu lương và chi tiết thu nhập của bạn.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng thu nhập (đã duyệt)</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{totalEarned.toLocaleString()}đ</p>
          </div>
        </div>
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-500 shrink-0">
            <Gift size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng thưởng</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">+{totalBonus.toLocaleString()}đ</p>
          </div>
        </div>
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng phạt</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">-{totalPenalty.toLocaleString()}đ</p>
          </div>
        </div>
      </div>

      {/* Payroll list */}
      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4 font-medium text-sm">Kỳ lương</th>
                <th className="px-4 py-4 font-medium text-sm text-right">Lương cứng</th>
                <th className="px-4 py-4 font-medium text-sm text-right">Theo giờ</th>
                <th className="px-4 py-4 font-medium text-sm text-right text-green-600 dark:text-green-500">Thưởng</th>
                <th className="px-4 py-4 font-medium text-sm text-right text-red-600 dark:text-red-500">Phạt</th>
                <th className="px-6 py-4 font-bold text-sm text-right text-primary">Thực nhận</th>
                <th className="px-6 py-4 font-medium text-sm text-center border-l border-slate-200 dark:border-slate-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mockMyPayroll.map((row) => (
                <>
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${expandedRow === row.id ? 'bg-slate-50/80 dark:bg-slate-800/50' : ''}`}
                    onClick={() => toggleRow(row.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 hover:text-primary transition-colors">
                          {expandedRow === row.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{row.period}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{row.startDate} → {row.endDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">{row.base > 0 ? row.base.toLocaleString() : '-'}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">{row.hourPay > 0 ? row.hourPay.toLocaleString() : '-'}</td>
                    <td className="px-4 py-4 text-sm font-medium text-green-600 dark:text-green-500 text-right">+{row.bonus.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-medium text-red-600 dark:text-red-400 text-right">-{row.penalty.toLocaleString()}</td>
                    <td className="px-6 py-4 text-base font-bold text-slate-900 dark:text-white text-right">{row.total.toLocaleString()}đ</td>
                    <td className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-700">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        row.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                      }`}>
                        {row.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
                      </span>
                    </td>
                  </tr>

                  {expandedRow === row.id && (
                    <tr key={`detail-${row.id}`} className="bg-slate-50/60 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-700">
                      <td colSpan={7} className="px-6 py-6">
                        <div className="pl-[34px] space-y-5">

                          {/* Room services */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                              <Clock size={15} className="text-primary" /> Ca phục vụ phòng
                            </h4>
                            {row.roomServices.length > 0 ? (
                              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm max-w-3xl">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                                    <tr>
                                      <th className="px-4 py-3 font-medium">Ngày</th>
                                      <th className="px-4 py-3 font-medium">Phòng</th>
                                      <th className="px-4 py-3 font-medium text-center">Thời gian</th>
                                      <th className="px-4 py-3 font-medium text-center">Số giờ</th>
                                      <th className="px-4 py-3 font-medium text-right">Lương/giờ</th>
                                      <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {row.roomServices.map((s, idx) => (
                                      <tr key={idx} className="border-t border-slate-100 dark:border-slate-800">
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.date}</td>
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.room}</td>
                                        <td className="px-4 py-3 text-center text-slate-500">{s.startTime} – {s.endTime}</td>
                                        <td className="px-4 py-3 text-center text-slate-500">{s.duration}h</td>
                                        <td className="px-4 py-3 text-right text-slate-500">{s.payPerHour.toLocaleString()}đ</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">{s.total.toLocaleString()}đ</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 italic">Không có ca phục vụ phòng trong kỳ này.</p>
                            )}
                          </div>

                          {/* Bonus & Penalty */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                            <div className="bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl overflow-hidden">
                              <div className="px-4 py-2.5 bg-green-100 dark:bg-green-500/10 border-b border-green-200 dark:border-green-500/20 flex items-center gap-2">
                                <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
                                <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Thưởng</span>
                              </div>
                              {row.bonuses.length > 0 ? row.bonuses.map((b, i) => (
                                <div key={i} className="flex justify-between items-center px-4 py-2.5 text-sm border-b border-green-100 dark:border-green-500/10 last:border-0">
                                  <span className="text-slate-600 dark:text-slate-300">{b.reason}</span>
                                  <span className="font-bold text-green-600 dark:text-green-400">+{b.amount.toLocaleString()}đ</span>
                                </div>
                              )) : <p className="px-4 py-3 text-xs text-slate-400 italic">Không có khoản thưởng.</p>}
                            </div>

                            <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl overflow-hidden">
                              <div className="px-4 py-2.5 bg-red-100 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 flex items-center gap-2">
                                <TrendingDown size={14} className="text-red-600 dark:text-red-400" />
                                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Phạt</span>
                              </div>
                              {row.penalties.length > 0 ? row.penalties.map((p, i) => (
                                <div key={i} className="flex justify-between items-center px-4 py-2.5 text-sm border-b border-red-100 dark:border-red-500/10 last:border-0">
                                  <span className="text-slate-600 dark:text-slate-300">{p.reason}</span>
                                  <span className="font-bold text-red-600 dark:text-red-400">-{p.amount.toLocaleString()}đ</span>
                                </div>
                              )) : <p className="px-4 py-3 text-xs text-slate-400 italic">Không có khoản phạt.</p>}
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
