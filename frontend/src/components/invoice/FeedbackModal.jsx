import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, MessageSquare, X } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, onSubmit, invoiceId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !document.getElementById('main-layout')) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit({ invoiceId, rating, comment });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="absolute inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative z-10">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white">Đánh giá dịch vụ</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-center">
          <div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Trải nghiệm của khách hàng như thế nào?</h4>
            <p className="text-sm text-slate-500 mb-4">Xin hãy chọn mức đánh giá</p>
            <div className="flex justify-center gap-1">
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="half-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="relative group cursor-pointer">
                  {/* Left half for 0.5 */}
                  <div 
                    className="absolute left-0 top-0 w-1/2 h-full z-10" 
                    onClick={() => setRating(star - 0.5)}
                  />
                  {/* Right half for 1.0 */}
                  <div 
                    className="absolute right-0 top-0 w-1/2 h-full z-10" 
                    onClick={() => setRating(star)}
                  />
                  <Star
                    size={40}
                    className={`${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : (star - 0.5 === rating)
                          ? 'text-yellow-400' 
                          : 'text-slate-300 dark:text-slate-700'
                    }`}
                    style={star - 0.5 === rating ? { fill: 'url(#half-star-gradient)' } : {}}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm font-bold text-primary h-5">
              {rating === 0.5 && 'Rất tệ (0.5)'}
              {rating === 1 && 'Rất tệ (1.0)'}
              {rating === 1.5 && 'Tệ (1.5)'}
              {rating === 2 && 'Tệ (2.0)'}
              {rating === 2.5 && 'Trung bình (2.5)'}
              {rating === 3 && 'Bình thường (3.0)'}
              {rating === 3.5 && 'Khá (3.5)'}
              {rating === 4 && 'Tốt (4.0)'}
              {rating === 4.5 && 'Rất tốt (4.5)'}
              {rating === 5 && 'Tuyệt vời (5.0)'}
            </div>
          </div>

          <div className="text-left">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lời nhắn / Góp ý (Không bắt buộc)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-24"
              placeholder="Chia sẻ trải nghiệm..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Bỏ qua
          </button>
          <button 
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-1 py-2.5 font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-lg shadow-primary/30 disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Lưu đánh giá'}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('main-layout')
  );
}
