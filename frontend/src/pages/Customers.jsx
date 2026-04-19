import { useState, useEffect } from 'react'
import { Plus, Search, UserCircle, Edit2, Trash2, History, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerBookings } from '../api/customerApi'
import CustomerFormModal from '../components/customer/CustomerFormModal'
import ConfirmModal from '../components/common/ConfirmModal'
import BookingHistoryModal from '../components/customer/BookingHistoryModal'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [size] = useState(10)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)

  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await getAllCustomers({ 
        keyword: keyword || undefined,
        page,
        size
      })
      setCustomers(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch customers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [page, keyword])

  const handleSaveCustomer = async (formData) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, formData)
    } else {
      await createCustomer(formData)
    }
    fetchCustomers()
  }

  const handleDeleteClick = (id) => {
    setCustomerToDelete(id)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!customerToDelete) return
    try {
      await deleteCustomer(customerToDelete)
      fetchCustomers()
    } catch (err) {
      console.error('Failed to delete customer:', err)
    }
  }

  const handleOpenEdit = (cus) => {
    setEditingCustomer(cus)
    setIsFormOpen(true)
  }

  const handleOpenAdd = () => {
    setEditingCustomer(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
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
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary dark:text-white shadow-sm transition-all"
            />
          </div>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/20 shrink-0 font-bold">
            <Plus size={18} /> <span className="hidden sm:inline">Thêm khách hàng</span>
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4 font-medium text-sm">Khách hàng</th>
                <th className="px-6 py-4 font-medium text-sm">Số điện thoại</th>
                <th className="px-6 py-4 font-medium text-sm">CCCD / CMND</th>
                <th className="px-6 py-4 font-medium text-sm">Địa chỉ</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Thao tác</th>
                <th className="px-6 py-4 font-medium text-sm text-right">Lịch sử</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <span className="text-slate-500 font-medium">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-500">
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              ) : customers.map((cus) => (
                <tr key={cus.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full text-primary shadow-sm"><UserCircle size={20}/></div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{cus.name}</div>
                        <div className="text-xs text-slate-500">{cus.email || 'Chưa cập nhật email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">{cus.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{cus.identity || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{cus.address || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end items-center gap-1">
                      <button onClick={() => handleOpenEdit(cus)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Sửa"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteClick(cus.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all" title="Xóa"><Trash2 size={16} /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedHistoryCustomer(cus)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
                    >
                      <History size={14} /> Lịch sử
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Hiển thị <span className="font-bold text-slate-700 dark:text-white">{customers.length}</span> / {totalPages * size} khách hàng
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-sm text-slate-700 dark:text-white">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <CustomerFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa khách hàng"
        message="Bạn có chắc muốn xóa khách hàng này? Mọi thông tin liên quan sẽ bị ảnh hưởng."
        confirmText="Xác nhận xóa"
        type="danger"
      />

      <BookingHistoryModal 
        isOpen={!!selectedHistoryCustomer}
        onClose={() => setSelectedHistoryCustomer(null)}
        customer={selectedHistoryCustomer}
      />
    </div>
  )
}

