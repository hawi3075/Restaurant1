import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Plus, CheckCircle, XCircle, Search, Edit, X } from 'lucide-react';
import API from '../../services/api';

export default function AdminRestaurantsPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', rating: '', isOpen: true });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await API.get('/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openEditModal(restaurant) {
    setEditingRestaurant(restaurant);
    setForm({
      name: restaurant.name || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      rating: restaurant.rating ?? '',
      isOpen: !!restaurant.isOpen,
    });
  }

  function closeEditModal() {
    setEditingRestaurant(null);
  }

  async function handleSaveEdit() {
    if (!editingRestaurant || !form.name.trim()) return;
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        rating: Number(form.rating) || 0,
        isOpen: form.isOpen,
      };
      const response = await API.put(`/restaurants/${editingRestaurant.id}`, payload);
      const updated = response.data;
      setRestaurants((prev) =>
        prev.map((r) => (r.id === editingRestaurant.id ? { ...r, ...updated } : r))
      );
      closeEditModal();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Failed to update restaurant. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(restaurant) {
    try {
      setTogglingId(restaurant.id);
      const response = await API.put(`/restaurants/${restaurant.id}`, {
        isOpen: !restaurant.isOpen,
      });
      const updated = response.data;
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurant.id ? { ...r, isOpen: updated?.isOpen ?? !restaurant.isOpen } : r
        )
      );
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/restaurants/${deleteTarget.id}`);
      setRestaurants((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Restaurant Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage partner vendors, commissions, and operational status.</p>
        </div>
        <button
          onClick={() => navigate('/admin/restaurants/add')}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Restaurant</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
            />
          </div>
          <div className="text-sm font-bold text-gray-600">
            {filteredRestaurants.length} Restaurant(s)
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Restaurant Name</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredRestaurants.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold flex items-center space-x-2 text-gray-900">
                      <Store className="w-4 h-4 text-orange-500" />
                      <span>{res.name}</span>
                    </td>
                    <td className="p-4 text-gray-500">{res.address}</td>
                    <td className="p-4">{res.phone}</td>
                    <td className="p-4 font-bold text-orange-600">⭐ {Number(res.rating || 0).toFixed(1)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          res.isOpen
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {res.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/admin/restaurants/edit/${res.id}`)}
                        className="p-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(res)}
                        disabled={togglingId === res.id}
                        className="p-2 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-600 rounded-lg transition cursor-pointer disabled:opacity-50"
                        title={res.isOpen ? 'Mark as Closed' : 'Mark as Open'}
                      >
                        {res.isOpen ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRestaurants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No restaurants match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRestaurant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">Edit Restaurant</h2>
              <button
                onClick={closeEditModal}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Status</label>
                <select
                  value={form.isOpen ? 'open' : 'closed'}
                  onChange={(e) => setForm({ ...form, isOpen: e.target.value === 'open' })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setDeleteTarget(editingRestaurant);
                  closeEditModal();
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                Delete Restaurant
              </button>
              <div className="space-x-2">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!form.name.trim() || saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20 transition cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-gray-900">Delete Restaurant</h2>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete{' '}
              <span className="font-bold text-gray-700">{deleteTarget.name}</span>? This action cannot be undone.
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