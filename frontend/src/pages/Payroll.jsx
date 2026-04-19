import React, { useState, useEffect } from 'react'
import { Calculator, ChevronDown, ChevronRight, Search, CheckCircle, RotateCcw, Loader2, RefreshCw, Pencil, Save, X } from 'lucide-react'
import { useSearchParams, Link } from 'react-router-dom'
import PayrollExpandedRow from '../components/payroll/PayrollExpandedRow'
import payrollPeriodApi from '../api/payrollPeriodApi'

const STATUS_CONFIG = {
  APPROVED: { label: 'Đã duyệt', cls: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
  PAID:     { label: 'Đã trả',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  DRAFT:    { label: 'Nháp',     cls: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
}

export default function Payroll() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPeriodId = searchParams.get('periodId')

  const [periodName, setPeriodName] = useState('')
  const [startDate, setStartDate]   = useState('')
  const [endDate, setEndDate]       = useState('')

  const [loading, setLoading]       = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [payrollData, setPayrollData] = useState([])
  const [expandedDataMap, setExpandedDataMap] = useState({})

  // Inline edit state
  const [editingId, setEditingId]   = useState(null)
  const [editForm, setEditForm]     = useState({})
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (currentPeriodId) fetchPayrolls(currentPeriodId)
  }, [currentPeriodId])

  const fetchPayrolls = async (periodId) => {
    setLoading(true)
    try {
      const res = await payrollPeriodApi.getPayrollsByPeriod(periodId, 0, 200)
      if (res.data) {
        setPayrollData(res.data.content)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Failed to fetch payrolls', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = async (employeeId) => {
    if (expandedRow === employeeId) { setExpandedRow(null); return }
    setExpandedRow(employeeId)
    if (!expandedDataMap[employeeId]) {
      try {
        const res = await payrollPeriodApi.getPeriodDetails(currentPeriodId, employeeId)
        setExpandedDataMap(prev => ({ ...prev, [employeeId]: res.data }))
      } catch (error) {
        console.error('Failed to fetch details', error)
      }
    }
  }

  const handleCalculate = async () => {
    if (!startDate || !endDate || !periodName) {
      alert('Vui lòng nhập tên kỳ lương và chọn ngày bắt đầu, kết thúc!')
      return
    }
    setLoading(true)
    try {
      const periodRes = await payrollPeriodApi.createPeriod({ name: periodName, periodStart: startDate, periodEnd: endDate })
      const periodId = periodRes.data.id
      await payrollPeriodApi.calculatePayroll(periodId)
      setSearchParams({ periodId })
    } catch (error) {
      console.error('Lỗi khi tính lương', error)
      alert('Lỗi khi tính lương. Có thể kỳ lương bị trùng lặp ngày hoặc lỗi server.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = async () => {
    if (!currentPeriodId) return
    if (!window.confirm('Tính lại sẽ xóa và tính toán lại toàn bộ phiếu lương trong kỳ này. Tiếp tục?')) return
    setLoading(true)
    try {
      await payrollPeriodApi.calculatePayroll(currentPeriodId)
      setExpandedDataMap({})
      await fetchPayrolls(currentPeriodId)
    } catch (error) {
      alert('Không thể tính lại: ' + (error.message || 'Kỳ lương đã được duyệt.'))
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async () => {
    if (!currentPeriodId || payrollData.length === 0) return
    const isApproved = payrollData[0].status === 'APPROVED'
    const newStatus  = isApproved ? 'DRAFT' : 'APPROVED'
    try {
      await payrollPeriodApi.updateStatus(currentPeriodId, newStatus)
      fetchPayrolls(currentPeriodId)
    } catch (error) {
      alert('Không thể thay đổi trạng thái: ' + (error.message || ''))
    }
  }

  const startEdit = (row) => {
    setEditingId(row.id)
    setEditForm({
      baseSalary:     row.baseSalary     ?? 0,
      salaryFromHours: row.salaryFromHours ?? 0,
      totalBonus:     row.totalBonus     ?? 0,
      totalPenalty:   row.totalPenalty   ?? 0,
    })
  }

  const handleSaveEdit = async (row) => {
    setSaving(true)
    try {
      await payrollPeriodApi.updatePayroll(currentPeriodId, row.id, editForm)
      setEditingId(null)
      fetchPayrolls(currentPeriodId)
    } catch (error) {
      alert('Lỗi khi lưu: ' + (error.message || ''))
    } finally {
      setSaving(false)
    }
  }

  const periodStatus = payrollData[0]?.status
  const filtered = payrollData.filter(r => r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Tính lương</h1>
          <p className="text-slate-500 dark:text-slate-400">Thiết lập thời gian và chạy tự động tính lương cho nhân viên.</p>
        </div>

        {/* New period form */}
        {!currentPeriodId && (
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <div className="flex items-end gap-2 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tên kỳ</label>
                <input type="text" placeholder="Tháng 10/2023" value={periodName} onChange={e => setPeriodName(e.target.value)}
                  className="w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
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
            <button onClick={handleCalculate} disabled={loading}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white px-5 py-2 h-[38px] rounded-lg font-bold transition-all shadow-md shadow-primary/20 shrink-0">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
              {loading ? 'Đang tính...' : 'Chạy tính lương'}
            </button>
          </div>
        )}

        {/* Actions for existing period */}
        {currentPeriodId && (
          <div className="flex gap-2 items-center flex-wrap">
            {periodStatus === 'DRAFT' && (
              <button onClick={handleRecalculate} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 h-[38px] rounded-lg font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                <RefreshCw size={16} /> Tính lại
              </button>
            )}
            <button onClick={() => setSearchParams({})}
              className="flex items-center gap-2 px-4 py-2 h-[38px] rounded-lg font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
              <Calculator size={16} /> Kỳ mới
            </button>
            {payrollData.length > 0 && (
              <button onClick={toggleStatus}
                className={`flex items-center gap-2 px-5 py-2 h-[38px] rounded-lg font-bold transition-all shadow-md text-white ${periodStatus === 'APPROVED' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'}`}>
                {periodStatus === 'APPROVED' ? <RotateCcw size={16} /> : <CheckCircle size={16} />}
                {periodStatus === 'APPROVED' ? 'Hoàn về nháp' : 'Duyệt toàn bộ'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {!showResults && !loading && (
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Calculator size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có dữ liệu</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">Chọn khoảng thời gian và nhấn nút Chạy tính lương để hệ thống tổng hợp thông tin.</p>
        </div>
      )}

      {/* Loading */}
      {loading && !showResults && (
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <Loader2 size={36} className="text-primary animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">Đang tính lương, vui lòng chờ...</p>
        </div>
      )}

      {/* Table */}
      {showResults && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Tìm nhân viên..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" />
            </div>
            {periodStatus && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_CONFIG[periodStatus]?.cls}`}>
                Trạng thái kỳ: {STATUS_CONFIG[periodStatus]?.label || periodStatus}
              </span>
            )}
            {loading && <Loader2 size={18} className="text-primary animate-spin" />}
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
                      <tr className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${editingId === row.id ? 'bg-primary/5 dark:bg-primary/10' : ''} ${expandedRow === row.employeeId && editingId !== row.id ? 'bg-slate-50/80 dark:bg-slate-800/50' : ''}`}>
                        {/* Employee name — clickable for expand */}
                        <td className="px-6 py-4 cursor-pointer" onClick={() => editingId !== row.id && toggleRow(row.employeeId)}>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">
                              {expandedRow === row.employeeId ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{row.employeeName}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{row.role}</div>
                            </div>
                          </div>
                        </td>

                        {/* Editable cells */}
                        {editingId === row.id ? (
                          <>
                            <td className="px-4 py-2 text-right">
                              <input type="number" value={editForm.baseSalary} onChange={e => setEditForm(f => ({ ...f, baseSalary: Number(e.target.value) }))}
                                className="w-28 text-right px-2 py-1 rounded-lg border border-primary/50 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <input type="number" value={editForm.salaryFromHours} onChange={e => setEditForm(f => ({ ...f, salaryFromHours: Number(e.target.value) }))}
                                className="w-28 text-right px-2 py-1 rounded-lg border border-primary/50 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <input type="number" value={editForm.totalBonus} onChange={e => setEditForm(f => ({ ...f, totalBonus: Number(e.target.value) }))}
                                className="w-24 text-right px-2 py-1 rounded-lg border border-green-400 text-sm bg-white dark:bg-slate-800 text-green-600 focus:outline-none focus:ring-1 focus:ring-green-400" />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <input type="number" value={editForm.totalPenalty} onChange={e => setEditForm(f => ({ ...f, totalPenalty: Number(e.target.value) }))}
                                className="w-24 text-right px-2 py-1 rounded-lg border border-red-400 text-sm bg-white dark:bg-slate-800 text-red-600 focus:outline-none focus:ring-1 focus:ring-red-400" />
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-slate-400 italic">tự tính</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">{row.baseSalary > 0 ? Number(row.baseSalary).toLocaleString() : '—'}</td>
                            <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">{row.salaryFromHours > 0 ? Number(row.salaryFromHours).toLocaleString() : '—'}</td>
                            <td className="px-4 py-4 text-sm font-medium text-green-600 dark:text-green-500 text-right">+{Number(row.totalBonus || 0).toLocaleString()}</td>
                            <td className="px-4 py-4 text-sm font-medium text-red-600 dark:text-red-400 text-right">-{Number(row.totalPenalty || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-base font-bold text-slate-900 dark:text-white text-right">{Number(row.totalSalary || 0).toLocaleString()}đ</td>
                          </>
                        )}

                        {/* Status */}
                        <td className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[row.status]?.cls}`}>
                            {STATUS_CONFIG[row.status]?.label || row.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                          {row.status === 'DRAFT' ? (
                            editingId === row.id ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => handleSaveEdit(row)} disabled={saving}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors disabled:opacity-60">
                                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Lưu
                                </button>
                                <button onClick={() => setEditingId(null)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600">
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => startEdit(row)}
                                className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 flex items-center justify-center mx-auto transition-colors" title="Sửa lương">
                                <Pencil size={14} />
                              </button>
                            )
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                          )}
                        </td>
                      </tr>

                      {expandedRow === row.employeeId && expandedDataMap[row.employeeId] && editingId !== row.id && (
                        <PayrollExpandedRow data={expandedDataMap[row.employeeId]} />
                      )}
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
