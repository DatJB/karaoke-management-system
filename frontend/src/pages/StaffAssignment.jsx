import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, Plus, X, Search, Clock, Trash2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import api from '../api/axios'

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
const SHIFT_COLORS = [
  { color: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400' },
  { color: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400' },
  { color: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400' },
  { color: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' },
]

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback

const formatDate = (date) => `${date.getDate()}/${date.getMonth() + 1}`

const formatIsoDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getWeekDates = (weekOffset) => {
  const now = new Date()
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  const day = monday.getDay() || 7
  monday.setDate(monday.getDate() - day + 1 + weekOffset * 7)

  return WEEKDAYS.map((_, index) => {
    const current = new Date(monday)
    current.setDate(monday.getDate() + index)
    return current
  })
}

const formatShiftTime = (startTime, endTime) => `${startTime?.slice(0, 5) || '--:--'} - ${endTime?.slice(0, 5) || '--:--'}`

export default function StaffAssignment() {
  const [employees, setEmployees] = useState([])
  const [schedules, setSchedules] = useState([])
  const [shifts, setShifts] = useState([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [modal, setModal] = useState(null)
  const [selectedEmpId, setSelectedEmpId] = useState(null)
  const [empSearch, setEmpSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const weekDates = getWeekDates(weekOffset)
  const fromDate = formatIsoDate(weekDates[0])
  const toDate = formatIsoDate(weekDates[6])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const [employeeResponse, shiftResponse, scheduleResponse] = await Promise.all([
        api.get('/employees', { params: { page: 0, size: 100 } }),
        api.get('/shifts'),
        api.get('/schedules', { params: { fromDate, toDate } }),
      ])

      setEmployees(employeeResponse.data.content || [])
      setShifts((shiftResponse.data || []).map((shift, index) => ({
        ...shift,
        ...SHIFT_COLORS[index % SHIFT_COLORS.length],
      })))
      setSchedules(scheduleResponse.data || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải dữ liệu phân công.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fromDate, toDate])

  const staffList = employees.filter((employee) => employee.role === 'STAFF' || employee.role === 'RECEPTIONIST')

  const getEmpShiftCount = (employeeId) =>
    schedules.filter((schedule) => schedule.employeeId === employeeId).length

  const openAssignModal = (day, shiftId) => {
    setModal({ day, shiftId })
    setSelectedEmpId(null)
    setEmpSearch('')
  }

  const closeModal = () => setModal(null)

  const handleAssign = async () => {
    if (!selectedEmpId || !modal) {
      return
    }

    try {
      setSubmitting(true)
      const response = await api.post('/schedules', {
        employeeId: selectedEmpId,
        shiftId: modal.shiftId,
        workDate: formatIsoDate(weekDates[modal.day]),
        note: '',
      })
      setSchedules((prev) => [...prev, response.data])
      closeModal()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Phân công nhân viên thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (schedule) => {
    if (!window.confirm(`Xóa phân công của "${schedule.employeeName}"?`)) {
      return
    }

    try {
      setSubmitting(true)
      await api.delete('/schedules', {
        data: {
          employeeId: schedule.employeeId,
          shiftId: schedule.shiftId,
          workDate: schedule.workDate,
        },
      })
      setSchedules((prev) => prev.filter((item) => item.id !== schedule.id))
    } catch (err) {
      window.alert(getErrorMessage(err, 'Xóa phân công thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const getCellAssignments = (dateIso, shiftId) =>
    schedules.filter((schedule) => schedule.workDate === dateIso && schedule.shiftId === shiftId)

  const filteredStaff = staffList.filter((employee) =>
    employee.name?.toLowerCase().includes(empSearch.toLowerCase()) ||
    employee.code?.toLowerCase().includes(empSearch.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Phân công nhân viên</h1>
          <p className="text-slate-500 dark:text-slate-400">Sắp xếp lịch trực và quản lý ca làm việc của đội ngũ nhân viên.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => setWeekOffset((value) => value - 1)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <CalendarDays size={16} className="text-primary" />
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>
          {weekOffset === 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Tuần hiện tại</span>}
        </div>
        <button onClick={() => setWeekOffset((value) => value + 1)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronRight size={18} />
        </button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)} className="px-3 py-2 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
            Về tuần hiện tại
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {staffList.map((employee) => {
          const count = getEmpShiftCount(employee.id)
          return (
            <div key={employee.id} className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xs shrink-0">
                {employee.name?.split(' ').pop()?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{employee.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  <span className={`uppercase font-bold tracking-wider ${employee.role === 'RECEPTIONIST' ? 'text-blue-500' : 'text-slate-400'}`}>{employee.role}</span>
                  {' '}· {count} ca
                </p>
              </div>
              <span className={`ml-1 w-2 h-2 rounded-full shrink-0 ${employee.status === 'AVAILABLE' ? 'bg-green-500' : employee.status === 'BUSY' ? 'bg-orange-500' : 'bg-slate-400'}`} />
            </div>
          )
        })}
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 text-left min-w-[120px] sticky left-0 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur z-10">
                  <div className="flex items-center gap-2"><Clock size={14} />Ca làm</div>
                </th>
                {WEEKDAYS.map((day, index) => {
                  const date = weekDates[index]
                  const isToday = date.toDateString() === new Date().toDateString()
                  return (
                    <th key={day} className={`px-2 py-4 text-center min-w-[180px] ${isToday ? 'bg-primary/5' : ''}`}>
                      <div className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{day}</div>
                      <div className={`text-[11px] font-mono mt-0.5 ${isToday ? 'text-primary/70' : 'text-slate-400'}`}>{formatDate(date)}</div>
                      {isToday && <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-1" />}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={WEEKDAYS.length + 1} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={WEEKDAYS.length + 1} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Chưa có ca làm nào.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-5 sticky left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur z-10">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-8 rounded-full ${shift.color}`} />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{shift.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{formatShiftTime(shift.startTime, shift.endTime)}</p>
                        </div>
                      </div>
                    </td>

                    {weekDates.map((date, dayIndex) => {
                      const dateIso = formatIsoDate(date)
                      const cellAssignments = getCellAssignments(dateIso, shift.id)
                      const isToday = date.toDateString() === new Date().toDateString()

                      return (
                        <td key={`${shift.id}-${dateIso}`} className={`px-2 py-3 align-top ${isToday ? 'bg-primary/[0.02]' : ''}`}>
                          <div className="space-y-1.5 min-h-[48px]">
                            {cellAssignments.map((schedule) => (
                              <div key={schedule.id} className={`group relative px-2.5 py-2.5 rounded-xl border text-xs transition-all hover:shadow-md flex items-center gap-2 ${shift.light}`}>
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-[8px] shrink-0">
                                  {schedule.employeeName?.split(' ').pop()?.charAt(0)}
                                </div>
                                <span className="font-bold truncate">{schedule.employeeName?.split(' ').slice(-2).join(' ')}</span>
                                <button
                                  onClick={() => handleRemove(schedule)}
                                  disabled={submitting}
                                  className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-all shrink-0 disabled:opacity-50"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            ))}

                            <button
                              onClick={() => openAssignModal(dayIndex, shift.id)}
                              disabled={submitting}
                              className="w-full py-1.5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary hover:text-primary dark:hover:border-primary transition-all flex items-center justify-center gap-1 text-[10px] font-bold opacity-60 hover:opacity-100 disabled:opacity-40"
                            >
                              <Plus size={12} /> Thêm
                            </button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 px-1">
        {shifts.map((shift) => (
          <div key={shift.id} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className={`w-3 h-3 rounded-full ${shift.color}`} />
            <span className="font-medium">{shift.name}</span>
            <span className="text-xs text-slate-400 font-mono">({formatShiftTime(shift.startTime, shift.endTime)})</span>
          </div>
        ))}
      </div>

      {modal && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0" onClick={closeModal} />
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Phân công nhân viên</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {WEEKDAYS[modal.day]} ({formatDate(weekDates[modal.day])}) · {shifts.find((shift) => shift.id === modal.shiftId)?.name}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider text-center">Chọn nhân viên trực ca</label>
                <div className="relative mb-5">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm mã hoặc tên nhân viên..."
                    value={empSearch}
                    onChange={(event) => setEmpSearch(event.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredStaff.map((employee) => {
                    const isSelected = selectedEmpId === employee.id
                    const shiftCount = getEmpShiftCount(employee.id)
                    return (
                      <button
                        key={employee.id}
                        onClick={() => setSelectedEmpId(employee.id)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all border-2 ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                          {employee.name?.split(' ').pop()?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-base font-bold truncate ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{employee.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[11px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-none uppercase">{employee.role}</span>
                            <span className="text-[11px] text-slate-400">· {shiftCount} ca trong tuần</span>
                          </div>
                        </div>
                        <span className={`w-3 h-3 rounded-full shrink-0 border-2 border-white dark:border-slate-900 ${employee.status === 'AVAILABLE' ? 'bg-green-500' : employee.status === 'BUSY' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                        {isSelected && <CheckCircle2 size={24} className="text-primary shrink-0 animate-in zoom-in" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
              <button onClick={closeModal} className="flex-1 py-3 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors">
                Hủy
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedEmpId || submitting}
                className="flex-1 py-3 font-bold text-white bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed rounded-2xl transition-colors shadow-lg shadow-primary/30 disabled:shadow-none"
              >
                Lưu phân công
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('main-layout'),
      )}
    </div>
  )
}
