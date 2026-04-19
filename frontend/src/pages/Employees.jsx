import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import api from '../api/axios'

const STATUS_LABELS = {
  AVAILABLE: 'SAN SANG',
  BUSY: 'DANG BAN',
  OFF: 'NGHI PHEP',
}

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF']
const STATUS_OPTIONS = ['AVAILABLE', 'BUSY', 'OFF']

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback

const toCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}d`

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

const collectEmployeePayload = (initial = {}, isCreate = false) => {
  const fields = [
    { key: 'code', label: 'Ma nhan vien', required: false },
    { key: 'name', label: 'Ten nhan vien', required: true },
    { key: 'phone', label: 'So dien thoai', required: false },
    { key: 'baseSalary', label: 'Luong co ban', required: false },
    { key: 'salaryPerHour', label: 'Luong theo gio', required: true },
    { key: 'status', label: `Trang thai (${STATUS_OPTIONS.join('/')})`, required: false },
    { key: 'avatarUrl', label: 'Avatar URL', required: false },
  ]

  if (isCreate) {
    fields.push(
      { key: 'username', label: 'Username', required: true },
      { key: 'password', label: 'Password', required: true },
      { key: 'role', label: `Role (${ROLE_OPTIONS.join('/')})`, required: true },
      { key: 'accountStatus', label: 'Trang thai tai khoan (ACTIVE/INACTIVE)', required: false },
    )
  }

  const payload = {}

  for (const field of fields) {
    while (true) {
      const result = askValue(field.label, initial[field.key], field.required)

      if (result.cancelled) {
        return null
      }

      if (result.retry) {
        continue
      }

      payload[field.key] = result.value
      break
    }
  }

  return {
    ...payload,
    baseSalary: payload.baseSalary ? Number(payload.baseSalary) : 0,
    salaryPerHour: Number(payload.salaryPerHour),
    status: payload.status || undefined,
    accountStatus: payload.accountStatus || undefined,
  }
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/employees', {
        params: { page: 0, size: 100 },
      })
      setEmployees(response.data.content || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Khong the tai danh sach nhan vien.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleCreate = async () => {
    const payload = collectEmployeePayload(
      {
        status: 'AVAILABLE',
        role: 'STAFF',
        accountStatus: 'ACTIVE',
      },
      true,
    )

    if (!payload) {
      return
    }

    try {
      setSubmitting(true)
      await api.post('/employees', payload)
      await fetchEmployees()
      window.alert('Them nhan vien thanh cong.')
    } catch (err) {
      window.alert(getErrorMessage(err, 'Them nhan vien that bai.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (employee) => {
    const payload = collectEmployeePayload(
      {
        code: employee.code || '',
        name: employee.name || '',
        phone: employee.phone || '',
        baseSalary: employee.baseSalary ?? 0,
        salaryPerHour: employee.salaryPerHour ?? '',
        status: employee.status || 'AVAILABLE',
        avatarUrl: employee.avatarUrl || '',
      },
      false,
    )

    if (!payload) {
      return
    }

    try {
      setSubmitting(true)
      await api.put(`/employees/${employee.id}`, payload)
      await fetchEmployees()
      window.alert('Cap nhat nhan vien thanh cong.')
    } catch (err) {
      window.alert(getErrorMessage(err, 'Cap nhat nhan vien that bai.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (employee) => {
    if (!window.confirm(`Xoa nhan vien ${employee.name}?`)) {
      return
    }

    try {
      setSubmitting(true)
      await api.delete(`/employees/${employee.id}`)
      setEmployees((prev) => prev.filter((item) => item.id !== employee.id))
      window.alert('Xoa nhan vien thanh cong.')
    } catch (err) {
      window.alert(getErrorMessage(err, 'Xoa nhan vien that bai.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Quan ly Nhan su</h1>
          <p className="text-slate-500 dark:text-slate-400">Danh sach nhan vien va tinh trang lam viec.</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={submitting}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-60"
        >
          <Plus size={18} />
          Them nhan vien
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4 font-medium text-sm">Nhan vien</th>
                <th className="px-6 py-4 font-medium text-sm">Vai tro</th>
                <th className="px-6 py-4 font-medium text-sm">So dien thoai</th>
                <th className="px-6 py-4 font-medium text-sm">Luong co ban (Thang)</th>
                <th className="px-6 py-4 font-medium text-sm">Luong/gio</th>
                <th className="px-6 py-4 font-medium text-sm">Trang thai</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Dang tai du lieu...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Chua co nhan vien nao.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        ID: {emp.id} {emp.username ? `- @${emp.username}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-md text-xs font-semibold dark:text-slate-300 tracking-wide">
                        {emp.role || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{emp.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-primary">{toCurrency(emp.baseSalary)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{toCurrency(emp.salaryPerHour)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        emp.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                        emp.status === 'BUSY' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
                      }`}>
                        {STATUS_LABELS[emp.status] || emp.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          disabled={submitting}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          disabled={submitting}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
