import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminEmployeeRolePage() {
  const [roles] = useState([
    { id: 1, name: 'Admin', permissions: 'Full platform access', employees: 2 },
    { id: 2, name: 'Chef', permissions: 'Kitchen & order management', employees: 8 },
    { id: 3, name: 'Waiter', permissions: 'Dine-in order handling', employees: 12 },
    { id: 4, name: 'Driver', permissions: 'Delivery assignments', employees: 20 },
  ]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Employee Roles</h1>
          <p className="text-xs text-gray-500 mt-0.5">Define staff roles and what each can access.</p>
        </div>
        <button className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Role</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Role</th>
                <th className="p-4">Permissions</th>
                <th className="p-4">Employees</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold flex items-center space-x-2 text-gray-900">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                    <span>{role.name}</span>
                  </td>
                  <td className="p-4 text-gray-500">{role.permissions}</td>
                  <td className="p-4">{role.employees}</td>
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
