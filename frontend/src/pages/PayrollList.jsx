import { useState } from 'react'
import { Calendar, Search, FileText, Eye, Download, Edit2, Trash2 } from 'lucide-react'

const mockPayrollList = [
  { id: 1, period: 'Tháng 10/2023', startDate: '2023-10-01', endDate: '2023-10-31', creator: 'Admin VIP', totalBase: 45000000, totalPay: 52000000, status: 'APPROVED' },
  { id: 2, period: 'Tháng 09/2023', startDate: '2023-09-01', endDate: '2023-09-30', creator: 'Admin VIP', totalBase: 42000000, totalPay: 48000000, status: 'APPROVED' },
  { id: 3, period: 'Tháng 08/2023', startDate: '2023-08-01', endDate: '2023-08-31', creator: 'Manager A', totalBase: 41000000, totalPay: 45000000, status: 'APPROVED' },
  { id: 4, period: 'Tháng 11/2023 (Tạm tính)', startDate: '2023-11-01', endDate: '2023-11-15', creator: 'Admin VIP', totalBase: 25000000, totalPay: 27000000, status: 'DRAFT' },
]

export default function PayrollList() {
  const [payrolls, setPayrolls] = useState(mockPayrollList)
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bảng lương này?')) {
      setPayrolls(prev => prev.filter(p => p.id !== id))
    }
  }

  const displayedPayrolls = payrolls.filter(p => {
    if (filterStart && p.startDate < filterStart) return false
    if (filterEnd && p.endDate > filterEnd) return false
    if (searchTerm && !p.period.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Danh sách bảng lương</h1>
          <p className="text-slate-500 dark:text-slate-400">Quản lý và tra cứu các bảng lương đã tính theo thời gian.</p>
        </div>
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tìm kỳ lương</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="VD: Tháng 10..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>
        
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Từ ngày</label>
          <input 
            type="date" 
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className="w-full md:w-36 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Đến ngày</label>
          <input 
            type="date" 
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className="w-full md:w-36 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4 font-medium text-sm">Kỳ lương</th>
                <th className="px-6 py-4 font-medium text-sm text-center">Thời gian</th>
                <th className="px-6 py-4 font-medium text-sm">Người tạo</th>
                <th className="px-4 py-4 font-medium text-sm text-right">Tổng lương cứng</th>
                <th className="px-6 py-4 font-bold text-sm text-right text-primary">Tổng thực nhận</th>
                <th className="px-6 py-4 font-medium text-sm text-center">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedPayrolls.length > 0 ? displayedPayrolls.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <FileText size={16} className="text-primary opacity-70" />
                       {row.period}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-center font-mono">
                    {new Date(row.startDate).toLocaleDateString('vi-VN')} - {new Date(row.endDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {row.creator}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">
                    {row.totalBase.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-base font-bold text-slate-900 dark:text-white text-right">
                    {row.totalPay.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      row.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                    }`}>
                      {row.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'BẢN NHÁP'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center transition-colors shadow-sm" title="Xem chi tiết">
                        <Eye size={16} />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:bg-orange-500/20 border border-orange-500/20 flex items-center justify-center transition-colors shadow-sm" title="Sửa bảng lương">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(row.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-colors shadow-sm" title="Xóa bảng lương">
                        <Trash2 size={16} />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm" title="Tải về Excel">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      Không tìm thấy bảng lương nào phù hợp với điều kiện lọc.
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
