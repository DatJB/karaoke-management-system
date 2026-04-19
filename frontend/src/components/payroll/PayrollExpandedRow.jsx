import { Clock, TrendingUp, TrendingDown } from 'lucide-react'

/** Used only by Payroll.jsx */
export default function PayrollExpandedRow({ data }) {
  if (!data) return null;
  
  return (
    <tr className="bg-slate-50/60 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-700">
      <td colSpan={8} className="px-6 py-6">
        <div className="pl-[34px] space-y-5">

          {/* Room services */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Clock size={15} className="text-primary" /> Chi tiết ca phục vụ phòng
            </h4>
            {data.serviceHistories && data.serviceHistories.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm max-w-4xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Ngày</th>
                      <th className="px-4 py-3 font-medium">Phòng</th>
                      <th className="px-4 py-3 font-medium text-center">Thời gian</th>
                      <th className="px-4 py-3 font-medium text-center">Số giờ</th>
                      <th className="px-4 py-3 font-medium text-right">Lương/giờ</th>
                      <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.serviceHistories.map((s, idx) => {
                      const checkinDate = new Date(s.checkinTime);
                      const checkoutDate = new Date(s.checkoutTime);
                      return (
                        <tr key={idx} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{checkinDate.toLocaleDateString('vi-VN')}</td>
                          <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{s.roomName}</td>
                          <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                            {checkinDate.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} – {checkoutDate.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{s.durationHours}h</td>
                          <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                            {s.durationHours > 0 ? (s.earnedAmount / s.durationHours).toLocaleString() : 0}đ
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">{s.earnedAmount.toLocaleString()}đ</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Không có ca phục vụ phòng trong kỳ này.</p>
            )}
          </div>

          {/* Bonus & Penalty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <div className="bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-green-100 dark:bg-green-500/10 border-b border-green-200 dark:border-green-500/20 flex items-center gap-2">
                <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Thưởng</span>
              </div>
              {data.bonuses && data.bonuses.length > 0 ? (
                <div className="divide-y divide-green-100 dark:divide-green-500/10">
                  {data.bonuses.map((b, i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-slate-600 dark:text-slate-300">{b.note || b.type}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">+{b.amount.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-3 text-xs text-slate-400 italic">Không có khoản thưởng.</p>
              )}
            </div>

            <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-red-100 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 flex items-center gap-2">
                <TrendingDown size={14} className="text-red-600 dark:text-red-400" />
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Phạt</span>
              </div>
              {data.otherPenalties && data.otherPenalties.length > 0 ? (
                <div className="divide-y divide-red-100 dark:divide-red-500/10">
                  {data.otherPenalties.map((p, i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-slate-600 dark:text-slate-300">{p.reason || p.type}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">-{p.amount.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-3 text-xs text-slate-400 italic">Không có khoản phạt.</p>
              )}
            </div>
          </div>

        </div>
      </td>
    </tr>
  )
}
