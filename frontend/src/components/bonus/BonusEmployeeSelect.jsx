import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Loader2 } from 'lucide-react'
import employeeApi from '../../api/employeeApi'

const roleLabel = { ADMIN: 'Admin', MANAGER: 'Manager', STAFF: 'NV Phục vụ', RECEPTIONIST: 'Lễ tân' }

/** Used only by BonusPenaltyManagement.jsx — fetches employees from real API */
export default function BonusEmployeeSelect({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setLoading(true)
    employeeApi.getAll()
      .then(res => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false))
  }, [])

  const selectedEmp = employees.find(e => e.id === value)
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (emp) => { onChange(emp); setQuery(''); setOpen(false) }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => { setOpen(o => !o); setQuery('') }}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
        {selectedEmp ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xs shrink-0">
              {selectedEmp.name.split(' ').pop()?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">{selectedEmp.name}</p>
              <p className="text-[10px] text-slate-400">{roleLabel[selectedEmp.role] || selectedEmp.role}</p>
            </div>
          </div>
        ) : <span className="text-slate-400">-- Chọn nhân viên --</span>}
        {loading
          ? <Loader2 size={15} className="text-slate-400 shrink-0 animate-spin" />
          : <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input autoFocus type="text" placeholder="Tìm theo tên..." value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm rounded-lg focus:outline-none" />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {loading ? (
              <li className="px-4 py-3 text-sm text-slate-400 text-center flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Đang tải...
              </li>
            ) : filtered.length > 0 ? filtered.map(emp => (
              <li key={emp.id}>
                <button type="button" onClick={() => handleSelect(emp)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${value === emp.id ? 'bg-primary/5' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {emp.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${value === emp.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{emp.name}</p>
                    <p className="text-[11px] text-slate-400">{roleLabel[emp.role] || emp.role}</p>
                  </div>
                </button>
              </li>
            )) : <li className="px-4 py-3 text-sm text-slate-400 text-center">Không tìm thấy nhân viên</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
