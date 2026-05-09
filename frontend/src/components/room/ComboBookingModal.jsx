import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { X, Search, UserCircle, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Calendar, Clock, ClipboardList, Home } from 'lucide-react'
import { getAllRooms, getAvailableRooms } from '../../api/roomApi'
import { getAllCustomers } from '../../api/customerApi'
import { createBooking } from '../../api/bookingApi'
import { DateTimeSelect } from '../common/DateTimeSelect'

export default function ComboBookingModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Step 1: Room Selection
  const [rooms, setRooms] = useState([])
  const [selectedRoomIds, setSelectedRoomIds] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [roomKeyword, setRoomKeyword] = useState('')
  const getTodayStart = () => {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 10);
    return `${today}T00:00`;
  }
  const getTodayEnd = () => {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 10);
    return `${today}T23:59`;
  }

  const [searchStartTime, setSearchStartTime] = useState(getTodayStart())
  const [searchEndTime, setSearchEndTime] = useState(getTodayEnd())

  // Step 2: Customer Selection
  const [customers, setCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customerKeyword, setCustomerKeyword] = useState('')

  const getCurrentLocalTime = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 16);
  const getCheckoutLocalTime = () => new Date(Date.now() + 3 * 3600000 - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 16);

  // Step 3: Booking Info
  const [bookingData, setBookingData] = useState({
    reservationTime: getCurrentLocalTime(),
    expectedCheckoutTime: getCheckoutLocalTime(),
    note: '',
    checkInImmediately: false
  })
  const [saving, setSaving] = useState(false)

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true)
      // Format as YYYY-MM-DDTHH:mm:ss by stripping the timezone 'Z' and adjusting offset if needed
      // Since searchStartTime is already "YYYY-MM-DDTHH:mm", we can just append ":00"
      const formatTime = (timeStr) => timeStr.length === 16 ? `${timeStr}:00` : timeStr;
      
      const response = await getAvailableRooms(
        formatTime(searchStartTime),
        formatTime(searchEndTime),
        { size: 100 }
      )
      // Spring Page returns 'content', while PageResponse returns 'data'
      setRooms(response.content || response.data || [])
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
    } finally {
      setLoadingRooms(false)
    }
  }

  // Fetch available rooms
  useEffect(() => {
    if (isOpen && step === 1) {
      fetchRooms()
    }
  }, [isOpen, step])

  // Fetch customers
  useEffect(() => {
    if (isOpen && step === 2) {
      const fetchCustomers = async () => {
        try {
          setLoadingCustomers(true)
          const response = await getAllCustomers({ keyword: customerKeyword || undefined, size: 20 })
          setCustomers(response.data || [])
        } catch (err) {
          console.error('Failed to fetch customers:', err)
        } finally {
          setLoadingCustomers(false)
        }
      }
      const delayDebounceFn = setTimeout(() => {
        fetchCustomers()
      }, 300)
      return () => clearTimeout(delayDebounceFn)
    }
  }, [isOpen, step, customerKeyword])

  const handleCreateCombo = async () => {
    if (selectedRoomIds.length === 0 || !selectedCustomerId) return
    try {
      setSaving(true)
      const payload = {
        customerId: selectedCustomerId,
        roomIds: selectedRoomIds,
        reservationTime: bookingData.reservationTime.length === 16 ? `${bookingData.reservationTime}:00` : bookingData.reservationTime,
        expectedCheckoutTime: bookingData.expectedCheckoutTime.length === 16 ? `${bookingData.expectedCheckoutTime}:00` : bookingData.expectedCheckoutTime,
        note: bookingData.note,
        checkInImmediately: bookingData.checkInImmediately
      }
      await createBooking(payload)
      onSuccess?.()
      onClose()
      resetForm()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message))
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedRoomIds([])
    setSelectedCustomerId(null)
    setBookingData({
      reservationTime: getCurrentLocalTime(),
      expectedCheckoutTime: getCheckoutLocalTime(),
      note: '',
      checkInImmediately: false
    })
  }

  if (!isOpen || !document.getElementById('main-layout')) return null

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(roomKeyword.toLowerCase()))

  return createPortal(
    <div className="absolute inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 relative z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Đặt Combo Phòng</h3>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${step >= i ? 'w-8 bg-primary' : 'w-4 bg-slate-200 dark:bg-slate-800'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: SELECT ROOMS */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <div className="flex items-center justify-between">
                 <p className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider flex items-center gap-2">
                   <Home size={18} className="text-primary" /> Bước 1: Chọn các phòng trống
                 </p>
                 <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-lg">Đã chọn: {selectedRoomIds.length}</span>
               </div>
               
               <div className="flex flex-col gap-3">
                 <div className="relative">
                   <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                   <input 
                     type="text" 
                     placeholder="Tìm nhanh tên phòng..." 
                     value={roomKeyword}
                     onChange={e => setRoomKeyword(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium"
                   />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <DateTimeSelect 
                     label="Từ giờ" 
                     value={searchStartTime} 
                     onChange={setSearchStartTime} 
                   />
                   <DateTimeSelect 
                     label="Đến giờ" 
                     value={searchEndTime} 
                     onChange={setSearchEndTime} 
                   />
                   <div className="col-span-1 md:col-span-2">
                     <button 
                       onClick={fetchRooms}
                       className="w-full px-4 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                     >
                       <Search size={18} />
                       Tìm phòng rảnh
                     </button>
                   </div>
                 </div>
               </div>

               {loadingRooms ? (
                 <div className="flex flex-col items-center justify-center py-20 gap-3">
                   <Loader2 className="animate-spin text-primary" size={32} />
                   <p className="text-slate-500 font-medium">Đang tải danh sách phòng...</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {filteredRooms.map(room => (
                     <button 
                       key={room.id}
                       onClick={() => {
                         if (selectedRoomIds.includes(room.id)) {
                           setSelectedRoomIds(selectedRoomIds.filter(id => id !== room.id))
                         } else {
                           setSelectedRoomIds([...selectedRoomIds, room.id])
                         }
                       }}
                       className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                         selectedRoomIds.includes(room.id) 
                           ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                           : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                       }`}
                     >
                        <div className={`text-sm font-bold mb-1 flex items-center justify-between ${selectedRoomIds.includes(room.id) ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                          {room.name}
                          {room.status !== 'AVAILABLE' && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-md text-white font-bold opacity-70 ${
                              room.status === 'OCCUPIED' ? 'bg-primary' : room.status === 'RESERVED' ? 'bg-orange-500' : 'bg-slate-500'
                            }`}>
                              {room.status === 'OCCUPIED' ? 'ĐANG HÁT' : room.status === 'RESERVED' ? 'ĐÃ ĐẶT' : 'BẢO TRÌ'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-500 transition-colors">{room.category} - {room.size} người</div>
                        
                        {selectedRoomIds.includes(room.id) && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                             <CheckCircle2 size={14} />
                          </div>
                        )}
                     </button>
                   ))}
                   {filteredRooms.length === 0 && (
                     <div className="col-span-full py-20 text-center text-slate-500 font-medium border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                       Không có phòng nào trống phù hợp.
                     </div>
                   )}
                 </div>
               )}
            </div>
          )}

          {/* STEP 2: SELECT CUSTOMER */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <p className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider flex items-center gap-2">
                 <UserCircle size={18} className="text-primary" /> Bước 2: Chọn khách hàng
               </p>
               
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Tìm theo tên hoặc SĐT..." 
                   value={customerKeyword}
                   onChange={e => setCustomerKeyword(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium"
                 />
               </div>

               <div className="space-y-2">
                 {loadingCustomers ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                 ) : customers.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">Không tìm thấy khách hàng nào.</div>
                 ) : customers.map(cus => (
                    <button 
                      key={cus.id}
                      onClick={() => setSelectedCustomerId(cus.id)}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${
                        selectedCustomerId === cus.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${selectedCustomerId === cus.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          <UserCircle size={24} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-900 dark:text-white">{cus.name}</div>
                          <div className="text-xs text-slate-500 font-bold">{cus.phone}</div>
                        </div>
                      </div>
                      {selectedCustomerId === cus.id && <CheckCircle2 className="text-primary" size={24} />}
                    </button>
                 ))}
               </div>
            </div>
          )}

          {/* STEP 3: BOOKING INFO */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <p className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider flex items-center gap-2">
                 <ClipboardList size={18} className="text-primary" /> Bước 3: Thông tin lượt hát
               </p>

               <div className="grid grid-cols-1 gap-4">
                 <DateTimeSelect 
                   label="Thời gian nhận" 
                   icon={Calendar}
                   value={bookingData.reservationTime} 
                   onChange={val => setBookingData({...bookingData, reservationTime: val})} 
                 />
                 <DateTimeSelect 
                   label="Trả (Dự kiến)" 
                   icon={Clock}
                   value={bookingData.expectedCheckoutTime} 
                   onChange={val => setBookingData({...bookingData, expectedCheckoutTime: val})} 
                 />
               </div>

               <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Ghi chú lượt hát</label>
                   <textarea 
                     placeholder="VD: Khách gọi thêm hoa, Happy Birthday..."
                     value={bookingData.note}
                     onChange={e => setBookingData({...bookingData, note: e.target.value})}
                     rows={3}
                     className="w-full px-4 py-3 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-2xl text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                   />
               </div>

               <button 
                 onClick={() => setBookingData({...bookingData, checkInImmediately: !bookingData.checkInImmediately})}
                 className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                   bookingData.checkInImmediately 
                     ? 'border-green-500 bg-green-50 dark:bg-green-500/10' 
                     : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                 }`}
               >
                 <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${bookingData.checkInImmediately ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                     <CheckCircle2 size={24} />
                   </div>
                   <div className="text-left">
                     <div className={`font-bold ${bookingData.checkInImmediately ? 'text-green-600 dark:text-green-500' : 'text-slate-900 dark:text-white'}`}>Nhận phòng ngay lập tức</div>
                     <div className="text-xs text-slate-500 font-medium">Bỏ qua trạng thái Đã đặt, vào hát luôn</div>
                   </div>
                 </div>
                 <div className={`w-10 h-5 rounded-full relative transition-colors ${bookingData.checkInImmediately ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${bookingData.checkInImmediately ? 'left-6' : 'left-1'}`} />
                 </div>
               </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex gap-4 shrink-0">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex-1 px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} /> Quay lại
            </button>
          )}
          
          {step < 3 ? (
            <button 
              disabled={(step === 1 && selectedRoomIds.length === 0) || (step === 2 && !selectedCustomerId)}
              onClick={() => setStep(step + 1)}
              className="flex-[2] px-6 py-3 font-bold text-white bg-primary hover:bg-primary-dark rounded-2xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Tiếp theo <ArrowRight size={20} />
            </button>
          ) : (
            <button 
              disabled={saving}
              onClick={handleCreateCombo}
              className="flex-[2] px-6 py-3 font-bold text-white bg-primary hover:bg-primary-dark rounded-2xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Đang xử lý...
                </>
              ) : (
                <>Xác nhận đặt Combo ({selectedRoomIds.length} phòng)</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.getElementById('main-layout')
  )
}
