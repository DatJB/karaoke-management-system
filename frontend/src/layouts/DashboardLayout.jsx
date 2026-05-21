import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard,
  Grid,
  Users,
  Receipt,
  User,
  Package,
  LogOut,
  Sun,
  Moon,
  Mic2,
  Contact,
  Settings,
  Calculator,
  CalendarDays,
  Sparkles,
  Menu,
  FileText,
  Wallet,
  TrendingUp,
  BarChart3,
  Award,
  DollarSign,
  ClipboardList,
  ShieldCheck,
  Key
} from 'lucide-react'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  const getNavItems = () => {
    const items = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan', roles: ['ADMIN', 'MANAGER'] },
      { path: '/rooms', icon: Grid, label: 'Phòng hát', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF'] },
      { path: '/settings', icon: DollarSign, label: 'Giá phòng', roles: ['ADMIN'] },
      { path: '/customers', icon: Contact, label: 'Khách hàng', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
      { path: '/invoices', icon: Receipt, label: 'Hóa đơn', roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'], end: true },
      { path: '/invoices/security', icon: ShieldCheck, label: 'Bảo mật HĐ', roles: ['ADMIN', 'MANAGER'] },
      { path: '/security/keys', icon: Key, label: 'Quản lý Khóa', roles: ['ADMIN', 'MANAGER'] },
      { path: '/products', icon: Package, label: 'Kho hàng', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      { path: '/employees', icon: Users, label: 'Nhân sự', roles: ['ADMIN', 'MANAGER'] },
      { path: '/accounts', icon: ShieldCheck, label: 'Tài khoản', roles: ['ADMIN'] },
      { path: '/staff-assignment', icon: ClipboardList, label: 'Phân công NV', roles: ['ADMIN', 'MANAGER'] },
      { path: '/payroll', icon: Calculator, label: 'Tính lương', roles: ['ADMIN', 'MANAGER'], end: true },
      { path: '/payroll-list', icon: FileText, label: 'DS bảng lương', roles: ['ADMIN', 'MANAGER'] },
      { path: '/revenue', icon: BarChart3, label: 'Doanh thu', roles: ['ADMIN', 'MANAGER'] },
      { path: '/bonus-penalty', icon: Award, label: 'Thưởng & Phạt', roles: ['ADMIN', 'MANAGER'] },
      { path: '/ai-feedback', icon: Sparkles, label: 'AI Phân tích', roles: ['ADMIN', 'MANAGER'] },
      { path: '/shifts', icon: CalendarDays, label: 'Ca làm việc', roles: ['RECEPTIONIST', 'STAFF'] },
      { path: '/my-payroll', icon: Wallet, label: 'Lương của tôi', roles: ['RECEPTIONIST', 'STAFF'] },
      { path: '/my-bonus-penalty', icon: Award, label: 'Thưởng & Phạt', roles: ['RECEPTIONIST', 'STAFF'] },
    ]
    return items.filter(item => item.roles.includes(user.role))
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 dark:bg-[#0b1120]">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300
        w-64 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
      `}>
        <div className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-800 px-6 ${isSidebarCollapsed ? 'md:justify-center md:px-0' : ''}`}>
          <div className="flex items-center gap-3 text-primary">
            <Mic2 size={24} className="shrink-0" />
            <span className={`font-display font-bold text-xl text-slate-900 dark:text-white truncate ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>Karaoke KTV</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {getNavItems().map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={closeMobileSidebar}
              title={isSidebarCollapsed ? item.label : ''}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all ${isSidebarCollapsed ? 'md:justify-center md:px-0' : ''} ${isActive
                  ? 'bg-primary/10 text-primary dark:text-primary-light'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <span className={`truncate ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <NavLink
            to="/profile"
            onClick={closeMobileSidebar}
            title={isSidebarCollapsed ? "Hồ sơ" : ''}
            className={({ isActive }) =>
              `flex items-center gap-3 mb-4 rounded-xl transition-all border border-transparent px-4 py-2.5 ${isSidebarCollapsed ? 'md:px-0 md:py-2 md:justify-center' : ''} ${isActive
                ? 'bg-primary/10 border-primary/20 text-primary dark:text-primary-light shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`
            }
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0 shadow-md" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex shrink-0 items-center justify-center font-bold text-sm shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={`overflow-hidden ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none mb-1">{user.name}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
            </div>
          </NavLink>
          <button
            onClick={() => {
              closeMobileSidebar();
              logout();
            }}
            title={isSidebarCollapsed ? "Đăng xuất" : ''}
            className={`w-full flex items-center gap-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors px-4 py-3 ${isSidebarCollapsed ? 'md:px-0 md:py-3 md:justify-center' : ''}`}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`truncate ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-layout" className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-200 hidden sm:block">
              Xin chào, {user.name}
            </h2>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors shadow-sm"
              title="Chuyển đổi giao diện"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
