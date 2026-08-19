import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/Toast';

export default function Address() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    fullAddress: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await API.get('/addresses');
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // If no addresses exist, just set empty array
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.title || !newAddress.fullAddress) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const addressData = {
        title: newAddress.title,
        address: newAddress.fullAddress, // Changed from fullAddress to address
        latitude: newAddress.latitude || null,
        longitude: newAddress.longitude || null,
      };

      const response = await API.post('/addresses', addressData);
      
      // Add the new address to the list
      const newAddr = response.data.address || response.data;
      setAddresses([...addresses, newAddr]);
      
      // Reset form
      setShowAddForm(false);
      setNewAddress({ title: '', fullAddress: '', latitude: '', longitude: '' });
      showToast('Address added successfully!', 'success');
    } catch (error) {
      console.error('Error adding address:', error);
      showToast(error.response?.data?.error || 'Failed to add address. Please try again.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await API.delete(`/addresses/${id}`);
      setAddresses(addresses.filter((addr) => addr.id !== id));
      showToast('Address deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast(error.response?.data?.error || 'Failed to delete address. Please try again.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <MapPin className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to login to manage your addresses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Addresses</h1>
          <p className="text-sm text-gray-500">Manage your delivery locations</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-600/20 transition text-sm"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </>
          )}
        </button>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-orange-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Address</h3>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Address Title *
              </label>
              <input
                type="text"
                value={newAddress.title}
                onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                placeholder="e.g., Home, Office, etc."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Full Address *
              </label>
              <textarea
                value={newAddress.fullAddress}
                onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                placeholder="Enter your complete address"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Latitude (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress.latitude}
                  onChange={(e) => setNewAddress({ ...newAddress, latitude: e.target.value })}
                  placeholder="e.g., 9.0320"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Longitude (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress.longitude}
                  onChange={(e) => setNewAddress({ ...newAddress, longitude: e.target.value })}
                  placeholder="e.g., 38.7464"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              Save Address
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-lg">
          <MapPin className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 mb-3">No Saved Addresses</h3>
          <p className="text-gray-500 mb-8">Add your first delivery address to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Address</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-orange-50 text-orange-600 p-3.5 rounded-2xl mt-1">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                    {index === 0 && (
                      <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Default</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{item.address || item.fullAddress}</p>
                  {item.latitude && item.longitude && (
                    <p className="text-xs text-gray-400 mt-1">
                      Coordinates: {item.latitude}, {item.longitude}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteAddress(item.id)}
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}