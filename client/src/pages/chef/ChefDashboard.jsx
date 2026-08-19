import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, ChefHat, Package, LogOut, Bell, AlertCircle } from 'lucide-react';

export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    completed: 0,
  });
  const [filter, setFilter] = useState('all'); // all, pending, preparing, ready
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

  // Check if user is chef
  if (!user || user.role !== 'CHEF') {
    return <Navigate to="/login" replace />;
  }

  const fetchKitchenOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      // Filter for active kitchen orders and orders for this chef's restaurant
      const activeOrders = response.data.filter(
        (o) =>
          ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'READY_TO_SERVE'].includes(o.status) &&
          (!user.restaurantId || o.restaurantId === user.restaurantId)
      );
      setOrders(activeOrders);

      // Calculate stats
      const pending = activeOrders.filter((o) => o.status === 'PENDING').length;
      const preparing = activeOrders.filter((o) =>
        ['CONFIRMED', 'PREPARING'].includes(o.status)
      ).length;
      const completed = response.data.filter(
        (o) =>
          ['DELIVERED', 'SERVED', 'COMPLETED'].includes(o.status) &&
          (!user.restaurantId || o.restaurantId === user.restaurantId)
      ).length;

      setStats({ pending, preparing, completed });
    } catch (err) {
      console.error('Error loading kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();

    if (socket && user.restaurantId) {
      // Join restaurant room for real-time updates
      socket.emit('join_room', user.restaurantId);

      socket.on('new_order', (newOrder) => {
        if (newOrder.restaurantId === user.restaurantId) {
          setOrders((prev) => [newOrder, ...prev]);
          setStats((prev) => ({ ...prev, pending: prev.pending + 1 }));
          // Play notification sound
          new Audio('/notification.mp3').play().catch(() => {});
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.restaurantId === user.restaurantId) {
          setOrders((prev) =>
            prev
              .map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
              .filter((o) =>
                ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'READY_TO_SERVE'].includes(o.status)
              )
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
  }, [socket, user.restaurantId]);

  const updateStatus = async (orderId, newStatus, notes = '') => {
    try {
      await API.put(`/orders/${orderId}/status`, { 
        status: newStatus,
        notes: notes || `Chef updated status to ${newStatus}`
      });
      
      // Emit socket event for real-time update
      if (socket) {
        const order = orders.find(o => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: newStatus,
          restaurantId: user.restaurantId,
          customerId: order?.customerId,
        });
      }
      
      fetchKitchenOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = () => {
    if (filter === 'all') return orders;
    if (filter === 'pending') return orders.filter((o) => o.status === 'PENDING');
    if (filter === 'preparing')
      return orders.filter((o) => ['CONFIRMED', 'PREPARING'].includes(o.status));
    if (filter === 'ready')
      return orders.filter((o) => ['READY', 'READY_TO_SERVE'].includes(o.status));
    return orders;
  };

  const getOrderAge = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <ChefHat className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Chef Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition">
                <Bell className="w-5 h-5 text-gray-600" />
                {stats.pending > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {stats.pending}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stats.pending}</h3>
            <p className="text-sm text-gray-600 mt-1">New Orders</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
                <ChefHat className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stats.preparing}</h3>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stats.completed}</h3>
            <p className="text-sm text-gray-600 mt-1">Completed Today</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'all'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'pending'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            New ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'preparing'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            In Progress ({stats.preparing})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'ready'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ready
          </button>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredOrders().length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No Orders</h3>
            <p className="text-gray-500">No orders in the {filter} queue right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders().map((order) => {
              const isUrgent = new Date() - new Date(order.createdAt) > 15 * 60 * 1000; // 15+ minutes

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-shadow ${
                    isUrgent ? 'border-red-300 animate-pulse' : 'border-gray-100'
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
                        order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'PREPARING'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Order Type */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                        order.orderType === 'DELIVERY'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {order.orderType === 'DELIVERY' ? '🚚 Delivery' : '🍽️ Dine-In'}
                    </span>
                  </div>

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4">
                      <p className="text-xs font-bold mb-1">⚠️ Special Instructions:</p>
                      <p className="text-xs">{order.specialInstructions}</p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg"
                      >
                        <span className="font-bold text-gray-900">
                          {item.quantity}x {item.food?.name}
                        </span>
                        <span className="text-gray-600">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => updateStatus(order.id, 'CONFIRMED')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg"
                      >
                        ✓ Accept Order
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => updateStatus(order.id, 'PREPARING')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg"
                      >
                        👨‍🍳 Start Preparing
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() =>
                          updateStatus(
                            order.id,
                            order.orderType === 'DELIVERY' ? 'READY' : 'READY_TO_SERVE'
                          )
                        }
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Mark as Ready</span>
                      </button>
                    )}
                    {['READY', 'READY_TO_SERVE'].includes(order.status) && (
                      <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-center">
                        <p className="text-sm font-bold">
                          ✓ Ready for {order.orderType === 'DELIVERY' ? 'Pickup' : 'Serving'}
                        </p>
                      </div>
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