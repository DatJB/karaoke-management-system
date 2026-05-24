import { useEffect, useState, useCallback } from 'react'
import axiosClient from '../api/axiosClient'
import { ShieldCheck, User, Calendar, ChevronLeft, ChevronRight, Globe, Search, RefreshCw } from 'lucide-react'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter states
  const [username, setUsername] = useState('')
  const [method, setMethod] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLogs = useCallback(async (page) => {
    try {
      setLoading(true)
      let query = `/audit-logs?page=${page}&size=15`
      if (username.trim()) query += `&username=${encodeURIComponent(username.trim())}`
      if (method) query += `&method=${method}`
      if (startDate) query += `&startDate=${startDate}`
      if (endDate) query += `&endDate=${endDate}`

      const res = await axiosClient.get(query)
      setLogs(res.data.content || [])
      setTotalPages(res.data.totalPages || 0)
    } catch (err) {
      console.error('Không thể tải nhật ký kiểm toán', err)
    } finally {
      setLoading(false)
    }
  }, [username, method, startDate, endDate])

  useEffect(() => {
    fetchLogs(currentPage)
  }, [currentPage, fetchLogs])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(0)
    fetchLogs(0)
  }

  const handleReset = () => {
    setUsername('')
    setMethod('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(0)
    // Sau khi reset, useEffect sẽ tự động gọi lại fetchLogs nhờ sự thay đổi của các state phụ thuộc
  }

  const formatDate = (dateString) => {
    const d = new Date(dateString)
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-800 dark:text-white">
            <ShieldCheck className="w-9 h-9 text-indigo-600" />
            Nhật Ký Kiểm Toán (Audit Logs)
          </h1>
          <p className="text-slate-500 mt-1">Giám sát và truy vết hoạt động hệ thống theo thời gian thực (Zero Trust)</p>
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tên tài khoản</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ví dụ: manager05"
              className="pl-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phương thức</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          >
            <option value="">Tất cả phương thức</option>
            <option value="POST">POST (Thêm mới)</option>
            <option value="PUT">PUT (Cập nhật)</option>
            <option value="PATCH">PATCH (Sửa đổi trạng thái)</option>
            <option value="DELETE">DELETE (Xóa)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Từ ngày</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Đến ngày</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm text-sm transition"
          >
            <Search className="w-4 h-4" />
            Lọc log
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-semibold py-2 px-3 rounded-lg flex items-center justify-center shadow-sm text-sm transition"
            title="Đặt lại bộ lọc"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                <th className="p-4">Thời gian</th>
                <th className="p-4">Người thực hiện</th>
                <th className="p-4">Hành động</th>
                <th className="p-4">Phương thức</th>
                <th className="p-4">URL</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Đang tải dữ liệu nhật ký...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Không tìm thấy dữ liệu nhật ký kiểm toán phù hợp.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition">
                    <td className="p-4 font-mono text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        {log.username}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs truncate font-medium text-slate-800 dark:text-white">
                      {log.action}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        log.method === 'POST' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        log.method === 'PUT' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        log.method === 'PATCH' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-500 max-w-xs truncate">{log.url}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-slate-400" />
                        {log.ipAddress}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        log.status >= 200 && log.status < 300 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
            <span className="text-sm text-slate-500">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="p-2 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-50 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
