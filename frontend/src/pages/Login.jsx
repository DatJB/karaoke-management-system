import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mic2, Lock, User, KeyRound } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(username, password);
      const role = data.role;

      if (role === 'ADMIN' || role === 'MANAGER') {
        navigate('/dashboard');
      } else {
        // STAFF, RECEPTIONIST, etc.
        navigate('/rooms');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 border-none bg-white/90 dark:bg-slate-900/90 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary-dark rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/30">
            <Mic2 size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Karaoke KTV</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-100/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium text-center">
              {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin my-0.5"></div>
            ) : (
              <>
                <Lock size={18} />
                Đăng nhập
              </>
            )}
          </button>


        </form>
      </div>
    </div>
  )
}
