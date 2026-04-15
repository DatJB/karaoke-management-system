import { mockEmployees } from '../mock/data'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function Employees() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Quản lý Nhân sự</h1>
          <p className="text-slate-500 dark:text-slate-400">Danh sách nhân viên và tình trạng làm việc.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/20">
          <Plus size={18} />
          Thêm nhân viên
        </button>
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4 font-medium text-sm">Nhân viên</th>
                <th className="px-6 py-4 font-medium text-sm">Vai trò</th>
                <th className="px-6 py-4 font-medium text-sm">Số điện thoại</th>
                <th className="px-6 py-4 font-medium text-sm">Lương cơ bản (Tháng)</th>
                <th className="px-6 py-4 font-medium text-sm">Lương/giờ</th>
                <th className="px-6 py-4 font-medium text-sm">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mockEmployees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{emp.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {emp.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-md text-xs font-semibold dark:text-slate-300 tracking-wide">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{emp.phone}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-primary">{(emp.base_salary || 0).toLocaleString()}đ</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{emp.salary_per_hour.toLocaleString()}đ</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      emp.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                      emp.status === 'BUSY' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
                    }`}>
                      {emp.status === 'AVAILABLE' ? 'SẴN SÀNG' :
                       emp.status === 'BUSY' ? 'ĐANG BẬN' :
                       'NGHỈ PHÉP'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
