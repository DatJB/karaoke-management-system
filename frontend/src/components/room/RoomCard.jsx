import { Users, Clock, User } from 'lucide-react'

export const ROOM_STATUS_COLOR = {
  AVAILABLE: 'bg-green-500 text-white shadow-green-500/30',
  OCCUPIED: 'bg-primary text-white shadow-primary/30',
  RESERVED: 'bg-orange-500 text-white shadow-orange-500/30',
  MAINTENANCE: 'bg-slate-500 text-white shadow-slate-500/30',
}

export const ROOM_STATUS_LABEL = {
  AVAILABLE: 'TRỐNG',
  OCCUPIED: 'ĐANG HÁT',
  RESERVED: 'ĐÃ ĐẶT',
  MAINTENANCE: 'BẢO TRÌ',
}

export const ROOM_STATUS_BG = {
  AVAILABLE: 'border-green-500/20 bg-green-500/5',
  OCCUPIED: 'border-primary/50 bg-primary/10',
  RESERVED: 'border-orange-500/30 bg-orange-500/10',
  MAINTENANCE: 'border-slate-500/20 bg-slate-500/5',
}

export default function RoomCard({ room, booking, onClick }) {
  return (
    <div
      onClick={() => onClick(room)}
      className={`glass-card p-6 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer relative ${ROOM_STATUS_BG[room.status] ?? 'border-slate-200 bg-slate-50'}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{room.name}</h3>
          <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{room.category}</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold shadow-md ${ROOM_STATUS_COLOR[room.status] ?? 'bg-slate-200 text-slate-600'}`}>
          {ROOM_STATUS_LABEL[room.status] ?? room.status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 p-2.5 rounded-xl">
          <Users size={18} className="text-slate-500" />
          <span className="text-sm font-medium">Sức chứa: {room.size} người</span>
        </div>

        {room.status === 'OCCUPIED' && (
          <div className="text-primary font-bold text-xs uppercase tracking-wider px-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Đang có khách hát
          </div>
        )}
        {room.status === 'RESERVED' && (
          <div className="text-orange-500 font-bold text-xs uppercase tracking-wider px-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            Đã có khách đặt
          </div>
        )}
        {room.status === 'MAINTENANCE' && (
          <div className="text-slate-500 font-bold text-xs uppercase tracking-wider px-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            Phòng đang bảo trì
          </div>
        )}
        {room.status === 'AVAILABLE' && (
          <div className="text-green-500 font-bold text-xs uppercase tracking-wider px-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Sẵn sàng phục vụ
          </div>
        )}

        {booking && room.status === 'OCCUPIED' && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary font-medium bg-primary/5 p-2.5 rounded-xl border border-primary/20">
              <Clock size={18} />
              <div className="flex flex-col">
                <span className="text-sm leading-tight text-slate-700 dark:text-slate-300">Khách: <strong className="text-primary">{booking.customer_name}</strong></span>
                <span className="text-[11px] mt-0.5">Vào lúc {new Date(booking.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {booking.assigned_staff && booking.assigned_staff.length > 0 && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 transition-all hover:bg-white dark:hover:bg-slate-800">
                <User size={18} className="text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nhân viên phục vụ</span>
                  <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 leading-none mt-0.5">{booking.assigned_staff.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {booking && room.status === 'RESERVED' && (
          <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 font-medium bg-orange-500/5 p-2.5 rounded-xl border border-orange-500/20">
            <Clock size={18} />
            <div className="flex flex-col">
              <span className="text-sm leading-tight text-slate-700 dark:text-slate-300">Khách: <strong className="text-orange-600 dark:text-orange-400">{booking.customer_name}</strong></span>
              {booking.booking_time && <span className="text-[11px] mt-0.5">Đặt lúc {new Date(booking.booking_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
          </div>
        )}


      </div>
    </div>
  )
}
