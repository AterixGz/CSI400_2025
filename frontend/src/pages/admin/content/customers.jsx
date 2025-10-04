import React from 'react';
import Header from '../component/header';
import { Search, MoreHorizontal, Mail, Phone } from 'lucide-react';

export default function Customers() {
  const customers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1(555)123-4567',
      tier: 'Platinum',
      status: 'Active',
      orders: 47,
      totalSpent: 12450,
      joinDate: 'Jan 15, 2023'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@email.com',
      phone: '+1(555)234-5678',
      tier: 'Gold',
      status: 'Active',
      orders: 32,
      totalSpent: 8920,
      joinDate: 'Mar 22, 2023'
    },
    {
      id: 3,
      name: 'Emma Williams',
      email: 'emma.w@email.com',
      phone: '+1(555)345-6789',
      tier: 'Silver',
      status: 'Active',
      orders: 18,
      totalSpent: 4560,
      joinDate: 'Jun 10, 2023'
    },
    {
      id: 4,
      name: 'James Brown',
      email: 'james.b@email.com',
      phone: '+1(555)456-7890',
      tier: 'Gold',
      status: 'Inactive',
      orders: 25,
      totalSpent: 6780,
      joinDate: 'Feb 28, 2023'
    },
    {
      id: 5,
      name: 'Olivia Davis',
      email: 'olivia.d@email.com',
      phone: '+1(555)567-8901',
      tier: 'Platinum',
      status: 'Active',
      orders: 53,
      totalSpent: 13250,
      joinDate: 'Nov 5, 2022'
    },
    {
      id: 6,
      name: 'Liam Martinez',
      email: 'liam.m@email.com',
      phone: '+1(555)678-9012',
      tier: 'Bronze',
      status: 'Active',
      orders: 8,
      totalSpent: 1890,
      joinDate: 'Jan 20, 2024'
    }
  ];

  const getTierStyle = (tier) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-blue-100 text-blue-700';
      case 'Gold':
        return 'bg-orange-100 text-orange-700';
      case 'Silver':
        return 'bg-emerald-100 text-emerald-700';
      case 'Bronze':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500 mt-1">View and manage customer information</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
              <option>All Tiers</option>
              <option>Platinum</option>
              <option>Gold</option>
              <option>Silver</option>
              <option>Bronze</option>
            </select>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Customer Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Member</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Tier</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Orders</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Total Spent</th>
                  {/* <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Join Date</th> */}
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${getTierStyle(customer.tier)}`}>
                        {customer.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        customer.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{customer.orders}</td>
                    <td className="px-6 py-4 text-gray-900">${customer.totalSpent.toLocaleString()}</td>
                    {/* <td className="px-6 py-4 text-gray-500">{customer.joinDate}</td> */}
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
