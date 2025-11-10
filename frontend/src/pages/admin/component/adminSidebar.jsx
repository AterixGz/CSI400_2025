import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import VYNE from '../../../assets/VYNE_tranparent_256.png';
import {
  Home,
  BarChart3,
  Users,
  FolderOpen,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  CreditCard,
  Archive,
  Image,
  Eye,
  BookOpen
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/admin/dashboard', count: '' },
  // { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  // { icon: Users, label: 'Organization', path: '/admin/organization' },
  // { icon: FolderOpen, label: 'Projects', path: '/admin/projects', count: '12' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders', count: '' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  // { icon: DollarSign, label: 'Transactions', path: '/admin/transactions' },
  // { icon: FileText, label: 'Invoices', path: '/admin/invoices', count: '' },
  // { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
  { icon: Users, label: 'Members', path: '/admin/members' },
//   { icon: Archive, label: 'Backup & Restore', path: '/admin/backup' }
];

const categoryBreaks = [0, 2, 5, 7, 10, 12];
const categories = ['OVERVIEW', 'E-COMMERCE', 'TEAM & COMMUNICATION', 'UTILITY'];//ลบ finance ออก

export default function AdminSidebar() {
  let currentCategory = 0;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
      <div className="p-4 border-b border-gray-200">
        <Link to="/admin/dashboard" className="flex items-center justify-center">
          <img src={VYNE} alt="VYNE" className="w-17 h-14 object-contain" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {sidebarItems.map((item, index) => {
          const categoryIndex = categoryBreaks.indexOf(index);
          if (categoryIndex !== -1) {
            currentCategory = categoryIndex;
          }

          return (
            <div key={index}>
              {categoryBreaks.includes(index) && (
                <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {categories[currentCategory]}
                </div>
              )}

              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `mx-3 px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between group hover:bg-gray-100 ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`
                }
              >
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
              </NavLink>
            </div>
          );
        })}
      </div>
    </div>
  );
}
