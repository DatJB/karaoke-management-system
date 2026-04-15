import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Search, UserCircle, Edit2, Trash2, History, X, Calendar } from 'lucide-react'
import { mockBookings } from '../mock/data'

const mockCustomers = [
  { id: 1, name: 'Nguyễn Văn A', phone: '0901 111 222', identity: '001090123456', email: 'nva@email.com', address: 'Quận 1, TP.HCM', created_at: '2023-10-25 14:00:00' },
  { id: 2, name: 'Trần Thị B', phone: '0903 333 444', identity: '002090654321', email: 'ttb@email.com', address: 'Quận 3, TP.HCM', created_at: '2023-10-27 18:30:00' },
  { id: 3, name: 'Lê Văn C', phone: '0905 555 666', identity: '003099999888', email: 'lvc@email.com', address: 'Quận Tân Bình, TP.HCM', created_at: '2023-10-20 20:15:00' },
]

export default function Customers() {
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState(null)

  const historyBookings = selectedHistoryCustomer ? mockBookings.filter(b => b.customer_name === selectedHistoryCustomer.name) : []

  const renderHistoryModal = () => {
    if (!selectedHistoryCustomer) return null;
    
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedHistoryCustomer(null)}
        ></div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10 flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Lịch sử Đặt phòng
            </h3>
            <button 
              onClick={() => setSelectedHistoryCustomer(null)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <div className="mb-4 text-sm text-slate-500">
               Khách hàng: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedHistoryCustomer.name}</span>
            </div>
            {historyBookings.length === 0 ? (
               <div className="text-center py-10 text-slate-500">Khách hàng này chưa có lịch sử đặt phòng nào.</div>
            ) : (
               <div className="space-y-4">
                  {historyBookings.map(booking => (
                     <div key={booking.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Calendar size={18} />
                          </div>
                          <div>
                             <div className="font-bold text-slate-900 dark:text-white">{booking.room_name}</div>
                             <div className="text-sm text-slate-500">
                               {new Date(booking.checkin_time || booking.booking_time).toLocaleString('vi-VN')}
                               {booking.checkout_time && ` - ${new Date(booking.checkout_time).toLocaleString('vi-VN')}`}
                             </div>
                          </div>
                       </div>
                       <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                          booking.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-500' : 
                          booking.status === 'CHECKED_OUT' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-500'
                       }`}>
                          {booking.status === 'CHECKED_IN' ? 'Đã Nhận phòng' : booking.status === 'CHECKED_OUT' ? 'Đã Trả phòng' : booking.status === 'BOOKED' ? 'Đặt trước' : booking.status}
                       </span>
                     </div>
                  ))}
               </div>
            )}
          </div>
        </div>
      </div>,
      document.getElementById('main-layout') || document.body
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Khách hàng</h1>
          <p className="text-slate-500 dark:text-slate-400">Quản lý danh sách khách hàng dựa trên dữ liệu hệ thống.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo SĐT/Tên..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary dark:text-white shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/20 shrink-0">
            <Plus size={18} /> <span className="hidden sm:inline">Thêm khách hàng</span>
          </button>
        </div>
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4 font-medium text-sm">Khách hàng</th>
                <th className="px-6 py-4 font-medium text-sm">Số điện thoại</th>
                <th className="px-6 py-4 font-medium text-sm">CCCD / CMND</th>
                <th className="px-6 py-4 font-medium text-sm">Địa chỉ</th>
                <th className="px-6 py-4 font-medium text-sm">Ngày tạo</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Thao tác</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Lịch sử</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((cus) => (
                <tr key={cus.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full text-primary"><UserCircle size={20}/></div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{cus.name}</div>
                        <div className="text-xs text-slate-500">{cus.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{cus.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{cus.identity}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{cus.address}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-500">
                    {cus.created_at}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end items-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-all shrink-0" title="Sửa"><Edit2 size={16} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all shrink-0" title="Xóa"><Trash2 size={16} /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedHistoryCustomer(cus); }}
                      className="inline-flex w-fit ml-auto shrink-0 items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      <History size={14} /> Xem Booking
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {renderHistoryModal()}
    </div>
  )
}
