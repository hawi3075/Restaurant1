import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import { Flame, Clock, CheckCircle, Truck, ChefHat, AlertCircle, ImageOff, LayoutGrid } from 'lucide-react';
import showToast from '../../components/Toast';

// Shared grid template so the header row and every order row line up perfectly.
const GRID_COLS =
  'lg:grid-cols-[40px_28px_100px_90px_120px_minmax(160px,1fr)_100px_110px_150px]';

export default function ChefOrdersCooking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchCookingOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');

      // Filter for orders in cooking/preparing stage
      const cookingOrders = response.data.filter(
        (o) =>
          ['CONFIRMED', 'PREPARING'].includes(o.status) &&
          (!user.restaurantId || o.restaurantId === user.restaurantId)
      );

      // Sort by creation date (oldest first)
      cookingOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setOrders(cookingOrders);
    } catch (err) {
      console.error('Error loading cooking orders:', err);
      showToast('Failed to load cooking orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCookingOrders();

    if (socket && user.restaurantId) {
      socket.emit('join_room', user.restaurantId);

      socket.on('new_order', (newOrder) => {
        if (newOrder.restaurantId === user.restaurantId) {
          fetchCookingOrders();
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.restaurantId === user.restaurantId) {
          fetchCookingOrders();
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

  const startPreparing = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: 'PREPARING',
        notes: 'Chef started preparing the order'
      });

      if (socket) {
        const order = orders.find(o => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: 'PREPARING',
          restaurantId: user.restaurantId,
          customerId: order?.customerId,
        });
      }

      fetchCookingOrders();
      showToast('Started preparing order', 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status', 'error');
    }
  };

  const markAsReady = async (orderId, orderType) => {
    try {
      const newStatus = orderType === 'DELIVERY' ? 'READY' : 'READY_TO_SERVE';

      await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: `Order ready for ${orderType === 'DELIVERY' ? 'pickup' : 'serving'}`
      });

      if (socket) {
        const order = orders.find(o => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: newStatus,
          restaurantId: user.restaurantId,
          customerId: order?.customerId,
        });
      }

      fetchCookingOrders();
      showToast('Order marked as ready!', 'success');
    } catch (err) {
      console.error('Failed to mark as ready:', err);
      showToast('Failed to mark as ready', 'error');
    }
  };

  const getOrderAge = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getCookingTime = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    return minutes;
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
                    Cooking Now 🔥
                  </h1>
                  {orders.length > 0 && (
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-black">
                      {orders.length} ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  {orders.length === 0
                    ? 'No orders currently in preparation'
                    : 'Orders currently being prepared'}
                </p>
              </div>
            </div>

            {/* Kitchen Status */}
            <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-xl border border-purple-200">
              <Flame className="w-5 h-5 text-purple-600 animate-pulse" />
              <span className="text-sm font-bold text-purple-700">
                {orders.length > 0 ? 'Kitchen Active' : 'Kitchen Idle'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <Flame className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No Orders Cooking</h3>
            <p className="text-gray-500">Start preparing orders from the "New Orders" section</p>
          </div>
        ) : (
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
              <span>Elapsed</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {orders.map((order, index) => {
              const cookingTime = getCookingTime(order.createdAt);
              const isTakingLong = cookingTime > 20;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 p-4 lg:py-3 lg:px-5 hover:shadow-md transition-all ${
                    isTakingLong ? 'border-orange-300' : 'border-purple-200'
                  }`}
                >
                  <div className={`grid grid-cols-1 ${GRID_COLS} gap-2 lg:gap-3 lg:items-center`}>
                    {/* Image */}
                    <div className="flex items-center">
                      {getOrderImage(order) ? (
                        <img
                          src={getOrderImage(order)}
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
                      <span className="font-black text-purple-600 text-xs">#{index + 1}</span>
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
                          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                            {getOrderAge(order.createdAt)}
                          </span>
                        </div>
                      </div>
                      {/* Status shown here on mobile */}
                      <span className={`lg:hidden px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {order.status === 'CONFIRMED' ? 'READY TO START' : 'COOKING'}
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
                        <p className="text-xs font-bold text-gray-700 truncate">{order.customer.name}</p>
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

                    {/* Elapsed */}
                    <div className="flex items-center justify-between lg:block">
                      <span className="lg:hidden text-[10px] font-bold text-gray-400 uppercase">Elapsed</span>
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                        cookingTime < 10
                          ? 'bg-green-100 text-green-700'
                          : cookingTime < 20
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {cookingTime}m {isTakingLong && '⏰'}
                      </span>
                    </div>

                    {/* Status — desktop only (mobile shown above next to Order ID) */}
                    <div className="hidden lg:block">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        order.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        <Flame className={`w-3.5 h-3.5 ${order.status === 'PREPARING' ? 'animate-pulse' : ''}`} />
                        {order.status === 'CONFIRMED' ? 'Ready to Start' : 'Cooking'}
                      </span>
                    </div>

                    {/* Action */}
                    <div>
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => startPreparing(order.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-bold text-xs transition-all hover:shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <Flame className="w-4 h-4" />
                          <span>Start Cooking</span>
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => markAsReady(order.id, order.orderType)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-bold text-xs transition-all hover:shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Ready</span>
                        </button>
                      )}
                    </div>
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