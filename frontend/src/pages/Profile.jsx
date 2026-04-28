import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { User, Phone, Briefcase, ShieldCheck, Banknote, Clock, Camera, X, ZoomIn, ZoomOut } from 'lucide-react'
import { getProfile, updatePassword, updateAvatar } from '../api/profile'
import toast from 'react-hot-toast'
import Cropper from 'react-easy-crop'

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

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdError, setPwdError] = useState('')

  const [avatarSrc, setAvatarSrc] = useState(null)
  const fileInputRef = useRef(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.addEventListener('load', () => resolve(reader.result), false)
      reader.readAsDataURL(file)
    })
  }

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
      const formData = new FormData();
      formData.append('image', blob, 'avatar.jpg');
      
      const result = await updateAvatar(formData);
      setAvatarSrc(result.avatar_url || croppedImage)
      if (result.avatar_url) {
        updateUser({ avatarUrl: result.avatar_url })
      }
      setImageSrc(null)
      toast.success('Đã cập nhật ảnh đại diện')
    } catch (e) {
      toast.error('Lỗi khi cập nhật ảnh đại diện')
      console.error(e)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const data = await getProfile()
        setProfileData(data)
        if (data.avatarUrl) {
          setAvatarSrc(data.avatarUrl)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChangePassword = async () => {
    setPwdError('')
    if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      setPwdError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('Mật khẩu mới không khớp')
      return
    }
    
    try {
      await updatePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
      toast.success('Đổi mật khẩu thành công!')
      setIsChangingPassword(false)
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPwdError(error.response?.data || 'Đổi mật khẩu thất bại')
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Hồ sơ cá nhân</h1>
        <p className="text-slate-500 dark:text-slate-400">Xem và quản lý thông tin của bạn.</p>
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start rounded-3xl relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="relative shrink-0 z-10 group">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-white relative shadow-xl shadow-primary/20 overflow-hidden">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={56} />
            )}
            <div 
              className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={24} className="text-white mb-1" />
              <span className="text-[10px] text-white font-medium">Cập nhật</span>
            </div>
          </div>
          <button 
            className="absolute bottom-0 right-0 p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all hover:scale-110 active:scale-95"
            onClick={() => fileInputRef.current?.click()}
            title="Cập nhật ảnh đại diện"
          >
            <Camera size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left z-10 w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{profileData?.name || user.name}</h2>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <ShieldCheck size={16} className="text-primary" />
                <p className="text-primary font-bold uppercase tracking-widest text-sm">{profileData?.role || user.role}</p>
                <span className="text-slate-400 text-sm ml-2">(@{profileData?.username || user?.username || 'user'})</span>
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
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><User size={18} className="text-slate-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Mã nhân viên</p>
                <p className="font-medium text-slate-900 dark:text-white">{profileData?.code || profileData?.id || user?.id || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Phone size={18} className="text-slate-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Điện thoại</p>
                <p className="font-medium text-slate-900 dark:text-white">{profileData?.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Briefcase size={18} className="text-slate-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Trạng thái</p>
                <p className="font-medium text-slate-900 dark:text-white">Đang hoạt động</p>
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
            {profileData?.recentActivities?.length > 0 ? profileData.recentActivities.map((activity, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50">
                <p className="text-sm text-slate-900 dark:text-white font-medium">{activity.description}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock size={10} /> {new Date(activity.timestamp).toLocaleString('vi-VN')}
                </p>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có hoạt động nào gần đây</p>
            )}
          </div>
        </div>
      </div>

      {isChangingPassword && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsChangingPassword(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Đổi mật khẩu</h3>
            <div className="space-y-4">
              {pwdError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{pwdError}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  value={pwdForm.oldPassword}
                  onChange={(e) => setPwdForm({...pwdForm, oldPassword: e.target.value})}
                  placeholder="Nhập mật khẩu hiện tại" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu mới</label>
                <input 
                  type="password" 
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({...pwdForm, newPassword: e.target.value})}
                  placeholder="Nhập mật khẩu mới" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
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
                onClick={handleChangePassword}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('main-layout')
      )}

      {imageSrc && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
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
