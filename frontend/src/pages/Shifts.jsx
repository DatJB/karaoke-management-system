import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const mockShifts = [
  { id: 1, date: 'Chủ Nhật, 15/10', shift: 'Ca Tối', time: '18:00 - 02:00', status: 'HOÀN THÀNH', note: 'Trực khu VIP 1' },
  { id: 2, date: 'Hôm qua, 16/10', shift: 'Ca Gãy', time: '14:00 - 22:00', status: 'HOÀN THÀNH', note: 'Bù ca cho Tiến' },
  { id: 3, date: 'Hôm nay, 17/10', shift: 'Ca Tối', time: '18:00 - 02:00', status: 'SẮP TỚI', note: '' },
  { id: 4, date: 'Ngày mai, 18/10', shift: 'Ca Tối', time: '18:00 - 02:00', status: 'SẮP TỚI', note: '' },
  { id: 5, date: 'Thứ 6, 20/10', shift: 'Ca Tăng Cường', time: '18:00 - 04:00', status: 'SẮP TỚI', note: 'Ngày lễ Phụ Nữ VN (x200% Lương)' },
]

export default function Shifts() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Ca làm việc của tôi</h1>
          <p className="text-slate-500 dark:text-slate-400">Xem toàn bộ lịch trực được phân công và lịch sử đã làm.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Tổng ca tuần này</p>
            <h4 className="border-none font-bold text-xl dark:text-white">5 Ca</h4>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center font-bold">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Đã hoàn thành</p>
            <h4 className="border-none font-bold text-xl dark:text-white">2 Ca</h4>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Sắp trực</p>
            <h4 className="border-none font-bold text-xl dark:text-white">3 Ca</h4>
          </div>
        </div>
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4 font-medium text-sm">Ngày</th>
                <th className="px-6 py-4 font-medium text-sm">Ca làm việc</th>
                <th className="px-6 py-4 font-medium text-sm">Giờ giấc</th>
                <th className="px-6 py-4 font-medium text-sm">Ghi chú</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mockShifts.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`font-semibold text-sm ${s.status === 'SẮP TỚI' ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                      {s.date}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{s.shift}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock size={14} /> {s.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {s.note ? (
                      <div className="flex items-center gap-1.5 text-orange-500 text-xs font-semibold bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded w-fit">
                        <AlertCircle size={12} /> {s.note}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      s.status === 'HOÀN THÀNH' 
                      ? 'bg-slate-200/50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400' 
                      : 'bg-primary text-white shadow-primary/30'
                    }`}>
                      {s.status}
                    </span>
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
