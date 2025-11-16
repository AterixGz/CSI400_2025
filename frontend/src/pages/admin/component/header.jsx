import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, Sun, Bell, Settings, Home, ExternalLink } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  const mapping = {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    organization: 'Organization',
    projects: 'Projects',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    transactions: 'Transactions',
    invoices: 'Invoices',
    payments: 'Payments',
    members: 'Members'
  };

  const parts = (location.pathname || '').split('/').filter(Boolean);
  let page = 'Dashboard';
  if (parts.length >= 2 && parts[0] === 'admin') {
    page = mapping[parts[1]] || parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
  } else if (parts.length === 1) {
    page = mapping[parts[0]] || parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Menu className="w-6 h-6 text-gray-500 mr-4" />
          <div className="flex items-center text-sm text-gray-500">
            <Home className="w-4 h-4 mr-1" />
            <span>{page}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">CMS</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}
          {/* <Sun className="w-5 h-5 text-gray-500 cursor-pointer" /> */}
          {/* <div className="relative">
            <Bell className="w-5 h-5 text-gray-500 cursor-pointer" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">3</span>
            </div>
          </div> */}
          {/* <Settings className="w-5 h-5 text-gray-500 cursor-pointer" /> */}
          <div className="flex items-center space-x-4">
            
            {/*person info*/}

            <UserInfo />

            <Link 
              to="/" 
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              กลับไปหน้าร้านค้า
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
}

function UserInfo() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    try {
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'John Doe';
  const roleLabel = user ? (user.role_name || 'User') : 'Administrator';
  const initials = user
    ? ((user.first_name && user.first_name[0]) || '') + ((user.last_name && user.last_name[0]) || '')
    : 'JD';

  return (
    <div className="flex items-center cursor-pointer">
      <div className="w-8 h-8 bg-blue-500 rounded-full mr-2 flex items-center justify-center text-white font-semibold">
        {initials.toUpperCase()}
      </div>
      <div className="text-sm">
        <div className="font-medium text-gray-900">{fullName}</div>
        <div className="text-gray-500">{roleLabel}</div>
      </div>
    </div>
  );
}
