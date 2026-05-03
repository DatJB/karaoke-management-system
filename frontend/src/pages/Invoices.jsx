import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInvoices, getInvoiceDetail, confirmPayment } from '../api/invoiceApi';
import { checkoutAllRooms } from '../api/bookingApi';
import { Receipt, Search, Plus, Calendar, Filter, User, Phone, Hash, Clock, CreditCard, CheckCircle2, AlertCircle, ChevronRight, Loader2, Printer, MessageSquare } from 'lucide-react';
import ConfirmModal from '../components/common/ConfirmModal';
import FeedbackModal from '../components/invoice/FeedbackModal';
import { submitFeedback } from '../api/feedbackApi';
import toast from 'react-hot-toast';

export default function Invoices() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [justPaidInvoiceId, setJustPaidInvoiceId] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices({
        page,
        size: 15,
        keyword: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        date: dateFilter || undefined
      });
      setInvoices(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, dateFilter]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 0) fetchInvoices();
      else setPage(0);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectInvoice = async (invoice) => {
    setSelectedInvoice(invoice);
    setSelectedInvoiceDetail(null); // Reset detail while loading new one
    try {
      setLoadingDetail(true);
      const detail = await getInvoiceDetail(invoice.invoiceId);
      setSelectedInvoiceDetail(detail);
    } catch (err) {
      console.error('Failed to fetch invoice detail:', err);
      alert('Không thể tải chi tiết hóa đơn.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedInvoiceDetail) return;
    try {
      setLoadingDetail(true);
      await confirmPayment(selectedInvoiceDetail.invoiceId);
      // Refresh detail and list
      const updated = await getInvoiceDetail(selectedInvoiceDetail.invoiceId);
      setSelectedInvoiceDetail(updated);
      fetchInvoices();
      toast.success('Đã thanh toán hóa đơn thành công!');

      setJustPaidInvoiceId(updated.invoiceId);
      setShowFeedback(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán');
    } finally {
      setLoadingDetail(false);
      setShowConfirm(false);
    }
  };

  const handleFeedbackSubmit = async (data) => {
    try {
      await submitFeedback(data);
      toast.success('Cảm ơn bạn đã gửi đánh giá!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu đánh giá');
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'bg-green-500 text-white';
      case 'UNPAID': return 'bg-orange-500 text-white';
      case 'CANCEL': return 'bg-red-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return 'Đã thanh toán';
      case 'UNPAID': return 'Chưa thanh toán';
      case 'CANCEL': return 'Đã hủy';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0';
    return Number(amount).toLocaleString('vi-VN');
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">

      {/* Left Column: Invoice List */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Quản lý Hóa đơn</h2>
            <Receipt size={24} className="text-primary opacity-50" />
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm khách hàng, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-600 dark:text-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm text-slate-500 font-medium">Đang tìm hóa đơn...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-500 font-medium italic">Không tìm thấy kết quả</p>
            </div>
          ) : invoices.map(invoice => (
            <button
              key={invoice.invoiceId}
              onClick={() => handleSelectInvoice(invoice)}
              className={`w-full p-4 rounded-3xl transition-all border-2 flex flex-col text-left group relative hover:scale-[1.02] ${selectedInvoice?.invoiceId === invoice.invoiceId
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-transparent bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">#{invoice.invoiceId}</span>
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{invoice.roomNames}</span>
                </div>
                <span className={`text-[9px] px-2 py-1 rounded-lg font-bold tracking-wider uppercase ${getStatusColor(invoice.status)}`}>
                  {getStatusLabel(invoice.status)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
                <User size={12} /> {invoice.customerName || 'Khách lẻ'}
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <Calendar size={12} /> {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
              </div>

              <div className="flex items-center justify-between mt-auto">
                {/* Chevron removed */}
              </div>
            </button>
          ))}
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

      {/* Right Column */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden overflow-y-auto custom-scrollbar">
        {loadingDetail ? (
          <div className="absolute inset-0 z-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="font-bold text-slate-600 dark:text-slate-400">Đang tải chi tiết...</p>
            </div>
          </div>
        ) : null}

        {(!selectedInvoiceDetail && !loadingDetail) ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Receipt size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">Chưa chọn hóa đơn</h3>
            <p className="max-w-xs text-sm">Vui lòng chọn một hóa đơn từ danh sách bên trái để xem chi tiết thanh toán.</p>
          </div>
        ) : selectedInvoiceDetail && (
          <>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Chi tiết Hóa đơn</h2>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(selectedInvoiceDetail.status)}`}>
                      {getStatusLabel(selectedInvoiceDetail.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Mã giao dịch: <span className="text-primary font-bold">#BK-{selectedInvoiceDetail.bookingId} - HĐ-{selectedInvoiceDetail.invoiceId}</span></p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all shadow-sm">
                    <Printer size={16} /> In Hóa đơn
                  </button>
                  {selectedInvoiceDetail.status === 'UNPAID' && (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
                    >
                      <CreditCard size={16} /> Thanh toán
                    </button>
                  )}
                  {selectedInvoiceDetail.status === 'PAID' && (
                    <button
                      onClick={() => { setJustPaidInvoiceId(selectedInvoiceDetail.invoiceId); setShowFeedback(true); }}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-yellow-500/25 hover:scale-105 active:scale-95"
                    >
                      <MessageSquare size={16} /> Đánh giá
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-50 dark:border-slate-800">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Khách hàng</p>
                    <p className={`text-sm ${selectedInvoiceDetail.customerName ? 'font-bold text-slate-900 dark:text-white' : 'italic font-normal text-slate-400'}`}>
                      {selectedInvoiceDetail.customerName || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-50 dark:border-slate-800">
                  <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Số điện thoại</p>
                    <p className={`text-sm ${selectedInvoiceDetail.customerPhone ? 'font-bold text-slate-900 dark:text-white' : 'italic font-normal text-slate-400'}`}>
                      {selectedInvoiceDetail.customerPhone || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-50 dark:border-slate-800">
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center shrink-0">
                    <Hash size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">CCCD/CMND</p>
                    <p className={`text-sm font-mono ${selectedInvoiceDetail.customerIdentity ? 'font-bold text-slate-900 dark:text-white' : 'italic font-normal text-slate-400'}`}>
                      {selectedInvoiceDetail.customerIdentity || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Chi phí hát (Phòng)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedInvoiceDetail.roomDetails?.map((room, idx) => (
                    <div key={idx} className="group border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                      <div className="flex justify-between items-start relative z-10 mb-3">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{room.roomName}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{room.roomType || 'Phòng Karaoke'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(room.totalAmount)}đ</p>
                          <p className="text-[9px] font-bold text-slate-400">TỔNG PHÒNG</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-50 dark:border-slate-800 pt-3 relative z-10">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1.5"><Clock size={12} /> Thời gian:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{room.hoursUsed || 0} giờ</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={12} /> Vào:</span>
                          <span className="font-medium text-slate-600 dark:text-slate-400">{room.checkinTime ? new Date(room.checkinTime).toLocaleString('vi-VN') : '—'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1.5"><Clock size={12} /> Ra:</span>
                          <span className="font-medium text-slate-600 dark:text-slate-400">{room.checkoutTime ? new Date(room.checkoutTime).toLocaleString('vi-VN') : '—'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1.5"><CreditCard size={12} /> Đơn giá:</span>
                          <span className="font-bold text-primary">{formatCurrency(room.pricePerHour)}đ / giờ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-purple-500 rounded-full" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Dịch vụ & Sản phẩm</h3>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Sản phẩm / Dịch vụ</th>
                        <th className="px-5 py-3">Phòng</th>
                        <th className="px-5 py-3 text-center">SL</th>
                        <th className="px-5 py-3 text-right">Đơn giá</th>
                        <th className="px-5 py-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                      {!selectedInvoiceDetail.itemDetails || selectedInvoiceDetail.itemDetails.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic">Không có dịch vụ đi kèm</td>
                        </tr>
                      ) : selectedInvoiceDetail.itemDetails.map((item, i) => (
                        <tr key={i} className="hover:bg-white dark:hover:bg-slate-800 transition-colors group">
                          <td className="px-5 py-3">
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{item.productName}</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase">{item.itemCategory || 'Sản phẩm'}</div>
                          </td>
                          <td className="px-5 py-3 text-slate-500 font-medium">{item.roomName || '—'}</td>
                          <td className="px-5 py-3 text-center font-bold text-slate-700 dark:text-slate-300">x{item.quantity}</td>
                          <td className="px-5 py-3 text-right font-medium text-slate-600 dark:text-slate-400">{formatCurrency(item.unitPrice)}đ</td>
                          <td className="px-5 py-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(item.totalAmount)}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mt-8 flex flex-col md:flex-row justify-end border-t-2 border-slate-900 dark:border-slate-100 pt-6 pb-8 gap-6">
                <div className="flex flex-col gap-2 min-w-[300px]">
                  <div className="flex justify-between items-center text-slate-500 font-medium text-xs">
                    <span>Tiền phòng:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedInvoiceDetail.totalRoomPrice)}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 font-medium text-xs">
                    <span>Tiền dịch vụ:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedInvoiceDetail.totalServicePrice)}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 font-medium text-xs">
                    <span>Giảm giá:</span>
                    <span className="font-bold text-red-500">-{formatCurrency(selectedInvoiceDetail.discount)}đ</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Tổng cộng thanh toán</span>
                      <div className="flex items-center gap-1.5">
                        {selectedInvoiceDetail.status === 'PAID' ? <CheckCircle2 className="text-green-500" size={20} /> : <AlertCircle className="text-orange-500 animate-pulse" size={20} />}
                        <span className="text-2xl font-display font-black text-slate-900 dark:text-white">
                          {formatCurrency(selectedInvoiceDetail.totalPrice)}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCheckout}
        title="Xác nhận thanh toán"
        message="Bạn có chắc chắn muốn thanh toán toàn bộ các phòng trong hóa đơn này không? Thao tác này không thể hoàn tác."
        confirmText="Thanh toán ngay"
        type="primary"
      />

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
        invoiceId={justPaidInvoiceId}
      />
    </div>
  );
}
