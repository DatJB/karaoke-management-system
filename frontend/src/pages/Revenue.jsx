import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Calendar, Users, 
  ArrowUpRight, ArrowDownRight, Filter, Download, 
  Loader2, Wallet, Receipt
} from 'lucide-react';
import { getRevenueStats } from '../api/statisticsApi';
import { toast } from 'react-hot-toast';

export default function Revenue() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('chart');

  useEffect(() => {
    fetchStats();
  }, [selectedYear]);

  const fetchStats = async () => {
    if (!selectedYear || isNaN(selectedYear) || selectedYear < 1000 || selectedYear > 9999) return;
    try {
      setLoading(true);
      const data = await getRevenueStats(selectedYear);
      setStats(data);
    } catch (err) {
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', currencyDisplay: 'code' }).format(value);
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const chartData = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const monthData = stats?.monthlyData?.find(d => d.month === monthNum);
    return {
      name,
      revenue: monthData?.revenue || 0,
      bookings: monthData?.bookingCount || 0
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl">
          <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Doanh thu: {formatCurrency(payload[0].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-slate-500 font-medium animate-pulse">Đang tổng hợp dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Thống kê Doanh thu</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Báo cáo chi tiết tình hình tài chính theo năm {selectedYear}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Calendar className="text-slate-400 mr-2" size={18} />
            <span className="text-slate-700 dark:text-slate-200 font-bold mr-2">Năm</span>
            <input 
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              placeholder="YYYY"
              className="bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-200 w-16 p-0 focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng Doanh Thu</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(stats?.totalRevenue || 0)}
            </h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-3xl" />
        </div>

        <div className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
              <Receipt size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng Đơn Đặt</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats?.totalBookings || 0} <span className="text-sm font-medium text-slate-400">đơn</span>
            </h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-3xl" />
        </div>

        <div className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng Khách Hàng</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats?.totalCustomers || 0} <span className="text-sm font-medium text-slate-400">người</span>
            </h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-3xl" />
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('chart')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'chart' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              Biểu đồ doanh thu
            </button>
            <button 
              onClick={() => setActiveTab('table')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'table' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              Bảng chi tiết
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              Doanh thu
            </div>
          </div>
        </div>

        {activeTab === 'chart' ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Tháng</th>
                  <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right">Doanh thu</th>
                  <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right">Đơn đặt</th>
                  <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center">Tỉ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {chartData.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="py-4 font-bold text-primary text-right">{formatCurrency(row.revenue)}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-400 font-medium text-right">{row.bookings} đơn</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 justify-end">
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${stats?.totalRevenue > 0 ? (row.revenue / stats.totalRevenue) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 min-w-[40px]">
                          {stats?.totalRevenue > 0 ? ((row.revenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
