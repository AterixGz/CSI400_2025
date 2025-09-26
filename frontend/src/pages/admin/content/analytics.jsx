import React from 'react';
import Header from '../component/header';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const data = [ {name: 'A', value: 30}, {name: 'B', value: 45}, {name: 'C', value: 60} ];

export default function Analytics() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-4 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-gray-600 mb-4">Overview of analytic metrics.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}><XAxis dataKey="name"/><YAxis/><Bar dataKey="value" fill="#3B82F6"/></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
