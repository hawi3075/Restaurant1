import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, X, Image } from 'lucide-react';
import API from '../../services/api';

export default function AdminMainCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', image: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.get('/foods/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  function openAddModal() {
    setForm({ name: '', image: '' });
    setModalMode('add');
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      image: category.image || ''
    });
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingCategory(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        image: form.image.trim() || null
      };

      if (modalMode === 'add') {
        const response = await API.post('/foods/categories', payload);
        const newCat = {
          ...response.data.category,
          _count: { foods: 0 }
        };
        setCategories(prev => [...prev, newCat]);
      } else if (modalMode === 'edit' && editingCategory) {
        const response = await API.put(`/foods/categories/${editingCategory.id}`, payload);
        setCategories(prev =>
          prev.map(c => (c.id === editingCategory.id ? { ...c, ...response.data } : c))
        );
      }
      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/foods/categories/${deleteTarget.id}`);
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Food Categories</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage food categories for tagging global food catalog menus.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">No categories found</p>
          <p className="text-xs text-gray-400 mt-1">Get started by creating your first food category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <Layers className="w-8 h-8 text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{category._count?.foods || 0} items</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => openEditModal(category)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => setDeleteTarget(category)}
                  className="px-4 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
              </h2>
              <button 
                type="button"
                onClick={closeModal} 
                className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Category Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Traditional, Fast Food"
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Category Image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="e.g. /uploads/traditional.webp"
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
                />
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
                disabled={!form.name.trim() || saving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20 transition cursor-pointer"
              >
                {saving ? 'Saving...' : modalMode === 'add' ? 'Add Category' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-gray-900">Delete Category</h2>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete <span className="font-bold text-gray-700">{deleteTarget.name}</span>?
              All food items belonging to this category will also be deleted. This action cannot be undone.
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
