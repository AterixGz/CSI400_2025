import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { FileText, CreditCard, BookOpen, Image, Eye, Users, ChevronDown, Plus } from 'lucide-react';
import Header from '../component/header';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: {},
    performance: [],
    categories: []
  });
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  const { stats, performance, categories } = data;

  // Add colors to categories
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
  const categoryData = categories.map((cat, i) => ({
    ...cat,
    color: colors[i % colors.length]
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 p-4 overflow-hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_users || 0}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_orders || 0}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_products || 0}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_categories || 0}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>

       {/* Charts Section */}
<div className="grid grid-cols-2 gap-4 mb-6">
  <div className="bg-white p-4 rounded-xl border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Monthly Orders</h3>
    </div>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performance}>
          <XAxis dataKey="month" />
          <YAxis />
          <Line type="monotone" dataKey="orders" stroke="#3B82F6" />
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
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
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