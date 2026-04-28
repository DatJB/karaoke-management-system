import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Package, Search, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/product'
import ProductModal from '../components/products/ProductModal'
import toast from 'react-hot-toast'

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const emptyForm = { code: '', name: '', category: 'DRINK', price: '', stock: '' }
  const [modal, setModal] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [page, categoryFilter])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 0) fetchProducts()
      else setPage(0)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts({
        page,
        size: 10,
        keyword: searchTerm || undefined,
        category: categoryFilter === 'ALL' ? undefined : categoryFilter
      })
      setProducts(data.content || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast.error('Lỗi khi tải danh sách hàng hóa')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setFormData(emptyForm)
    setSelectedProduct(null)
    setModal('add')
  }

  const openEdit = (product) => {
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock
    })
    setSelectedProduct(product)
    setModal('edit')
  }

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.price || !formData.stock) {
      toast.error('Vui lòng điền đủ thông tin')
      return
    }

    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock)
      }

      if (modal === 'add') {
        await createProduct(payload)
        toast.success('Thêm sản phẩm thành công')
      } else {
        await updateProduct(selectedProduct.id, payload)
        toast.success('Cập nhật sản phẩm thành công')
      }
      setModal(null)
      fetchProducts()
    } catch (error) {
      console.error(error)
      const msg = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error(msg)
    }
  }

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-slate-900 dark:text-white">Bạn có chắc muốn xóa sản phẩm này?</p>
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg" onClick={() => toast.dismiss(t.id)}>Hủy</button>
          <button className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg" onClick={async () => {
            toast.dismiss(t.id)
            try {
              await deleteProduct(id)
              toast.success('Đã xóa sản phẩm')
              fetchProducts()
            } catch (error) {
              console.error(error)
              toast.error('Có lỗi xảy ra khi xóa')
            }
          }}>Xóa</button>
        </div>
      </div>
    ), { duration: Infinity })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">Kho hàng & Sản phẩm</h1>
          <p className="text-slate-500 dark:text-slate-400">Danh mục đồ uống, thức ăn và theo dõi số lượng tồn kho.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary dark:text-white shadow-sm transition-all text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary dark:text-white shadow-sm transition-all text-sm font-medium"
          >
            <option value="ALL">Tất cả danh mục</option>
            <option value="DRINK">Đồ uống</option>
            <option value="FOOD">Thức ăn</option>
            <option value="OTHER">Khác</option>
          </select>
          {user.role !== 'STAFF' && (
            <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 shrink-0 font-bold text-sm">
              <Plus size={18} />
              <span className="hidden sm:inline">Nhập thêm hàng</span>
            </button>
          )}
        </div>
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
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Đang tải dữ liệu...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Không có sản phẩm nào</td></tr>
              ) : products.map((product) => (
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
                        <button onClick={() => openEdit(product)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all border border-transparent hover:border-slate-200"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <span className="text-xs font-bold text-slate-500">Trang {page + 1} / {totalPages}</span>
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all border border-transparent hover:border-slate-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      
      <ProductModal 
        modal={modal}
        formData={formData}
        setFormData={setFormData}
        closeModal={() => setModal(null)}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}
