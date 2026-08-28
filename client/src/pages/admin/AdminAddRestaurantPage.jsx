import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Store, Plus, ArrowLeft, Save } from 'lucide-react';
import API from '../../services/api';
import ImageUpload from '../../components/ImageUpload';

export default function AdminAddRestaurantPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const isEditMode = Boolean(id);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    openingHours: '08:00 AM',
    closingHours: '10:00 PM',
    logo: '',
    coverImage: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch restaurant data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchRestaurant();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/restaurants/${id}`);
      const restaurant = response.data;
      
      setForm({
        name: restaurant.name || '',
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        openingHours: restaurant.openingHours || '08:00 AM',
        closingHours: restaurant.closingHours || '10:00 PM',
        logo: restaurant.logo || '',
        coverImage: restaurant.coverImage || '',
        latitude: restaurant.latitude || '',
        longitude: restaurant.longitude || ''
      });
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) {
      setError('Please fill in Name, Address, and Phone number.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null
      };

      if (isEditMode) {
        // Update existing restaurant
        await API.put(`/restaurants/${id}`, payload);
      } else {
        // Create new restaurant
        await API.post('/restaurants', payload);
      }
      
      navigate('/admin/restaurants/list');
    } catch (err) {
      console.error('Error saving restaurant:', err);
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} restaurant. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/admin/restaurants/list')}
            className="p-2 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {isEditMode ? 'Edit Restaurant' : 'Add New Restaurant'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditMode ? 'Update restaurant information' : 'Register a new vendor partner into the system.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-3xl space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="font-bold text-gray-600 uppercase">Restaurant Name *</label>
            <input 
              type="text" 
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Café Monarch" 
              className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition" 
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-gray-600 uppercase">Description</label>
            <textarea 
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description of the restaurant..." 
              className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition h-20 resize-none" 
            />
          </div>

          <div>
            <label className="font-bold text-gray-600 uppercase">Address *</label>
            <input 
              type="text" 
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. Bole Sub-City, Addis Ababa" 
              className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition" 
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-600 uppercase">Phone Number *</label>
            <input 
              type="text" 
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. +251 911 000 000" 
              className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition" 
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-600 uppercase">Opening Hours *</label>
            <input 
              type="text" 
              name="openingHours"
              value={form.openingHours}
              onChange={handleChange}
              placeholder="e.g. 08:00 AM" 
              className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition" 
              required
            />
          </div>

          <div>
            <label className="font-bold text-gray-600 uppercase">Closing Hours *</label>
            <input 
              type="text" 
              name="closingHours"
              value={form.closingHours}
              onChange={handleChange}
              placeholder="e.g. 10:00 PM" 
              className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition" 
              required
            />
          </div>

          <div>
            <ImageUpload
              label="Logo Image"
              value={form.logo}
              onChange={(value) => setForm(prev => ({ ...prev, logo: value }))}
              placeholder="Upload logo or enter image URL"
            />
          </div>

          <div>
            <ImageUpload
              label="Cover Image"
              value={form.coverImage}
              onChange={(value) => setForm(prev => ({ ...prev, coverImage: value }))}
              placeholder="Upload cover or enter image URL"
            />
          </div>

          <div>
            <label className="font-bold text-gray-600 uppercase">Latitude (Optional)</label>
            <input 
              type="number" 
              step="0.000001"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="e.g. 9.03" 
              className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition" 
            />
          </div>

          <div>
            <label className="font-bold text-gray-600 uppercase">Longitude (Optional)</label>
            <input 
              type="number" 
              step="0.000001"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="e.g. 38.74" 
              className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition" 
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button 
            type="button"
            onClick={() => navigate('/admin/restaurants/list')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-600/20 disabled:opacity-50 transition cursor-pointer"
          >
            {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : (isEditMode ? 'Update Restaurant' : 'Save Restaurant')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}