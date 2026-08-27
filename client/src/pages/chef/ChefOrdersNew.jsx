import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/Toast';
import { playOrderAlarmSound } from '../../utils/sound';
import DashboardHeader from '../../components/DashboardHeader';
import { Bell, Clock, ChefHat, CheckCircle, ArrowRight, User, MapPin, AlertCircle, ShoppingBag, ImageOff, Truck, LayoutGrid } from 'lucide-react';

// Shared grid template so the header row and every order row line up perfectly.
const GRID_COLS =
  'lg:grid-cols-[40px_28px_100px_110px_120px_minmax(160px,1fr)_90px_100px_150px]';

export default function ChefOrdersNew() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchNewOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');

      // Filter for new/pending orders
      let newOrders = response.data.filter((o) => o.status === 'PENDING');
      if (user?.restaurantId) {
        const matching = newOrders.filter((o) => o.restaurantId === user.restaurantId);
        if (matching.length > 0) newOrders = matching;
      }

      // Sort by creation date (oldest first - most urgent)
      newOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setOrders(newOrders);
    } catch (err) {
      console.error('Error loading new orders:', err);
      showToast('Failed to load new orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewOrders();

    if (socket) {
      if (user?.restaurantId) socket.emit('join_room', user.restaurantId);
      socket.emit('join_room', 'chef_global');

      const handleNewOrder = (newOrder) => {
        fetchNewOrders();
        playOrderAlarmSound();
        showToast(`🚨 NEW ORDER RECEIVED! Order #${(newOrder?.id || '').slice(0, 6)}`, 'info');
      };

      const handleStatusUpdate = () => {
        fetchNewOrders();
      };

      socket.on('new_order', handleNewOrder);
      socket.on('order_status_updated', handleStatusUpdate);

      return () => {
        socket.off('new_order', handleNewOrder);
        socket.off('order_status_updated', handleStatusUpdate);
      };
    }
  }, [socket, user?.restaurantId]);

  const acceptOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: 'CONFIRMED',
        notes: 'Chef accepted the order'
      });

      if (socket) {
        const order = orders.find(o => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: 'CONFIRMED',
          restaurantId: user.restaurantId,
          customerId: order?.customerId,
        });
      }

      fetchNewOrders();
      showToast('Order accepted successfully!', 'success');
    } catch (err) {
      console.error('Failed to accept order:', err);
      showToast('Failed to accept order', 'error');
    }
  };

  const getOrderAge = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getUrgencyLevel = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (minutes < 5) return 'normal';
    if (minutes < 15) return 'warning';
    return 'urgent';
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'urgent') return 'bg-red-100 text-red-800 border-red-300';
    if (urgency === 'warning') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  // Grabs the first item's food image (if any) to represent the order visually
  const getOrderImage = (order) => order.items?.find((i) => i.food?.image)?.food?.image || null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">

      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-10 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    New Orders 🔔
                  </h1>
                  {orders.length > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black animate-pulse">
                      {orders.length} NEW
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  {orders.length === 0
                    ? 'No new orders waiting'
                    : 'Review and accept pending orders'}
                </p>
              </div>
            </div>

            {/* Real-time indicator */}
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-700">Live Updates</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <Bell className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">All Caught Up! 🎉</h3>
            <p className="text-gray-500">No new orders waiting for acceptance</p>
            <p className="text-sm text-gray-400 mt-2">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Urgent Alert */}
            {orders.some(o => getUrgencyLevel(o.createdAt) === 'urgent') && (
              <div className="bg-red-500 text-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-7 h-7 shrink-0" />
                  <div>
                    <h3 className="font-black text-base">⚠️ URGENT: Orders Waiting Too Long!</h3>
                    <p className="text-xs opacity-90">
                      {orders.filter(o => getUrgencyLevel(o.createdAt) === 'urgent').length} order(s) need immediate attention
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Column headers — desktop only */}
              <div
                className={`hidden lg:grid ${GRID_COLS} gap-3 px-5 pb-1 text-[11px] font-black text-gray-400 uppercase tracking-wide`}
              >
                <span>Photo</span>
                <span>#</span>
                <span>Order</span>
                <span>Type / Table</span>
                <span>Customer</span>
                <span>Food Name</span>
                <span className="text-right">Total</span>
                <span>Urgency</span>
                <span>Action</span>
              </div>

              {orders.map((order, index) => {
                const urgency = getUrgencyLevel(order.createdAt);
                const image = getOrderImage(order);

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl shadow-sm border-2 p-4 lg:py-3 lg:px-5 hover:shadow-md transition-all ${
                      urgency === 'urgent'
                        ? 'border-red-400'
                        : urgency === 'warning'
                        ? 'border-yellow-300'
                        : 'border-green-200'
                    }`}
                  >
                    <div className={`grid grid-cols-1 ${GRID_COLS} gap-2 lg:gap-3 lg:items-center`}>
                      {/* Image */}
                      <div className="flex items-center">
                        {image ? (
                          <img
                            src={image}
                            alt={order.items?.[0]?.food?.name || 'Order item'}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            <ImageOff className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* # */}
                      <div className="hidden lg:flex items-center">
                        <span className="font-black text-orange-600 text-xs">#{index + 1}</span>
                      </div>

                      {/* Order ID / Age */}
                      <div className="flex items-center justify-between lg:block">
                        <div className="min-w-0">
                          <span className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mr-1">Order</span>
                          <span className="text-sm font-bold text-gray-900 lg:text-xs lg:font-medium lg:text-gray-500 truncate block">
                            #{order.id.slice(0, 8)}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className={`text-xs font-bold whitespace-nowrap ${
                              urgency === 'urgent'
                                ? 'text-red-600'
                                : urgency === 'warning'
                                ? 'text-yellow-700'
                                : 'text-green-600'
                            }`}>
                              {getOrderAge(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        {/* Urgency shown here on mobile */}
                        <span className={`lg:hidden px-3 py-1 rounded-full text-xs font-bold border-2 ${getUrgencyBadge(urgency)}`}>
                          {urgency === 'urgent' ? 'URGENT' : urgency === 'warning' ? 'ATTENTION' : 'NEW'}
                        </span>
                      </div>

                      {/* Type + Table Number */}
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                          order.orderType === 'DELIVERY'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {order.orderType === 'DELIVERY' ? (
                            <>
                              <Truck className="w-3.5 h-3.5" />
                              <span>Delivery</span>
                            </>
                          ) : (
                            <>
                              <ChefHat className="w-3.5 h-3.5" />
                              <span>Dine-In</span>
                            </>
                          )}
                        </span>
                        {order.orderType === 'DINE_IN' && order.table?.tableNumber && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black bg-orange-100 text-orange-700 border border-orange-300">
                            <LayoutGrid className="w-3 h-3" />
                            Table {order.table.tableNumber}
                          </span>
                        )}
                      </div>

                      {/* Customer */}
                      <div className="min-w-0">
                        <span className="lg:hidden text-[10px] font-bold text-gray-400 uppercase block">Customer</span>
                        {order.customer && (
                          <>
                            <p className="text-xs font-bold text-gray-700 truncate">{order.customer.name}</p>
                            {order.customer.phone && (
                              <p className="text-xs text-gray-500 truncate">{order.customer.phone}</p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Items */}
                      <div className="min-w-0">
                        <span className="lg:hidden text-[10px] font-bold text-gray-400 uppercase block mb-1">Items</span>
                        {order.specialInstructions && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-lg mb-1 text-xs inline-block">
                            <span className="font-bold">⚠️ </span>
                            {order.specialInstructions}
                          </div>
                        )}
                        <div className="text-xs text-gray-700 leading-relaxed flex flex-wrap gap-x-3 gap-y-1">
                          {order.items?.map((item, idx) => (
                            <span key={idx} className="whitespace-nowrap">
                              <span className="font-bold">{item.quantity}x</span> {item.food?.name || 'Item'}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between lg:block lg:text-right">
                        <span className="lg:hidden text-[10px] font-bold text-gray-400 uppercase">Total</span>
                        <p className="font-black text-orange-600 text-xs lg:text-sm whitespace-nowrap">
                          ETB {order.totalAmount?.toFixed(2)}
                        </p>
                      </div>

                      {/* Urgency badge — desktop only (mobile shown above next to Order ID) */}
                      <div className="hidden lg:block">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${getUrgencyBadge(urgency)}`}>
                          {urgency === 'urgent' ? 'URGENT' : urgency === 'warning' ? 'ATTENTION' : 'NEW'}
                        </span>
                      </div>

                      {/* Action */}
                      <div>
                        <button
                          onClick={() => acceptOrder(order.id)}
                          className={`w-full py-2 rounded-xl font-bold text-xs transition-all hover:shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap ${
                            urgency === 'urgent'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}