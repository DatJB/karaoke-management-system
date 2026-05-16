import { useEffect, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Edit2, Trash2, X, Search, Camera, ZoomIn, ZoomOut, User } from 'lucide-react'
import Cropper from 'react-easy-crop'
import api from '../api/axios'

const STATUS_LABELS = {
  AVAILABLE: 'SẴN SÀNG',
  BUSY: 'ĐANG BẬN',
  OFF: 'NGHỈ PHÉP',
}

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new window.Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(URL.createObjectURL(file))
    }, 'image/jpeg')
  })
}

const readFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result), false)
    reader.readAsDataURL(file)
  })
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
  username: '',
  password: '',
  role: 'STAFF',
  accountStatus: 'ACTIVE',
  avatarPreview: null,
  avatarBlob: null,
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
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [viewingImage, setViewingImage] = useState(null)

  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      let imageDataUrl = await readFile(file)
      setImageSrc(imageDataUrl)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      e.target.value = ''
    }
  }

  const handleSaveCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      setForm(prev => ({ ...prev, avatarPreview: croppedImage, avatarBlob: blob }))
      setImageSrc(null)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch = search ? (emp.name?.toLowerCase().includes(search.toLowerCase()) || emp.phone?.includes(search)) : true;
      const matchRole = roleFilter === 'ALL' ? true : emp.role === roleFilter;
      return matchSearch && matchRole;
    })
  }, [employees, search, roleFilter])

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
        const formData = new FormData()
        formData.append('data', new Blob([JSON.stringify(result.payload)], { type: 'application/json' }))
        if (form.avatarBlob) {
          formData.append('avatar', form.avatarBlob, 'avatar.jpg')
        }
        await api.post('/employees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
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
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Quản lý nhân sự</h1>
          <p className="text-slate-500 dark:text-slate-400">Danh sách nhân viên và tình trạng làm việc.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo tên, SĐT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary dark:text-white shadow-sm transition-all text-sm"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary dark:text-white shadow-sm transition-all text-sm font-medium"
          >
            <option value="ALL">Tất cả vai trò</option>
            {ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          <button
            onClick={openCreateModal}
            disabled={submitting}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 shrink-0 font-bold disabled:opacity-60 text-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Thêm nhân viên</span>
          </button>
        </div>
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
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Không tìm thấy nhân viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div 
                        className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${emp.avatarUrl ? 'cursor-pointer hover:opacity-80 transition-opacity shadow-sm' : ''}`}
                        onClick={() => emp.avatarUrl && setViewingImage(emp.avatarUrl)}
                      >
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-400 font-bold text-lg">{emp.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{emp.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          ID: {emp.code || emp.id} {emp.username ? `- @${emp.username}` : ''}
                        </div>
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
              </div>

              {isCreateMode && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ảnh đại diện & Tài khoản</h4>
                    <span className="text-xs text-slate-400">Tạo cùng lúc với nhân viên</span>
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <div className="relative group/avatar">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                        {form.avatarPreview ? (
                          <img src={form.avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-slate-400" />
                        )}
                      </div>
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                        <Camera size={24} className="text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
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

      {viewingImage && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm z-[9999]" onClick={() => setViewingImage(null)}>
          <button className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-all" onClick={() => setViewingImage(null)}>
            <X size={24} />
          </button>
          <img src={viewingImage} alt="Chi tiết" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()} />
        </div>,
        document.getElementById('main-layout')
      )}

      {imageSrc && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" style={{ zIndex: 10000 }}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg flex flex-col relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Căn chỉnh ảnh đại diện</h3>
              <button onClick={() => setImageSrc(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="relative w-full h-[400px] bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-slate-500"><ZoomOut size={18} /></span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-slate-500"><ZoomIn size={18} /></span>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setImageSrc(null)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Hủy
                </button>
                <button onClick={handleSaveCrop} className="px-5 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary-dark transition-colors shadow-md shadow-primary/20">
                  Lưu ảnh
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('main-layout')
      )}
    </div>
  )
}
