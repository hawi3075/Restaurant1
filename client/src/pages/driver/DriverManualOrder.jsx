import React, { useState } from 'react';
import { PlusCircle, Package, MapPin, Phone, DollarSign, User } from 'lucide-react';

export default function DriverManualOrder() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    orderDetails: '',
    totalAmount: '',
    paymentMethod: 'CASH',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.customerName || !formData.customerPhone || !formData.deliveryAddress || !formData.totalAmount) {
      if (window.showToast) {
        window.showToast('Please fill in all required fields', 'error');
      }
      return;
    }

    // TODO: Integrate with backend API
    console.log('Manual Order:', formData);
    
    if (window.showToast) {
      window.showToast('Manual order created successfully!', 'success');
    }

    // Reset form
    setFormData({
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      orderDetails: '',
      totalAmount: '',
      paymentMethod: 'CASH',
      notes: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Manual Order</h1>
            <p className="text-gray-600">Create a custom delivery order</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-100 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Use this form to create delivery orders for walk-in customers or phone orders that need to be delivered.
        </p>
      </div>

      {/* Manual Order Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Customer Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="+251 123 456 789"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Delivery Address</span>
            </h2>
            
            <textarea
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="Enter full delivery address with landmarks"
              rows="3"
              required
            />
          </div>

          {/* Order Details */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Order Details</span>
            </h2>
            
            <textarea
              name="orderDetails"
              value={formData.orderDetails}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="List items in the order (e.g., 2x Doro Wot, 1x Kitfo, 3x Injera)"
              rows="4"
            />
          </div>

          {/* Payment Information */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span>Payment Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Total Amount (Birr) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                {formData.totalAmount && (
                  <p className="text-xs text-green-600 mt-1 font-bold">
                    Your earning: ETB {(parseFloat(formData.totalAmount) * 0.1).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                >
                  <option value="CASH">Cash on Delivery</option>
                  <option value="CARD">Card</option>
                  <option value="MOBILE">Mobile Payment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="Any special instructions or notes"
              rows="2"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Manual Order</span>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({
                customerName: '',
                customerPhone: '',
                deliveryAddress: '',
                orderDetails: '',
                totalAmount: '',
                paymentMethod: 'CASH',
                notes: ''
              })}
              className="px-8 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-bold transition-all"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 max-w-3xl">
        <p className="text-sm text-amber-800">
          <strong>💡 Tip:</strong> Manual orders are useful for special deliveries, catering orders, or when customers call directly. Make sure to get accurate address and contact information!
        </p>
      </div>
    </div>
  );
}
