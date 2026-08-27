import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import API from '../../services/api';

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingAddon, setEditingAddon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    price: '',
    foodId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [addonsRes, foodsRes] = await Promise.all([
        API.get('/foods/addons'),
        API.get('/foods')
      ]);
      setAddons(addonsRes.data || []);
      setFoods(foodsRes.data || []);
    } catch (error) {
      console.error('Error fetching addons data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAddons = addons.filter((addon) =>
    addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addon.food?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openAddModal() {
    setForm({
      name: '',
      price: '',
      foodId: foods[0]?.id || ''
    });
    setModalMode('add');
  }

  function openEditModal(addon) {
    setEditingAddon(addon);
    setForm({
      name: addon.name || '',
      price: addon.price.toString(),
      foodId: addon.foodId || ''
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingAddon(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.foodId) {
      alert('Please fill in Name, Price, and select a Food Item.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        foodId: form.foodId
      };

      if (modalMode === 'add') {
        const response = await API.post('/foods/addons', payload);
        setAddons(prev => [...prev, response.data]);
      } else if (modalMode === 'edit' && editingAddon) {
        const response = await API.put(`/foods/addons/${editingAddon.id}`, payload);
        setAddons(prev =>
          prev.map(a => (a.id === editingAddon.id ? response.data : a))
        );
      }
      closeModal();
    } catch (error) {
      console.error('Error saving addon:', error);
      alert('Failed to save addon. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/foods/addons/${deleteTarget.id}`);
      setAddons(prev => prev.filter(a => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting addon:', error);
      alert('Failed to delete addon. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Addons Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Configure extras, sides, and beverage add-ons.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Addon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search addons..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition" 
            />
          </div>
          <div className="text-sm font-bold text-gray-600">
            {filteredAddons.length} Addon(s)
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredAddons.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-xs font-bold">No addons found matching search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Addon Name</th>
                  <th className="p-4">Linked Food Item</th>
                  <th className="p-4">Restaurant</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredAddons.map(addon => (
                  <tr key={addon.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold flex items-center space-x-2 text-gray-900">
                      <ShoppingBag className="w-4 h-4 text-orange-500" />
                      <span>{addon.name}</span>
                    </td>
                    <td className="p-4 text-gray-700">{addon.food?.name}</td>
                    <td className="p-4 text-gray-500">{addon.food?.restaurant?.name || '—'}</td>
                    <td className="p-4 font-black text-gray-900">{Number(addon.price || 0).toFixed(2)} ETB</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(addon)}
                        className="p-2 bg-gray-100 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(addon)}
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

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                {modalMode === 'add' ? 'Add New Addon' : 'Edit Addon'}
              </h2>
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
                <label className="font-bold text-gray-500 uppercase tracking-wide">Addon Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Extra Cheese"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Price (ETB) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 50"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Link to Food Item *</label>
                <select
                  required
                  value={form.foodId}
                  onChange={e => setForm({ ...form, foodId: e.target.value })}
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                >
                  {foods.map(food => (
                    <option key={food.id} value={food.id}>
                      {food.name} ({food.restaurant?.name || '—'})
                    </option>
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
                {saving ? 'Saving...' : modalMode === 'add' ? 'Add Addon' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-gray-900">Delete Addon</h2>
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