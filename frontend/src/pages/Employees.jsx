import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import api from '../api/axios'

const STATUS_LABELS = {
  AVAILABLE: 'SẴN SÀNG',
  BUSY: 'ĐANG BẬN',
  OFF: 'NGHỈ PHÉP',
}

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF']
const STATUS_OPTIONS = ['AVAILABLE', 'BUSY', 'OFF']
const ACCOUNT_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE']

const defaultForm = {
  code: '',
  name: '',
  phone: '',
  baseSalary: '',
  salaryPerHour: '',
  status: 'AVAILABLE',
  avatarUrl: '',
  username: '',
  password: '',
  role: 'STAFF',
  accountStatus: 'ACTIVE',
}

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback

const toCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [formError, setFormError] = useState('')

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/employees', {
        params: { page: 0, size: 100 },
      })
      setEmployees(response.data.content || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách nhân viên.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const isCreateMode = modal?.type === 'create'

  const currentEmployee = useMemo(
    () => employees.find((employee) => employee.id === modal?.employeeId),
    [employees, modal],
  )

  const openCreateModal = () => {
    setModal({ type: 'create' })
    setForm(defaultForm)
    setFormError('')
  }

  const openEditModal = (employee) => {
    setModal({ type: 'edit', employeeId: employee.id })
    setForm({
      code: employee.code || '',
      name: employee.name || '',
      phone: employee.phone || '',
      baseSalary: employee.baseSalary ?? '',
      salaryPerHour: employee.salaryPerHour ?? '',
      status: employee.status || 'AVAILABLE',
      avatarUrl: employee.avatarUrl || '',
      username: employee.username || '',
      password: '',
      role: employee.role || 'STAFF',
      accountStatus: employee.accountStatus || 'ACTIVE',
    })
    setFormError('')
  }

  const closeModal = () => {
    setModal(null)
    setForm(defaultForm)
    setFormError('')
  }

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const buildPayload = () => {
    if (!form.code.trim()) {
      return { error: 'Mã nhân viên không được để trống.' }
    }

    if (!form.name.trim()) {
      return { error: 'Tên nhân viên không được để trống.' }
    }

    if (!form.phone.trim()) {
      return { error: 'Số điện thoại không được để trống.' }
    }

//     if () {
//       return { error: 'Lương cơ bản là số nguyên.' }
//     }
//
//     if (!Number.isInteger(form.salaryPerHour)) {
//       return { error: 'Lương theo giờ phải là số nguyên.' }
//     }

    const payload = {
      code: form.code.trim() || null,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      baseSalary: form.baseSalary === '' ? 0 : Number(form.baseSalary),
      salaryPerHour: Number(form.salaryPerHour),
      status: form.status,
      avatarUrl: form.avatarUrl.trim() || null,
    }

    if (Number.isNaN(payload.baseSalary) || payload.baseSalary < 0 || payload.baseSalary >= Number.MAX_SAFE_INTEGER) {
      return { error: 'Lương cơ bản không hợp lệ.' }
    }

    if (Number.isNaN(payload.salaryPerHour) || payload.salaryPerHour < 0 || payload.salaryPerHour >= Number.MAX_SAFE_INTEGER) {
      return { error: 'Lương theo giờ không hợp lệ.' }
    }

    if (isCreateMode) {
      if (!form.username.trim()) {
        return { error: 'Tài khoản Không được để trống.' }
      }

      if (!form.password.trim()) {
        return { error: 'Mật khẩu không được để trống.' }
      }

      payload.username = form.username.trim()
      payload.password = form.password
      payload.role = form.role
      payload.accountStatus = form.accountStatus
    }

    return { payload }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = buildPayload()

    if (result.error) {
      setFormError(result.error)
      return
    }

    try {
      setSubmitting(true)
      setFormError('')

      if (isCreateMode) {
        await api.post('/employees', result.payload)
      } else {
        await api.put(`/employees/${modal.employeeId}`, result.payload)
      }

      await fetchEmployees()
      closeModal()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Lưu nhân viên thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (employee) => {
    if (!window.confirm(`Xóa nhân viên "${employee.name}"?`)) {
      return
    }

    try {
      setSubmitting(true)
      await api.delete(`/employees/${employee.id}`)
      setEmployees((prev) => prev.filter((item) => item.id !== employee.id))
    } catch (err) {
      window.alert(getErrorMessage(err, 'Xóa nhân viên thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Quản lý nhân sự</h1>
          <p className="text-slate-500 dark:text-slate-400">Danh sách nhân viên và tình trạng làm việc.</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={submitting}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-60"
        >
          <Plus size={18} />
          Thêm nhân viên.
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
                <th className="px-6 py-4 font-medium text-sm">Nhân viên</th>
                <th className="px-6 py-4 font-medium text-sm">Vai trò</th>
                <th className="px-6 py-4 font-medium text-sm">Số điện thoại</th>
                <th className="px-6 py-4 font-medium text-sm">Lương cơ bản (Tháng)</th>
                <th className="px-6 py-4 font-medium text-sm">Lương theo giờ</th>
                <th className="px-6 py-4 font-medium text-sm">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Chưa có nhân viên nào.
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
                          onClick={() => openEditModal(emp)}
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

      {modal && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0" onClick={closeModal} />
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isCreateMode ? 'Thêm nhân viên' : 'Cập nhật nhân viên'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {isCreateMode ? 'Tạo nhân viên và Thêm tài khoản' : `Sửa nhân viên #${currentEmployee?.name ?? ''}`}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mã nhân viên</span>
                  <input value={form.code} onChange={(event) => handleInputChange('code', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên nhân viên</span>
                  <input value={form.name} onChange={(event) => handleInputChange('name', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số điện thọai</span>
                  <input value={form.phone} onChange={(event) => handleInputChange('phone', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trạng thái</span>
                  <select value={form.status} onChange={(event) => handleInputChange('status', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lương cơ bản</span>
                  <input type="number" min="0" value={form.baseSalary} onChange={(event) => handleInputChange('baseSalary', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lương theo giờ</span>
                  <input type="number" min="0" value={form.salaryPerHour} onChange={(event) => handleInputChange('salaryPerHour', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Avatar URL</span>
                  <input value={form.avatarUrl} onChange={(event) => handleInputChange('avatarUrl', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </label>
              </div>

              {isCreateMode && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tài khoản đăng nhập</h4>
                    <span className="text-xs text-slate-400">Tạo cùng lúc với nhân viên</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tài khoản</span>
                      <input value={form.username} onChange={(event) => handleInputChange('username', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</span>
                      <input type="password" value={form.password} onChange={(event) => handleInputChange('password', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quyền</span>
                      <select value={form.role} onChange={(event) => handleInputChange('role', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {ROLE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trạng thái tài khoản</span>
                      <select value={form.accountStatus} onChange={(event) => handleInputChange('accountStatus', event.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {ACCOUNT_STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </form>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
              <button onClick={closeModal} type="button" className="flex-1 py-3 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors">
                Hủy
              </button>
              <button type="submit" onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 font-bold text-white bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed rounded-2xl transition-colors shadow-lg shadow-primary/30 disabled:shadow-none">
                {submitting ? 'Đang lưu...' : isCreateMode ? 'Tạo nhân viên' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('main-layout'),
      )}
    </div>
  )
}
