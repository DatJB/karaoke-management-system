import { useState } from 'react'
import { Search, Shield, User, Power, MoreVertical, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react'

const mockAccounts = [
  { id: 1, username: 'admin', name: 'Admin VIP', role: 'ADMIN', lastLogin: '2023-11-15 10:30', status: 'ACTIVE' },
  { id: 2, username: 'manager1', name: 'Lê Thanh Bình', role: 'MANAGER', lastLogin: '2023-11-15 08:20', status: 'ACTIVE' },
  { id: 3, username: 'staff1', name: 'Nguyễn Văn Phục', role: 'STAFF', lastLogin: '2023-11-14 19:45', status: 'ACTIVE' },
  { id: 4, username: 'staff2', name: 'Phạm Văn Vụ', role: 'STAFF', lastLogin: '2023-11-13 14:10', status: 'DISABLED' },
  { id: 5, username: 'reception1', name: 'Trần Thị Tiếp', role: 'RECEPTIONIST', lastLogin: '2023-11-15 07:15', status: 'ACTIVE' },
]

export default function Accounts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [accounts, setAccounts] = useState(mockAccounts)

  const toggleStatus = (id) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, status: acc.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : acc
    ))
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      setAccounts(prev => prev.filter(acc => acc.id !== id))
    }
  }

  const filteredAccounts = accounts.filter(acc => 
    acc.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
      case 'MANAGER': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
      case 'RECEPTIONIST': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Quản lý tài khoản</h1>
          <p className="text-slate-500 dark:text-slate-400">Phân quyền, quản lý trạng thái và bảo mật người dùng hệ thống.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc tên đăng nhập..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        <div className="flex gap-2">
           <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
             <option value="">Tất cả quyền</option>
             <option value="ADMIN">ADMIN</option>
             <option value="MANAGER">MANAGER</option>
             <option value="RECEPTIONIST">RECEPTIONIST</option>
             <option value="STAFF">STAFF</option>
           </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map(account => (
          <div key={account.id} className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group border border-transparent hover:border-primary/20">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-200 dark:shadow-none ${getRoleColor(account.role).replace('text-', 'bg-')}`}>
                  {account.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-none mb-1">{account.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">@{account.username}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${getRoleColor(account.role)}`}>
                  {account.role}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${account.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                  {account.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Shield size={14} /> Bảo mật:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Quyền tiêu chuẩn</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Power size={14} /> Đăng nhập cuối:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{account.lastLogin}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => alert(`Đang chỉnh sửa cho ${account.username}`)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all"
              >
                <Edit2 size={14} /> Sửa
              </button>
              <button 
                onClick={() => toggleStatus(account.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${account.status === 'ACTIVE' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/10' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/10'}`}
              >
                {account.status === 'ACTIVE' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                {account.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
              </button>
              <button 
                onClick={() => handleDelete(account.id)}
                className="w-10 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
