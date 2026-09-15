import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, ArrowRight, Package } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import showToast from '../../components/Toast';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Please Login</h2>
        <p className="text-gray-500">Login to view your order history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500">Track and review your past food orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Orders Found</h3>
          <p className="text-gray-500">You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{order.restaurant?.name || 'Restaurant'}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2.5 py-0.5 rounded-md">#{order.id.slice(0, 8)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} • 
                    Total: <span className="font-bold text-gray-700">ETB {order.totalAmount.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                <span className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                  ['DELIVERED', 'SERVED', 'COMPLETED'].includes(order.status) 
                    ? 'text-emerald-600 bg-emerald-50'
                    : order.status === 'CANCELLED' 
                    ? 'text-red-600 bg-red-50'
                    : 'text-orange-600 bg-orange-50'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase().replace('_', ' ')}</span>
                </span>
                <button className="flex items-center space-x-1 bg-gray-100 hover:bg-orange-600 hover:text-white text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition">
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}