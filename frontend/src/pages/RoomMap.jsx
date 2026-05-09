import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { getAllRooms, getAvailableRooms, createRoom, updateRoom, deleteRoom } from '../api/roomApi'
import { getServingRooms } from '../api/profile'
import { useAuth } from '../context/AuthContext'
import RoomCard from '../components/room/RoomCard'
import RoomDetailModal from '../components/room/RoomDetailModal'
import RoomFormModal from '../components/room/RoomFormModal'
import ComboBookingModal from '../components/room/ComboBookingModal'
import ConfirmModal from '../components/common/ConfirmModal'
import { DateTimeSelect } from '../components/common/DateTimeSelect'
import { Search } from 'lucide-react'

export default function RoomMap() {
  const { user } = useAuth()
  const [filter, setFilter] = useState(user.role === 'STAFF' ? 'ASSIGNED' : 'ALL')
  const [capacityFilter, setCapacityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const [roomsData, setRoomsData] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [bookingAction, setBookingAction] = useState(null)
  const [bookingStep, setBookingStep] = useState(1)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [orderAction, setOrderAction] = useState(null)
  const [rooms, setRooms] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState(null)
  const [isComboOpen, setIsComboOpen] = useState(false)

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
  const [isTimeSearchActive, setIsTimeSearchActive] = useState(false)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      
      if (filter === 'ASSIGNED') {
        const response = await getServingRooms()
        const mappedRooms = (response || []).map(r => ({
          id: r.roomId,
          name: r.roomName,
          category: r.roomCategory,
          size: r.roomSize,
          status: r.roomStatus,
          bookingId: r.bookingId,
          customerName: r.customerName,
          checkinTime: r.checkInTime,
          staffList: [{ name: user.name }]
        }))
        const filtered = mappedRooms.filter(r => {
          if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false
          if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
          if (capacityFilter === 'SMALL' && r.size >= 10) return false
          if (capacityFilter === 'MEDIUM' && (r.size < 10 || r.size > 20)) return false
          if (capacityFilter === 'LARGE' && r.size <= 20) return false
          return true
        })
        setRooms(filtered)
        setTotalPages(1)
      } else if (isTimeSearchActive) {
        // Fetch available rooms for the specified time
        const formatTime = (timeStr) => timeStr.length === 16 ? `${timeStr}:00` : timeStr;
        const response = await getAvailableRooms(formatTime(searchStartTime), formatTime(searchEndTime), { size: 100 })
        const availableRooms = response.content || response.data || []
        // Apply filters
        const filtered = availableRooms.filter(r => {
          if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false
          if (capacityFilter === 'SMALL' && r.size >= 10) return false
          if (capacityFilter === 'MEDIUM' && (r.size < 10 || r.size > 20)) return false
          if (capacityFilter === 'LARGE' && r.size <= 20) return false
          return true
        })
        setRooms(filtered)
        setTotalPages(1)
      } else {
        const params = {
          page,
          size: 5,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }

        if (capacityFilter === 'SMALL') params.maxSize = 9
        else if (capacityFilter === 'MEDIUM') { params.minSize = 10; params.maxSize = 20 }
        else if (capacityFilter === 'LARGE') params.minSize = 21

        const response = await getAllRooms(params)
        setRooms(response.data || [])
        setTotalPages(response.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [categoryFilter, capacityFilter, statusFilter, filter, isTimeSearchActive])

  useEffect(() => {
    fetchRooms()
  }, [page, categoryFilter, capacityFilter, statusFilter, filter, isTimeSearchActive])

  const handleSaveRoom = async (data) => {
    if (editingRoom) {
      await updateRoom(editingRoom.id, data)
    } else {
      await createRoom(data)
    }
    fetchRooms()
  }

  const handleDeleteRoom = async (id) => {
    setRoomToDelete(id)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!roomToDelete) return
    try {
      await deleteRoom(roomToDelete)
      setSelectedRoom(null)
      fetchRooms()
    } catch (error) {
      console.error('Failed to delete room:', error)
    }
  }

  const handleOpenEdit = (room) => {
    setEditingRoom(room)
    setIsFormOpen(true)
  }

  const handleOpenAdd = () => {
    setEditingRoom(null)
    setIsFormOpen(true)
  }



  return (
    <div className="flex flex-col min-h-[calc(100vh-12rem)]">
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Sơ đồ phòng</h1>
              {user.role === 'ADMIN' && (
                <button onClick={handleOpenAdd}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/25">
                  <Plus size={18} /> Thêm phòng
                </button>
              )}
              <div className="flex gap-2">
                {user.role !== 'STAFF' && (
                  <button
                    onClick={() => setIsComboOpen(true)}
                    className="px-4 py-1.5 text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 rounded-lg shadow-sm transition-all shadow-purple-500/30 flex items-center gap-1.5"
                  >
                    + Đặt combo
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
            <div className="flex flex-col lg:flex-row gap-3 w-full justify-end lg:justify-start">
              {/* Time Search Bar */}
              <div className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="min-w-[220px] flex-1">
                    <DateTimeSelect 
                      label="Từ giờ" 
                      value={searchStartTime} 
                      onChange={setSearchStartTime} 
                    />
                  </div>
                  <div className="min-w-[220px] flex-1">
                    <DateTimeSelect 
                      label="Đến giờ" 
                      value={searchEndTime} 
                      onChange={setSearchEndTime} 
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsTimeSearchActive(true)}
                    className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                  >
                    <Search size={18} />
                    Tìm phòng trống
                  </button>
                  {isTimeSearchActive && (
                    <button 
                      onClick={() => { setIsTimeSearchActive(false); setStatusFilter('ALL'); }}
                      className="px-4 py-2 text-slate-500 hover:text-slate-700 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl font-bold transition-all text-sm whitespace-nowrap"
                    >
                      Hủy lọc
                    </button>
                  )}
                </div>
              </div>

              {/* Status and Capacity Filters */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 lg:pt-0">
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary h-[42px] min-w-[140px]">
                  <option value="ALL">Mọi loại phòng</option>
                  <option value="VIP">VIP</option>
                  <option value="STANDARD">Standard</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} disabled={isTimeSearchActive}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary h-[42px] min-w-[140px] disabled:opacity-50">
                  <option value="ALL">Mọi trạng thái</option>
                  <option value="AVAILABLE">Trống</option>
                  <option value="OCCUPIED">Đang hát</option>
                  <option value="RESERVED">Đã đặt</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
                <select value={capacityFilter} onChange={e => setCapacityFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary h-[42px] min-w-[140px]">
                  <option value="ALL">Mọi sức chứa</option>
                  <option value="SMALL">Dưới 10 người</option>
                  <option value="MEDIUM">10 - 20 người</option>
                  <option value="LARGE">Trên 20 người</option>
                </select>
              </div>
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map(room => {
              const booking = room.bookingId ? {
                customer_name: room.customerName,
                checkin_time: room.checkinTime,
                booking_time: room.checkinTime,
                assigned_staff: room.staffList?.map(s => s.name) || []
              } : null
              return <RoomCard key={room.id} room={room} booking={booking} onClick={setSelectedRoom} />
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 py-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Detail modal */}
      <RoomDetailModal
        selectedRoom={selectedRoom}
        bookingAction={bookingAction} setBookingAction={setBookingAction}
        bookingStep={bookingStep} setBookingStep={setBookingStep}
        selectedCustomerId={selectedCustomerId} setSelectedCustomerId={setSelectedCustomerId}
        orderAction={orderAction} setOrderAction={setOrderAction}
        onClose={() => setSelectedRoom(null)}
        user={user}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteRoom}
        onSuccess={fetchRooms}
      />

      <RoomFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        room={editingRoom}
        onSave={handleSaveRoom}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa phòng hát"
        message="Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác."
        confirmText="Xóa ngay"
        cancelText="Để sau"
        type="danger"
      />

      <ComboBookingModal
        isOpen={isComboOpen}
        onClose={() => setIsComboOpen(false)}
        onSuccess={fetchRooms}
      />
    </div>
  )
}
