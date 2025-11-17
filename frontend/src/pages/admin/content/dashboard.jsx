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
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate(); // เพิ่มบรรทัดนี้
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

  // redirect ถ้าไม่ใช่ manager
  useEffect(() => {
    if (!user || user.role_name !== "manager") {
      navigate("/admin/orders"); // staff หรือ user ที่ไม่ใช่ manager ไป /orders
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

  // ทำความสะอาด interval ตอน component unmount
  return () => clearInterval(intervalId);
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
// กำหนดสีสำหรับแต่ละ size
const sizeColors = {
  S: '#21c8dbff',
  M: '#10B981',
  L: '#F59E0B',
  FreeSize: '#EF4444',
  'Freesize': '#EF4444', // กัน case ต่างกัน
  XL: '#8B5CF6',
  XXL: '#EC4899'
};

// map lowStockData
const lowStockData = (data.lowStockProducts || []).map(item => ({
  ...item,
  stock: Number(item.stock),
  displayName: `${item.product_name} (${item.size_name})`,
  color: sizeColors[item.size_name] || '#6cbe28ff'  // default color ถ้าไม่มี
}));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 p-4 overflow-hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
  {/* Total Users */}
  <div className="bg-white p-4 rounded-xl border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <Users className="w-8 h-8 text-blue-600" />
    </div>
    <div className="text-3xl font-bold text-gray-900">{stats?.total_users || 0}</div>
    <div className="text-sm text-gray-600">Total Users</div>
  </div>

  {/* Total Products */}
  <div className="bg-white p-4 rounded-xl border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <FileText className="w-8 h-8 text-blue-600" />
    </div>
    <div className="text-3xl font-bold text-gray-900">{stats?.total_products || 0}</div>
    <div className="text-sm text-gray-600">Total Products</div>
  </div>

  {/* Product Categories */}
  <div className="bg-white p-4 rounded-xl border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <BookOpen className="w-8 h-8 text-blue-600" />
    </div>
    <div className="text-3xl font-bold text-gray-900">{stats?.total_categories || 0}</div>
    <div className="text-sm text-gray-600">Product Categories</div>
  </div>

  {/* Out of Stock */}
  <div className="bg-white p-4 rounded-xl border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <Image className="w-8 h-8 text-red-600" />
    </div>
    <div className="text-3xl font-bold text-gray-900">{stats?.out_of_stock_sizes || 0}</div>
    <div className="text-sm text-gray-600">Out of Stock</div>
  </div>

  {/* Total Visitors */}
  <div className="bg-white p-4 rounded-xl border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <Eye className="w-8 h-8 text-green-600" />
    </div>
    <div className="text-3xl font-bold text-gray-900">{stats?.total_visitors || 0}</div>
    <div className="text-sm text-gray-600">Total Visitors</div>
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
      formatter={(value) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)}
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
    formatter={(value) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)}
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
                <XAxis dataKey="name" 
                  tick={{ fontSize: 15 }} // ลดขนาด font
                  />
                <YAxis allowDecimals={false}   // ❌ ไม่ให้มีทศนิยม
                />
                <Tooltip formatter={(value) => value} labelFormatter={(label) => `Product: ${label}` } />
                <Bar dataKey="total_sold" fill="#6cbe28ff" radius={[4,4,0,0]} />
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
  <BarChart data={lowStockData}>
    <XAxis dataKey="displayName" />
    <YAxis allowDecimals={false} domain={[0, 'auto']} />
    <Tooltip
      content={({ active, payload }) => {
        if (active && payload && payload.length) {
          const { product_name, size_name, stock } = payload[0].payload;
          return (
            <div style={{ background: 'white', border: '1px solid #a27979ff', padding: '8px 12px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{product_name}</p>
              <p style={{ margin: 0 }}>Size: {size_name}</p>
              <p style={{ margin: 0, color: stock < 2 ? '#f44d00ff' : '#dfce35ff', fontWeight: '500' }}>
                คงเหลือ: {stock} ชิ้น
              </p>
            </div>
          );
        }
        return null;
      }}
    />
    <Bar dataKey="stock" radius={[4,4,0,0]} minPointSize={4}>
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