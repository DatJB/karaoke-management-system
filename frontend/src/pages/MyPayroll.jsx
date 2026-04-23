import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Clock, TrendingUp, TrendingDown, Wallet, Gift, AlertCircle, Loader2 } from 'lucide-react'
import payrollPeriodApi from '../api/payrollPeriodApi'
import PayrollExpandedRow from '../components/payroll/PayrollExpandedRow'

export default function MyPayroll() {
  const [expandedRow, setExpandedRow] = useState(null)
  const [payrolls, setPayrolls] = useState([])
  const [expandedDataMap, setExpandedDataMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyPayrolls()
  }, [])

  const fetchMyPayrolls = async () => {
    setLoading(true)
    try {
      const res = await payrollPeriodApi.getMyPayrolls(0, 100)
      if (res.data) {
        setPayrolls(res.data.content)
      }
    } catch (error) {
      console.error("Failed to fetch my payrolls", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = async (id, periodId) => {
    if (expandedRow === id) {
      setExpandedRow(null)
      return
    }

    setExpandedRow(id)
    if (!expandedDataMap[id]) {
      try {
        const res = await payrollPeriodApi.getMyPeriodDetails(periodId)
        setExpandedDataMap(prev => ({
          ...prev,
          [id]: res.data
        }))
      } catch (error) {
        console.error("Failed to fetch detail", error)
      }
    }
  }

  const approved = payrolls.filter(p => p.status === 'APPROVED' || p.status === 'PAID')
  const totalEarned = approved.reduce((s, p) => s + (p.totalSalary || 0), 0)
  const totalBonus = approved.reduce((s, p) => s + (p.totalBonus || 0), 0)
  const totalPenalty = approved.reduce((s, p) => s + (p.totalPenalty || 0), 0)

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
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" style={{ width: `${50 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payrolls.length > 0 ? payrolls.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${expandedRow === row.id ? 'bg-slate-50/80 dark:bg-slate-800/50' : ''}`}
                    onClick={() => toggleRow(row.id, row.periodId)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 hover:text-primary transition-colors">
                          {expandedRow === row.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{row.periodName || 'Kỳ lương'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{new Date(row.periodStart).toLocaleDateString('vi-VN')} → {new Date(row.periodEnd).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">{row.baseSalary > 0 ? row.baseSalary.toLocaleString() : '-'}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">{row.salaryFromHours > 0 ? row.salaryFromHours.toLocaleString() : '-'}</td>
                    <td className="px-4 py-4 text-sm font-medium text-green-600 dark:text-green-500 text-right">+{row.totalBonus ? row.totalBonus.toLocaleString() : 0}</td>
                    <td className="px-4 py-4 text-sm font-medium text-red-600 dark:text-red-400 text-right">-{row.totalPenalty ? row.totalPenalty.toLocaleString() : 0}</td>
                    <td className="px-6 py-4 text-base font-bold text-slate-900 dark:text-white text-right">{row.totalSalary ? row.totalSalary.toLocaleString() : 0}đ</td>
                    <td className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-700">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                          row.status === 'PAID' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                        }`}>
                        {row.status === 'APPROVED' ? 'ĐÃ DUYỆT' : row.status === 'PAID' ? 'ĐÃ TRẢ' : 'CHỜ DUYỆT'}
                      </span>
                    </td>
                  </tr>

                  {expandedRow === row.id && expandedDataMap[row.id] && (
                    <PayrollExpandedRow data={expandedDataMap[row.id]} />
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">
                    Không có dữ liệu bảng lương nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
