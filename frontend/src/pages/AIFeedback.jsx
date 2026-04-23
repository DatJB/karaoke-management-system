import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, Zap, Loader2, Calendar } from 'lucide-react'
import { getAiDashboard } from '../api/aiApi'

export default function AIFeedback() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = {}
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await getAiDashboard(params)
      setData(response)
    } catch (error) {
      console.error('Failed to fetch AI dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  const score = data?.satisfactionScore || 0;
  const positive = data?.sentimentIndex?.positivePercent || 0;
  const neutral = data?.sentimentIndex?.neutralPercent || 0;
  const negative = data?.sentimentIndex?.negativePercent || 0;
  const insights = data?.actionableInsights || [];
  const feedbacks = data?.liveFeedbacks?.content || [];

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
            <div className="text-3xl font-display font-bold">{score}<span className="text-lg opacity-70">/5</span></div>
          </div>
          <TrendingUp size={36} className="text-yellow-300 opacity-90" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
          <Calendar size={18} />
          <span>Thời gian phân tích:</span>
        </div>
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm text-slate-700 dark:text-slate-300"
        />
        <span className="text-slate-400">-</span>
        <input 
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm text-slate-700 dark:text-slate-300"
        />
        <button 
          onClick={fetchData}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-primary/20 transition-all active:scale-95"
        >
          Lọc dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Chỉ số Cảm xúc (Tuần qua)</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-2 font-medium text-green-600 dark:text-green-500"><ThumbsUp size={16}/> Tích cực</span>
                  <span className="font-bold">{positive}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${positive}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-2 font-medium text-amber-500 dark:text-amber-500"><MessageSquare size={16}/> Trung lập</span>
                  <span className="font-bold">{neutral}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${neutral}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-2 font-medium text-red-500 dark:text-red-400"><ThumbsDown size={16}/> Tiêu cực</span>
                  <span className="font-bold">{negative}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${negative}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> Đề xuất hành động từ AI
            </h3>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className={`p-4 rounded-xl border ${
                  insight.severityLevel === 'HIGH' ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 
                  insight.severityLevel === 'MEDIUM' ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20' :
                  'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20'
                }`}>
                  <h4 className={`font-bold text-sm mb-1 flex items-center gap-1.5 ${
                    insight.severityLevel === 'HIGH' ? 'text-red-700 dark:text-red-400' : 
                    insight.severityLevel === 'MEDIUM' ? 'text-orange-700 dark:text-orange-400' :
                    'text-green-700 dark:text-green-400'
                  }`}>
                    {insight.severityLevel === 'HIGH' ? <AlertTriangle size={14} /> : null}
                    {insight.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{insight.content}</p>
                </div>
              ))}
              {insights.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm">
                  Chưa có phân tích nào từ AI.
                </div>
              )}
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
            {feedbacks.map(review => (
              <div key={review.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm transition-hover hover:border-violet-300 dark:hover:border-violet-500/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-slate-900 dark:text-white">{review.customerName}</div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                    review.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                    review.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'
                  }`}>
                    {review.sentiment === 'POSITIVE' ? 'Tích cực' : review.sentiment === 'NEGATIVE' ? 'Tiêu cực' : 'Trung lập'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 italic">"{review.comment}"</p>
                
                <div className="flex gap-2 flex-wrap">
                  {(review.tags || []).map((tag, idx) => (
                    <span key={idx} className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md flex items-center gap-1">
                      <Sparkles size={10} className="text-violet-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                Chưa có phản hồi nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
