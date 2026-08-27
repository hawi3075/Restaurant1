import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Ban, CheckCircle, X, Trash2 } from 'lucide-react';
import API from '../../services/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCustomer = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/users/customers/${deleteTarget.id}`);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">View and manage all customers</p>
        </div>
        <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold">
          {customers.length} Total Customers
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                    Phone
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                    Total Orders
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                    Reviews
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                    Joined
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{customer.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {customer.phone || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        {customer._count?.orders || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        {customer._count?.reviews || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(customer)}
                          className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                          title="Delete customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-black text-gray-900">Customer Details</h2>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-950">{selectedCustomer.name}</h3>
                  <p className="text-gray-500">ID: {selectedCustomer.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-gray-400 font-semibold uppercase">Email</span>
                  <p className="font-bold text-gray-800">{selectedCustomer.email}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase">Phone</span>
                  <p className="font-bold text-gray-800">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase">Joined On</span>
                  <p className="font-bold text-gray-800">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase">Customer Role</span>
                  <p className="font-bold text-emerald-600">Active Customer</p>
                </div>
              </div>

              <div className="border-t pt-3 grid grid-cols-2 gap-3 text-center">
                <div className="bg-orange-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-orange-600 font-bold uppercase">Total Orders</span>
                  <p className="text-lg font-black text-orange-700">{selectedCustomer._count?.orders || 0}</p>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-blue-600 font-bold uppercase">Reviews Posted</span>
                  <p className="text-lg font-black text-blue-700">{selectedCustomer._count?.reviews || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-gray-900">Delete Customer</h2>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete{' '}
              <span className="font-bold text-gray-700">{deleteTarget.name}</span>? This will
              permanently remove their account and cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 shadow-lg shadow-rose-600/20 transition cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}