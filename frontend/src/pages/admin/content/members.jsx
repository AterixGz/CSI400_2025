import React from 'react';
import Header from '../component/header';
import { Search, Users, Shield, Clock, MoreHorizontal, CheckCircle } from 'lucide-react';

export default function Members() {
  const admins = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      role: 'Super Admin',
      status: 'Active',
      permissions: 'Full Access',
      lastActive: '2 minutes ago',
      joinDate: 'Jan 15, 2022'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@company.com',
      role: 'Admin',
      status: 'Active',
      permissions: 'Products, Orders, Customers',
      lastActive: '1 hour ago',
      joinDate: 'Mar 22, 2023'
    },
    // Add more admin data as needed
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-500 mt-1">Manage admin users, roles, permissions, and monitor team activity</p>
          </div>

          {/* Stats Grid */}
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="shadow-md p-6 rounded-xl">
              <div className=" flex items-center justify-between mb-4">
                <span className="text-black">Total Admins</span>
                <Users className="h-6 w-6 text-black" />
              </div>
              <div className="text-4xl font-bold mb-2">24</div>
              <div className="text-orange-500 text-sm">↗ +2 this month</div>
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="">Active Now</span>
                <Users className="h-6 w-6 " />
              </div>
              <div className="text-4xl font-bold mb-2">12</div>
              <div className="text-orange-500 text-sm">↗ 50% online</div>
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="">Super Admins</span>
                <Shield className="h-6 w-6 " />
              </div>
              <div className="text-4xl font-bold mb-2">5</div>
              <div className=" text-sm">Full access</div>
            </div>

            <div className="shadow-md p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="">Avg. Session</span>
                <Clock className="h-6 w-6 " />
              </div>
              <div className="text-4xl font-bold mb-2">4.2h</div>
              <div className="text-orange-500 text-sm">↗ +0.5h</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search admins..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white">
              <option>All Roles</option>
              <option>Super Admin</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Staff</option>
            </select>
            <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="px-4 py-2 bg-white text-black border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Invite Admin
            </button>
          </div>

          {/* Admin Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Admin</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Permissions</th>
                  {/* <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Last Active</th> */}
                  {/* <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Join Date</th> */}
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">ID: {admin.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        admin.role === 'Super Admin' 
                          ? 'bg-blue-100 text-blue-700'
                          : admin.role === 'Admin'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        admin.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{admin.permissions}</td>
                    {/* <td className="px-6 py-4 text-gray-500">{admin.lastActive}</td> */}
                    {/* <td className="px-6 py-4 text-gray-500">{admin.joinDate}</td> */}
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
