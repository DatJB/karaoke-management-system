import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, Zap, Loader2, Calendar, ChevronLeft, ChevronRight, Star, X } from 'lucide-react'
import { getAiDashboard, getWeeklyReport, generateAiReport } from '../api/aiApi'
import toast from 'react-hot-toast'

export default function AIFeedback() {
  const getISOWeekString = (inputDate) => {
    const d = new Date(inputDate);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  const getCurrentWeek = () => getISOWeekString(new Date());

  const getDatesOfWeek = (weekStr) => {
    if (!weekStr) return [];
    const [year, week] = weekStr.split('-W').map(Number);
    const jan4 = new Date(year, 0, 4);
    const dayOfJan4 = jan4.getDay() || 7;
    const mondayOfWeek1 = new Date(year, 0, 4 - dayOfJan4 + 1);
    const targetMonday = new Date(mondayOfWeek1.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(targetMonday.getTime() + i * 24 * 60 * 60 * 1000));
    }
    return days;
  };

  const formatDateString = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek())
  const [selectedDayIndex, setSelectedDayIndex] = useState(-1) // -1 is all week
  const [sortBy, setSortBy] = useState('LATEST')
  const [page, setPage] = useState(0)
  const [weeklyData, setWeeklyData] = useState(null)

  const [showAggregator, setShowAggregator] = useState(false)
  const [aggType, setAggType] = useState('DAY') // 'DAY' | 'WEEK'
  const [aggDate, setAggDate] = useState(formatDateString(new Date()))
  const [aggWeek, setAggWeek] = useState(getCurrentWeek())
  const [aggregating, setAggregating] = useState(false)

  const handleAggregate = async () => {
    try {
      setAggregating(true)
      
      let dateParam = ""
      if (aggType === 'DAY') {
        dateParam = aggDate
      } else {
        const dates = getDatesOfWeek(aggWeek)
        if (dates.length > 0) {
          dateParam = formatDateString(dates[0]) // Monday of the selected week
        } else {
          toast.error("Tuần không hợp lệ")
          setAggregating(false)
          return
        }
      }

      const toastId = toast.loading("Đang tổng hợp dữ liệu AI, vui lòng chờ giây lát...")
      
      await generateAiReport(aggType, dateParam)
      
      toast.success("Tổng hợp dữ liệu thành công!", { id: toastId })
      setShowAggregator(false)

      if (aggType === 'WEEK') {
        setSelectedWeek(aggWeek);
        setSelectedDayIndex(-1);
      } else if (aggType === 'DAY') {
        const aggDateObj = new Date(aggDate);
        const calculatedWeekStr = getISOWeekString(aggDateObj);
        setSelectedWeek(calculatedWeekStr);
        
        const weekDates = getDatesOfWeek(calculatedWeekStr);
        const targetDateStr = formatDateString(aggDateObj);
        const dayIdx = weekDates.findIndex(d => formatDateString(d) === targetDateStr);
        setSelectedDayIndex(dayIdx);
      }
      
      fetchData() // Refresh dashboard data
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data || "Không có phản hồi nào trong thời gian này để tổng hợp hoặc có lỗi xảy ra.")
    } finally {
      setAggregating(false)
    }
  }

  const weekDays = getDatesOfWeek(selectedWeek);

  const navigateWeek = (direction) => {
    if (weekDays.length === 0) return;
    const targetDate = new Date(weekDays[0].getTime() + direction * 7 * 24 * 60 * 60 * 1000);
    setSelectedWeek(getISOWeekString(targetDate));
    setSelectedDayIndex(-1);
  };

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        size: 10,
        sortBy: 'LATEST', // Default sort
        sentiment: sortBy // We use the sortBy state to store sentiment filter
      }
      if (weekDays.length === 7) {
        if (selectedDayIndex >= 0) {
          const selectedDateStr = formatDateString(weekDays[selectedDayIndex]);
          params.startDate = selectedDateStr;
          params.endDate = selectedDateStr;
        } else {
          params.startDate = formatDateString(weekDays[0]);
          params.endDate = formatDateString(weekDays[6]);
        }
      }
      
      const response = await getAiDashboard(params)
      setData(response)

      // Fetch weekly specific data
      if (selectedDayIndex === -1 && selectedWeek) {
        const [year, week] = selectedWeek.split('-W').map(Number);
        try {
          const wData = await getWeeklyReport(week, year);
          setWeeklyData(wData);
        } catch (e) {
          // If not found, just set to null silently
          setWeeklyData(null);
        }
      } else {
        setWeeklyData(null);
      }
    } catch (error) {
      console.error('Failed to fetch AI dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedWeek, selectedDayIndex, sortBy, page])

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

      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium shrink-0">
            <Calendar size={18} />
            <span>Chọn tuần phân tích:</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => navigateWeek(-1)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 cursor-pointer">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mr-2 min-w-[110px] text-center pointer-events-none">
                Tuần {selectedWeek.split('-W')[1]}, {selectedWeek.split('-W')[0]}
              </span>
              <Calendar size={16} className="text-slate-400 pointer-events-none" />
              <input 
                type="week" 
                value={selectedWeek}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedWeek(e.target.value);
                    setSelectedDayIndex(-1);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <button 
              onClick={() => navigateWeek(1)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        {weekDays.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSelectedDayIndex(-1)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedDayIndex === -1 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Cả tuần
            </button>
            {weekDays.map((d, index) => {
              const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
              const isSelected = selectedDayIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all flex flex-col items-center min-w-[64px] ${
                    isSelected 
                      ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20 font-bold' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-medium'
                  }`}
                >
                  <span>{dayNames[index]}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-violet-100' : 'text-slate-400'}`}>
                    {String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Weekly Summary Strategy is moved down to the suggestions spot in Full Week mode */}


          <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Chỉ số Cảm xúc</h3>
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

          {selectedDayIndex === -1 ? (
            /* ── Weekly Report (In place of Suggestions) ── */
            <>
              {weeklyData ? (
                <div className="glass-card border-none bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-3xl text-white animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-300" /> Tóm tắt chiến lược tuần
                  </h3>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mb-4">
                    <p className="text-sm leading-relaxed italic opacity-90">"{weeklyData.topIssuesSummary}"</p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wider font-bold text-white/60 mb-2">Kế hoạch hành động tuần:</div>
                    {(weeklyData.weeklyActionPlan || []).map((plan, idx) => (
                      <div key={idx} className="flex gap-3 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </div>
                        <span>{plan}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !loading && (
                <div className="glass-card border-none bg-white/50 dark:bg-slate-800/50 p-10 rounded-3xl text-center">
                  <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">Chưa có báo cáo tổng hợp cho tuần này.</p>
                </div>
              )}
            </>
          ) : (
            /* ── AI Insights / Suggestions (Daily mode) ── */
            <div className="glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" /> Đề xuất hành động từ AI
              </h3>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {insights.map((insight) => {
                  const getStyles = (level) => {
                    switch (level?.toUpperCase()) {
                      case 'CRITICAL':
                        return 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400';
                      case 'HIGH':
                        return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400';
                      case 'MEDIUM':
                        return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400';
                      default: // LOW
                        return 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400';
                    }
                  };
                  
                  const styleClasses = getStyles(insight.severityLevel).split(' ');
                  const bgBorder = styleClasses.slice(0, 3).join(' ');
                  const textColor = styleClasses.slice(3).join(' ');
                  
                  return (
                    <div key={insight.id} className={`p-4 rounded-xl border ${bgBorder}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-bold text-sm flex items-center gap-1.5 ${textColor}`}>
                          {['HIGH', 'CRITICAL'].includes(insight.severityLevel?.toUpperCase()) && <AlertTriangle size={14} />}
                          {insight.title}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${bgBorder} ${textColor} border-current/20`}>
                          {insight.severityLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{insight.content}</p>
                      {insight.solution && (
                        <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Giải pháp đề xuất:</div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{insight.solution}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                {insights.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    Chưa có phân tích nào từ AI.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass-card border-none bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Feedback Bóc tách bởi AI</h3>
            <div className="flex gap-2">
              <select 
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-1 outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="LATEST">Mới nhất</option>
                <option value="POSITIVE">Chỉ Tích Cực</option>
                <option value="NEUTRAL">Chỉ Trung Lập</option>
                <option value="NEGATIVE">Chỉ Tiêu Cực</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {feedbacks.map(review => (
              <div key={review.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm transition-hover hover:border-violet-300 dark:hover:border-violet-500/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {review.customerName}
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded text-xs text-amber-600">
                        <Star size={12} fill="currentColor" /> {review.rating || 0}
                      </div>
                      {review.sentimentScore !== null && (
                        <div className={`text-xs px-2 py-1 rounded font-bold font-mono ${
                          review.sentiment === 'POSITIVE' ? 'bg-green-50 text-green-600 dark:bg-green-500/10' : 
                          review.sentiment === 'NEGATIVE' ? 'bg-red-50 text-red-600 dark:bg-red-500/10' : 
                          'bg-slate-50 text-slate-600 dark:bg-slate-500/10'
                        }`}>
                          Score: {Number(review.sentimentScore).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
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
                  {(review.extractedTags || review.extracted_tag || review.tags || []).map((tag, idx) => {
                    const tagText = typeof tag === 'object' ? (tag.extractedTag || tag.extracted_tag || tag.tagName) : tag;
                    return (
                      <span key={idx} className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md flex items-center gap-1">
                        <Sparkles size={10} className="text-violet-500" />
                        {tagText}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                Chưa có phản hồi nào.
              </div>
            )}

            {/* Pagination */}
            {data?.liveFeedbacks?.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(prev => prev - 1)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  Trang {page + 1} / {data?.liveFeedbacks?.totalPages}
                </span>
                <button
                  disabled={page >= data?.liveFeedbacks?.totalPages - 1}
                  onClick={() => setPage(prev => prev + 1)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-200 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Aggregation Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {showAggregator && (
          <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tổng hợp phản hồi AI</h4>
                <p className="text-[11px] text-slate-400">Yêu cầu AI phân tích dữ liệu mới</p>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 mb-4">
              <button
                type="button"
                onClick={() => setAggType('DAY')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  aggType === 'DAY'
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Theo Ngày
              </button>
              <button
                type="button"
                onClick={() => setAggType('WEEK')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  aggType === 'WEEK'
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Theo Tuần
              </button>
            </div>

            <div className="mb-6">
              {aggType === 'DAY' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn ngày phân tích</label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={aggDate}
                      onChange={(e) => setAggDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn tuần phân tích</label>
                  <div className="relative flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus-within:ring-2 focus-within:ring-primary/50 min-h-[42px] cursor-pointer">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 pointer-events-none">
                      Tuần {aggWeek.split('-W')[1]}, {aggWeek.split('-W')[0]}
                    </span>
                    <Calendar size={16} className="text-slate-400 pointer-events-none" />
                    <input 
                      type="week"
                      value={aggWeek}
                      onChange={(e) => {
                        if (e.target.value) {
                          setAggWeek(e.target.value);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAggregator(false)}
                disabled={aggregating}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAggregate}
                disabled={aggregating}
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {aggregating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Đang tổng hợp...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Bắt đầu tổng hợp
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowAggregator(!showAggregator)}
          className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-violet-600 to-primary text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-105 active:scale-95 ${
            showAggregator ? 'rotate-90 bg-slate-600 dark:bg-slate-700' : ''
          }`}
          title="Tổng hợp feedback bằng AI"
        >
          {showAggregator ? (
            <X size={24} className="transition-transform duration-300" />
          ) : (
            <Sparkles className={aggregating ? "animate-spin" : ""} size={24} />
          )}
        </button>
      </div>
    </div>
  )
}
