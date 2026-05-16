/** TypeBadge + Enum constants — used only by BonusPenaltyManagement and its sub-components */

export const BONUS_TYPES = [
  { value: 'SERVICE',      label: 'Thưởng bán đồ' },
  { value: 'ROOM_SUPPORT', label: 'Phục vụ phòng' },
  { value: 'TEAMWORK',     label: 'Hỗ trợ team' },
  { value: 'KPI',          label: 'Đạt chỉ tiêu' },
  { value: 'TIP',          label: 'Khách tip' },
  { value: 'HOLIDAY',      label: 'Thưởng lễ' },
  { value: 'OTHER',        label: 'Khác' },
]

export const PENALTY_TYPES = [
  { value: 'LATE',       label: 'Đi trễ' },
  { value: 'ABSENT',     label: 'Vắng không phép' },
  { value: 'MISCONDUCT', label: 'Vi phạm nội quy' },
  { value: 'BOOKING',    label: 'Liên quan booking' },
  { value: 'GENERAL',    label: 'Phạt chung' },
]

export default function TypeBadge({ kind, type }) {
  const list = kind === 'BONUS' ? BONUS_TYPES : PENALTY_TYPES
  const label = list.find(t => t.value === type)?.label ?? type
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
      kind === 'BONUS'
        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
    }`}>{label}</span>
  )
}
