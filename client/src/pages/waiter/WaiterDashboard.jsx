import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Utensils, 
  CheckCircle, 
  Bell, 
  LogOut, 
  Clock, 
  Plus,
  Users,
  AlertCircle,
  X
} from 'lucide-react';

export default function WaiterDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    inKitchen: 0,
    readyToServe: 0,
    served: 0,
  });
  const [filter, setFilter] = useState('all'); // all, kitchen, ready, served
  const [loading, setLoading] = useState(true);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
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

  // Check if user is waiter
  if (!user || user.role !== 'WAITER') {
    return <Navigate to="/login" replace />;
  }

  const fetchWaiterOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      // Filter for dine-in orders at this waiter's restaurant
      const dineInOrders = response.data.filter(
        (o) =>
          o.orderType === 'DINE_IN' &&
          !['COMPLETED', 'CANCELLED'].includes(o.status) &&
          (!user.restaurantId || o.restaurantId === user.restaurantId)
      );
      setOrders(dineInOrders);

      // Calculate stats
      const inKitchen = dineInOrders.filter((o) =>
        ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)
      ).length;
      const readyToServe = dineInOrders.filter((o) => o.status === 'READY_TO_SERVE').length;
      const served = dineInOrders.filter((o) => o.status === 'SERVED').length;

      setStats({ inKitchen, readyToServe, served });
    } catch (err) {
      console.error('Error fetching dine-in orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaiterOrders();

    if (socket && user.restaurantId) {
      // Join restaurant room for real-time updates
      socket.emit('join_room', user.restaurantId);

      socket.on('new_order', (newOrder) => {
        if (newOrder.orderType === 'DINE_IN' && newOrder.restaurantId === user.restaurantId) {
          setOrders((prev) => [newOrder, ...prev]);
          setStats((prev) => ({ ...prev, inKitchen: prev.inKitchen + 1 }));
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.orderType === 'DINE_IN' && updatedOrder.restaurantId === user.restaurantId) {
          setOrders((prev) =>
            prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          );

          // Play notification if order is ready to serve
          if (updatedOrder.status === 'READY_TO_SERVE') {
            new Audio('/notification.mp3').play().catch(() => {});
          }
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
        notes: notes || `Waiter updated status to ${newStatus}`,
      });

      // Emit socket event for real-time update
      if (socket) {
        const order = orders.find((o) => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: newStatus,
          restaurantId: user.restaurantId,
          customerId: order?.customerId,
        });
      }

      fetchWaiterOrders();
    } catch (err) {
      console.error('Failed to update dine-in order status:', err);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = () => {
    if (filter === 'all') return orders;
    if (filter === 'kitchen')
      return orders.filter((o) => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status));
    if (filter === 'ready') return orders.filter((o) => o.status === 'READY_TO_SERVE');
    if (filter === 'served') return orders.filter((o) => o.status === 'SERVED');
    return orders;
  };

  const getOrderAge = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Utensils className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Waiter Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition">
                <Bell className="w-5 h-5 text-gray-600" />
                {stats.readyToServe > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {stats.readyToServe}
                  </span>
                )}
              </button>

              {/* New Order Button */}
              <button
                onClick={() => setShowNewOrderModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-bold text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Order</span>
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
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stats.inKitchen}</h3>
            <p className="text-sm text-gray-600 mt-1">In Kitchen</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stats.readyToServe}</h3>
            <p className="text-sm text-gray-600 mt-1">Ready to Serve</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stats.served}</h3>
            <p className="text-sm text-gray-600 mt-1">Served</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('kitchen')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'kitchen'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            In Kitchen ({stats.inKitchen})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'ready'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ready ({stats.readyToServe})
          </button>
          <button
            onClick={() => setFilter('served')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              filter === 'served'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Served ({stats.served})
          </button>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredOrders().length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No Orders</h3>
            <p className="text-gray-500">No dine-in orders in the {filter} queue right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders().map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-shadow ${
                  order.status === 'READY_TO_SERVE'
                    ? 'border-green-300 ring-2 ring-green-200'
                    : 'border-gray-100'
                }`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">
                      Table #{order.tableNumber || 'Walk-In'}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {getOrderAge(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'READY_TO_SERVE'
                        ? 'bg-green-100 text-green-800 animate-pulse'
                        : order.status === 'SERVED'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">Customer:</span>{' '}
                    {order.customer?.name || 'Guest'}
                  </p>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl mb-4">
                    <p className="text-xs font-bold mb-1">📝 Special Instructions:</p>
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
                      <span className="text-gray-600">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center text-sm font-bold border-t pt-3 mb-4">
                  <span>Total:</span>
                  <span className="text-lg">${order.totalAmount?.toFixed(2)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {order.status === 'READY_TO_SERVE' && (
                    <button
                      onClick={() => updateStatus(order.id, 'SERVED')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Mark as Served</span>
                    </button>
                  )}
                  {order.status === 'SERVED' && (
                    <button
                      onClick={() => updateStatus(order.id, 'COMPLETED')}
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg"
                    >
                      Complete & Clear Table
                    </button>
                  )}
                  {['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-xl text-center">
                      <p className="text-sm font-bold">🍳 Being Prepared in Kitchen</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Create Walk-In Order</h2>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              This feature allows you to create orders for walk-in customers. Integration with
              menu selection will be added in the next update.
            </p>
            <button
              onClick={() => setShowNewOrderModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition"
            >
              Coming Soon
            </button>
          </div>
        </div>
      )}
    </div>
  );
}