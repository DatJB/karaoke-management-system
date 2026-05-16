import { createPortal } from 'react-dom'
import { X, Star } from 'lucide-react'
import { mockRooms } from '../../mock/data'

/** Used only by RoomPricing.jsx */
export default function SpecialPriceModal({ modal, specialForm, setSpecialForm, closeModal, handleSpecialSubmit }) {
  if (!modal || !document.getElementById('main-layout')) return null

  return createPortal(
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0" onClick={closeModal} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            {modal === 'add' ? 'Thêm giá đặc biệt' : 'Sửa giá đặc biệt'}
          </h3>
          <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Room */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phòng <span className="text-red-400">*</span></label>
            <select value={specialForm.roomId} onChange={e => setSpecialForm(f => ({ ...f, roomId: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">-- Chọn phòng --</option>
              {mockRooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.category})</option>)}
            </select>
          </div>
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ngày đặc biệt <span className="text-red-400">*</span></label>
            <input type="date" value={specialForm.specialDate} onChange={e => setSpecialForm(f => ({ ...f, specialDate: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Từ giờ</label>
              <input type="time" value={specialForm.startTime} onChange={e => setSpecialForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Đến giờ</label>
              <input type="time" value={specialForm.endTime} onChange={e => setSpecialForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Giá / giờ (VND) <span className="text-red-400">*</span></label>
            <input type="number" min={0} placeholder="VD: 250000" value={specialForm.pricePerHour} onChange={e => setSpecialForm(f => ({ ...f, pricePerHour: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ghi chú</label>
            <input type="text" placeholder="VD: Tết Nguyên Đán" value={specialForm.note} onChange={e => setSpecialForm(f => ({ ...f, note: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex gap-3">
          <button onClick={closeModal} className="flex-1 py-2.5 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Hủy</button>
          <button onClick={handleSpecialSubmit} className="flex-1 py-2.5 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-md shadow-amber-500/30">
            {modal === 'add' ? 'Thêm' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('main-layout')
  )
}
