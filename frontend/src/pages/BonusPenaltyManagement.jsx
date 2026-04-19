import { useState, useEffect } from 'react'
import { Plus, Search, Gift, AlertCircle, Filter, Eye, Pencil, Trash2, Loader2 } from 'lucide-react'
import TypeBadge from '../components/bonus/BonusTypeConfig'
import BonusPenaltyModal from '../components/bonus/BonusPenaltyModal'
import bonusPenaltyApi from '../api/bonusPenaltyApi'

const emptyForm = { kind: 'BONUS', employeeId: null, employeeName: '', type: 'SERVICE', bookingId: '', invoiceId: '', amount: '', note: '' }

export default function BonusPenaltyManagement() {
  const [data, setData]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [dateFrom, setDateFrom]   = useState('')
  const [dateTo, setDateTo]       = useState('')
  const [kindFilter, setKindFilter] = useState('ALL')
  const [modal, setModal]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await bonusPenaltyApi.getAllCombined(0, 200)
      if (res.data) {
        setData(res.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch bonuses/penalties', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = data.filter(item => {
    if (kindFilter !== 'ALL' && item.itemType !== kindFilter) return false
    if (search && !item.employeeName?.toLowerCase().includes(search.toLowerCase())) return false
    if (dateFrom && item.createdAt < dateFrom) return false
    if (dateTo && item.createdAt > dateTo) return false
    return true
  })

  const totalBonus   = filtered.filter(i => i.itemType === 'BONUS').reduce((s, i) => s + i.amount, 0)
  const totalPenalty = filtered.filter(i => i.itemType === 'PENALTY').reduce((s, i) => s + i.amount, 0)

  const openAdd  = () => { setForm(emptyForm); setFormError(''); setSelected(null); setModal('add') }
  const openEdit = (item) => { 
    setForm({ 
      kind: item.itemType, 
      employeeId: item.employeeId, 
      employeeName: item.employeeName, 
      type: item.type, 
      amount: item.amount, 
      note: item.description,
      bookingId: item.bookingId || ''
    }); 
    setFormError(''); 
    setSelected(item); 
    setModal('edit') 
  }
  const openView = (item) => { setSelected(item); setModal('view') }
  const closeModal = () => setModal(null)

  const validate = () => {
    if (!form.employeeId || !form.type || !form.amount) { setFormError('Vui lòng điền đầy đủ thông tin bắt buộc.'); return false }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) { setFormError('Số tiền phải là số dương.'); return false }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      const payload = {
        employeeId: form.employeeId,
        type: form.type,
        amount: Number(form.amount),
        bookingId: form.bookingId ? form.bookingId : null,
      };
      
      // Bonus uses "note", Penalty uses "reason"
      if (form.kind === 'BONUS') {
        payload.note = form.note;
      } else {
        payload.reason = form.note;
      }

      if (modal === 'add') {
        if (form.kind === 'BONUS') {
          await bonusPenaltyApi.createBonus(payload)
        } else {
          await bonusPenaltyApi.createPenalty(payload)
        }
      } else {
        if (form.kind === 'BONUS') {
          await bonusPenaltyApi.updateBonus(selected.id, payload)
        } else {
          await bonusPenaltyApi.updatePenalty(selected.id, payload)
        }
      }
      fetchData()
      closeModal()
    } catch (error) {
      console.error("Failed to save", error)
      setFormError("Lỗi khi lưu dữ liệu.")
    }
  }

  const handleDelete = async (id, itemType) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
      try {
        if (itemType === 'BONUS') {
          await bonusPenaltyApi.deleteBonus(id)
        } else {
          await bonusPenaltyApi.deletePenalty(id)
        }
        setData(prev => prev.filter(i => i.id !== id || i.itemType !== itemType))
      } catch (error) {
        console.error("Delete failed", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Quản lý Thưởng & Phạt</h1>
          <p className="text-slate-500 dark:text-slate-400">Thêm, xem và tìm kiếm các khoản thưởng phạt của nhân viên.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-primary/20 shrink-0">
          <Plus size={18} /> Thêm thưởng / phạt
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0"><Filter size={20} /></div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Số bản ghi</p><p className="text-xl font-bold text-slate-900 dark:text-white">{filtered.length}</p></div>
        </div>
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-500 shrink-0"><Gift size={20} /></div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng thưởng</p><p className="text-xl font-bold text-green-600 dark:text-green-400">+{totalBonus.toLocaleString()}đ</p></div>
        </div>
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0"><AlertCircle size={20} /></div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng phạt</p><p className="text-xl font-bold text-red-600 dark:text-red-400">-{totalPenalty.toLocaleString()}đ</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tìm nhân viên</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Nhập tên nhân viên..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Từ ngày</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Đến ngày</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Loại</label>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[{v:'ALL',l:'Tất cả'},{v:'BONUS',l:'Thưởng'},{v:'PENALTY',l:'Phạt'}].map(tab => (
              <button key={tab.v} onClick={() => setKindFilter(tab.v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${kindFilter === tab.v ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {tab.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium">Nhân viên</th>
                <th className="px-4 py-4 font-medium">Loại</th>
                <th className="px-4 py-4 font-medium">Ghi chú / Lý do</th>
                <th className="px-4 py-4 font-medium text-center">Booking</th>
                <th className="px-4 py-4 font-medium text-center">Hóa đơn</th>
                <th className="px-4 py-4 font-medium text-center">Ngày tạo</th>
                <th className="px-4 py-4 font-medium">Người tạo</th>
                <th className="px-6 py-4 font-medium text-right">Số tiền</th>
                <th className="px-4 py-4 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" style={{ width: `${50 + j * 5}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length > 0 ? filtered.map(item => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {item.employeeName ? item.employeeName.split(' ').pop()?.charAt(0) : 'E'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.employeeName || 'Nhân viên'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><TypeBadge kind={item.itemType} type={item.type} /></td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-[180px] truncate">{item.description}</td>
                  <td className="px-4 py-3 text-center">
                    {item.bookingId ? <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-mono">{item.bookingId}</span> : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-slate-300 dark:text-slate-600">—</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center font-mono">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Admin</td>
                  <td className={`px-6 py-3 text-base font-bold text-right ${item.itemType === 'BONUS' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {item.itemType === 'BONUS' ? '+' : '-'}{item.amount.toLocaleString()}đ
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openView(item)} title="Xem" className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center justify-center transition-colors"><Eye size={14} /></button>
                      <button onClick={() => openEdit(item)} title="Sửa" className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 flex items-center justify-center transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(item.id, item.itemType)} title="Xóa" className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">Không có dữ liệu phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BonusPenaltyModal
        modal={modal}
        form={form} setForm={setForm}
        formError={formError}
        closeModal={closeModal}
        handleSubmit={handleSubmit}
        selected={selected}
        openEdit={openEdit}
      />
    </div>
  )
}
