import React from 'react';
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
  const performanceData = [
    { month: 'Jan', articles: 50, views: 12 },
    { month: 'Feb', articles: 52, views: 15 },
    { month: 'Mar', articles: 48, views: 13 },
    { month: 'Apr', articles: 60, views: 18 },
    { month: 'May', articles: 55, views: 16 },
    { month: 'Jun', articles: 70, views: 25 },
    { month: 'Jul', articles: 68, views: 24 },
    { month: 'Aug', articles: 65, views: 23 },
    { month: 'Sep', articles: 75, views: 28 },
    { month: 'Oct', articles: 80, views: 32 },
    { month: 'Nov', articles: 78, views: 30 },
    { month: 'Dec', articles: 85, views: 35 }
  ];

  const categoryData = [
    { name: 'Technology', value: 160, color: '#3B82F6' },
    { name: 'Business', value: 140, color: '#10B981' },
    { name: 'Health', value: 100, color: '#F59E0B' },
    { name: 'Sports', value: 95, color: '#EF4444' },
    { name: 'Entertainment', value: 80, color: '#8B5CF6' },
    { name: 'Politics', value: 65, color: '#EC4899' },
    { name: 'Science', value: 55, color: '#06B6D4' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />

      {/* Main Dashboard Content */}
      <main className="flex-1 p-4 overflow-hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-green-600 text-sm font-medium">+12.5%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">1,247</div>
            <div className="text-sm text-gray-600">Total Articles</div>
            <div className="text-xs text-gray-500 mt-1">Published articles</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-blue-600" />
              <span className="text-green-600 text-sm font-medium">+23.1%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">89.2K</div>
            <div className="text-sm text-gray-600">Page Views</div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-green-600 text-sm font-medium">+8.2%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">2,847</div>
            <div className="text-sm text-gray-600">Comments</div>
            <div className="text-xs text-gray-500 mt-1">User engagement</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-red-600 text-sm font-medium">-2.1%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">34</div>
            <div className="text-sm text-gray-600">Authors</div>
            <div className="text-xs text-gray-500 mt-1">Active writers</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-green-600 text-sm font-medium">+5.3%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">7</div>
            <div className="text-sm text-gray-600">Scheduled Posts</div>
            <div className="text-xs text-gray-500 mt-1">Upcoming content</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Image className="w-8 h-8 text-blue-600" />
              <span className="text-green-600 text-sm font-medium">+15.7%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">1,456</div>
            <div className="text-sm text-gray-600">Media Files</div>
            <div className="text-xs text-gray-500 mt-1">Images & videos</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Content Performance</h3>
              <div className="flex items-center text-sm text-gray-600">
                <span>Last 12 months</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Line type="monotone" dataKey="articles" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} name="Articles Published" />
                  <Line type="monotone" dataKey="views" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} name="Page Views (K)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Articles Published</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Page Views (K)</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Content by Category</h3>
              <div className="flex items-center text-sm text-gray-600">
                <span>This year</span>
                <Plus className="w-4 h-4 ml-2 cursor-pointer" />
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center mt-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Articles</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">System History</h3>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View all</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">Plugin Activated</span>
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">success</span>
                </div>
                <span className="text-xs text-gray-500">10 minutes ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View all</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                    <div className="text-xs text-gray-500">Editor</div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">5 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
