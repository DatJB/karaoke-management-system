import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockInvoices, mockProducts } from '../mock/data';
import { Receipt, Search, Plus } from 'lucide-react';

export default function Invoices() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(mockInvoices[0]);

  const filteredInvoices = mockInvoices.filter(invoice => 
    invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Invoice List */}
      <div className="w-1/3 glass-card flex flex-col p-4 border-none bg-white/80 dark:bg-slate-900/80">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Danh sách Hóa đơn</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên khách hàng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredInvoices.map(invoice => (
            <div 
              key={invoice.id} 
              onClick={() => setSelectedInvoice(invoice)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedInvoice?.id === invoice.id 
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5' 
                  : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`font-bold ${selectedInvoice?.id === invoice.id ? 'text-primary dark:text-primary-light' : 'dark:text-white'}`}>
                  {invoice.room_name}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  invoice.status === 'PAID' 
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                    : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                }`}>
                  {invoice.status === 'PAID' ? 'ĐÃ TT' : 'CHƯA TT'}
                </span>
              </div>
              <div className="mb-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Khách: <span className="font-medium text-slate-700 dark:text-slate-300">{invoice.customer_name}</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  CCCD: <span className="font-mono">{invoice.identity}</span>
                </p>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {invoice.total.toLocaleString()} VNĐ
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* POS / Detail View */}
      <div className="flex-1 glass-card p-6 flex flex-col border-none bg-white/80 dark:bg-slate-900/80 overflow-y-auto">
        {selectedInvoice ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold dark:text-white">Chi tiết {selectedInvoice.room_name}</h2>
                <p className="text-slate-500 dark:text-slate-400">HĐ #{selectedInvoice.id} • Hát: {selectedInvoice.duration}</p>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 border-l-2 border-primary/50 pl-3">
                  <p>Khách hàng: <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.customer_name}</span></p>
                  <p>CCCD/CMND: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{selectedInvoice.identity}</span></p>
                </div>
              </div>
              {user.role !== 'STAFF' && (
                <button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30">
                  Thanh toán ngay
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col xl:flex-row gap-6">
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold mb-4 dark:text-white text-lg">Đã đặt (Order)</h3>
                <div className="space-y-4">
                  {/* Mock items */}
                  <div className="flex justify-between items-center group">
                    <div>
                      <p className="font-medium dark:text-white group-hover:text-primary transition-colors">Tiger (Bia)</p>
                      <p className="text-sm text-slate-500">40,000đ x 5</p>
                    </div>
                    <p className="font-bold dark:text-white">200,000đ</p>
                  </div>
                  <div className="flex justify-between items-center group">
                    <div>
                      <p className="font-medium dark:text-white group-hover:text-primary transition-colors">Trái cây dĩa</p>
                      <p className="text-sm text-slate-500">200,000đ x 1</p>
                    </div>
                    <p className="font-bold dark:text-white">200,000đ</p>
                  </div>
                  <div className="group border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-4 bg-white dark:bg-slate-800 transition-all hover:shadow-md hover:border-primary/30">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-bold text-lg dark:text-white text-primary">Tiền phòng hát ({selectedInvoice.duration})</p>
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{(selectedInvoice.total - 400000).toLocaleString()}đ</p>
                    </div>
                    
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-3 border-dashed space-y-2">
                      <div className="flex justify-between text-sm text-slate-500">
                         <span>Giờ nhận phòng:</span>
                         <span className="font-medium text-slate-700 dark:text-slate-300">
                           {new Date(selectedInvoice.time).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'})}
                         </span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500">
                         <span>Giờ trả phòng:</span>
                         <span className="font-medium text-slate-700 dark:text-slate-300">
                           {new Date(new Date(selectedInvoice.time).getTime() + (parseInt(selectedInvoice.duration.split('h')[0] || 0) * 60 + parseInt(selectedInvoice.duration.split('h')[1] || 0)) * 60 * 1000).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'})}
                         </span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500">
                         <span>Đơn giá phòng:</span>
                         <span className="font-medium text-slate-700 dark:text-slate-300">
                           {selectedInvoice.total > 1000000 ? '200,000' : '100,000'}đ / giờ
                         </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                  <span className="text-slate-500">Tổng cộng:</span>
                  <span className="text-3xl font-display font-bold text-primary dark:text-primary-light">
                    {selectedInvoice.total.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <div className="xl:w-72">
                <h3 className="font-bold mb-4 dark:text-white text-lg">Menu nhanh (POS)</h3>
                <div className="space-y-3">
                  {mockProducts.slice(0, 5).map(p => (
                    <button key={p.id} className="w-full flex justify-between items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 rounded-xl transition-all shadow-sm hover:shadow-md">
                      <div className="text-left">
                        <p className="text-sm font-medium dark:text-white">{p.name}</p>
                        <p className="text-xs text-primary">{p.price.toLocaleString()}đ</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Plus size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Chọn một hóa đơn để xem chi tiết
          </div>
        )}
      </div>
    </div>
  )
}
