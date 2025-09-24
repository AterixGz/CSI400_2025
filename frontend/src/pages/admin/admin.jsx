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
import {
  Menu,
  Search,
  Sun,
  Bell,
  Settings,
  Home,
  BarChart3,
  Users,
  FolderOpen,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  CreditCard,
  Banknote,
  BookOpen,
  Image,
  Eye,
  HelpCircle,
  ChevronDown,
  Plus,
  MessageCircle,
  Video,
  Puzzle,
  Code2,
  Layers,
  Archive
} from 'lucide-react';

const Dashboard = () => {
  // Mock data for charts
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

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', count: '3', active: true },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Users, label: 'Organization' },
    { icon: FolderOpen, label: 'Projects', count: '12' },
    { icon: Package, label: 'Products' },
    { icon: ShoppingCart, label: 'Orders', count: '5' },
    { icon: Users, label: 'Customers' },
    { icon: DollarSign, label: 'Transactions' },
    { icon: FileText, label: 'Invoices', count: '2' },
    { icon: CreditCard, label: 'Payments' },
    { icon: BookOpen, label: 'Pages' },
    { icon: Image, label: 'Media' },
    { icon: Eye, label: 'SEO', badge: 'New' },
    { icon: Users, label: 'Members' },
    { icon: MessageCircle, label: 'Chat', count: '12' },
    { icon: Video, label: 'Meetings' },
    { icon: Puzzle, label: 'Plugins', count: '8' },
    { icon: Code2, label: 'API' },
    { icon: Layers, label: 'Integrations' },
    { icon: Archive, label: 'Backup & Restore' },
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Help' }
  ];

  const categories = ['OVERVIEW', 'E-COMMERCE', 'FINANCE', 'CONTENT MANAGEMENT', 'TEAM & COMMUNICATION', 'TOOLS & UTILITIES'];
  let currentCategory = 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-gray-900">CMSFullForm</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {sidebarItems.map((item, index) => {
            // Check if we need to show category header
            const categoryIndex = [0, 4, 7, 10, 13, 16].indexOf(index);
            if (categoryIndex !== -1) {
              currentCategory = categoryIndex;
            }

            return (
              <div key={index}>
                {/* Category Header */}
                {[0, 4, 7, 10, 13, 16].includes(index) && (
                  <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {categories[categoryIndex]}
                  </div>
                )}
                
                {/* Menu Item */}
                <div className={`mx-3 px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between group hover:bg-gray-100 ${
                  item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}>
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center">
                    {item.badge && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                        {item.badge}
                      </span>
                    )}
                    {item.count && (
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Menu className="w-6 h-6 text-gray-500 mr-4" />
              <div className="flex items-center text-sm text-gray-500">
                <Home className="w-4 h-4 mr-1" />
                <span>Dashboard</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900">CMS</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Sun className="w-5 h-5 text-gray-500 cursor-pointer" />
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-500 cursor-pointer" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">3</span>
                </div>
              </div>
              <Settings className="w-5 h-5 text-gray-500 cursor-pointer" />
              <div className="flex items-center cursor-pointer">
                <div className="w-8 h-8 bg-blue-600 rounded-full mr-2"></div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">John Doe</div>
                  <div className="text-gray-500">Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CMS Full Form .com</h1>
                <p className="text-gray-600">Forks & Likes this Project, and download Full Templates at CMSFullForm.com</p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  New Article
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Import Content
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-6 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-green-600 text-sm font-medium">+12.5%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">1,247</div>
              <div className="text-sm text-gray-600">Total Articles</div>
              <div className="text-xs text-gray-500 mt-1">Published articles</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-blue-600" />
                <span className="text-green-600 text-sm font-medium">+23.1%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">89.2K</div>
              <div className="text-sm text-gray-600">Page Views</div>
              <div className="text-xs text-gray-500 mt-1">This month</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-green-600 text-sm font-medium">+8.2%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">2,847</div>
              <div className="text-sm text-gray-600">Comments</div>
              <div className="text-xs text-gray-500 mt-1">User engagement</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-red-600 text-sm font-medium">-2.1%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">34</div>
              <div className="text-sm text-gray-600">Authors</div>
              <div className="text-xs text-gray-500 mt-1">Active writers</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <span className="text-green-600 text-sm font-medium">+5.3%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">7</div>
              <div className="text-sm text-gray-600">Scheduled Posts</div>
              <div className="text-xs text-gray-500 mt-1">Upcoming content</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
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
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Content Performance Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Content Performance</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Last 12 months</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="articles" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      name="Articles Published"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      name="Page Views (K)"
                    />
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

            {/* Content by Category Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Content by Category</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span>This year</span>
                  <Plus className="w-4 h-4 ml-2 cursor-pointer" />
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
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
          <div className="grid grid-cols-2 gap-6">
            {/* System History */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
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

            {/* User Activity */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
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
    </div>
  );
};

export default Dashboard;