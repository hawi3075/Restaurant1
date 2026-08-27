import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Navigation,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Bell,
  ArrowRight,
  Truck
} from 'lucide-react';

export default function DriverDashboardHome() {
  const [stats, setStats] = useState({
    available: 0,
    inTransit: 0,
    delivered: 0,
    earnings: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      
      const allDeliveryOrders = response.data.filter((o) => o.orderType === 'DELIVERY');
      
      // Available orders ready for driver pickup
      const available = allDeliveryOrders.filter((o) => ['READY', 'READY_TO_SERVE'].includes(o.status)).length;
      const inTransit = allDeliveryOrders.filter(
        (o) => o.status === 'OUT_FOR_DELIVERY' && (!o.driverId || o.driverId === user?.id)
      ).length;

      const allDelivered = allDeliveryOrders.filter(
        (o) => o.status === 'DELIVERED' && (!o.driverId || o.driverId === user?.id)
      );
      const delivered = allDelivered.length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deliveredToday = allDelivered.filter(
        (o) => new Date(o.updatedAt) >= today
      );
      // Earnings: delivery fee (or 10% commission on order total)
      const earnings = deliveredToday.reduce((sum, o) => sum + (o.deliveryFee || (o.totalAmount * 0.1) || 50), 0);

      setStats({ available, inTransit, delivered, earnings });
      
      const recent = allDelivered
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
      setRecentDeliveries(recent);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (socket) {
      // Join driver global room for real-time order alerts
      socket.emit('join_room', 'driver_global');
      if (user?.id) socket.emit('join_user_room', user.id);

      socket.on('new_order', (newOrder) => {
        fetchDashboardData();
      });

      socket.on('order_status_updated', (updatedOrder) => {
        fetchDashboardData();
      });
    }

    return () => {
      if (socket) {
        socket.off('new_order');
        socket.off('order_status_updated');
      }
    };
  }, [socket, user?.id]);

  const getTimeAgo = (date) => {
    const minutes = Math.floor((Date.now() - new Date(date)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-2xl shadow-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
        </div>
      </div>

      {/* Stats Cards — compact & stylish */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-green-50 rounded-full" />
          <div className="relative flex items-start justify-between">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            {stats.available > 0 && (
              <div className="animate-pulse">
                <Bell className="w-4 h-4 text-green-600" />
              </div>
            )}
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-3">{stats.available}</h3>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-0.5">Available</p>
          {stats.available > 0 && (
            <button
              onClick={() => navigate('/driver/orders/new')}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg font-bold text-xs transition-all"
            >
              View
            </button>
          )}
        </div>

        <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-orange-50 rounded-full" />
          <div className="relative flex items-start justify-between">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-3">{stats.inTransit}</h3>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-0.5">In Transit</p>
          {stats.inTransit > 0 && (
            <button
              onClick={() => navigate('/driver/orders/on-way')}
              className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white py-1.5 rounded-lg font-bold text-xs transition-all"
            >
              Track
            </button>
          )}
        </div>

        <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-orange-50 rounded-full" />
          <div className="relative flex items-start justify-between">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-3">{stats.delivered}</h3>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-0.5">All Deliveries</p>
          <button
            onClick={() => navigate('/driver/orders/delivered')}
            className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white py-1.5 rounded-lg font-bold text-xs transition-all"
          >
            History
          </button>
        </div>

        <div className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-amber-50 rounded-full" />
          <div className="relative flex items-start justify-between">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-3">ETB {stats.earnings.toFixed(2)}</h3>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-0.5">Today's Earnings</p>
          <div className="mt-3 text-[10px] text-gray-400 text-center">
            10% of delivery total
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => navigate('/driver/orders/new')}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-orange-200 text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <h3 className="text-sm font-black text-gray-900 mb-0.5">New Orders</h3>
          <p className="text-xs text-gray-500">View available deliveries</p>
        </button>

        <button
          onClick={() => navigate('/driver/manual-order')}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-orange-200 text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <h3 className="text-sm font-black text-gray-900 mb-0.5">Manual Order</h3>
          <p className="text-xs text-gray-500">Create custom delivery</p>
        </button>

        <button
          onClick={() => navigate('/driver/my-deliveries')}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-orange-200 text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <h3 className="text-sm font-black text-gray-900 mb-0.5">My Deliveries</h3>
          <p className="text-xs text-gray-500">View complete history</p>
        </button>
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900">Recent Deliveries</h2>
          <button
            onClick={() => navigate('/driver/my-deliveries')}
            className="text-orange-600 hover:text-orange-700 font-bold text-xs flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentDeliveries.length === 0 ? (
          <div className="text-center py-10">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No recent deliveries</p>
            <p className="text-xs text-gray-400 mt-1">Your completed deliveries will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50/50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 text-green-600 p-1.5 rounded-md">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Order #{delivery.id.slice(0, 8)}</p>
                    <div className="flex items-center space-x-3 mt-0.5">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{delivery.customer?.name || 'Customer'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(delivery.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-sm">ETB {delivery.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-green-600 font-bold">
                    +ETB {(delivery.totalAmount * 0.1).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}