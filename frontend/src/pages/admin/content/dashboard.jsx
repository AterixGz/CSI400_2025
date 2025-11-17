import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FileText, CreditCard, BookOpen, Image, Eye, Users, ChevronDown, Plus, TrendingUp, Package } from 'lucide-react';
import Header from '../component/header';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: {},
    monthlyActivity: [],
    categories: [],
    topProducts: [],
    lowStockProducts: []
  });

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!user || user.role_name !== "manager") {
      navigate("/profile");
    }
  }, [user, navigate]);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const intervalId = setInterval(fetchDashboard, 30000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  const { stats, monthlyActivity, categories, topProducts, lowStockProducts } = data;

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  const categoryData = (categories || []).map((cat, i) => ({
    name: cat.name,
    value: Number(cat.total_sales),
    color: colors[i % colors.length]
  }));

  const sizeColors = {
    S: '#21c8dbff',
    M: '#10B981',
    L: '#F59E0B',
    FreeSize: '#EF4444',
    'Freesize': '#EF4444',
    XL: '#8B5CF6',
    XXL: '#EC4899'
  };

  const lowStockData = (data.lowStockProducts || []).map(item => ({
    ...item,
    stock: Number(item.stock),
    displayName: `${item.product_name} (${item.size_name})`,
    color: sizeColors[item.size_name] || '#6cbe28ff'
  }));

  const statCards = [
    { 
      icon: Users, 
      value: stats?.total_users || 0, 
      label: 'Total Users', 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      icon: FileText, 
      value: stats?.total_products || 0, 
      label: 'Total Products', 
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-100',
      iconColor: 'text-green-600'
    },
    { 
      icon: BookOpen, 
      value: stats?.total_categories || 0, 
      label: 'Categories', 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconColor: 'text-purple-600'
    },
    { 
      icon: Package, 
      value: stats?.out_of_stock_sizes || 0, 
      label: 'Out of Stock', 
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-100',
      iconColor: 'text-red-600'
    },
    { 
      icon: Eye, 
      value: stats?.total_visitors || 0, 
      label: 'Total Visitors', 
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-100',
      iconColor: 'text-amber-600'
    }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header />

      <main className="flex-1 p-6 overflow-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-blue-100">Welcome back! Here's what's happening with your store today.</p>
            </div>
            <TrendingUp className="w-16 h-16 opacity-50" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Sales Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full"></div>
                Monthly Sales
              </h3>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Trend
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyActivity}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    formatter={(value) => <span style={{ color: '#0cac9cff', fontWeight: '600' }}>฿{new Intl.NumberFormat('th-TH').format(Math.round(value))}</span>}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_sales" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categories Distribution Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full"></div>
                Categories Distribution
              </h3>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Sales
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#38882aff"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    formatter={(value) => <span style={{ color: '#059669', fontWeight: '600' }}>฿{new Intl.NumberFormat('th-TH').format(Math.round(value))}</span>}
                    labelFormatter={(label) => `Category: ${label}`}
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="value" radius={[8,8,0,0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-green-600 rounded-full"></div>
                Top 5 Best Selling
              </h3>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                Popular
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    allowDecimals={false}
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    formatter={(value) => value}
                    labelFormatter={(label) => `Product: ${label}`}
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="total_sold" fill="#6cbe28ff" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
  
          {/* Low Stock Products Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full"></div>
                Low Stock Alert
              </h3>
              <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                ⚠️ Warning
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lowStockData}>
                  <XAxis 
                    dataKey="displayName"
                    stroke="#9CA3AF"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    allowDecimals={false}
                    domain={[0, 'auto']}
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const { product_name, size_name, stock } = payload[0].payload;
                        return (
                          <div style={{ 
                            background: 'white', 
                            border: '1px solid #E5E7EB', 
                            padding: '12px 16px', 
                            borderRadius: '12px', 
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                          }}>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{product_name}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Size: {size_name}</p>
                            <p style={{ 
                              margin: '4px 0 0 0', 
                              color: stock < 2 ? '#DC2626' : '#F59E0B', 
                              fontWeight: '600',
                              fontSize: '13px'
                            }}>
                              คงเหลือ: {stock} ชิ้น
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="stock" radius={[8,8,0,0]} minPointSize={4}>
                    {lowStockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;