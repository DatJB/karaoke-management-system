import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { User, Phone, Briefcase, ShieldCheck, Banknote } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Hồ sơ cá nhân</h1>
        <p className="text-slate-500 dark:text-slate-400">Xem và quản lý thông tin của bạn.</p>
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start rounded-3xl relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-white relative shadow-xl shadow-primary/20 z-10 shrink-0">
          <User size={56} />
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left z-10 w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{user.name}</h2>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <ShieldCheck size={16} className="text-primary" />
                <p className="text-primary font-bold uppercase tracking-widest text-sm">{user.role}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsChangingPassword(true)}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors mx-auto md:mx-0"
            >
              Đổi mật khẩu
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800 mt-6 md:w-full">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Phone size={18} className="text-slate-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Điện thoại</p>
                <p className="font-medium text-slate-900 dark:text-white">0901 234 567</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Briefcase size={18} className="text-slate-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Lương/giờ</p>
                <p className="font-medium text-slate-900 dark:text-white">50,000đ/giờ</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Banknote size={18} className="text-slate-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Lương cơ bản</p>
                <p className="font-medium text-slate-900 dark:text-white">8,000,000đ/tháng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Lịch trực tuần này</h3>
          <div className="space-y-3 relative">
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700/50"></div>
            {[{day: 'Thứ Hai', time: '18:00 - 23:00'}, {day: 'Thứ Tư', time: '18:00 - 23:00'}, {day: 'Thứ Sáu', time: '18:00 - 23:00'}].map((shift, i) => (
              <div key={i} className="flex relative items-center gap-4 pl-8">
                <div className="absolute left-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-[3px] border-white dark:border-slate-900 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="flex-1 flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 rounded-xl hover:border-primary/30 transition-colors">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{shift.day}</span>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {shift.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Hoạt động gần nhất</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm text-slate-900 dark:text-white font-medium">Checkout Phòng 102</p>
              <p className="text-xs text-slate-500 mt-1">Hôm qua, 23:30</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm text-slate-900 dark:text-white font-medium">Nhận ca làm việc</p>
              <p className="text-xs text-slate-500 mt-1">Hôm qua, 18:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal using Portal to center in right pane */}
      {isChangingPassword && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsChangingPassword(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Đổi mật khẩu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  placeholder="Nhập mật khẩu hiện tại" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="Nhập mật khẩu mới" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="Nhập lại mật khẩu mới" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsChangingPassword(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  alert('Đổi mật khẩu thành công!');
                  setIsChangingPassword(false);
                }}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('main-layout')
      )}
    </div>
  )
}
