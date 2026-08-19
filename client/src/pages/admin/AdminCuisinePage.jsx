import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function AdminCuisinePage() {
  const [cuisines] = useState([
    { id: 1, name: 'Ethiopian Traditional', restaurants: 22, status: 'Active' },
    { id: 2, name: 'Italian', restaurants: 9, status: 'Active' },
    { id: 3, name: 'Fast Food & Burgers', restaurants: 15, status: 'Active' },
    { id: 4, name: 'Bakery & Pastries', restaurants: 6, status: 'Active' },
  ]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cuisine Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage the cuisine categories restaurants can be tagged with.</p>
        </div>
        <button className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Cuisine</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search cuisines..." className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition" />
          </div>
          <div className="text-sm font-bold text-gray-600">{cuisines.length} Cuisine(s)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Cuisine</th>
                <th className="p-4">Restaurants</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {cuisines.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold flex items-center space-x-2 text-gray-900">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                    <span>{c.name}</span>
                  </td>
                  <td className="p-4">{c.restaurants} Restaurants</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{c.status}</span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-2 bg-gray-100 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button className="p-2 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
