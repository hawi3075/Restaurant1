import React from 'react';
import { PlusCircle, Utensils } from 'lucide-react';
import DashboardHeader from '../../components/DashboardHeader';

export default function WaiterNewOrder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Global Top Header */}
      <DashboardHeader />

      {/* Page Content Header */}
      <div className="bg-white border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create New Order (POS) 🍽️</h1>
              <p className="text-sm text-gray-600 mt-0.5">Create walk-in orders for dine-in customers</p>
            </div>
            <div className="flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-xl border border-orange-200">
              <PlusCircle className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">Point of Sale</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Coming Soon Card */}
          <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-gray-100 hover:border-orange-300 transition-all">
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-orange-600" />
            </div>
            
            <h2 className="text-xl font-black text-gray-900 mb-2">Manual Order Creation</h2>
            
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              This feature will allow you to create orders manually for walk-in customers. 
              You'll be able to select menu items, customize orders, assign tables, and process payments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl">
                <h3 className="text-sm font-bold text-gray-900 mb-1">1. Select Items</h3>
                <p className="text-xs text-gray-500">Browse menu and add items</p>
              </div>
              <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl">
                <h3 className="text-sm font-bold text-gray-900 mb-1">2. Assign Table</h3>
                <p className="text-xs text-gray-500">Select table for dine-in</p>
              </div>
              <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl">
                <h3 className="text-sm font-bold text-gray-900 mb-1">3. Send to Kitchen</h3>
                <p className="text-xs text-gray-500">Submit for preparation</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2.5 rounded-xl inline-block shadow-2xs">
              <p className="text-sm font-bold">🚀 Feature coming in next update</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl p-5 shadow-md">
            <h3 className="font-black text-sm mb-1">💡 For Now:</h3>
            <p className="text-xs opacity-95 leading-relaxed">
              Customers can place orders through the customer portal. You can view and manage those orders 
              in the "New Orders", "Cooking", and "Food Ready" sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}