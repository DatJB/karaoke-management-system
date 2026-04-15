import { createPortal } from 'react-dom'
import { X, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import TypeBadge, { BONUS_TYPES, PENALTY_TYPES } from './BonusTypeConfig'
import BonusEmployeeSelect from './BonusEmployeeSelect'
import { mockEmployees } from '../../mock/data'

/** Add/Edit + View modal — used only by BonusPenaltyManagement.jsx */
export default function BonusPenaltyModal({ modal, form, setForm, formError, closeModal, handleSubmit, selected, openEdit }) {
  if (!modal || !document.getElementById('main-layout')) return null

  const currentTypes = form.kind === 'BONUS' ? BONUS_TYPES : PENALTY_TYPES

  /* ── Add / Edit ── */
  if (modal === 'add' || modal === 'edit') return createPortal(
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0" onClick={closeModal} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{modal === 'add' ? 'Thêm thưởng / phạt' : 'Chỉnh sửa'}</h3>
          <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Kind toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Loại hành động</label>
            <div className="flex gap-3">
              <button onClick={() => setForm(f => ({ ...f, kind: 'BONUS', type: 'SERVICE' }))}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all ${form.kind === 'BONUS' ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                <TrendingUp size={16} /> Thưởng
              </button>
              <button onClick={() => setForm(f => ({ ...f, kind: 'PENALTY', type: 'LATE' }))}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all ${form.kind === 'PENALTY' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                <TrendingDown size={16} /> Phạt
              </button>
            </div>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nhân viên <span className="text-red-400">*</span></label>
            <BonusEmployeeSelect value={form.employeeId} onChange={(emp) => setForm(f => ({ ...f, employeeId: emp.id, employeeName: emp.name }))} />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phân loại {form.kind === 'BONUS' ? 'thưởng' : 'phạt'} <span className="text-red-400">*</span></label>
            <div className="relative">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none pr-8">
                {currentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Booking & Invoice */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Booking ID (tùy chọn)</label>
              <input type="text" placeholder="VD: B012" value={form.bookingId ?? ''} onChange={e => setForm(f => ({ ...f, bookingId: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Hóa đơn ID (tùy chọn)</label>
              <input type="text" placeholder="VD: INV5" value={form.invoiceId ?? ''} onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Số tiền (VND) <span className="text-red-400">*</span></label>
            <input type="number" placeholder="VD: 500000" min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ghi chú / Lý do</label>
            <textarea rows={2} placeholder="Mô tả ngắn gọn..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>

          {formError && <p className="text-sm text-red-500 font-medium">{formError}</p>}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
          <button onClick={closeModal} className="flex-1 py-2.5 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Hủy</button>
          <button onClick={handleSubmit}
            className={`flex-1 py-2.5 font-bold text-white rounded-xl transition-colors shadow-lg ${form.kind === 'BONUS' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'}`}>
            {modal === 'add' ? `Xác nhận ${form.kind === 'BONUS' ? 'thưởng' : 'phạt'}` : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('main-layout')
  )

  /* ── View ── */
  if (modal === 'view' && selected) return createPortal(
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0" onClick={closeModal} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chi tiết</h3>
          <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold shrink-0">
              {selected.employeeName.split(' ').pop()?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{selected.employeeName}</p>
              <p className="text-xs text-slate-400 font-mono">CCCD: {mockEmployees.find(e => e.id === selected.employeeId)?.cccd ?? '—'}</p>
            </div>
          </div>
          {[
            ['Loại', <TypeBadge kind={selected.kind} type={selected.type} />],
            ['Booking ID', selected.bookingId || '—'],
            ['Hóa đơn ID', selected.invoiceId || '—'],
            ['Ghi chú / Lý do', selected.note || '—'],
            ['Ngày tạo', new Date(selected.createdAt).toLocaleDateString('vi-VN')],
            ['Người tạo', selected.createdBy],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{val}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Số tiền</span>
            <span className={`text-2xl font-bold ${selected.kind === 'BONUS' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {selected.kind === 'BONUS' ? '+' : '-'}{selected.amount.toLocaleString()}đ
            </span>
          </div>
        </div>
        <div className="p-4 flex gap-3 border-t border-slate-200 dark:border-slate-800">
          <button onClick={closeModal} className="flex-1 py-2.5 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Đóng</button>
          <button onClick={() => openEdit(selected)} className="flex-1 py-2.5 font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors">Chỉnh sửa</button>
        </div>
      </div>
    </div>,
    document.getElementById('main-layout')
  )

  return null
}
