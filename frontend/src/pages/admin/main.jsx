import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './component/adminSidebar';
import Dashboard from './content/dashboard';
import Analytics from './content/analytics';
import Organization from './content/organization';
import Projects from './content/projects';
import Products from './content/products';
import Orders from './content/orders';
import Customers from './content/customers';
import Transactions from './content/transactions';
import Invoices from './content/invoices';
import Payments from './content/payments';
import Members from './content/members';

function AdminShell() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <Routes>
      <Route path="/" element={<AdminShell />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="organization" element={<Organization />} />
        <Route path="projects" element={<Projects />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="payments" element={<Payments />} />
        <Route path="members" element={<Members />} />
      </Route>
    </Routes>
  );
}