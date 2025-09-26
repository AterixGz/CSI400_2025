import React from 'react';
import Header from '../component/header';

export default function Organization(){
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-4 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">Organization</h2>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-gray-600">Manage teams and roles here.</p>
        </div>
      </main>
    </div>
  );
}
