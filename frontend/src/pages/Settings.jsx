import { Shield, Key, Building, Save } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Cấu hình Hệ thống</h1>
        <p className="text-slate-500 dark:text-slate-400">Điều chỉnh các thông số vận hành và phân quyền truy cập cốt lõi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {['Tài khoản & Phân quyền', 'Giá phòng & Khung giờ', 'Công thức tính Lương', 'Giao diện & Hệ thống'].map((tab, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${
              i === 0 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}>
              {i === 0 ? <Shield size={18} /> : i === 1 ? <Building size={18} /> : <Key size={18} />}
              <span className="text-sm">{tab}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 glass-card border-none bg-white/80 dark:bg-slate-900/80 p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quản lý Tài khoản & Bảo mật (Ví dụ)</h3>
          
          <div className="space-y-8">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <div className="flex justify-between items-start mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h4 className="text-lg font-bold dark:text-white">Kiểm soát truy cập</h4>
                  <p className="text-sm text-slate-500">Quản lý phiên bản đăng nhập của nhân sự hệ thống.</p>
                </div>
                <button className="text-sm font-medium bg-red-100/50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
                  Ngắt kết nối tất cả
                </button>
              </div>
              <div className="flex items-center gap-3 mt-4 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
                <span className="text-sm font-medium dark:text-slate-300">Chỉ cho phép đăng nhập từ IP nhà mạng quán (Intranet)</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Các tính năng yêu cầu bảo mật</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <div className="text-sm font-bold dark:text-white">Yêu cầu xác thực 2 lớp (2FA) đối với Admin/Manager</div>
                    <div className="text-xs text-slate-500 mt-1">Bảo mật giao dịch tránh bị xóa hóa đơn</div>
                  </div>
                  <div className="w-12 h-6 bg-slate-300 dark:bg-slate-600 rounded-full cursor-pointer relative transition-colors">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <div className="text-sm font-bold dark:text-white">Tự động đăng xuất màn hình Lễ tân sau 15p</div>
                    <div className="text-xs text-slate-500 mt-1">Ngăn chặn thao tác khi Lễ tân vắng mặt</div>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full cursor-pointer relative shadow-inner">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white px-8 py-3 rounded-xl transition-all font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30">
                <Save size={18} /> Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
