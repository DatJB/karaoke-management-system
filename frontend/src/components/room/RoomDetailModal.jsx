import { createPortal } from 'react-dom'
import { X, ArrowLeft, Search, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { mockCustomers, mockEmployees, mockProducts, mockBookings } from '../../mock/data'
import { ROOM_STATUS_COLOR, ROOM_STATUS_LABEL } from './RoomCard'

const getRoomPrice = (category) => (category === 'VIP' ? 200000 : 100000)
const isAssignedRoom = (name) => name === 'Phòng 102' || name === 'Phòng 202'

/** Used only by RoomMap.jsx */
export default function RoomDetailModal({
  selectedRoom,
  bookingAction, setBookingAction,
  bookingStep, setBookingStep,
  selectedCustomerId, setSelectedCustomerId,
  orderAction, setOrderAction,
  onClose,
  user,
}) {
  if (!selectedRoom || !document.getElementById('main-layout')) return null

  const booking = (selectedRoom.status === 'OCCUPIED' || selectedRoom.status === 'RESERVED')
    ? mockBookings.find(b => b.room_name === selectedRoom.name)
    : null

  const handleFullClose = () => {
    onClose(); setBookingAction(null); setOrderAction(null); setBookingStep(1); setSelectedCustomerId(null)
  }

  return createPortal(
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm shadow-2xl" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0" onClick={handleFullClose} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10 flex flex-col max-h-[90vh]">

        {/* ── Step 1: Select customer ── */}
        {bookingAction && bookingStep === 1 ? (
          <>
            <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <button onClick={() => setBookingAction(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex-1">
                {bookingAction === 'CHECKIN' ? 'Chọn khách nhận phòng' : bookingAction === 'COMBO' ? 'Chọn khách đặt combo' : 'Chọn khách đặt trước'}
              </h3>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {bookingAction === 'CHECKIN' || bookingAction === 'COMBO' ? 'Thời gian nhận phòng' : 'Thời gian nhận (dự kiến)'}
                  </label>
                  <input type="datetime-local" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Thời gian trả phòng (nếu có)</label>
                  <input type="datetime-local" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Tìm tên hoặc SĐT khách hàng..." className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {mockCustomers.map(customer => (
                <div key={customer.id}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all group border-2 ${selectedCustomerId === customer.id ? 'bg-primary/5 border-primary' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  onClick={() => setSelectedCustomerId(customer.id)}>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white mb-0.5">{customer.name}</div>
                    <div className="text-sm text-slate-500">{customer.phone}</div>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-all ${selectedCustomerId === customer.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}>
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              ))}
              <button className="w-full mt-4 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors flex items-center justify-center gap-2">
                + Thêm khách hàng mới
              </button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button onClick={() => setBookingStep(2)} disabled={!selectedCustomerId}
                className="w-full px-6 py-3 font-bold text-white bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-primary/30 disabled:shadow-none">
                Tiếp theo
              </button>
            </div>
          </>

          /* ── Step 2: Select staff ── */
        ) : bookingAction && bookingStep === 2 ? (
          <>
            <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <button onClick={() => setBookingStep(1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex-1">Chọn nhân viên phục vụ</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                Phân công nhân viên phụ trách cho <strong>{selectedRoom.name}</strong> (Có thể chọn nhiều)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {mockEmployees.filter(emp => emp.role === 'STAFF').map(emp => (
                  <label key={emp.id} className="cursor-pointer flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 transition-colors text-sm text-slate-700 dark:text-slate-300 shadow-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{emp.name}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded font-mono">ID:{emp.id}</span>
                      </div>
                      <span className={`text-[10px] w-fit px-2 py-0.5 rounded-full font-bold tracking-wide uppercase ${emp.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : emp.status === 'BUSY' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'}`}>
                        {emp.status === 'AVAILABLE' ? 'SẴN SÀNG' : emp.status === 'BUSY' ? 'ĐANG BẬN' : 'NGHỈ PHÉP'}
                      </span>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-primary bg-slate-50 border-slate-300 rounded focus:ring-primary dark:bg-slate-900 dark:border-slate-600 cursor-pointer" value={emp.id} />
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button onClick={() => {
                const customer = mockCustomers.find(c => c.id === selectedCustomerId)
                const actionText = bookingAction === 'CHECKIN' ? 'nhận phòng' : bookingAction === 'COMBO' ? 'đặt combo' : 'đặt trước'
                alert(`Đã hoàn tất ${actionText} tại ${selectedRoom.name} cho khách hàng: ${customer?.name}`)
                setBookingAction(null); onClose(); setSelectedCustomerId(null); setBookingStep(1)
              }} className="w-full px-6 py-3 font-bold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors shadow-lg shadow-green-500/30">
                Xác nhận {bookingAction === 'CHECKIN' ? 'nhận phòng' : bookingAction === 'COMBO' ? 'đặt combo' : 'đặt trước'}
              </button>
            </div>
          </>

          /* ── View order ── */
        ) : orderAction === 'VIEW' ? (
          <>
            <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <button onClick={() => setOrderAction(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex-1">Order của {selectedRoom.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {[
                { qty: 'x12', name: 'Bia Heineken', price: '35,000đ/lon', total: '420,000đ', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                { qty: 'x1', name: 'Đĩa trái cây lớn', price: '150,000đ/đĩa', total: '150,000đ', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
                { qty: 'x5', name: 'Khăn lạnh', price: '5,000đ/cái', total: '25,000đ', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
              ].map(item => (
                <div key={item.name} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center shadow-sm ${item.color}`}>{item.qty}</div>
                    <div><div className="font-bold text-slate-900 dark:text-white">{item.name}</div><div className="text-sm text-slate-500">{item.price}</div></div>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">{item.total}</div>
                </div>
              ))}
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-medium">Tổng tiền order:</span>
                <span className="text-2xl font-bold text-primary">595,000đ</span>
              </div>
              <button onClick={() => setOrderAction('ADD')} className="w-full px-6 py-3 font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors shadow-lg shadow-blue-500/30">+ Gọi thêm món</button>
            </div>
          </>

          /* ── Add order ── */
        ) : orderAction === 'ADD' ? (
          <>
            <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <button onClick={() => setOrderAction(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex-1">Thêm đồ gọi (Order)</h3>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Tìm kiếm thức ăn, đồ uống..." className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {mockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white mb-1">{product.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{product.price.toLocaleString()}đ</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                        {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold">-</button>
                    <span className="font-bold text-slate-900 dark:text-white w-4 text-center">0</span>
                    <button className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button onClick={() => { alert('Đã thêm vào order của phòng thành công!'); setOrderAction(null) }}
                className="w-full px-6 py-3 font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-lg shadow-primary/30">
                Xác nhận thêm
              </button>
            </div>
          </>

          /* ── Room detail (default) ── */
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 relative z-20 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chi tiết phòng</h3>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{selectedRoom.name}</span>
                  {user.role === 'ADMIN' && (
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button onClick={() => alert('Chức năng sửa thông tin phòng')} className="p-1.5 text-blue-500 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm" title="Sửa thông tin"><Pencil size={14} /></button>
                      <button onClick={() => alert('Chức năng xóa phòng')} className="p-1.5 text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm" title="Xóa phòng"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold shadow-sm ${ROOM_STATUS_COLOR[selectedRoom.status] ?? ''}`}>
                  {ROOM_STATUS_LABEL[selectedRoom.status] ?? selectedRoom.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <div><div className="text-xs text-slate-500 mb-1">Loại phòng</div><div className="font-semibold text-slate-700 dark:text-slate-300">{selectedRoom.category}</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Sức chứa</div><div className="font-semibold text-slate-700 dark:text-slate-300">{selectedRoom.size} người</div></div>
                <div><div className="text-xs text-slate-500 mb-1">Giá/giờ</div><div className="font-semibold text-slate-700 dark:text-slate-300">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getRoomPrice(selectedRoom.category))}</div></div>
              </div>
              {booking && (
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Thông tin {selectedRoom.status === 'RESERVED' ? 'đặt phòng' : 'khách hàng'}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-slate-500">Khách hàng:</span><span className="font-medium text-slate-700 dark:text-slate-200">{booking.customer_name}</span></div>
                    {booking.assigned_staff && booking.assigned_staff.length > 0 && (
                      <div className="flex justify-between"><span className="text-slate-500">Nhân viên phục vụ:</span><span className="font-medium text-primary font-bold">{booking.assigned_staff.join(', ')}</span></div>
                    )}
                    {booking.checkin_time && selectedRoom.status === 'OCCUPIED' && (
                      <div className="flex justify-between"><span className="text-slate-500">Bắt đầu hát lúc:</span><span className="font-medium text-slate-700 dark:text-slate-200">{new Date(booking.checkin_time).toLocaleString('vi-VN')}</span></div>
                    )}
                    {booking.booking_time && selectedRoom.status === 'RESERVED' && (
                      <div className="flex justify-between"><span className="text-slate-500">Dự kiến nhận phòng:</span><span className="font-medium text-orange-600 dark:text-orange-400">{new Date(booking.booking_time).toLocaleString('vi-VN')}</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end items-center shrink-0">
              <button onClick={onClose} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Trở lại</button>
              {selectedRoom.status === 'AVAILABLE' && user.role !== 'STAFF' && (
                <>
                  <button onClick={() => { setBookingAction('RESERVE'); setBookingStep(1); setSelectedCustomerId(null) }} className="px-6 py-2 font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">Đặt trước</button>
                  <button onClick={() => { setBookingAction('CHECKIN'); setBookingStep(1); setSelectedCustomerId(null) }} className="px-6 py-2 flex-1 font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-lg shadow-green-500/30">Nhận phòng</button>
                </>
              )}
              {selectedRoom.status === 'OCCUPIED' && (
                user.role === 'STAFF' ? (
                  isAssignedRoom(selectedRoom.name) && (
                    <>
                      <button onClick={() => setOrderAction('VIEW')} className="px-6 py-2 font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">Xem order</button>
                      <button onClick={() => setOrderAction('ADD')} className="px-6 py-2 flex-1 font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-lg shadow-blue-500/30">Thêm order</button>
                    </>
                  )
                ) : (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button onClick={() => setOrderAction('VIEW')} className="flex-1 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">Xem order</button>
                      <button onClick={() => setOrderAction('ADD')} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-lg shadow-blue-500/30">Thêm order</button>
                    </div>
                    <button className="w-full px-6 py-2.5 font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-lg shadow-primary/30">Thanh toán / Trả phòng</button>
                  </div>
                )
              )}
              {selectedRoom.status === 'RESERVED' && user.role !== 'STAFF' && (
                <button className="px-6 py-2 flex-1 font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-lg shadow-orange-500/30">Khách nhận phòng</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.getElementById('main-layout')
  )
}
