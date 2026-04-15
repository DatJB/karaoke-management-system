import { useState } from 'react'
import { Plus, Search, TrendingUp, TrendingDown, Gift, AlertCircle, Filter, Eye, Pencil, Trash2 } from 'lucide-react'
import { mockEmployees } from '../mock/data'
import TypeBadge, { BONUS_TYPES, PENALTY_TYPES } from '../components/bonus/BonusTypeConfig'
import BonusEmployeeSelect from '../components/bonus/BonusEmployeeSelect'
import BonusPenaltyModal from '../components/bonus/BonusPenaltyModal'

const initialData = [
  { id: 1, kind: 'BONUS',   employeeId: 2, employeeName: 'Trần Thị Tiếp',   type: 'TIP',          bookingId: 'B012', invoiceId: null,   amount: 500000,  note: 'Khách hài lòng, tip thêm',      createdBy: 'Admin',   createdAt: '2023-10-15' },
  { id: 2, kind: 'PENALTY', employeeId: 2, employeeName: 'Trần Thị Tiếp',   type: 'LATE',         bookingId: null,   invoiceId: null,   amount: 100000,  note: 'Đi trễ 2 lần trong tuần',       createdBy: 'Admin',   createdAt: '2023-10-08' },
  { id: 3, kind: 'BONUS',   employeeId: 3, employeeName: 'Lê Văn Phục',     type: 'ROOM_SUPPORT', bookingId: 'B008', invoiceId: null,   amount: 400000,  note: 'Phục vụ phòng VIP cuối tuần',   createdBy: 'Manager', createdAt: '2023-10-20' },
  { id: 4, kind: 'PENALTY', employeeId: 3, employeeName: 'Lê Văn Phục',     type: 'MISCONDUCT',   bookingId: null,   invoiceId: null,   amount: 200000,  note: 'Vi phạm đồng phục',             createdBy: 'Manager', createdAt: '2023-10-12' },
  { id: 5, kind: 'BONUS',   employeeId: 1, employeeName: 'Nguyễn Văn Quản', type: 'KPI',          bookingId: null,   invoiceId: null,   amount: 1500000, note: 'Hoàn thành KPI tháng 9',        createdBy: 'Admin',   createdAt: '2023-09-28' },
  { id: 6, kind: 'BONUS',   employeeId: 2, employeeName: 'Trần Thị Tiếp',   type: 'SERVICE',      bookingId: null,   invoiceId: 'INV5', amount: 200000,  note: 'Doanh số đồ uống cao',          createdBy: 'Admin',   createdAt: '2023-09-20' },
]

const emptyForm = { kind: 'BONUS', employeeId: null, employeeName: '', type: 'SERVICE', bookingId: '', invoiceId: '', amount: '', note: '' }

export default function BonusPenaltyManagement() {
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [kindFilter, setKindFilter] = useState('ALL')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const filtered = data.filter(item => {
    if (kindFilter !== 'ALL' && item.kind !== kindFilter) return false
    if (search && !item.employeeName.toLowerCase().includes(search.toLowerCase())) return false
    if (dateFrom && item.createdAt < dateFrom) return false
    if (dateTo && item.createdAt > dateTo) return false
    return true
  })

  const totalBonus   = filtered.filter(i => i.kind === 'BONUS').reduce((s, i) => s + i.amount, 0)
  const totalPenalty = filtered.filter(i => i.kind === 'PENALTY').reduce((s, i) => s + i.amount, 0)

  const openAdd  = () => { setForm(emptyForm); setFormError(''); setSelected(null); setModal('add') }
  const openEdit = (item) => { setForm({ ...item }); setFormError(''); setSelected(item); setModal('edit') }
  const openView = (item) => { setSelected(item); setModal('view') }
  const closeModal = () => setModal(null)

  const validate = () => {
    if (!form.employeeId || !form.type || !form.amount) { setFormError('Vui lòng điền đầy đủ thông tin bắt buộc.'); return false }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) { setFormError('Số tiền phải là số dương.'); return false }
    return true
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (modal === 'add') {
      setData(prev => [{ ...form, id: Date.now(), amount: Number(form.amount), createdBy: 'Admin', createdAt: new Date().toISOString().slice(0,10) }, ...prev])
    } else {
      setData(prev => prev.map(i => i.id === selected.id ? { ...i, ...form, amount: Number(form.amount) } : i))
    }
    closeModal()
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) setData(prev => prev.filter(i => i.id !== id))
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
              {filtered.length > 0 ? filtered.map(item => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {item.employeeName.split(' ').pop()?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{mockEmployees.find(e => e.id === item.employeeId)?.cccd ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><TypeBadge kind={item.kind} type={item.type} /></td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-[180px] truncate">{item.note}</td>
                  <td className="px-4 py-3 text-center">
                    {item.bookingId ? <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-mono">{item.bookingId}</span> : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.invoiceId ? <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-mono">{item.invoiceId}</span> : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center font-mono">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{item.createdBy}</td>
                  <td className={`px-6 py-3 text-base font-bold text-right ${item.kind === 'BONUS' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {item.kind === 'BONUS' ? '+' : '-'}{item.amount.toLocaleString()}đ
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openView(item)} title="Xem" className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center justify-center transition-colors"><Eye size={14} /></button>
                      <button onClick={() => openEdit(item)} title="Sửa" className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 flex items-center justify-center transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} title="Xóa" className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center transition-colors"><Trash2 size={14} /></button>
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
