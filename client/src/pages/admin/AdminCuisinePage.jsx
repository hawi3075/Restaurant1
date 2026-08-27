import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import API from '../../services/api';

export default function AdminCuisinePage() {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingCuisine, setEditingCuisine] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', restaurants: '', status: 'Active' });

  useEffect(() => {
    fetchCuisines();
  }, []);

  const fetchCuisines = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/cuisines');
      setCuisines(response.data || []);
    } catch (error) {
      console.error('Error fetching cuisines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCuisines = cuisines.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function openAddModal() {
    setForm({ name: '', restaurants: '', status: 'Active' });
    setModalMode('add');
  }

  function openEditModal(cuisine) {
    setEditingCuisine(cuisine);
    setForm({
      name: cuisine.name,
      restaurants: cuisine.restaurants.toString(),
      status: cuisine.status,
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingCuisine(null);
  }

  async function handleSave() {
    if (!form.name.trim()) return;

    try {
      const payload = {
        name: form.name.trim(),
        restaurants: parseInt(form.restaurants) || 0,
        status: form.status,
      };

      if (modalMode === 'add') {
        const response = await API.post('/admin/cuisines', payload);
        setCuisines((prev) => [...prev, response.data]);
      } else if (modalMode === 'edit' && editingCuisine) {
        const response = await API.put(`/admin/cuisines/${editingCuisine.id}`, payload);
        setCuisines((prev) =>
          prev.map((c) => (c.id === editingCuisine.id ? response.data : c))
        );
      }
      closeModal();
    } catch (error) {
      console.error('Error saving cuisine:', error);
      alert('Failed to save cuisine. Please try again.');
    }
  }

  function confirmDelete(cuisine) {
    setDeleteTarget(cuisine);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await API.delete(`/admin/cuisines/${deleteTarget.id}`);
      setCuisines((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting cuisine:', error);
      alert('Failed to delete cuisine. Please try again.');
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cuisine Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage the cuisine categories restaurants can be tagged with.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cuisine</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cuisines..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
            />
          </div>
          <div className="text-sm font-bold text-gray-600">{filteredCuisines.length} Cuisine(s)</div>
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
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCuisines.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold flex items-center space-x-2 text-gray-900">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                    <span>{c.name}</span>
                  </td>
                  <td className="p-4">{c.restaurants} Restaurants</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-2 bg-gray-100 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(c)}
                      className="p-2 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredCuisines.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    No cuisines match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                {modalMode === 'add' ? 'Add Cuisine' : 'Edit Cuisine'}
              </h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Cuisine Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Mexican"
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Restaurants</label>
                <input
                  type="number"
                  min="0"
                  value={form.restaurants}
                  onChange={(e) => setForm({ ...form, restaurants: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20 transition cursor-pointer"
              >
                {modalMode === 'add' ? 'Add Cuisine' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-gray-900">Delete Cuisine</h2>
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}