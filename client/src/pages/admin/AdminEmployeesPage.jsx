import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Trash2, X, User } from 'lucide-react';
import API from '../../services/api';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CHEF', // Default role
    restaurantId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const [fetchError, setFetchError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const [staffRes, restsRes] = await Promise.all([
        API.get('/users/staff'),
        API.get('/restaurants')
      ]);
      setEmployees(staffRes.data || []);
      setRestaurants(restsRes.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setFetchError(error?.response?.data?.error || error.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.phone && emp.phone.includes(searchTerm))
  );

  function openAddModal() {
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'CHEF',
      restaurantId: restaurants[0]?.id || ''
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.restaurantId) {
      alert('Please fill in Name, Email, Password, and Restaurant assignment.');
      return;
    }

    try {
      setSaving(true);
      const response = await API.post('/users/staff', form);
      const newEmployee = {
        ...response.data.staff,
        restaurant: restaurants.find(r => r.id === form.restaurantId)
      };
      setEmployees(prev => [newEmployee, ...prev]);
      closeModal();
    } catch (error) {
      console.error('Error creating employee:', error);
      alert(error.response?.data?.error || 'Failed to create employee. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/users/staff/${deleteTarget.id}`);
      setEmployees(prev => prev.filter(emp => emp.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Employees List</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage administrative and operational staff accounts.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <span>⚠️ {fetchError}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search employees by name, email, or role..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition" 
            />
          </div>
          <div className="text-sm font-bold text-gray-600">
            {filteredEmployees.length} Employee(s)
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-xs font-bold">No staff members found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Assigned Restaurant</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold flex items-center space-x-2 text-gray-900">
                      <User className="w-4 h-4 text-orange-500" />
                      <span>{emp.name}</span>
                    </td>
                    <td className="p-4">{emp.email}</td>
                    <td className="p-4 font-semibold text-orange-600 uppercase">{emp.role}</td>
                    <td className="p-4 text-gray-500">{emp.phone || '—'}</td>
                    <td className="p-4 font-semibold text-gray-700">{emp.restaurant?.name || '—'}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setDeleteTarget(emp)}
                        className="p-2 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">Add New Employee</h2>
              <button 
                type="button"
                onClick={closeModal} 
                className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Almaz Kebede"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. almaz@restaurant.com"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Password *</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +251 911 000 000"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Employee Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                >
                  <option value="CHEF">Chef</option>
                  <option value="WAITER">Waiter</option>
                  <option value="DRIVER">Driver</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Assign Restaurant *</label>
                <select
                  required
                  value={form.restaurantId}
                  onChange={e => setForm({ ...form, restaurantId: e.target.value })}
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                >
                  {restaurants.map(res => (
                    <option key={res.id} value={res.id}>{res.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 shadow-lg shadow-orange-600/20 transition cursor-pointer"
              >
                {saving ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-gray-900">Delete Employee</h2>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete <span className="font-bold text-gray-700">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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