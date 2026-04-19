import { useEffect, useState } from 'react'
import { Search, Shield, Power, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react'
import api from '../api/axios'

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF']
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE']

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback

const askValue = (label, defaultValue = '', required = false) => {
  const value = window.prompt(label, defaultValue ?? '')

  if (value === null) {
    return { cancelled: true }
  }

  const trimmed = value.trim()

  if (required && !trimmed) {
    window.alert(`${label} khong duoc de trong.`)
    return { retry: true }
  }

  return { value: trimmed }
}

const getRoleColor = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
    case 'MANAGER':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
    case 'RECEPTIONIST':
      return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
  }
}

export default function Accounts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/accounts', {
        params: { page: 0, size: 100 },
      })
      setAccounts(response.data.content || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Khong the tai danh sach tai khoan.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const toggleStatus = async (account) => {
    const nextStatus = account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    try {
      setSubmitting(true)
      const response = await api.patch(`/accounts/${account.id}/status`, {
        status: nextStatus,
      })
      setAccounts((prev) => prev.map((item) => (item.id === account.id ? response.data : item)))
    } catch (err) {
      window.alert(getErrorMessage(err, 'Cap nhat trang thai tai khoan that bai.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (account) => {
    if (!window.confirm(`Ban co chac chan muon xoa tai khoan ${account.username}?`)) {
      return
    }

    try {
      setSubmitting(true)
      await api.delete(`/accounts/${account.id}`)
      setAccounts((prev) => prev.filter((item) => item.id !== account.id))
      window.alert('Xoa tai khoan thanh cong.')
    } catch (err) {
      window.alert(getErrorMessage(err, 'Xoa tai khoan that bai.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (account) => {
    const payload = {}

    while (true) {
      const usernameResult = askValue('Username', account.username, true)
      if (usernameResult.cancelled) return
      if (usernameResult.retry) continue
      payload.username = usernameResult.value
      break
    }

    while (true) {
      const roleResult = askValue(`Role (${ROLE_OPTIONS.join('/')})`, account.role, true)
      if (roleResult.cancelled) return
      if (roleResult.retry) continue
      payload.role = roleResult.value
      break
    }

    while (true) {
      const statusResult = askValue(`Trang thai (${STATUS_OPTIONS.join('/')})`, account.status, true)
      if (statusResult.cancelled) return
      if (statusResult.retry) continue
      payload.status = statusResult.value
      break
    }

    const passwordResult = askValue('Password moi (de trong neu giu nguyen)', '', false)
    if (passwordResult.cancelled) {
      return
    }
    if (passwordResult.value) {
      payload.password = passwordResult.value
    }

    try {
      setSubmitting(true)
      const response = await api.put(`/accounts/${account.id}`, payload)
      setAccounts((prev) => prev.map((item) => (item.id === account.id ? response.data : item)))
      window.alert('Cap nhat tai khoan thanh cong.')
    } catch (err) {
      window.alert(getErrorMessage(err, 'Cap nhat tai khoan that bai.'))
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = !selectedRole || account.role === selectedRole

    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Quan ly tai khoan</h1>
          <p className="text-slate-500 dark:text-slate-400">Phan quyen, quan ly trang thai va bao mat nguoi dung he thong.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tim theo ten hoac ten dang nhap..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Tat ca quyen</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="RECEPTIONIST">RECEPTIONIST</option>
            <option value="STAFF">STAFF</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
            Dang tai du lieu...
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
            Khong co tai khoan nao phu hop.
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <div key={account.id} className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group border border-transparent hover:border-primary/20">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-200 dark:shadow-none ${getRoleColor(account.role).replace('text-', 'bg-')}`}>
                    {(account.employeeName || account.username || '?').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-none mb-1">{account.employeeName || 'Chua lien ket nhan vien'}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">@{account.username}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${getRoleColor(account.role)}`}>
                    {account.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${account.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                    {account.status === 'ACTIVE' ? 'Hoat dong' : 'Da khoa'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Shield size={14} /> Bao mat:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Quyen {account.role}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Power size={14} /> Nhan vien:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{account.employeeId ? `#${account.employeeId}` : '--'}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleEdit(account)}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                >
                  <Edit2 size={14} /> Sua
                </button>
                <button
                  onClick={() => toggleStatus(account)}
                  disabled={submitting}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${account.status === 'ACTIVE' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/10' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/10'}`}
                >
                  {account.status === 'ACTIVE' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                  {account.status === 'ACTIVE' ? 'Khoa' : 'Mo'}
                </button>
                <button
                  onClick={() => handleDelete(account)}
                  disabled={submitting}
                  className="w-10 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-all disabled:opacity-60"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
