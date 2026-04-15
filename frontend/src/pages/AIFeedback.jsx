import { Sparkles, TrendingUp, ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, Zap } from 'lucide-react'

const mockReviews = [
  { id: 1, customer: 'Nguyễn Văn A', text: 'Phòng VIP 102 âm thanh cực kỳ xịn, hát rất nhẹ. Đồ ăn ra hơi chậm một chút nhưng các bạn phục vụ rất ngoan và nhiệt tình.', sentiment: 'POSITIVE', tags: ['Âm thanh (Tốt)', 'Phục vụ (Tốt)', 'Đồ ăn (Chậm)'] },
  { id: 2, customer: 'Trần Thị B', text: 'Hôm qua đặt phòng 202 mà lúc nhận phòng có mùi thuốc lá hơi nồng. Micro bên mép trái thỉnh thoảng bị rè khúc cao trào.', sentiment: 'NEGATIVE', tags: ['Không gian (Mùi)', 'Thiết bị (Rè)'] },
  { id: 3, customer: 'Lê Văn C', text: 'Giá cả hợp lý, không gian sạch sẽ. Nhưng menu đồ uống hơi ít sự lựa chọn, đa số là bia.', sentiment: 'NEUTRAL', tags: ['Giá cả (Tốt)', 'Menu (Hạn chế)'] },
  { id: 4, customer: 'Khách vãng lai', text: 'Quán thiết kế đẹp siêu thực. Ánh sáng cảm biến theo nhạc đánh rất lực, chắc chắn sẽ quay lại làm khách ruột!', sentiment: 'POSITIVE', tags: ['Không gian (Tuyệt vời)', 'Ánh sáng (Chất lượng)'] },
]

const aiInsights = [
  { id: 1, type: 'WARNING', issue: 'Tốc độ ra món (Khung 20h-22h)', desc: 'AI phân tích từ 45 đánh giá gần nhất cho thấy phàn nàn về đồ ăn ra chậm tăng đột biến 12%. Đề xuất tăng cường bếp phụ vào cuối tuần.' },
  { id: 2, type: 'DANGER', issue: 'Tình trạng thiết bị (Phòng 202)', desc: 'Phát hiện 3 phản ánh liên tiếp tuần qua về Micro bị rè và nhiễu sóng tại phòng 202. Cần kỹ thuật viên thay thế ngay.' },
  { id: 3, type: 'SUCCESS', issue: 'Mức độ hài lòng Âm thanh', desc: '92% feedback tích cực liên quan đến dàn Loa và Mix. Đây là lợi thế cạnh tranh cốt lõi, nên đẩy mạnh trên các bài post Marketing.' }
]

export default function AIFeedback() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-violet-600 to-primary rounded-3xl p-6 text-white shadow-lg shadow-violet-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-yellow-300" size={24} />
            <h1 className="text-2xl font-display font-bold">AI Customer Insights</h1>
          </div>
          <p className="text-white/80">Trí tuệ nhân tạo tổng hợp và phân tích cảm xúc từ hàng ngàn feedback của khách hàng.</p>
        </div>
        <div className="flex bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md items-center gap-4">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider font-bold text-white/70">Điểm hài lòng</div>
            <div className="text-3xl font-display font-bold">4.8<span className="text-lg opacity-70">/5</span></div>
          </div>
          <TrendingUp size={36} className="text-yellow-300 opacity-90" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Chỉ số Cảm xúc (Tuần qua)</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-2 font-medium text-green-600 dark:text-green-500"><ThumbsUp size={16}/> Tích cực</span>
                  <span className="font-bold">78%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-2 font-medium text-amber-500 dark:text-amber-500"><MessageSquare size={16}/> Trung lập</span>
                  <span className="font-bold">15%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-2 font-medium text-red-500 dark:text-red-400"><ThumbsDown size={16}/> Tiêu cực</span>
                  <span className="font-bold">7%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> Đề xuất hành động từ AI
            </h3>
            <div className="space-y-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className={`p-4 rounded-xl border ${
                  insight.type === 'DANGER' ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 
                  insight.type === 'WARNING' ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20' :
                  'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20'
                }`}>
                  <h4 className={`font-bold text-sm mb-1 flex items-center gap-1.5 ${
                    insight.type === 'DANGER' ? 'text-red-700 dark:text-red-400' : 
                    insight.type === 'WARNING' ? 'text-orange-700 dark:text-orange-400' :
                    'text-green-700 dark:text-green-400'
                  }`}>
                    {insight.type === 'DANGER' ? <AlertTriangle size={14} /> : null}
                    {insight.issue}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{insight.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Feedback Bóc tách bởi AI</h3>
            <div className="flex gap-2">
              <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-1 outline-none text-slate-700 dark:text-slate-300">
                <option>Mới nhất</option>
                <option>Chỉ Tiêu Cực</option>
                <option>Chỉ Tích Cực</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {mockReviews.map(review => (
              <div key={review.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm transition-hover hover:border-violet-300 dark:hover:border-violet-500/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-slate-900 dark:text-white">{review.customer}</div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                    review.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                    review.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'
                  }`}>
                    {review.sentiment === 'POSITIVE' ? 'Tích cực' : review.sentiment === 'NEGATIVE' ? 'Tiêu cực' : 'Trung lập'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 italic">"{review.text}"</p>
                
                <div className="flex gap-2 flex-wrap">
                  {review.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md flex items-center gap-1">
                      <Sparkles size={10} className="text-violet-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
