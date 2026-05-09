import { useState, useEffect } from 'react'
import { Clock, Pencil, Save, Plus, Trash2, Star } from 'lucide-react'
import { mockRooms } from '../mock/data'
import SpecialPriceModal from '../components/pricing/SpecialPriceModal'
import { getSpecialPricesByRoom, createSpecialPrice, updateSpecialPrice, deleteSpecialPrice } from '../api/specialPrice'
import { getRooms, getWeeklyPricing, updateWeeklyPrices, updateTimeSlot } from '../api/room'
import toast from 'react-hot-toast'

// Day of week config
const DAYS = [
  { key: 'MON', label: 'Thứ 2' },
  { key: 'TUE', label: 'Thứ 3' },
  { key: 'WED', label: 'Thứ 4' },
  { key: 'THU', label: 'Thứ 5' },
  { key: 'FRI', label: 'Thứ 6' },
  { key: 'SAT', label: 'Thứ 7' },
  { key: 'SUN', label: 'CN' },
]

const emptySpecial = { roomId: '', specialDate: '', startTime: '', endTime: '', pricePerHour: '', note: '' }

const initialSpecial = [
  { id: 1, roomId: 1, roomName: 'Phòng 101', specialDate: '2024-12-31', startTime: '20:00', endTime: '02:00', pricePerHour: 200000, note: 'Đêm giao thừa' },
  { id: 2, roomId: 2, roomName: 'Phòng 102', specialDate: '2025-01-01', startTime: '10:00', endTime: '22:00', pricePerHour: 180000, note: 'Tết Dương lịch' },
]


export default function RoomPricing() {
  const [tab, setTab] = useState('regular')          // 'regular' | 'special'
  const [selectedDay, setSelectedDay] = useState('MON')
  const [slots, setSlots] = useState([])
  const [prices, setPrices] = useState({}) // { [roomId_dayOfWeek_slotId]: { id, pricePerHour } }
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Slot editing state
  const [slotChanges, setSlotChanges] = useState([])
  const [slotModalOpen, setSlotModalOpen] = useState(false)
  const [tempSlot, setTempSlot] = useState(null)

  const [specials, setSpecials] = useState([])
  const [modal, setModal] = useState(null)
  const [specialForm, setSpecialForm] = useState(emptySpecial)
  const [selectedSpecial, setSelectedSpecial] = useState(null)
  const [realRooms, setRealRooms] = useState([])

  useEffect(() => {
    if (tab === 'special') {
      fetchSpecials()
    } else if (tab === 'regular') {
      fetchRegularPrices()
    }
  }, [tab])

  const fetchRegularPrices = async () => {
    try {
      const data = await getWeeklyPricing()
      const rooms = data.rooms || []
      setRealRooms(rooms)

      const newPrices = {}
      const uniqueSlots = new Map()

      rooms.forEach(room => {
        room.prices.forEach(p => {
          const sNormalized = p.startTime.substring(0, 5)
          const eNormalized = p.endTime.substring(0, 5)
          const slotId = `${sNormalized}-${eNormalized}`
          
          if (!uniqueSlots.has(slotId)) {
            uniqueSlots.set(slotId, {
              id: slotId,
              label: `Khung ${sNormalized} - ${eNormalized}`,
              from: sNormalized,
              to: eNormalized
            })
          }
          newPrices[`${room.id}_${p.dayOfWeek}_${slotId}`] = {
            id: p.id,
            pricePerHour: p.pricePerHour,
            startTime: p.startTime,
            endTime: p.endTime,
            dayOfWeek: p.dayOfWeek
          }
        })
      })

      setSlots(Array.from(uniqueSlots.values()).sort((a, b) => a.from.localeCompare(b.from)))
      setPrices(newPrices)
    } catch (error) {
      console.error("Failed to fetch regular prices:", error)
    }
  }

  const fetchSpecials = async () => {
    try {
      const response = await getRooms()
      const rooms = Array.isArray(response) ? response : (response?.content || response?.data || [])
      setRealRooms(rooms)
      const promises = rooms.map(r => getSpecialPricesByRoom(r.id))
      const results = await Promise.all(promises)
      setSpecials(results.flat())
    } catch (error) {
      console.error("Failed to fetch special prices:", error)
    }
  }

  // Group rooms by category
  const standardRooms = realRooms.filter(r => r.category === 'STANDARD')
  const vipRooms = realRooms.filter(r => r.category === 'VIP')

  const priceKey = (roomId, slotId) => `${roomId}_${selectedDay}_${slotId}`

  // Inline edit
  const startEdit = (roomId, slotId) => {
    setEditing({ roomId, slotId })
    const key = priceKey(roomId, slotId)
    setEditValue(String(prices[key]?.pricePerHour ?? ''))
  }
  const commitEdit = async () => {
    if (!editing) return
    const val = Number(editValue)
    const key = priceKey(editing.roomId, editing.slotId)
    const currentPrice = prices[key]
    
    // Find the slot object to get times
    const slot = slots.find(s => s.id === editing.slotId)

    if (!isNaN(val) && val >= 0 && slot) {
      // Optimistic update
      setPrices(prev => ({ 
        ...prev, 
        [key]: { 
          ...(prev[key] || {}), 
          pricePerHour: val,
          dayOfWeek: selectedDay,
          startTime: slot.from.length === 5 ? slot.from + ':00' : slot.from,
          endTime: slot.to.length === 5 ? slot.to + ':00' : slot.to
        } 
      }))

      try {
        await updateWeeklyPrices(editing.roomId, [{
          id: currentPrice?.id || null,
          dayOfWeek: selectedDay,
          startTime: slot.from.length === 5 ? slot.from + ':00' : slot.from,
          endTime: slot.to.length === 5 ? slot.to + ':00' : slot.to,
          pricePerHour: val
        }])
        toast.success('Đã lưu giá thành công')
      } catch (error) {
        console.error("Failed to update price:", error)
        toast.error("Lỗi khi lưu giá")
        fetchRegularPrices() // rollback
      }
    }
    setEditing(null)
  }

  // Special modal
  const openAddSpecial = () => { setSpecialForm(emptySpecial); setSelectedSpecial(null); setModal('add') }
  const openEditSpecial = (s) => { setSpecialForm({ ...s, roomId: String(s.roomId) }); setSelectedSpecial(s); setModal('edit') }
  const closeModal = () => setModal(null)
  const handleSpecialSubmit = async () => {
    const room = realRooms.length > 0 ? realRooms.find(r => r.id === Number(specialForm.roomId)) : mockRooms.find(r => r.id === Number(specialForm.roomId))
    if (!room || !specialForm.specialDate || !specialForm.startTime || !specialForm.endTime || !specialForm.pricePerHour) return

    try {
      if (modal === 'add') {
        const payload = {
          specialDate: specialForm.specialDate,
          startTime: specialForm.startTime + ':00', // API might expect HH:mm:ss
          endTime: specialForm.endTime + ':00',
          pricePerHour: Number(specialForm.pricePerHour),
          note: specialForm.note
        }
        await createSpecialPrice(room.id, payload)
      } else {
        const payload = {
          specialDate: specialForm.specialDate,
          startTime: specialForm.startTime.length === 5 ? specialForm.startTime + ':00' : specialForm.startTime,
          endTime: specialForm.endTime.length === 5 ? specialForm.endTime + ':00' : specialForm.endTime,
          pricePerHour: Number(specialForm.pricePerHour),
          note: specialForm.note
        }
        await updateSpecialPrice(selectedSpecial.id, payload)
      }
      fetchSpecials()
      closeModal()
    } catch (error) {
      console.error("Failed to save special price:", error)
      toast.error("Đã xảy ra lỗi khi lưu giá đặc biệt!")
    }
  }

  const handleDeleteSpecial = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-slate-900 dark:text-white">Xóa giá đặc biệt này?</p>
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors" onClick={() => toast.dismiss(t.id)}>Hủy</button>
          <button className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors" onClick={async () => {
            toast.dismiss(t.id)
            try {
              await deleteSpecialPrice(id)
              fetchSpecials()
              toast.success('Đã xóa thành công')
            } catch (error) {
              console.error("Failed to delete special price:", error)
              toast.error('Có lỗi xảy ra khi xóa')
            }
          }}>Xóa</button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  // Slot editing actions
  const openEditSlot = (slot) => {
    setTempSlot({ ...slot, oldFrom: slot.from, oldTo: slot.to })
    setSlotModalOpen(true)
  }
  const saveSlotEdit = () => {
    const updatedSlot = {
      ...tempSlot,
      from: tempSlot.from.length === 5 ? tempSlot.from + ':00' : tempSlot.from,
      to: tempSlot.to.length === 5 ? tempSlot.to + ':00' : tempSlot.to,
      oldFrom: tempSlot.oldFrom.length === 5 ? tempSlot.oldFrom + ':00' : tempSlot.oldFrom,
      oldTo: tempSlot.oldTo.length === 5 ? tempSlot.oldTo + ':00' : tempSlot.oldTo,
    };

    setSlotChanges(prev => [...prev, {
      oldStartTime: updatedSlot.oldFrom,
      oldEndTime: updatedSlot.oldTo,
      newStartTime: updatedSlot.from,
      newEndTime: updatedSlot.to
    }]);

    setSlots(prev => prev.map(s => s.id === tempSlot.id ? { ...s, from: tempSlot.from, to: tempSlot.to, label: tempSlot.label } : s));
    setSlotModalOpen(false);
  }

  const handleSaveSlots = async () => {
    if (slotChanges.length === 0) return;
    try {
      await updateTimeSlot(slotChanges);
      toast.success('Cập nhật khung giờ thành công');
      setSlotChanges([]);
      fetchRegularPrices();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi đổi khung giờ';
      toast.error(typeof msg === 'string' ? msg : 'Có lỗi xảy ra khi đổi khung giờ');
      setSlotChanges([]); // rollback local changes
      fetchRegularPrices();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Quản lý giá phòng</h1>
          <p className="text-slate-500 dark:text-slate-400">Cấu hình giá thuê theo khung giờ, ngày trong tuần và ngày đặc biệt.</p>
        </div>
        {slotChanges.length > 0 && tab === 'regular' && (
          <button onClick={handleSaveSlots}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md bg-primary hover:bg-primary-dark text-white shadow-primary/20">
            <Save size={16} /> Lưu khung giờ
          </button>
        )}
      </div>

      {/* Tab switch */}
      <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { v: 'regular', l: 'Giá theo ngày', icon: Clock },
          { v: 'special', l: 'Giá đặc biệt', icon: Star },
        ].map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.v ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <t.icon size={15} /> {t.l}
          </button>
        ))}
      </div>

      {/* === TAB: REGULAR === */}
      {tab === 'regular' && (
        <div className="space-y-4">
          {/* Day tabs */}
          <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit">
            {DAYS.map(day => (
              <button key={day.key} onClick={() => setSelectedDay(day.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedDay === day.key
                    ? ['SAT', 'SUN'].includes(day.key)
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-primary text-white shadow-md shadow-primary/30'
                    : ['SAT', 'SUN'].includes(day.key)
                      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}>
                {day.label}
              </button>
            ))}
          </div>

          {/* Pricing grid */}
          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 sticky left-0 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur min-w-[130px]">
                      <div className="flex items-center gap-2"><Clock size={14} /> Khung giờ</div>
                    </th>
                    {/* STANDARD rooms */}
                    {standardRooms.map(room => (
                      <th key={room.id} className="px-4 py-3 text-center min-w-[140px]">
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{room.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Standard · {room.size} người</div>
                      </th>
                    ))}
                    {/* VIP rooms */}
                    {vipRooms.map(room => (
                      <th key={room.id} className="px-4 py-3 text-center min-w-[140px]">
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400">{room.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">VIP · {room.size} người</div>
                      </th>
                    ))}
                  </tr>
                  {/* Category sub-header */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-5 py-2 sticky left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur" />
                    {standardRooms.length > 0 && (
                      <td colSpan={standardRooms.length} className="px-4 py-1.5 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">Standard</span>
                      </td>
                    )}
                    {vipRooms.length > 0 && (
                      <td colSpan={vipRooms.length} className="px-4 py-1.5 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">VIP</span>
                      </td>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      {/* Slot label */}
                      <td className="px-5 py-4 sticky left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
                        <div onClick={() => openEditSlot(slot)} className="flex items-center gap-2.5 group/slot cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors -ml-2">
                          <div className="relative">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary transition-colors group-hover/slot:bg-primary group-hover/slot:text-white">
                              <Clock size={14} />
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm group-hover/slot:text-primary transition-colors">{slot.label}</p>
                            <p className="text-[10px] text-slate-400 font-mono group-hover/slot:text-primary/70">{slot.from} – {slot.to}</p>
                          </div>
                        </div>
                      </td>
                      {/* Standard room prices */}
                      {standardRooms.map(room => {
                        const key = priceKey(room.id, slot.id)
                        const isEdit = editing?.roomId === room.id && editing?.slotId === slot.id
                        return (
                          <td key={room.id} className="px-4 py-3 text-center">
                            {isEdit ? (
                              <input autoFocus type="number" value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
                                className="w-28 text-center px-2 py-1.5 bg-white dark:bg-slate-800 border-2 border-blue-400 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none" />
                            ) : (
                              <button onDoubleClick={() => startEdit(room.id, slot.id)} title="Nhấp đúp để sửa"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all group">
                                {(prices[key]?.pricePerHour ?? 0).toLocaleString()}đ
                                <Pencil size={10} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                              </button>
                            )}
                          </td>
                        )
                      })}
                      {/* VIP room prices */}
                      {vipRooms.map(room => {
                        const key = priceKey(room.id, slot.id)
                        const isEdit = editing?.roomId === room.id && editing?.slotId === slot.id
                        return (
                          <td key={room.id} className="px-4 py-3 text-center">
                            {isEdit ? (
                              <input autoFocus type="number" value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
                                className="w-28 text-center px-2 py-1.5 bg-white dark:bg-slate-800 border-2 border-purple-400 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none" />
                            ) : (
                              <button onDoubleClick={() => startEdit(room.id, slot.id)} title="Nhấp đúp để sửa"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all group">
                                {(prices[key]?.pricePerHour ?? 0).toLocaleString()}đ
                                <Pencil size={10} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === TAB: SPECIAL === */}
      {tab === 'special' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openAddSpecial}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/20">
              <Plus size={16} /> Thêm giá đặc biệt
            </button>
          </div>

          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="px-6 py-4 font-medium">Phòng</th>
                    <th className="px-4 py-4 font-medium text-center">Ngày đặc biệt</th>
                    <th className="px-4 py-4 font-medium text-center">Thời gian</th>
                    <th className="px-6 py-4 font-bold text-right text-primary">Giá / giờ</th>
                    <th className="px-4 py-4 font-medium">Ghi chú</th>
                    <th className="px-4 py-4 font-medium text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {specials.length > 0 ? specials.map(s => (
                    <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-amber-500" />
                          <span className="font-semibold text-slate-900 dark:text-white">{s.roomName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 text-center font-mono">
                        {new Date(s.specialDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                        {s.startTime.substring(0, 5)} – {s.endTime.substring(0, 5)}
                      </td>
                      <td className="px-6 py-4 text-base font-bold text-right text-primary">
                        {Number(s.pricePerHour).toLocaleString()}đ
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                        {s.note || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openEditSpecial(s)} title="Sửa"
                            className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteSpecial(s.id)} title="Xóa"
                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                        Chưa có giá đặc biệt nào. Nhấn "Thêm giá đặc biệt" để bắt đầu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <SpecialPriceModal
        modal={modal}
        specialForm={specialForm} setSpecialForm={setSpecialForm}
        closeModal={closeModal}
        handleSpecialSubmit={handleSpecialSubmit}
      />

      {/* Slot Edit Modal */}
      {slotModalOpen && tempSlot && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="text-primary" size={20} /> Sửa khung giờ
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên khung giờ</label>
                <input type="text" value={tempSlot.label} onChange={e => setTempSlot({ ...tempSlot, label: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Từ</label>
                  <input type="time" value={tempSlot.from} onChange={e => setTempSlot({ ...tempSlot, from: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Đến</label>
                  <input type="time" value={tempSlot.to} onChange={e => setTempSlot({ ...tempSlot, to: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button onClick={() => setSlotModalOpen(false)} className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">Hủy</button>
              <button onClick={saveSlotEdit} className="flex-1 py-2.5 font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-lg shadow-primary/30">Lưu lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
