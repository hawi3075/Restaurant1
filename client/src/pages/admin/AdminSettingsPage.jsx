import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    businessName: 'ማእድ Food Delivery',
    supportEmail: 'support@maed.com',
    supportPhone: '+251 900 000 000',
    deliveryFee: '50',
    commissionRate: '15',
    currency: 'ETB',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-3xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-600 uppercase">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
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
            />
          </div>
        </div>

        <div className="pt-2">
          <button className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
