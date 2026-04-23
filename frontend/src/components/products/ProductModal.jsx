import { Package } from 'lucide-react'

export default function ProductModal({ modal, formData, setFormData, closeModal, handleSubmit }) {
  if (!modal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="text-primary" size={24} /> 
            {modal === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mã SP</label>
              <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                placeholder="VD: SP001"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phân loại</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white">
                <option value="DRINK">Đồ uống</option>
                <option value="FOOD">Thức ăn</option>
                <option value="EQUIPMENT">Thiết bị</option>
                <option value="OTHER">Chung</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên sản phẩm</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="VD: Bia Heineken"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Giá bán (VNĐ)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="0"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Số lượng tồn</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                placeholder="0"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button onClick={closeModal} className="px-5 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Hủy
          </button>
          <button onClick={handleSubmit} className="px-5 py-2.5 font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-lg shadow-primary/30">
            Lưu lại
          </button>
        </div>
      </div>
    </div>
  )
}
