import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Shield, Crown, Mail, Phone, Store } from 'lucide-react';
import showToast from '../../components/Toast';
import API from '../../services/api';

export default function SuperAdminManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    restaurantId: ''
  });

  useEffect(() => {
    fetchAdmins();
    fetchRestaurants();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users/staff');
      // Filter only ADMIN role users
      const adminUsers = response.data.filter(user => user.role === 'ADMIN');
      setAdmins(adminUsers);
    } catch (error) {
      console.error('Error fetching admins:', error);
      showToast('Failed to load admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await API.get('/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      showToast('Name and email are required', 'error');
      return;
    }

    if (!editingAdmin && !formData.password) {
      showToast('Password is required for new admins', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        role: 'ADMIN',
        restaurantId: formData.restaurantId || null
      };

      if (editingAdmin) {
        // Update existing admin
        await API.put(`/users/staff/${editingAdmin.id}`, payload);
        showToast('Admin updated successfully!', 'success');
      } else {
        // Create new admin
        await API.post('/users/staff', payload);
        showToast('Admin created successfully!', 'success');
      }

      setShowModal(false);
      setEditingAdmin(null);
      setFormData({ name: '', email: '', password: '', phone: '', restaurantId: '' });
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
      showToast(error.response?.data?.error || 'Failed to save admin', 'error');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      phone: admin.phone || '',
      restaurantId: admin.restaurantId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/users/staff/${adminId}`);
      showToast('Admin deleted successfully', 'success');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      showToast(error.response?.data?.error || 'Failed to delete admin', 'error');
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-4 rounded-2xl shadow-lg">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Manage Admins</h1>
                <p className="text-sm text-gray-500">Create, edit, and manage admin accounts</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingAdmin(null);
                setFormData({ name: '', email: '', password: '', phone: '', restaurantId: '' });
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Admin</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
            />
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Admins Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Click "Add New Admin" to create one'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase tracking-wider">Restaurant</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-900 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-purple-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-purple-50/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{admin.name}</p>
                            <div className="flex items-center space-x-1 text-xs text-purple-600">
                              <Shield className="w-3 h-3" />
                              <span>Admin</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{admin.email}</span>
                          </div>
                          {admin.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{admin.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {admin.restaurant ? (
                          <div className="flex items-center space-x-2">
                            <Store className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">{admin.restaurant.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">All Restaurants</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(admin)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                            title="Edit Admin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                            title="Delete Admin"
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
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-black text-gray-900">
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editingAdmin ? 'Update admin account information' : 'Create a new admin account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                  placeholder="admin@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password {!editingAdmin && '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingAdmin}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                  placeholder={editingAdmin ? 'Leave blank to keep current password' : 'Enter password (min 6 characters)'}
                  minLength="6"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                  placeholder="+251 900 000 000"
                />
              </div>

              {/* Restaurant Assignment */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Assign Restaurant (Optional)
                </label>
                <select
                  name="restaurantId"
                  value={formData.restaurantId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                >
                  <option value="">All Restaurants (System-wide Admin)</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Leave blank to grant access to all restaurants
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl"
                >
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAdmin(null);
                    setFormData({ name: '', email: '', password: '', phone: '', restaurantId: '' });
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
