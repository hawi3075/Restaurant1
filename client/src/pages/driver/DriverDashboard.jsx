import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bike,
  Navigation,
  CheckCircle,
  LogOut,
  Bell,
  Clock,
  MapPin,
  Package,
  Phone,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    inTransit: 0,
    delivered: 0,
    earnings: 0,
  });
  const [filter, setFilter] = useState('all'); // all, available, transit
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user, logout, loading: authLoading } = useAuth();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is driver
  if (!user || user.role !== 'DRIVER') {
    return <Navigate to="/login" replace />;
  }

  const fetchDeliveryOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      
      // Filter for delivery orders
      const allDeliveryOrders = response.data.filter((o) => o.orderType === 'DELIVERY');
      
      // Active delivery orders (available or in transit)
      const activeOrders = allDeliveryOrders.filter(
        (o) =>
          ['READY', 'OUT_FOR_DELIVERY'].includes(o.status) &&
          (!o.driverId || o.driverId === user.id)
      );
      
      setOrders(activeOrders);

      // Calculate stats
      const available = activeOrders.filter((o) => o.status === 'READY').length;
      const inTransit = activeOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
      
      // Count delivered today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deliveredToday = allDeliveryOrders.filter(
        (o) =>
          o.status === 'DELIVERED' &&
          o.driverId === user.id &&
          new Date(o.updatedAt) >= today
      );
      const delivered = deliveredToday.length;
      
      // Calculate today's earnings (assuming delivery fee is 10% of order total)
      const earnings = deliveredToday.reduce((sum, o) => sum + (o.totalAmount * 0.1), 0);

      setStats({ available, inTransit, delivered, earnings });
    } catch (err) {
      console.error('Error fetching delivery orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();

    if (socket) {
      socket.on('new_order', (newOrder) => {
        if (newOrder.orderType === 'DELIVERY' && newOrder.status === 'READY') {
          setOrders((prev) => [newOrder, ...prev]);
          setStats((prev) => ({ ...prev, available: prev.available + 1 }));
          // Play notification sound
          new Audio('/notification.mp3').play().catch(() => {});
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.orderType === 'DELIVERY') {
          setOrders((prev) =>
            prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          );
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new_order');
        socket.off('order_status_updated');
      }
    };
  }, [socket, user.id]);

  const updateStatus = async (orderId, newStatus, notes = '') => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
        driverId: user.id,
        notes: notes || `Driver updated status to ${newStatus}`,
      });

      // Emit socket event for real-time update
      if (socket) {
        const order = orders.find((o) => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: newStatus,
          driverId: user.id,
          customerId: order?.customerId,
          restaurantId: order?.restaurantId,
        });
      }

      fetchDeliveryOrders();
    } catch (err) {
      console.error('Failed to update delivery status:', err);
      alert('Failed to update delivery status');
    }
  };

  const filteredOrders = () => {
    if (filter === 'all') return orders;
    if (filter === 'available') return orders.filter((o) => o.status === 'READY');
    if (filter === 'transit') return orders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
    return orders;
  };

  const getOrderAge = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Bike className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Driver Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition">
                <Bell className="w-5 h-5 text-gray-600" />
                {stats.available > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {stats.available}
                  </span>
                )}
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition font-bold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stats.available}</h3>
            <p className="text-sm text-gray-600 mt-1">Available Orders</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                <Navigation className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stats.inTransit}</h3>
            <p className="text-sm text-gray-600 mt-1">In Transit</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stats.delivered}</h3>
            <p className="text-sm text-gray-600 mt-1">Delivered Today</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">${stats.earnings.toFixed(2)}</h3>
            <p className="text-sm text-gray-600 mt-1">Today's Earnings</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'all'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'available'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Available ({stats.available})
          </button>
          <button
            onClick={() => setFilter('transit')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'transit'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            In Transit ({stats.inTransit})
          </button>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
          </div>
        ) : filteredOrders().length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <Bike className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No Deliveries</h3>
            <p className="text-gray-500">No delivery orders in the {filter} queue right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders().map((order) => {
              const isUrgent = order.status === 'OUT_FOR_DELIVERY' && 
                new Date() - new Date(order.updatedAt) > 20 * 60 * 1000; // 20+ minutes in transit

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-shadow ${
                    isUrgent
                      ? 'border-red-300 ring-2 ring-red-200'
                      : order.status === 'READY'
                      ? 'border-green-300'
                      : 'border-blue-300'
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">
                        #{order.id.slice(0, 8)}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                          {getOrderAge(order.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'READY'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status === 'READY' ? 'READY FOR PICKUP' : 'IN TRANSIT'}
                    </span>
                  </div>

                  {/* Restaurant Info */}
                  <div className="mb-4 p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600 font-bold">Pick up from:</p>
                        <p className="text-sm font-bold text-gray-900">
                          {order.restaurant?.name || 'Restaurant'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.restaurant?.address || 'Address not available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 font-bold">Deliver to:</p>
                        <p className="text-sm font-bold text-gray-900">
                          {order.customer?.name || 'Customer'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.deliveryAddress || 'Address not available'}
                        </p>
                        {order.customer?.phone && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Phone className="w-3 h-3 text-blue-600" />
                            <a
                              href={`tel:${order.customer.phone}`}
                              className="text-xs text-blue-600 hover:underline font-bold"
                            >
                              {order.customer.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 font-bold mb-2">Order Items:</p>
                    <div className="space-y-1">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                          <span className="text-gray-700">
                            {item.quantity}x {item.food?.name}
                          </span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="text-xs text-gray-500 text-center py-1">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="flex justify-between items-center border-t pt-3 mb-4">
                    <span className="text-sm font-bold text-gray-600">Order Total:</span>
                    <span className="text-lg font-black text-gray-900">
                      ${order.totalAmount?.toFixed(2)}
                    </span>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-4 text-xs">
                    <span className="text-gray-600">Payment: </span>
                    <span className="font-bold text-gray-900">{order.paymentMethod || 'Cash'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {order.status === 'READY' && (
                      <button
                        onClick={() => updateStatus(order.id, 'OUT_FOR_DELIVERY')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Navigation className="w-5 h-5" />
                        <span>Accept & Pick Up</span>
                      </button>
                    )}
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'DELIVERED')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Confirm Delivered</span>
                        </button>
                        <div className="text-xs text-center text-gray-500">
                          Delivery Fee: ${(order.totalAmount * 0.1).toFixed(2)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}