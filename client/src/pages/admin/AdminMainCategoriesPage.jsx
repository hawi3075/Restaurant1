import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';
import API from '../../services/api';

export default function AdminMainCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.get('/foods/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Food Categories</h1>
          <p className="text-gray-600 mt-1">Manage food categories</p>
        </div>
        <button className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Layers className="w-8 h-8 text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category._count?.foods || 0} items</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-1">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="px-4 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
