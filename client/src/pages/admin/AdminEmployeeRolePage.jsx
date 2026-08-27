import React, { useState, useEffect } from 'react';
import { ShieldCheck, Edit2, Loader } from 'lucide-react';
import API from '../../services/api';

const ROLE_DESCRIPTIONS = {
  ADMIN: 'Full platform access — manage restaurants, staff, orders, and settings.',
  CHEF: 'Kitchen & order management — receive orders, cook, and mark as ready.',
  WAITER: 'Dine-in order handling — take orders, serve food, manage tables.',
  DRIVER: 'Delivery assignments — pick up ready orders and deliver to customers.',
  CUSTOMER: 'Online ordering — browse menus, place orders, track deliveries.',
};

export default function AdminEmployeeRolePage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleCounts();
  }, []);

  const fetchRoleCounts = async () => {
    try {
      setLoading(true);

      // Fetch staff (CHEF, WAITER, DRIVER) and customers in parallel
      const [staffRes, customersRes] = await Promise.all([
        API.get('/users/staff'),
        API.get('/users/customers'),
      ]);

      const staff = staffRes.data || [];
      const customers = customersRes.data || [];

      // Count staff per role
      const chefCount = staff.filter((s) => s.role === 'CHEF').length;
      const waiterCount = staff.filter((s) => s.role === 'WAITER').length;
      const driverCount = staff.filter((s) => s.role === 'DRIVER').length;
      const adminCount = staff.filter((s) => s.role === 'ADMIN').length;

      setRoles([
        {
          name: 'Admin',
          key: 'ADMIN',
          permissions: ROLE_DESCRIPTIONS.ADMIN,
          employees: adminCount || 1, // at least 1 admin (current user)
        },
        {
          name: 'Chef',
          key: 'CHEF',
          permissions: ROLE_DESCRIPTIONS.CHEF,
          employees: chefCount,
        },
        {
          name: 'Waiter',
          key: 'WAITER',
          permissions: ROLE_DESCRIPTIONS.WAITER,
          employees: waiterCount,
        },
        {
          name: 'Driver',
          key: 'DRIVER',
          permissions: ROLE_DESCRIPTIONS.DRIVER,
          employees: driverCount,
        },
        {
          name: 'Customer',
          key: 'CUSTOMER',
          permissions: ROLE_DESCRIPTIONS.CUSTOMER,
          employees: customers.length,
        },
      ]);
    } catch (error) {
      console.error('Error fetching role counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const ROLE_COLORS = {
    ADMIN: 'text-red-600 bg-red-50',
    CHEF: 'text-orange-600 bg-orange-50',
    WAITER: 'text-blue-600 bg-blue-50',
    DRIVER: 'text-green-600 bg-green-50',
    CUSTOMER: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Employee Roles</h1>
          <p className="text-xs text-gray-500 mt-0.5">Staff roles and their current counts (live from database).</p>
        </div>
        <button 
          onClick={fetchRoleCounts}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Role</th>
                  <th className="p-4">Permissions / Description</th>
                  <th className="p-4">Active Members</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {roles.map((role) => (
                  <tr key={role.key} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold flex items-center space-x-2 text-gray-900">
                      <span className={`p-1.5 rounded-lg ${ROLE_COLORS[role.key] || ''}`}>
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <span>{role.name}</span>
                    </td>
                    <td className="p-4 text-gray-500 max-w-sm">{role.permissions}</td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs font-black">
                        {role.employees}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => alert(`"${role.name}" role permissions are system-defined and cannot be modified.`)}
                        className="p-2 bg-gray-100 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
