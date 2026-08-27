import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import API from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    businessName: '',
    supportEmail: '',
    supportPhone: '',
    deliveryFee: '',
    commissionRate: '',
    currency: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/settings');
      if (response.data) {
        setForm({
          businessName: response.data.businessName || '',
          supportEmail: response.data.supportEmail || '',
          supportPhone: response.data.supportPhone || '',
          deliveryFee: response.data.deliveryFee?.toString() || '0',
          commissionRate: response.data.commissionRate?.toString() || '0',
          currency: response.data.currency || 'ETB',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load business settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const payload = {
        businessName: form.businessName,
        supportEmail: form.supportEmail,
        supportPhone: form.supportPhone,
        deliveryFee: parseFloat(form.deliveryFee) || 0,
        commissionRate: parseFloat(form.commissionRate) || 0,
        currency: form.currency
      };

      const response = await API.put('/admin/settings', payload);
      setMessage({ type: 'success', text: 'Business setup updated successfully!' });
      
      // Update form with clean response values
      setForm({
        businessName: response.data.businessName || '',
        supportEmail: response.data.supportEmail || '',
        supportPhone: response.data.supportPhone || '',
        deliveryFee: response.data.deliveryFee?.toString() || '0',
        commissionRate: response.data.commissionRate?.toString() || '0',
        currency: response.data.currency || 'ETB',
      });

      // Synchronize global settings context instantly across the application
      refreshSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3">
        <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Business Setup</h1>
          <p className="text-xs text-gray-500 mt-0.5">Core platform settings for fees, contact info, and currency.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-3xl space-y-4">
          {message.text && (
            <div className={`p-3 text-xs font-semibold rounded-xl ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-gray-600 uppercase">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-600 uppercase">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={form.supportEmail}
                onChange={handleChange}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-600 uppercase">Support Phone</label>
              <input
                type="text"
                name="supportPhone"
                value={form.supportPhone}
                onChange={handleChange}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-600 uppercase">Currency</label>
              <input
                type="text"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-600 uppercase">Default Delivery Fee</label>
              <input
                type="number"
                name="deliveryFee"
                value={form.deliveryFee}
                onChange={handleChange}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-600 uppercase">Platform Commission (%)</label>
              <input
                type="number"
                name="commissionRate"
                value={form.commissionRate}
                onChange={handleChange}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
