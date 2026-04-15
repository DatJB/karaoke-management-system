import React, { useState } from 'react'
import { Calculator, ChevronDown, ChevronRight, Search, CheckCircle, RotateCcw, Save } from 'lucide-react'
import PayrollExpandedRow from '../components/payroll/PayrollExpandedRow'

const initialPayroll = [
  {
    id: 1, name: 'Nguyễn Văn Quản', period: 'Tháng 10/2023', base: 10000000, hourPay: 0, bonus: 2000000, penalty: 0, total: 12000000, status: 'APPROVED',
    roomServices: [],
    bonuses: [{ reason: 'Hoàn thành KPI tháng', amount: 1500000 }, { reason: 'Nhân viên xuất sắc', amount: 500000 }],
    penalties: [],
  },
  {
    id: 2, name: 'Trần Thị Tiếp', period: 'Tháng 10/2023', base: 5000000, hourPay: 2400000, bonus: 500000, penalty: 100000, total: 7800000, status: 'DRAFT',
    roomServices: [
      { date: '10/10/2023', room: 'Phòng 102', startTime: '19:00', endTime: '22:00', duration: 3, payPerHour: 50000, total: 150000 },
      { date: '12/10/2023', room: 'Phòng VIP 1', startTime: '20:00', endTime: '23:30', duration: 3.5, payPerHour: 60000, total: 210000 },
      { date: '15/10/2023', room: 'Phòng 205', startTime: '21:00', endTime: '01:00', duration: 4, payPerHour: 50000, total: 200000 },
    ],
    bonuses: [{ reason: 'Phục vụ tốt, khách khen', amount: 500000 }],
    penalties: [{ reason: 'Đi trễ 2 lần', amount: 100000 }],
  },
  {
    id: 3, name: 'Lê Văn Phục', period: 'Tháng 10/2023', base: 0, hourPay: 4500000, bonus: 800000, penalty: 300000, total: 5000000, status: 'DRAFT',
    roomServices: [
      { date: '01/10/2023', room: 'Phòng 201', startTime: '18:00', endTime: '23:00', duration: 5, payPerHour: 40000, total: 200000 },
      { date: '02/10/2023', room: 'Phòng 205', startTime: '19:00', endTime: '01:00', duration: 6, payPerHour: 40000, total: 240000 },
    ],
    bonuses: [{ reason: 'Tăng ca cuối tuần', amount: 500000 }, { reason: 'Hoàn thành đúng hạn', amount: 300000 }],
    penalties: [{ reason: 'Vi phạm quy định đồng phục', amount: 200000 }, { reason: 'Không báo cáo theo quy định', amount: 100000 }],
  },
]

export default function Payroll() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [payrollData, setPayrollData] = useState(initialPayroll)

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id)

  const handleCalculate = () => {
    if (!startDate || !endDate) { alert('Vui lòng chọn ngày bắt đầu và kết thúc!'); return }
    setShowResults(true)
  }

  const toggleStatus = (id) => {
    setPayrollData(prev => prev.map(row =>
      row.id !== id ? row : { ...row, status: row.status === 'APPROVED' ? 'DRAFT' : 'APPROVED' }
    ))
  }

  const filtered = payrollData.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Tính lương</h1>
          <p className="text-slate-500 dark:text-slate-400">Thiết lập thời gian và chạy tự động tính lương cho nhân viên.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Từ ngày</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đến ngày</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex gap-2">
            {showResults && (
              <button onClick={() => alert('Đã lưu bảng lương vào hệ thống thành công!')}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 h-[38px] rounded-lg font-bold transition-all shadow-md shadow-green-500/20 shrink-0 mt-4 sm:mt-0">
                <Save size={18} /> Lưu bảng lương
              </button>
            )}
            <button onClick={handleCalculate}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2 h-[38px] rounded-lg font-bold transition-all shadow-md shadow-primary/20 shrink-0 mt-4 sm:mt-0">
              <Calculator size={18} /> Chạy tính lương
            </button>
          </div>
        </div>
      </div>

      {!showResults ? (
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Calculator size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có dữ liệu</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">Chọn khoảng thời gian và nhấn nút Chạy tính lương để hệ thống tổng hợp thông tin.</p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Tìm nhân viên..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" />
          </div>

          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <th className="px-6 py-4 font-medium text-sm">Nhân viên</th>
                    <th className="px-4 py-4 font-medium text-sm text-right">Lương cứng</th>
                    <th className="px-4 py-4 font-medium text-sm text-right">Theo giờ</th>
                    <th className="px-4 py-4 font-medium text-sm text-right text-green-600 dark:text-green-500">Thưởng</th>
                    <th className="px-4 py-4 font-medium text-sm text-right text-red-600 dark:text-red-500">Phạt</th>
                    <th className="px-6 py-4 font-bold text-sm text-right text-primary">Thực nhận</th>
                    <th className="px-6 py-4 font-medium text-sm text-center border-l border-slate-200 dark:border-slate-700">Trạng thái</th>
                    <th className="px-4 py-4 font-medium text-sm text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <React.Fragment key={row.id}>
                      <tr
                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${expandedRow === row.id ? 'bg-slate-50/80 dark:bg-slate-800/50' : ''}`}
                        onClick={() => toggleRow(row.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 hover:text-primary transition-colors">
                              {expandedRow === row.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{row.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{startDate} → {endDate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">{row.base > 0 ? row.base.toLocaleString() : '-'}</td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">{row.hourPay > 0 ? row.hourPay.toLocaleString() : '-'}</td>
                        <td className="px-4 py-4 text-sm font-medium text-green-600 dark:text-green-500 text-right">+{row.bonus.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm font-medium text-red-600 dark:text-red-400 text-right">-{row.penalty.toLocaleString()}</td>
                        <td className="px-6 py-4 text-base font-bold text-slate-900 dark:text-white text-right">{row.total.toLocaleString()}đ</td>
                        <td className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                            {row.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'BẢN NHÁP'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => toggleStatus(row.id)}
                            title={row.status === 'APPROVED' ? 'Chuyển về bản nháp' : 'Duyệt phiếu lương'}
                            className={`flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${row.status === 'APPROVED'
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:hover:bg-orange-500/30'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30'}`}
                          >
                            {row.status === 'APPROVED' ? <RotateCcw size={13} /> : <CheckCircle size={13} />}
                            {row.status === 'APPROVED' ? 'Hoàn nháp' : 'Duyệt'}
                          </button>
                        </td>
                      </tr>

                      {expandedRow === row.id && <PayrollExpandedRow row={row} />}
                    </React.Fragment>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400 text-sm">Không tìm thấy nhân viên phù hợp.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
