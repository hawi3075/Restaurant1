import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Search, Edit, Trash2 } from 'lucide-react';
import API from '../../services/api';

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await API.get('/foods');
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Food Management</h1>
          <p className="text-gray-600 mt-1">Manage all food items</p>
        </div>
        <button className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
          <Plus className="w-5 h-5" />
          <span>Add New Food</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={food.image || '/m1.jpg'}
                alt={food.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-black text-gray-900 mb-1">{food.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{food.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-black text-xl">${food.price}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    food.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {food.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-1">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button className="px-4 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
