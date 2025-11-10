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
import { FileText, CreditCard, BookOpen, Image, Eye, Users, ChevronDown, Plus } from 'lucide-react';
import Header from '../component/header';

// ...existing imports...

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: {},
    monthlyActivity: [],
    categories: [],
    topProducts: [],
    lowStockProducts: []
  });
  

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
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="flex-1 flex items-center justify-center text-red-500">Error: {error}</div>;

  const { stats, monthlyActivity, categories, topProducts, lowStockProducts } = data;

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const categoryData = (categories || []).map((cat, i) => ({
  name: cat.name,
  value: Number(cat.total_sales), // ยอดขายรวม
  color: colors[i % colors.length]
}));


  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 p-4 overflow-hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.total_users || 0}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.total_products || 0}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.total_categories || 0}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Image className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.out_of_stock_products || 0}</div>
            <div className="text-sm text-gray-600">out of stock</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Sales</h3>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyActivity}>
                  <XAxis dataKey="month" />
                  <YAxis  />
                  <Tooltip 
      formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
      labelFormatter={(label) => `Month: ${label}`}
    />
                   <Line type="monotone" dataKey="total_sales" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Categories Distribution</h3>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
  <XAxis dataKey="name" />
  
  <YAxis />
  <Tooltip 
    formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
    labelFormatter={(label) => `Category: ${label}`}
  />
  <Bar dataKey="value" radius={[4,4,0,0]}>
    {categoryData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color} />
    ))}
  </Bar>
</BarChart>

              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
       {/* Top Products */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top 5 Best Selling Products</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false}   // ❌ ไม่ให้มีทศนิยม
                />
                <Tooltip formatter={(value) => value} labelFormatter={(label) => `Product: ${label}`} />
                <Bar dataKey="total_sold" fill="#F59E0B" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* Low Stock Products */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Products</h3>
          </div>
          <div className="h-56">
             <ResponsiveContainer width="100%" height="100%">
      <BarChart data={lowStockProducts}>
        <XAxis dataKey="product_name" />
        <YAxis 
          allowDecimals={false}   // ❌ ไม่ให้มีทศนิยม
          domain={[0, 3]}   // ✅ ให้เริ่มจาก 0 เสมอ
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const { product_name, size_name, stock } = payload[0].payload;
              return (
                <div
                  style={{
                    background: 'white',
                    border: '1px solid #ccc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{product_name}</p>
                  <p style={{ margin: 0 }}>Size: {size_name}</p>
                  <p
                    style={{
                      margin: 0,
                      color: stock < 2 ? '#EF4444' : '#000',
                      fontWeight: '500',
                    }}
                  >
                    คงเหลือ: {stock} ชิ้น
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="stock" 
          fill="#EF4444" 
          radius={[4, 4, 0, 0]} 
          isAnimationActive={true}
          minPointSize={4}   // ✅ ให้แท่งที่มีค่า 0 ยังคงมองเห็นเล็กๆ
        />
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