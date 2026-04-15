import { useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, Plus, X, Search, Clock, Users, Trash2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { mockEmployees } from '../mock/data'

const SHIFTS = [
  { id: 'morning',   label: 'Ca Sáng',  time: '08:00 – 14:00', color: 'bg-amber-500',   light: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400' },
  { id: 'afternoon', label: 'Ca Chiều',  time: '14:00 – 20:00', color: 'bg-blue-500',    light: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400' },
  { id: 'evening',   label: 'Ca Tối',    time: '20:00 – 02:00', color: 'bg-purple-500',  light: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400' },
]

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

// Generate mock assignments
const generateMockAssignments = () => {
  const assignments = new Set()
  
  // Scatter some assignments: `${day}_${shift}_${empId}`
  const presets = [
    { day: 0, shift: 'evening',   empId: 3 },
    { day: 0, shift: 'evening',   empId: 2 },
    { day: 1, shift: 'evening',   empId: 3 },
    { day: 1, shift: 'afternoon', empId: 2 },
    { day: 2, shift: 'evening',   empId: 3 },
    { day: 2, shift: 'evening',   empId: 4 },
    { day: 3, shift: 'afternoon', empId: 2 },
    { day: 3, shift: 'evening',   empId: 3 },
    { day: 4, shift: 'evening',   empId: 3 },
    { day: 4, shift: 'evening',   empId: 4 },
    { day: 4, shift: 'evening',   empId: 2 },
    { day: 5, shift: 'evening',   empId: 3 },
    { day: 5, shift: 'evening',   empId: 4 },
    { day: 5, shift: 'afternoon', empId: 2 },
    { day: 6, shift: 'morning',   empId: 2 },
    { day: 6, shift: 'evening',   empId: 3 },
  ]

  presets.forEach(p => {
    assignments.add(`${p.day}_${p.shift}_${p.empId}`)
  })

  return assignments
}

const getWeekDates = (weekOffset) => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7)
  return WEEKDAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const formatDate = (d) => `${d.getDate()}/${d.getMonth() + 1}`

export default function StaffAssignment() {
  const [assignments, setAssignments] = useState(generateMockAssignments)
  const [weekOffset, setWeekOffset] = useState(0)
  const [modal, setModal] = useState(null) // { day, shiftId }
  const [selectedEmpId, setSelectedEmpId] = useState(null)
  const [empSearch, setEmpSearch] = useState('')

  const weekDates = getWeekDates(weekOffset)
  const staffList = mockEmployees.filter(e => e.role === 'STAFF' || e.role === 'RECEPTIONIST')

  // Count assignments per employee this week
  const getEmpShiftCount = (empId) => {
    return Array.from(assignments).filter(key => {
      const [day] = key.split('_')
      return key.endsWith(`_${empId}`) && Number(day) >= 0 && Number(day) <= 6
    }).length
  }

  const openAssignModal = (day, shiftId) => {
    setModal({ day, shiftId })
    setSelectedEmpId(null)
    setEmpSearch('')
  }

  const closeModal = () => setModal(null)

  const handleAssign = () => {
    if (!selectedEmpId) return
    const key = `${modal.day}_${modal.shiftId}_${selectedEmpId}`
    setAssignments(prev => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
    closeModal()
  }

  const handleRemove = (day, shiftId, empId) => {
    const key = `${day}_${shiftId}_${empId}`
    setAssignments(prev => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }



  // Get all assignments for a cell
  const getCellAssignments = (day, shiftId) => {
    return Array.from(assignments)
      .filter(key => key.startsWith(`${day}_${shiftId}_`))
      .map(key => {
        const empId = Number(key.split('_')[2])
        const emp = mockEmployees.find(e => e.id === empId)
        return { empId, emp }
      })
  }

  const filteredStaff = staffList.filter(e =>
    e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    e.cccd?.includes(empSearch)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Phân công nhân viên</h1>
          <p className="text-slate-500 dark:text-slate-400">Sắp xếp lịch trực và quản lý ca làm việc của đội ngũ nhân viên.</p>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <CalendarDays size={16} className="text-primary" />
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {formatDate(weekDates[0])} – {formatDate(weekDates[6])}
          </span>
          {weekOffset === 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Tuần này</span>}
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronRight size={18} />
        </button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
            Về tuần này
          </button>
        )}
      </div>

      {/* Staff summary bar */}
      <div className="flex flex-wrap gap-3">
        {staffList.map(emp => {
          const count = getEmpShiftCount(emp.id)
          return (
            <div key={emp.id} className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xs shrink-0">
                {emp.name.split(' ').pop()?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{emp.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  <span className={`uppercase font-bold tracking-wider ${emp.role === 'RECEPTIONIST' ? 'text-blue-500' : 'text-slate-400'}`}>{emp.role}</span>
                   · {count} ca
                </p>
              </div>
              <span className={`ml-1 w-2 h-2 rounded-full shrink-0 ${emp.status === 'AVAILABLE' ? 'bg-green-500' : emp.status === 'BUSY' ? 'bg-orange-500' : 'bg-slate-400'}`} />
            </div>
          )
        })}
      </div>

      {/* Schedule grid */}
      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 text-left min-w-[120px] sticky left-0 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur z-10">
                  <div className="flex items-center gap-2"><Clock size={14} /> Ca làm</div>
                </th>
                {WEEKDAYS.map((day, i) => {
                  const d = weekDates[i]
                  const isToday = d.toDateString() === new Date().toDateString()
                  return (
                    <th key={i} className={`px-2 py-4 text-center min-w-[180px] ${isToday ? 'bg-primary/5' : ''}`}>
                      <div className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{day}</div>
                      <div className={`text-[11px] font-mono mt-0.5 ${isToday ? 'text-primary/70' : 'text-slate-400'}`}>{formatDate(d)}</div>
                      {isToday && <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-1" />}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {SHIFTS.map(shift => (
                <tr key={shift.id} className="border-b border-slate-100 dark:border-slate-800">
                  {/* Shift label */}
                  <td className="px-4 py-5 sticky left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur z-10">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-8 rounded-full ${shift.color}`} />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{shift.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{shift.time}</p>
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {WEEKDAYS.map((_, dayIdx) => {
                    const cellAssigns = getCellAssignments(dayIdx, shift.id)
                    const isToday = weekDates[dayIdx].toDateString() === new Date().toDateString()
                    return (
                      <td key={dayIdx} className={`px-2 py-3 align-top ${isToday ? 'bg-primary/[0.02]' : ''}`}>
                        <div className="space-y-1.5 min-h-[48px]">
                          {cellAssigns.map(({ empId, emp }) => (
                            <div key={empId}
                              className={`group relative px-2.5 py-2.5 rounded-xl border text-xs transition-all hover:shadow-md flex items-center gap-2 ${shift.light}`}>
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-[8px] shrink-0">
                                {emp?.name.split(' ').pop()?.charAt(0)}
                              </div>
                              <span className="font-bold truncate">{emp?.name.split(' ').slice(-2).join(' ')}</span>
                              <button onClick={() => handleRemove(dayIdx, shift.id, empId)}
                                className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-all shrink-0">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ))}

                          {/* Add button */}
                          <button onClick={() => openAssignModal(dayIdx, shift.id)}
                            className="w-full py-1.5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary hover:text-primary dark:hover:border-primary transition-all flex items-center justify-center gap-1 text-[10px] font-bold opacity-60 hover:opacity-100">
                            <Plus size={12} /> Thêm
                          </button>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift legend */}
      <div className="flex flex-wrap gap-4 px-1">
        {SHIFTS.map(s => (
          <div key={s.id} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className={`w-3 h-3 rounded-full ${s.color}`} />
            <span className="font-medium">{s.label}</span>
            <span className="text-xs text-slate-400 font-mono">({s.time})</span>
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {modal && document.getElementById('main-layout') && createPortal(
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0" onClick={closeModal} />
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Phân công nhân viên</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {WEEKDAYS[modal.day]} ({formatDate(weekDates[modal.day])}) · {SHIFTS.find(s => s.id === modal.shiftId)?.label}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Choose employee */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider text-center">Chọn nhân viên trực ca</label>
                <div className="relative mb-5">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Tìm tên hoặc CCCD..." value={empSearch}
                    onChange={e => setEmpSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredStaff.map(emp => {
                    const isSelected = selectedEmpId === emp.id
                    const shiftCount = getEmpShiftCount(emp.id)
                    return (
                      <button key={emp.id} onClick={() => setSelectedEmpId(emp.id)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all border-2 ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-700'
                        }`}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                          {emp.name.split(' ').pop()?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-base font-bold truncate ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{emp.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[11px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-none uppercase">{emp.role}</span>
                            <span className="text-[11px] text-slate-400">· {shiftCount} ca/tuần</span>
                          </div>
                        </div>
                        <span className={`w-3 h-3 rounded-full shrink-0 border-2 border-white dark:border-slate-900 ${emp.status === 'AVAILABLE' ? 'bg-green-500' : emp.status === 'BUSY' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                        {isSelected && <CheckCircle2 size={24} className="text-primary shrink-0 animate-in zoom-in" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
              <button onClick={closeModal}
                className="flex-1 py-3 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors">
                Hủy
              </button>
              <button onClick={handleAssign}
                disabled={!selectedEmpId}
                className="flex-1 py-3 font-bold text-white bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed rounded-2xl transition-colors shadow-lg shadow-primary/30 disabled:shadow-none">
                Lưu phân công
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('main-layout')
      )}
    </div>
  )
}
