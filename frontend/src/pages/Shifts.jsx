import { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../api/axios'

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback

const formatDateLabel = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.getTime() === today.getTime()) return 'Hom nay'
  if (date.getTime() === tomorrow.getTime()) return 'Ngay mai'
  if (date.getTime() === yesterday.getTime()) return 'Hom qua'

  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

const formatShiftTime = (startTime, endTime) => `${startTime?.slice(0, 5) || '--:--'} - ${endTime?.slice(0, 5) || '--:--'}`

const startOfWeek = (date) => {
  const current = new Date(date)
  current.setHours(0, 0, 0, 0)
  const day = current.getDay() || 7
  current.setDate(current.getDate() - day + 1)
  return current
}

const endOfWeek = (date) => {
  const current = startOfWeek(date)
  current.setDate(current.getDate() + 6)
  return current
}

export default function Shifts() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/schedules/me')
        setSchedules(response.data || [])
      } catch (err) {
        setError(getErrorMessage(err, 'Khong the tai lich lam viec cua ban.'))
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [])

  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekStart = startOfWeek(today)
    const weekEnd = endOfWeek(today)

    const inCurrentWeek = schedules.filter((schedule) => {
      const scheduleDate = new Date(`${schedule.workDate}T00:00:00`)
      return scheduleDate >= weekStart && scheduleDate <= weekEnd
    })

    const completed = schedules.filter((schedule) => new Date(`${schedule.workDate}T00:00:00`) < today)
    const upcoming = schedules.filter((schedule) => new Date(`${schedule.workDate}T00:00:00`) >= today)

    return {
      currentWeek: inCurrentWeek.length,
      completed: completed.length,
      upcoming: upcoming.length,
    }
  }, [schedules])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Ca lam viec cua toi</h1>
          <p className="text-slate-500 dark:text-slate-400">Xem toan bo lich truc duoc phan cong va lich su da lam.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Tong ca tuan nay</p>
            <h4 className="border-none font-bold text-xl dark:text-white">{stats.currentWeek} Ca</h4>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Da hoan thanh</p>
            <h4 className="border-none font-bold text-xl dark:text-white">{stats.completed} Ca</h4>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Sap truc</p>
            <h4 className="border-none font-bold text-xl dark:text-white">{stats.upcoming} Ca</h4>
          </div>
        </div>
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4 font-medium text-sm">Ngay</th>
                <th className="px-6 py-4 font-medium text-sm">Ca lam viec</th>
                <th className="px-6 py-4 font-medium text-sm">Gio giac</th>
                <th className="px-6 py-4 font-medium text-sm">Ghi chu</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Dang tai du lieu...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Ban chua co lich lam viec nao.
                  </td>
                </tr>
              ) : (
                schedules.map((schedule) => {
                  const isUpcoming = new Date(`${schedule.workDate}T00:00:00`) >= new Date(new Date().setHours(0, 0, 0, 0))
                  return (
                    <tr key={schedule.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`font-semibold text-sm ${isUpcoming ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                          {formatDateLabel(schedule.workDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{schedule.shiftName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock size={14} /> {formatShiftTime(schedule.shiftStartTime, schedule.shiftEndTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {schedule.note ? (
                          <div className="flex items-center gap-1.5 text-orange-500 text-xs font-semibold bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded w-fit">
                            <AlertCircle size={12} /> {schedule.note}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          isUpcoming
                            ? 'bg-primary text-white shadow-primary/30'
                            : 'bg-slate-200/50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400'
                        }`}>
                          {isUpcoming ? 'SAP TOI' : 'HOAN THANH'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
