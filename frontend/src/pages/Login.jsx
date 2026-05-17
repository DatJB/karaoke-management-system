import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, KeyRound, Lock, Mic2, ShieldCheck, User } from 'lucide-react'

export default function Login() {
  const { login, verify2faLogin } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [pendingUsername, setPendingUsername] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigateAfterLogin = (role) => {
    if (role === 'ADMIN' || role === 'MANAGER') {
      navigate('/dashboard')
    } else {
      navigate('/rooms')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await login(username, password)

      if (data.requires2FA === true || data.requires2FA === 'true') {
        setPendingUsername(data.username || username)
        setRequires2FA(true)
        setTotpCode('')
        return
      }

      navigateAfterLogin(data.role)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Đăng nhập thất bại. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    setError('')

    if (!totpCode.match(/^\d{6}$/)) {
      setError('Vui lòng nhập mã xác thực gồm 6 chữ số.')
      return
    }

    setIsLoading(true)

    try {
      const data = await verify2faLogin(pendingUsername || username, totpCode)
      navigateAfterLogin(data.role)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Mã xác thực không chính xác hoặc đã hết hạn.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const reset2FA = () => {
    setRequires2FA(false)
    setPendingUsername('')
    setTotpCode('')
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 border-none bg-white/90 dark:bg-slate-900/90 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary-dark rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/30">
            {requires2FA ? <ShieldCheck size={32} /> : <Mic2 size={32} />}
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Karaoke KTV</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {requires2FA ? 'Nhập mã từ Google Authenticator' : 'Đăng nhập vào hệ thống'}
          </p>
        </div>

        <form onSubmit={requires2FA ? handleVerify2FA : handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-100/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium text-center">
              {error}
            </div>
          )}

          {requires2FA ? (
            <>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-sm text-slate-600 dark:text-slate-300">
                Tài khoản <span className="font-semibold text-slate-900 dark:text-white">{pendingUsername || username}</span> đã bật xác thực 2 lớp.
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Mã xác thực 6 số</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-500 rounded-xl outline-none focus:border-primary dark:focus:border-primary text-slate-900 dark:text-white transition-all shadow-sm tracking-[0.35em] font-semibold"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Tên đăng nhập</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập..."
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-500 rounded-xl outline-none focus:border-primary dark:focus:border-primary text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Mật khẩu</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-500 rounded-xl outline-none focus:border-primary dark:focus:border-primary text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin my-0.5"></div>
            ) : requires2FA ? (
              <>
                <ShieldCheck size={18} />
                Xác minh
              </>
            ) : (
              <>
                <Lock size={18} />
                Đăng nhập
              </>
            )}
          </button>

          {requires2FA && (
            <button
              type="button"
              onClick={reset2FA}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Đổi tài khoản
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
