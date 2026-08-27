import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, RefreshCw, Clock, Bike, RotateCcw, Bell, ImageOff, AlertCircle } from 'lucide-react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import showToast from '../../components/Toast';

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

const getOrderImage = (order) => order.items?.find((i) => i.food?.image)?.food?.image || null;

export default function AdminOrdersPage({ filter = 'all' }) {
  const config = FILTER_CONFIG[filter] || FILTER_CONFIG.all;
  const Icon = config.icon;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);

  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Real-time Socket.IO listeners for live order updates
  useEffect(() => {
    if (!socket) return;

    // Admin sees all restaurants, join a global admin room
    socket.emit('join_room', 'admin_global');

    const handleNewOrder = (newOrder) => {
      // Add the new order to the top of the list in real-time
      setOrders((prev) => {
        // Prevent duplicate if the order already exists
        const exists = prev.some((o) => o.id === newOrder.id);
        if (exists) return prev;
        return [newOrder, ...prev];
      });

      setNewOrderAlert(true);
      showToast(`🔔 New ${newOrder.orderType?.toLowerCase()} order received!`, 'success');

      // Play notification sound
      try {
        new Audio('/notification.mp3').play().catch(() => {});
      } catch (e) {}

      // Auto-dismiss alert after 5 seconds
      setTimeout(() => setNewOrderAlert(false), 5000);
    };

    const handleStatusUpdate = (updatedOrder) => {
      // Update the order in place in real-time
      setOrders((prev) =>
        prev.map((o) =>
          o.id === updatedOrder.id
            ? { ...o, status: updatedOrder.status, updatedAt: updatedOrder.updatedAt }
            : o
        )
      );

      showToast(
        `Order #${updatedOrder.id?.slice(0, 8)} → ${updatedOrder.status?.replace(/_/g, ' ')}`,
        'info'
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [socket]);

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

  const handleCancelOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: 'CANCELLED', notes: 'Cancelled by platform Admin' });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));

      // Emit socket event so chef/driver/waiter/customer see the cancellation live
      if (socket) {
        const order = orders.find(o => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: 'CANCELLED',
          restaurantId: order?.restaurantId,
          customerId: order?.customerId,
        });
      }

      showToast('Order cancelled successfully', 'success');
    } catch (err) {
      console.error('Error cancelling order:', err);
      showToast('Failed to cancel order', 'error');
    } finally {
      setCancelTargetId(null);
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

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const minutes = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* New Order Alert Banner */}
      {newOrderAlert && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 flex items-center space-x-3 animate-pulse">
          <Bell className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-sm font-black text-green-800">New Order Received!</p>
            <p className="text-xs text-green-600">A new order just came in — check below.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{config.title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{config.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-gray-500">
            🔴 Live
          </span>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
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
                  <th className="p-4">Photo</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Restaurant</th>
                  <th className="p-4">Food Items</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Time</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    {/* Photo */}
                    <td className="p-4">
                      {getOrderImage(order) ? (
                        <img
                          src={getOrderImage(order)}
                          alt={order.items?.[0]?.food?.name || 'Food item'}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <ImageOff className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </td>
                    {/* Order */}
                    <td className="p-4 font-bold text-gray-900">
                      <span>#{index + 1}</span>
                      <span className="text-[10px] text-gray-400 block font-normal">#{order.id.slice(0, 8)}</span>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{order.customer?.name || '—'}</td>
                    <td className="p-4 text-gray-600">{order.restaurant?.name || '—'}</td>
                    {/* Food Items */}
                    <td className="p-4 min-w-[150px]">
                      <div className="text-xs text-gray-700 leading-relaxed flex flex-col gap-0.5">
                        {order.items?.map((item, idx) => (
                          <span key={idx} className="whitespace-nowrap">
                            <span className="font-bold text-orange-600">{item.quantity}x</span> {item.food?.name || 'Item'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">{order.orderType}</td>
                    <td className="p-4 font-bold text-orange-600">
                      {Number(order.totalAmount || 0).toFixed(2)} ETB
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-[10px]">
                      {getTimeAgo(order.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'DELIVERED' && (
                        <button
                          onClick={() => setCancelTargetId(order.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-[10px] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Beautiful CSS Confirmation Modal */}
      {cancelTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden transform scale-100 transition-all duration-300 animate-fadeIn">
            {/* Top Accent Warning Bar */}
            <div className="h-2 bg-gradient-to-r from-red-500 to-rose-600" />
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Cancel Order</h3>
                  <p className="text-xs text-gray-500">Confirm order cancellation request</p>
                </div>
              </div>

              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 mb-6">
                <p className="text-xs text-gray-700 leading-relaxed">
                  Are you sure you want to cancel order <span className="font-bold text-gray-900">#{cancelTargetId.slice(0, 8)}</span>?
                </p>
                <p className="text-[10px] text-rose-600 mt-2 font-semibold">
                  ⚠️ This will notify the customer, kitchen chef, and delivery driver immediately.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCancelTargetId(null)}
                  className="px-4.5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition cursor-pointer"
                >
                  No, Keep Order
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelOrder(cancelTargetId)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/20 transition cursor-pointer"
                >
                  Yes, Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}