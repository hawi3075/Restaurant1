import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';

export default function DriverOrdersDelivered() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today'); // today, week, month, all
  const [stats, setStats] = useState({ count: 0, totalEarnings: 0 });
  const { user } = useAuth();

  const fetchDeliveredOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      const deliveredOrders = response.data.filter(
        (o) =>
          o.orderType === 'DELIVERY' &&
          o.status === 'DELIVERED' &&
          (!o.driverId || o.driverId === user?.id)
      );

      deliveredOrders.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setOrders(deliveredOrders);
    } catch (err) {
      console.error('Error fetching delivered orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveredOrders();
  }, [user.id]);

  useEffect(() => {
    const now = new Date();
    let filtered = [...orders];

    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = orders.filter((o) => new Date(o.updatedAt) >= today);
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = orders.filter((o) => new Date(o.updatedAt) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = orders.filter((o) => new Date(o.updatedAt) >= monthAgo);
    }

    setFilteredOrders(filtered);

    const totalEarnings = filtered.reduce((sum, o) => sum + (o.totalAmount * 0.1), 0);
    setStats({ count: filtered.length, totalEarnings });
  }, [orders, filter]);

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d >= today) {
      return `Today ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (d >= yesterday) {
      return `Yesterday ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Delivered Orders</h1>
            <p className="text-sm text-gray-600">Your delivery history and earnings</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-orange-100 text-orange-600 p-2.5 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Deliveries</p>
              <p className="text-2xl font-black text-gray-900">{stats.count}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {filter === 'today' && 'Today\'s deliveries'}
            {filter === 'week' && 'Last 7 days'}
            {filter === 'month' && 'Last 30 days'}
            {filter === 'all' && 'All time'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-100 text-green-600 p-2.5 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Earnings</p>
              <p className="text-2xl font-black text-gray-900">ETB {stats.totalEarnings.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>10% of delivery total</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1.5 flex flex-wrap gap-1.5 mb-5">
        <button
          onClick={() => setFilter('today')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center space-x-1.5 ${
            filter === 'today'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-orange-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Today</span>
        </button>
        <button
          onClick={() => setFilter('week')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
            filter === 'week'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-orange-50'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setFilter('month')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
            filter === 'month'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-orange-50'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
            filter === 'all'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-orange-50'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No Delivered Orders</h3>
          <p className="text-sm text-gray-500">
            {filter === 'today' && 'No deliveries completed today yet'}
            {filter === 'week' && 'No deliveries in the last 7 days'}
            {filter === 'month' && 'No deliveries in the last 30 days'}
            {filter === 'all' && 'Your delivery history will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all border border-gray-100"
            >
              <div className="flex items-start justify-between">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-md">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm">Order #{index + 1}</h3>
                      <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(order.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-2 flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {order.customer?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.deliveryAddress || 'Address not available'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="bg-gray-50 rounded-lg p-2.5 mb-2">
                    <p className="text-xs text-gray-600 font-bold mb-1">
                      {order.items?.length || 0} items delivered
                    </p>
                    <div className="space-y-0.5">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-600">
                          • {item.quantity}x {item.food?.name}
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Payment: </span>
                    <span className="font-bold text-gray-900">{order.paymentMethod || 'Cash'}</span>
                  </div>
                </div>

                {/* Earnings Section */}
                <div className="text-right ml-4">
                  <div className="mb-1.5">
                    <p className="text-xs text-gray-500">Order Total</p>
                    <p className="text-lg font-black text-gray-900">ETB {order.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <div className="flex items-center space-x-1 mb-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-green-600" />
                      <p className="text-xs text-gray-600 font-bold">Your Earning</p>
                    </div>
                    <p className="text-lg font-black text-green-600">
                      +ETB {(order.totalAmount * 0.1).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Summary */}
      {filteredOrders.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-0.5">
                {filter === 'today' && 'Today\'s Summary'}
                {filter === 'week' && 'Last 7 Days Summary'}
                {filter === 'month' && 'Last 30 Days Summary'}
                {filter === 'all' && 'Total Summary'}
              </p>
              <p className="text-2xl font-black text-gray-900">
                {stats.count} {stats.count === 1 ? 'Delivery' : 'Deliveries'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 font-medium mb-0.5">Total Earnings</p>
              <p className="text-3xl font-black text-orange-600">ETB {stats.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}