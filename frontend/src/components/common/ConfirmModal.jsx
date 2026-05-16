import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', type = 'danger' }) {
  if (!isOpen || !document.getElementById('main-layout')) return null

  const colors = {
    danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
    warning: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30',
    primary: 'bg-primary hover:bg-primary-dark shadow-primary/30'
  }

  return createPortal(
    <div className="absolute inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative z-10">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'}`}>
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              {cancelText}
            </button>
            <button onClick={() => { onConfirm(); onClose() }} className={`flex-1 py-2.5 font-bold text-white rounded-xl transition-all shadow-lg ${colors[type]}`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('main-layout')
  )
}
