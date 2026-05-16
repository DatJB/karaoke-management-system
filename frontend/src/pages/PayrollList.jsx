import { useState, useEffect } from 'react'
import { Calendar, Search, FileText, Eye, Download, Trash2, Plus, Loader2, BadgeCheck, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'
import payrollPeriodApi from '../api/payrollPeriodApi'

const STATUS_CONFIG = {
  DRAFT:    { label: 'Nháp',     cls: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
  APPROVED: { label: 'Đã duyệt', cls: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
  PAID:     { label: 'Đã trả',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
}

export default function PayrollList() {
  const [payrolls, setPayrolls]     = useState([])
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd]   = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    fetchPeriods()
  }, [])

  const fetchPeriods = async () => {
    setLoading(true)
    try {
      const res = await payrollPeriodApi.getPeriods(0, 100)
      if (res.data) {
        setPayrolls(res.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch periods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kỳ lương này?')) {
      try {
        await payrollPeriodApi.deletePeriod(id)
        setPayrolls(prev => prev.filter(p => p.id !== id))
      } catch (error) {
        alert("Không thể xóa kỳ lương. Có thể nó đã được duyệt.")
      }
    }
  }

  const handleQuickStatus = async (id, currentStatus) => {
    const transitions = { DRAFT: 'APPROVED', APPROVED: 'PAID' }
    const newStatus = transitions[currentStatus]
    if (!newStatus) return
    const confirmMsg = newStatus === 'APPROVED'
      ? 'Duyệt toàn bộ bảng lương kỳ này?'
      : 'Xác nhận đã thanh toán lương kỳ này?'
    if (!window.confirm(confirmMsg)) return
    try {
      await payrollPeriodApi.updateStatus(id, newStatus)
      setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
    } catch (error) {
      alert('Không thể thay đổi trạng thái: ' + (error.message || ''))
    }
  }

  const handleExport = async (id) => {
    try {
      const res = await payrollPeriodApi.exportPayrolls(id);
      // When responseType='blob', the interceptor returns response.data (the raw Blob) directly
      const blob = res instanceof Blob ? res : new Blob([res]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payrolls_period_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export Excel", error);
      alert("Lỗi khi tải file Excel");
    }
  }

  const displayedPayrolls = payrolls.filter(p => {
    if (filterStart && p.periodStart < filterStart) return false
    if (filterEnd && p.periodEnd > filterEnd) return false
    if (searchTerm && !p.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-white mb-1">Danh sách bảng lương</h1>
          <p className="text-slate-500 dark:text-slate-400">Quản lý và tra cứu các bảng lương đã tính theo thời gian.</p>
        </div>
        <Link to="/payroll"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-primary/20 shrink-0">
          <Plus size={18} /> Tính lương mới
        </Link>
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
                <th className="px-6 py-4 font-medium text-sm text-center">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayedPayrolls.length > 0 ? displayedPayrolls.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <FileText size={16} className="text-primary opacity-70" />
                       {row.name || 'Kỳ lương'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-center font-mono">
                    {new Date(row.periodStart).toLocaleDateString('vi-VN')} - {new Date(row.periodEnd).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {row.createdBy?.username || 'Admin'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[row.status]?.cls || ''}`}>
                      {STATUS_CONFIG[row.status]?.label || row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/payroll?periodId=${row.id}`} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center transition-colors shadow-sm" title="Xem chi tiết">
                        <Eye size={16} />
                      </Link>
                      {/* Quick approve button — DRAFT→APPROVED */}
                      {row.status === 'DRAFT' && (
                        <button onClick={() => handleQuickStatus(row.id, 'DRAFT')}
                          className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:bg-green-500/20 border border-green-500/20 flex items-center justify-center transition-colors shadow-sm" title="Duyệt kỳ lương">
                          <BadgeCheck size={16} />
                        </button>
                      )}
                      {/* Mark as paid — APPROVED→PAID */}
                      {row.status === 'APPROVED' && (
                        <button onClick={() => handleQuickStatus(row.id, 'APPROVED')}
                          className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center transition-colors shadow-sm" title="Đánh dấu đã trả">
                          <DollarSign size={16} />
                        </button>
                      )}
                      {row.status === 'DRAFT' && (
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-colors shadow-sm" title="Xóa kỳ lương">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleExport(row.id)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm" title="Tải về Excel">
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
