import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'

export default function RoomFormModal({ isOpen, onClose, room, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    size: 10,
    category: 'STANDARD',
    status: 'AVAILABLE'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        size: room.size || 10,
        category: room.category || 'STANDARD',
        status: room.status || 'AVAILABLE'
      })
    } else {
      setFormData({
        name: '',
        size: 10,
        category: 'STANDARD',
        status: 'AVAILABLE'
      })
    }
  }, [room, isOpen])

  if (!isOpen || !document.getElementById('main-layout')) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên phòng')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu phòng')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="absolute inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {room ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-500/20">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Room Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tên phòng</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Phòng 101"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Loại phòng</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sức chứa (người)</label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={e => setFormData({ ...formData, size: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Trạng thái</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'AVAILABLE', label: 'Trống', color: 'bg-green-500' },
                  { id: 'OCCUPIED', label: 'Đang hát', color: 'bg-primary' },
                  { id: 'RESERVED', label: 'Đã đặt', color: 'bg-orange-500' },
                  { id: 'MAINTENANCE', label: 'Bảo trì', color: 'bg-slate-500' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s.id })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      formData.status === s.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={18} /> {room ? 'Cập nhật' : 'Thêm phòng'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('main-layout')
  )
}
