import { useEffect, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Search, Shield, Power, Trash2, Edit2, CheckCircle2, XCircle, X, Camera, ZoomIn, ZoomOut } from 'lucide-react'
import toast from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import api from '../api/axios'

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF']
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE']

const defaultForm = {
  username: '',
  password: '',
  role: 'STAFF',
  status: 'ACTIVE',
}

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback

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

const formatLastLogin = (value) => {
  if (!value) {
    return 'Chưa đăng nhập.'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
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

export default function Accounts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingAccountId, setEditingAccountId] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [formError, setFormError] = useState('')

  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [targetAccountId, setTargetAccountId] = useState(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/accounts', {
        params: { page: 0, size: 100 },
      })
      setAccounts(response.data.content || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách tài khoản.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const editingAccount = useMemo(
    () => accounts.find((account) => account.id === editingAccountId),
    [accounts, editingAccountId],
  )

  const openEditModal = (account) => {
    setEditingAccountId(account.id)
    setForm({
      username: account.username || '',
      password: '',
      role: account.role || 'STAFF',
      status: account.status || 'ACTIVE',
    })
    setFormError('')
  }

  const closeEditModal = () => {
    setEditingAccountId(null)
    setForm(defaultForm)
    setFormError('')
  }

  const toggleStatus = async (account) => {
    const nextStatus = account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    try {
      setSubmitting(true)
      const response = await api.patch(`/accounts/${account.id}/status`, {
        status: nextStatus,
      })
      setAccounts((prev) => prev.map((item) => (item.id === account.id ? response.data : item)))
    } catch (err) {
      window.alert(getErrorMessage(err, 'Cập nhật trạng thái tài khoản thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (account) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${account.username}"?`)) {
      return
    }

    try {
      setSubmitting(true)
      await api.delete(`/accounts/${account.id}`)
      setAccounts((prev) => prev.filter((item) => item.id !== account.id))
    } catch (err) {
      window.alert(getErrorMessage(err, 'Xóa tài khoản thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    if (!form.username.trim()) {
      setFormError('Username không được để trống.')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')

      const payload = {
        username: form.username.trim(),
        role: form.role,
        status: form.status,
      }

      if (form.password.trim()) {
        payload.password = form.password
      }

      const response = await api.put(`/accounts/${editingAccountId}`, payload)
      setAccounts((prev) => prev.map((item) => (item.id === editingAccountId ? response.data : item)))
      closeEditModal()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Cập nhật tài khoản thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = async (accountId, e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      let imageDataUrl = await readFile(file)
      setImageSrc(imageDataUrl)
      setTargetAccountId(accountId)
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
      const formData = new FormData();
      formData.append('image', blob, 'avatar.jpg');
      
      const loadingToast = toast.loading('Đang cập nhật ảnh đại diện...');
      const res = await api.post(`/accounts/${targetAccountId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.dismiss(loadingToast);
      toast.success('Đã cập nhật ảnh đại diện');
      
      setAccounts((prev) => prev.map((item) => (item.id === targetAccountId ? { ...item, avatarUrl: res.data.avatar_url } : item)));
      
      setImageSrc(null)
      setTargetAccountId(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Cập nhật ảnh đại diện thất bại.'));
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
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Quản lý tài khoản</h1>
          <p className="text-slate-500 dark:text-slate-400">Phân quyền, quản lý trạng thái và bảo mật người dùng hệ thống.</p>
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
            placeholder="Tìm theo tên nhân viên hoặc tài khoản..."
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
            <option value="">Tất cả quyền</option>
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
            Đang tải dữ liệu...
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
            Không có tài khoản nào phù hợp.
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <div key={account.id} className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group border border-transparent hover:border-primary/20">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative group/avatar shrink-0">
                    {account.avatarUrl ? (
                      <img src={account.avatarUrl} alt={account.username} className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-slate-200 dark:shadow-none" />
                    ) : (
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-200 dark:shadow-none ${getRoleColor(account.role).replace('text-', 'bg-')}`}>
                        {(account.employeeName || account.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                      <Camera size={18} className="text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(account.id, e)} />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-none mb-1">{account.employeeName || 'Chưa liên kết nhân viên'}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">@{account.username}</p>
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
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Quyền {account.role}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Power size={14} /> Đăng nhập cuối:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{formatLastLogin(account.lastLoginAt)}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => openEditModal(account)}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                >
                  <Edit2 size={14} /> Sửa
                </button>
                <button
                  onClick={() => toggleStatus(account)}
                  disabled={submitting}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${account.status === 'ACTIVE' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/10' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/10'}`}
                >
                  {account.status === 'ACTIVE' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                  {account.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
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

      {editingAccountId && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0" onClick={closeEditModal} />
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cập nhật tài khoản</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {editingAccount?.employeeName || editingAccount?.username}
                </p>
              </div>
              <button onClick={closeEditModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tài khoản</span>
                  <input value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu mới</span>
                  <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Để trống nếu không đổi" className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quyền</span>
                  <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {ROLE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trạng thái</span>
                  <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <div className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Đăng nhập lần cuối</span>
                  <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300">
                    {formatLastLogin(editingAccount?.lastLoginAt)}
                  </div>
                </div>
              </div>
            </form>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
              <button onClick={closeEditModal} type="button" className="flex-1 py-3 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors">
                Hủy
              </button>
              <button type="submit" onClick={handleEditSubmit} disabled={submitting} className="flex-1 py-3 font-bold text-white bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed rounded-2xl transition-colors shadow-lg shadow-primary/30 disabled:shadow-none">
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('main-layout'),
      )}

      {imageSrc && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg flex flex-col relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Căn chỉnh ảnh đại diện</h3>
              <button onClick={() => {setImageSrc(null); setTargetAccountId(null);}} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
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
                <button onClick={() => {setImageSrc(null); setTargetAccountId(null);}} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
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
