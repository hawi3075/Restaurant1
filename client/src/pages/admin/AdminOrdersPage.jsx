import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, RefreshCw, Clock, Bike, RotateCcw } from 'lucide-react';
import API from '../../services/api';

// filter: 'all' | 'pending' | 'delivering' | 'refunds'
const FILTER_CONFIG = {
  all: {
    title: 'All Orders',
    subtitle: 'A complete log of every order placed on the platform.',
    icon: ShoppingBag,
    statuses: null, // no filter
  },
  pending: {
    title: 'Pending Orders',
    subtitle: 'Orders awaiting confirmation or currently being prepared.',
    icon: Clock,
    statuses: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'],
  },
  delivering: {
    title: 'Out for Delivery',
    subtitle: 'Orders currently on the road with a delivery partner.',
    icon: Bike,
    statuses: ['OUT_FOR_DELIVERY'],
  },
  refunds: {
    title: 'Refund Requests',
    subtitle: 'Cancelled orders that may require a refund review.',
    icon: RotateCcw,
    statuses: ['CANCELLED'],
  },
};

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  READY: 'bg-indigo-100 text-indigo-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  READY_TO_SERVE: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  SERVED: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function AdminOrdersPage({ filter = 'all' }) {
  const config = FILTER_CONFIG[filter] || FILTER_CONFIG.all;
  const Icon = config.icon;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Could not load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scoped = config.statuses
    ? orders.filter((o) => config.statuses.includes(o.status))
    : orders;

  const filteredOrders = scoped.filter((o) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.id?.toLowerCase().includes(term) ||
      o.customer?.name?.toLowerCase().includes(term) ||
      o.restaurant?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{config.title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{config.subtitle}</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order, customer, restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-orange-500 transition"
            />
          </div>
          <div className="text-sm font-bold text-gray-600">
            {filteredOrders.length} Order(s)
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-rose-600 font-semibold">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <Icon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-500">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">There's nothing in this queue right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Restaurant</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold text-gray-900">#{index + 1}</td>
                    <td className="p-4">{order.customer?.name || '—'}</td>
                    <td className="p-4">{order.restaurant?.name || '—'}</td>
                    <td className="p-4">{order.orderType}</td>
                    <td className="p-4 font-bold text-orange-600">
                      {Number(order.totalAmount || 0).toFixed(2)} ETB
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}