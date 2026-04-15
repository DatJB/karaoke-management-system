import { useState } from 'react'
import { mockRooms, mockBookings } from '../mock/data'
import { useAuth } from '../context/AuthContext'
import RoomCard from '../components/room/RoomCard'
import RoomDetailModal from '../components/room/RoomDetailModal'

export default function RoomMap() {
  const { user } = useAuth()
  const [filter, setFilter] = useState(user.role === 'STAFF' ? 'ASSIGNED' : 'ALL')
  const [capacityFilter, setCapacityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [bookingAction, setBookingAction] = useState(null)
  const [bookingStep, setBookingStep] = useState(1)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [orderAction, setOrderAction] = useState(null)

  const isAssignedRoom = (name) => name === 'Phòng 102' || name === 'Phòng 202'

  const displayedRooms = mockRooms.filter(r => {
    if (filter === 'ASSIGNED' && !isAssignedRoom(r.name)) return false
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false
    if (capacityFilter === 'SMALL' && r.size >= 10) return false
    if (capacityFilter === 'MEDIUM' && (r.size < 10 || r.size > 20)) return false
    if (capacityFilter === 'LARGE' && r.size <= 20) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Sơ đồ phòng hát</h1>
            <div className="flex gap-2">
              {user.role !== 'STAFF' && (
                <button
                  onClick={() => alert('Chức năng đặt combo chung đang được phát triển')}
                  className="px-4 py-1.5 text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 rounded-lg shadow-sm transition-all shadow-purple-500/30 flex items-center gap-1.5"
                >
                  + Đặt combo
                </button>
              )}
              {user.role === 'ADMIN' && (
                <button
                  onClick={() => alert('Chức năng thêm phòng mới')}
                  className="px-4 py-1.5 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-sm transition-all shadow-blue-500/30 flex items-center gap-1.5"
                >
                  + Thêm phòng
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Theo dõi trạng thái tất cả các phòng theo thời gian thực.</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 bg-white/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
            {[['bg-green-500', 'Trống'], ['bg-primary', 'Đang hát'], ['bg-orange-500', 'Đã đặt'], ['bg-slate-500', 'Bảo trì']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${c}`} />
                <span className="text-sm font-medium dark:text-slate-300">{l}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full justify-end sm:justify-start">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-primary shrink-0">
              <option value="ALL">Mọi loại phòng</option>
              <option value="VIP">VIP</option>
              <option value="STANDARD">Standard</option>
            </select>
            <select value={capacityFilter} onChange={e => setCapacityFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-primary shrink-0">
              <option value="ALL">Mọi sức chứa</option>
              <option value="SMALL">Dưới 10 người</option>
              <option value="MEDIUM">10 - 20 người</option>
              <option value="LARGE">Trên 20 người</option>
            </select>
          </div>

          {user.role === 'STAFF' && (
            <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl">
              {[{ v: 'ASSIGNED', l: 'Phòng tôi trực' }, { v: 'ALL', l: 'Tất cả phòng' }].map(tab => (
                <button key={tab.v} onClick={() => setFilter(tab.v)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === tab.v ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                  {tab.l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Room grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedRooms.map(room => {
          const booking = (room.status === 'OCCUPIED' || room.status === 'RESERVED')
            ? mockBookings.find(b => b.room_name === room.name)
            : null
          return <RoomCard key={room.id} room={room} booking={booking} onClick={setSelectedRoom} />
        })}
      </div>

      {/* Detail modal */}
      <RoomDetailModal
        selectedRoom={selectedRoom}
        bookingAction={bookingAction} setBookingAction={setBookingAction}
        bookingStep={bookingStep} setBookingStep={setBookingStep}
        selectedCustomerId={selectedCustomerId} setSelectedCustomerId={setSelectedCustomerId}
        orderAction={orderAction} setOrderAction={setOrderAction}
        onClose={() => setSelectedRoom(null)}
        user={user}
      />
    </div>
  )
}
