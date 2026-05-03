import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { X, Calendar, Loader2, ArrowLeft, Clock, MapPin, ClipboardList, Trash2 as TrashIcon, Edit2, PlusCircle, Check, Save, LogIn, LogOut } from 'lucide-react'
import { getCustomerBookings } from '../../api/customerApi'
import { getBookingDetail, removeRoomFromBooking, deleteBooking, updateBookingInfo, addRoomToBooking, checkInAllRooms, checkoutAllRooms, checkInSingleRoom, checkoutSingleRoom } from '../../api/bookingApi'
import { getAllRooms, getRoomEmployee } from '../../api/roomApi'

export default function BookingHistoryModal({ isOpen, onClose, customer }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  
  // Edit Booking Info states
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [editFormData, setEditFormData] = useState({ note: '', reservationTime: '', expectedCheckoutTime: '' })

  // Add Room states
  const [isAddingRoom, setIsAddingRoom] = useState(false)
  const [availableRooms, setAvailableRooms] = useState([])
  const [loadingAvailableRooms, setLoadingAvailableRooms] = useState(false)

  useEffect(() => {
    if (isOpen && customer) {
      fetchBookings()
    } else {
      setBookings([])
      setPage(1)
    }
  }, [isOpen, customer, page, selectedDate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await getCustomerBookings(customer.id, { 
        page, 
        size: 5,
        date: selectedDate || undefined
      })
      setBookings(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (id) => {
    try {
      setLoadingDetail(true)
      const data = await getBookingDetail(id)
      
      if (data.roomDetails) {
        const roomsWithEmployees = await Promise.all(
          data.roomDetails.map(async (room) => {
             try {
                const employees = await getRoomEmployee(room.bookingRoomId);
                return { ...room, employees };
             } catch (e) {
                return { ...room, employees: [] };
             }
          })
        );
        data.roomDetails = roomsWithEmployees;
      }
      
      setSelectedBookingDetail(data)
    } catch (err) {
      console.error('Failed to fetch booking detail:', err)
      alert('Không công lấy được chi tiết đơn đặt phòng.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleActionAll = async (id, action, e) => {
    e.stopPropagation()
    const confirmMsg = action === 'check-in' ? 'Bạn có muốn nhận toàn bộ phòng trong đơn này?' : 'Bạn có muốn trả toàn bộ phòng trong đơn này?'
    if (!window.confirm(confirmMsg)) return
    try {
      setLoading(true)
      if (action === 'check-in') await checkInAllRooms(id)
      else await checkoutAllRooms(id)
      fetchBookings()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleActionSingle = async (roomId, action) => {
    const confirmMsg = action === 'check-in' ? 'Bạn có muốn nhận phòng này?' : 'Bạn có muốn trả phòng này?'
    if (!window.confirm(confirmMsg)) return
    try {
      setLoadingDetail(true)
      if (action === 'check-in') await checkInSingleRoom(selectedBookingDetail.id, roomId)
      else await checkoutSingleRoom(selectedBookingDetail.id, roomId)
      const updated = await getBookingDetail(selectedBookingDetail.id)
      setSelectedBookingDetail(updated)
      fetchBookings()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDeleteBooking = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ đơn đặt phòng này?')) return
    try {
      setLoading(true)
      await deleteBooking(id)
      fetchBookings()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEditBooking = (booking, e) => {
    e.stopPropagation()
    setSelectedBookingDetail(booking)
    setEditFormData({
      note: booking.note || '',
      reservationTime: booking.reservationTime || '',
      expectedCheckoutTime: booking.expectedCheckoutTime || ''
    })
    setIsEditingInfo(true)
  }

  const handleSaveBookingInfo = async () => {
    try {
      setLoadingDetail(true)
      await updateBookingInfo(selectedBookingDetail.id, editFormData)
      const updated = await getBookingDetail(selectedBookingDetail.id)
      setSelectedBookingDetail(updated)
      setIsEditingInfo(false)
      fetchBookings()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleOpenAddRoom = async () => {
    try {
      setIsAddingRoom(true)
      setLoadingAvailableRooms(true)
      const response = await getAllRooms({ size: 100 })
      setAvailableRooms(response.data || [])
    } catch (err) {
      console.error('Failed to fetch available rooms:', err)
    } finally {
      setLoadingAvailableRooms(false)
    }
  }

  const handleConfirmAddRoom = async (roomId) => {
    try {
      setLoadingDetail(true)
      await addRoomToBooking(selectedBookingDetail.id, roomId)
      const updated = await getBookingDetail(selectedBookingDetail.id)
      setSelectedBookingDetail(updated)
      setIsAddingRoom(false)
      fetchBookings()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleRemoveRoom = async (roomId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này khỏi booking?')) return
    try {
      setLoadingDetail(true)
      await removeRoomFromBooking(selectedBookingDetail.id, roomId)
      const updated = await getBookingDetail(selectedBookingDetail.id)
      setSelectedBookingDetail(updated)
      fetchBookings()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoadingDetail(false)
    }
  }

  if (!isOpen || !document.getElementById('main-layout')) return null

  return createPortal(
    <div className="absolute inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Lịch sử Đặt phòng
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Khách hàng</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{customer.name}</p>
            </div>
            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lọc theo ngày</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={e => { setSelectedDate(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-slate-500 font-medium">Đang tải lịch sử...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
              <Calendar className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
              <p className="text-slate-500 font-medium">Khách hàng này chưa có lịch sử đặt phòng nào.</p>
            </div>
          ) : selectedBookingDetail ? (
            /* ── Booking Detail View ── */
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <button 
                 onClick={() => { setSelectedBookingDetail(null); setIsEditingInfo(false); setIsAddingRoom(false); }}
                 className="flex items-center gap-2 text-primary font-bold hover:underline mb-4"
               >
                 <ArrowLeft size={18} /> Quay lại danh sách
               </button>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái đơn</p>
                     <span className={`text-[11px] uppercase font-bold tracking-widest px-3 py-1 rounded-lg shadow-sm ${
                        ['CHECKOUT', 'CHECK_OUT', 'CHECKED_OUT'].includes(selectedBookingDetail.status?.toUpperCase()) ? 'bg-slate-500 text-white' : 
                        ['CANCEL', 'CANCELLED'].includes(selectedBookingDetail.status?.toUpperCase()) ? 'bg-red-500 text-white' :
                        ['CHECKIN', 'CHECK_IN', 'CHECKED_IN'].includes(selectedBookingDetail.status?.toUpperCase()) ? 'bg-green-500 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {['BOOKED'].includes(selectedBookingDetail.status?.toUpperCase()) ? 'Đặt trước' : 
                         ['CHECKIN', 'CHECK_IN', 'CHECKED_IN'].includes(selectedBookingDetail.status?.toUpperCase()) ? 'Nhận phòng' : 
                         ['CHECKOUT', 'CHECK_OUT', 'CHECKED_OUT'].includes(selectedBookingDetail.status?.toUpperCase()) ? 'Trả phòng' : 
                         ['CANCEL', 'CANCELLED'].includes(selectedBookingDetail.status?.toUpperCase()) ? 'Đã hủy' : selectedBookingDetail.status}
                      </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mã booking</p>
                     <p className="font-bold text-slate-900 dark:text-white text-base">#BK-{selectedBookingDetail.id}</p>
                  </div>
               </div>

               <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-display">Thời gian đặt phòng</p>
                  {isEditingInfo ? (
                    <input 
                      type="datetime-local" 
                      value={editFormData.reservationTime?.substring(0, 16)}
                      onChange={e => setEditFormData({...editFormData, reservationTime: e.target.value})}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    />
                  ) : (
                    <p className="font-bold text-primary text-base">
                      {selectedBookingDetail.reservationTime ? new Date(selectedBookingDetail.reservationTime).toLocaleString('vi-VN') : '—'}
                    </p>
                  )}
               </div>

               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ClipboardList size={14} /> Danh sách phòng ({selectedBookingDetail.roomDetails?.length || 0})
                    </p>
                    <button 
                      onClick={handleOpenAddRoom}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-all"
                    >
                      <PlusCircle size={14} /> Thêm phòng
                    </button>
                  </div>

                  {isAddingRoom && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                       <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-primary uppercase">Chọn phòng để thêm</p>
                          <button onClick={() => setIsAddingRoom(false)}><X size={14} className="text-slate-400" /></button>
                       </div>
                       {loadingAvailableRooms ? (
                          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" size={20} /></div>
                       ) : availableRooms.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-2">Không có phòng nào phù hợp.</p>
                       ) : (
                          <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
                             {availableRooms.map(r => (
                                <button 
                                  key={r.id}
                                  onClick={() => handleConfirmAddRoom(r.id)}
                                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all text-left flex items-center justify-between"
                                >
                                  {r.name}
                                  <ArrowLeft size={12} className="rotate-180" />
                                </button>
                             ))}
                          </div>
                       )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedBookingDetail.roomDetails?.map(room => (
                      <div key={room.bookingRoomId} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                               {room.roomName?.split(' ').pop()}
                            </div>
                            <div>
                               <div className="font-bold text-slate-900 dark:text-white">{room.roomName}</div>
                               <div className="text-[10px] text-slate-500 uppercase font-medium">{room.roomType}</div>
                               {room.employees && room.employees.length > 0 && (
                                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex flex-col gap-1">
                                     <span className="font-semibold text-primary">Nhân viên phục vụ:</span>
                                     <div className="flex flex-col gap-0.5 pl-2">
                                       {room.employees.map((e, idx) => (
                                          <div key={idx} className="flex items-center gap-2">
                                            <span>• {e.employeeName}</span>
                                            {e.startTime && (
                                              <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {e.endTime ? new Date(e.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hiện tại'}
                                              </span>
                                            )}
                                          </div>
                                       ))}
                                     </div>
                                  </div>
                               )}
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                               <div className="text-right text-xs">
                                 {room.checkInTime && <div className="text-slate-600 dark:text-slate-400">Vào: {new Date(room.checkInTime).toLocaleString('vi-VN')}</div>}
                                 {room.checkOutTime && <div className="text-slate-500">Ra: {new Date(room.checkOutTime).toLocaleString('vi-VN')}</div>}
                               </div>
                               <div className="flex items-center gap-1 border-l border-slate-100 dark:border-slate-700 pl-2 ml-1">
                                  {['BOOKED'].includes(room.status?.toUpperCase()) && (
                                    <button 
                                      onClick={() => handleActionSingle(room.roomId, 'check-in')}
                                      className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                      title="Nhận phòng"
                                    >
                                      <LogIn size={16} />
                                    </button>
                                  )}
                                  {['CHECKIN', 'CHECK_IN', 'CHECKED_IN'].includes(room.status?.toUpperCase()) && (
                                    <button 
                                      onClick={() => handleActionSingle(room.roomId, 'checkout')}
                                      className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                      title="Trả phòng"
                                    >
                                      <LogOut size={16} />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleRemoveRoom(room.roomId)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Xóa phòng khỏi booking"
                                  >
                                    <TrashIcon size={16} />
                                  </button>
                               </div>
                            </div>
                      </div>
                    ))}
                  </div>
               </div>

               {selectedBookingDetail.note || isEditingInfo ? (
                  <div className={`p-4 rounded-2xl border transition-all ${isEditingInfo ? 'bg-white dark:bg-slate-900 border-primary shadow-lg ring-1 ring-primary' : 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'}`}>
                     <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isEditingInfo ? 'text-primary' : 'text-yellow-700 dark:text-yellow-500'}`}>Ghi chú</p>
                     {isEditingInfo ? (
                        <textarea 
                          value={editFormData.note}
                          onChange={e => setEditFormData({...editFormData, note: e.target.value})}
                          rows={2}
                          placeholder="Nhập ghi chú mới..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm p-2 outline-none focus:ring-1 focus:ring-primary/50"
                        />
                     ) : (
                        <p className="text-sm text-yellow-800 dark:text-slate-300">{selectedBookingDetail.note}</p>
                     )}
                  </div>
               ) : null}

               <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 flex items-center gap-2"><Clock size={14} /> Dự kiến trả</span>
                     {isEditingInfo ? (
                        <input 
                           type="datetime-local" 
                           value={editFormData.expectedCheckoutTime?.substring(0, 16)}
                           onChange={e => setEditFormData({...editFormData, expectedCheckoutTime: e.target.value})}
                           className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                     ) : (
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {selectedBookingDetail.expectedCheckoutTime ? new Date(selectedBookingDetail.expectedCheckoutTime).toLocaleString('vi-VN') : '—'}
                        </span>
                     )}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Ngày tạo đơn</span>
                     <span className="font-bold text-slate-700 dark:text-slate-200">
                       {selectedBookingDetail.createdAt ? new Date(selectedBookingDetail.createdAt).toLocaleString('vi-VN') : '—'}
                     </span>
                  </div>
               </div>

               {/* Action Buttons for Info Editing */}
               <div className="flex gap-3">
                  {isEditingInfo ? (
                    <>
                      <button 
                        onClick={() => setIsEditingInfo(false)}
                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-500"
                      >
                        Hủy
                      </button>
                      <button 
                        onClick={handleSaveBookingInfo}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
                      >
                        <Save size={16} /> Lưu thay đổi
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={(e) => {
                        setEditFormData({
                          note: selectedBookingDetail.note || '',
                          reservationTime: selectedBookingDetail.reservationTime || '',
                          expectedCheckoutTime: selectedBookingDetail.expectedCheckoutTime || ''
                        });
                        setIsEditingInfo(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-all"
                    >
                      <Edit2 size={16} /> Chỉnh sửa thông tin đơn
                    </button>
                  ) }
               </div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div 
                  key={booking.id} 
                  onClick={() => handleViewDetail(booking.id)}
                  className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-base mb-0.5">{booking.roomCount} phòng</div>
                      <div className="text-xs text-slate-500 flex flex-col">
                        <span>Nhận: {booking.reservationTime ? new Date(booking.reservationTime).toLocaleString('vi-VN') : '—'}</span>
                        {booking.expectedCheckoutTime && <span>Trả dự kiến: {new Date(booking.expectedCheckoutTime).toLocaleString('vi-VN')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2 text-[13px]">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                       {['BOOKED'].includes(booking.status?.toUpperCase()) && (
                         <button 
                           onClick={(e) => handleActionAll(booking.id, 'check-in', e)}
                           className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                           title="Nhận toàn bộ phòng"
                         >
                           <LogIn size={14} />
                         </button>
                       )}
                       {['CHECKIN', 'CHECK_IN', 'CHECKED_IN'].includes(booking.status?.toUpperCase()) && (
                         <button 
                           onClick={(e) => handleActionAll(booking.id, 'checkout', e)}
                           className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                           title="Trả toàn bộ phòng"
                         >
                           <LogOut size={14} />
                         </button>
                       )}
                       <button 
                         onClick={(e) => handleOpenEditBooking(booking, e)}
                         className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                         title="Sửa thông tin"
                       >
                         <Edit2 size={14} />
                       </button>
                       <button 
                         onClick={(e) => handleDeleteBooking(booking.id, e)}
                         className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                         title="Xóa đơn hàng"
                       >
                         <TrashIcon size={14} />
                       </button>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-lg shadow-sm ${
                      ['CHECKOUT', 'CHECK_OUT', 'CHECKED_OUT'].includes(booking.status?.toUpperCase()) ? 'bg-slate-500 text-white' : 
                      ['CANCEL', 'CANCELLED'].includes(booking.status?.toUpperCase()) ? 'bg-red-500 text-white' :
                      ['CHECKIN', 'CHECK_IN', 'CHECKED_IN'].includes(booking.status?.toUpperCase()) ? 'bg-green-500 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {['BOOKED'].includes(booking.status?.toUpperCase()) ? 'Đặt trước' : 
                       ['CHECKIN', 'CHECK_IN', 'CHECKED_IN'].includes(booking.status?.toUpperCase()) ? 'Nhận phòng' : 
                       ['CHECKOUT', 'CHECK_OUT', 'CHECKED_OUT'].includes(booking.status?.toUpperCase()) ? 'Trả phòng' : 
                       ['CANCEL', 'CANCELLED'].includes(booking.status?.toUpperCase()) ? 'Đã hủy' : booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              Trước
            </button>
            <div className="px-4 py-2 text-primary font-bold">{page} / {totalPages}</div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              Tiếp
            </button>
          </div>
        )}
      </div>
    </div>,
    document.getElementById('main-layout')
  )
}
