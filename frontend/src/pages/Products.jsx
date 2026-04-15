import { mockProducts } from '../mock/data'
import { Plus, Edit2, Trash2, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Products() {
  const { user } = useAuth()
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Kho hàng & Sản phẩm</h1>
          <p className="text-slate-500 dark:text-slate-400">Danh mục đồ uống, thức ăn và theo dõi số lượng tồn kho.</p>
        </div>
        {user.role !== 'STAFF' && (
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/20">
            <Plus size={18} />
            Nhập thêm hàng
          </button>
        )}
      </div>

      <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="px-6 py-4 font-medium text-sm">Sản phẩm</th>
                <th className="px-6 py-4 font-medium text-sm">Mã SP</th>
                <th className="px-6 py-4 font-medium text-sm">Phân loại</th>
                <th className="px-6 py-4 font-medium text-sm">Giá bán (VNĐ)</th>
                <th className="px-6 py-4 font-medium text-sm">Kho tồn</th>
                {user.role !== 'STAFF' && <th className="px-6 py-4 font-medium text-sm text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><Package size={16}/></div>
                      <div className="font-semibold text-slate-900 dark:text-white">{product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{product.code}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase ${
                      product.category === 'DRINK' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                      product.category === 'FOOD' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                      'bg-slate-200/50 dark:bg-slate-700/50 dark:text-slate-300'
                    }`}>
                      {product.category === 'DRINK' ? 'ĐỒ UỐNG' :
                       product.category === 'FOOD' ? 'THỨC ĂN' :
                       'CHUNG'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{product.price.toLocaleString()}đ</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${product.stock <= 30 ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {product.stock}
                    </span>
                  </td>
                  {user.role !== 'STAFF' && (
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
