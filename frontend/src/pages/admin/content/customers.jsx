import React from 'react';
import Header from '../component/header';

export default function Customers(){
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-4 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">Customers</h2>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-gray-600">Customer list and profiles.</p>
        </div>
      </main>
    </div>
  );
}
