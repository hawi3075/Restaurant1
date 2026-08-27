import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Search, Edit, Trash2, X, Image } from 'lucide-react';
import API from '../../services/api';

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingFood, setEditingFood] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    restaurantId: '',
    isPopular: false,
    isAvailable: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [foodsRes, catsRes, restsRes] = await Promise.all([
        API.get('/foods'),
        API.get('/foods/categories'),
        API.get('/restaurants')
      ]);
      setFoods(foodsRes.data || []);
      setCategories(catsRes.data || []);
      setRestaurants(restsRes.data || []);
    } catch (error) {
      console.error('Error fetching foods data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openAddModal() {
    setForm({
      name: '',
      description: '',
      price: '',
      image: '',
      categoryId: categories[0]?.id || '',
      restaurantId: restaurants[0]?.id || '',
      isPopular: false,
      isAvailable: true
    });
    setModalMode('add');
  }

  function openEditModal(food) {
    setEditingFood(food);
    setForm({
      name: food.name || '',
      description: food.description || '',
      price: food.price.toString(),
      image: food.image || '',
      categoryId: food.categoryId || '',
      restaurantId: food.restaurantId || '',
      isPopular: !!food.isPopular,
      isAvailable: !!food.isAvailable
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingFood(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.categoryId || !form.restaurantId) {
      alert('Please fill in Name, Price, Category, and Restaurant.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        price: parseFloat(form.price),
        isPopular: form.isPopular,
        isAvailable: form.isAvailable
      };

      if (modalMode === 'add') {
        const response = await API.post('/foods', payload);
        // Refresh local list or append with detailed nested objects
        await fetchData();
      } else if (modalMode === 'edit' && editingFood) {
        await API.put(`/foods/${editingFood.id}`, payload);
        await fetchData();
      }
      closeModal();
    } catch (error) {
      console.error('Error saving food item:', error);
      alert('Failed to save food item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/foods/${deleteTarget.id}`);
      setFoods((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Failed to delete food. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Food Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage all food items, pricing, and availability status.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Food</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none text-xs transition"
          />
        </div>
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">No food items found</p>
          <p className="text-xs text-gray-400 mt-1">There are no dishes matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col"
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={food.image || '/m1.webp'}
                  alt={food.name}
                  className="w-full h-full object-cover"
                />
                {food.isPopular && (
                  <span className="absolute top-3 left-3 bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    POPULAR
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm truncate">{food.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 h-8">{food.description || 'No description available.'}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    <span className="font-semibold text-gray-600">{food.restaurant?.name}</span> • {food.category?.name}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-black text-base">{Number(food.price || 0).toFixed(2)} ETB</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    food.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {food.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button 
                    onClick={() => openEditModal(food)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => setDeleteTarget(food)}
                    className="px-4 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-black text-gray-900">
                {modalMode === 'add' ? 'Add New Food Item' : 'Edit Food Item'}
              </h2>
              <button 
                type="button"
                onClick={closeModal} 
                className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-gray-500 uppercase tracking-wide">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Special Tibs"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-500 uppercase tracking-wide">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the dish ingredients or size..."
                  className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition h-16 resize-none"
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
                  placeholder="e.g. 250"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="e.g. /uploads/dish.webp"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Category *</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide">Restaurant Vendor *</label>
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

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={form.isPopular}
                  onChange={e => setForm({ ...form, isPopular: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isPopular" className="font-bold text-gray-600 uppercase select-none cursor-pointer">
                  Mark as Popular
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={form.isAvailable}
                  onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isAvailable" className="font-bold text-gray-600 uppercase select-none cursor-pointer">
                  Is Available
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t pt-3">
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
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 shadow-lg shadow-orange-600/20 transition cursor-pointer"
              >
                {saving ? 'Saving...' : modalMode === 'add' ? 'Add Food' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-gray-900">Delete Food Item</h2>
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
