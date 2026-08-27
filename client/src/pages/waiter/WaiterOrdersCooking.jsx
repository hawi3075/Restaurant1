import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Flame, Clock, Users } from 'lucide-react';
import showToast from '../../components/Toast';

export default function WaiterOrdersCooking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchCookingOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');

      // Filter for dine-in orders being cooked
      const cookingOrders = response.data.filter(
        (o) =>
          o.orderType === 'DINE_IN' &&
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
        if (newOrder.orderType === 'DINE_IN' && newOrder.restaurantId === user.restaurantId) {
          fetchCookingOrders();
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.orderType === 'DINE_IN' && updatedOrder.restaurantId === user.restaurantId) {
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

  const getOrderAge = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getCookingTime = (createdAt) => {
    return Math.floor((Date.now() - new Date(createdAt)) / 60000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-8 lg:px-12 py-8 space-y-8">
        {/* Centered Title with Rectangular Orange Border Tag */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl border border-orange-200 shadow-xs">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cooking Now</h1>
            <div className="bg-orange-50 border border-orange-300 px-3 py-1 rounded-lg text-orange-600 font-bold shadow-2xs flex items-center space-x-1">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              {orders.length > 0 && (
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-md font-black">
                  {orders.length}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {orders.length === 0
              ? 'No orders currently being prepared'
              : 'Orders currently being prepared by kitchen'}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center max-w-2xl mx-auto">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No Orders Cooking</h3>
            <p className="text-sm text-gray-600">Orders will appear here when kitchen starts preparing them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order, index) => {
              const cookingTime = getCookingTime(order.createdAt);
              const isTakingLong = cookingTime > 20;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${isTakingLong ? 'border-orange-400 bg-orange-50/10' : 'border-gray-200 hover:border-orange-300'
                    }`}
                >
                  {/* Status Banner */}
                  <div className={`text-center py-2 rounded-xl mb-4 font-black text-xs uppercase tracking-wider ${order.status === 'CONFIRMED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800 border border-orange-300'
                    }`}>
                    <div className="flex items-center justify-center space-x-1.5">
                      <Flame className={`w-3.5 h-3.5 ${order.status === 'PREPARING' ? 'animate-pulse' : ''}`} />
                      <span>{order.status === 'CONFIRMED' ? 'CONFIRMED - READY TO COOK' : 'COOKING IN PROGRESS'}</span>
                    </div>
                  </div>

                  {/* Cooking Time Alert */}
                  {isTakingLong && (
                    <div className="bg-orange-100 border border-orange-300 text-orange-800 p-2.5 rounded-xl mb-4 text-center">
                      <p className="text-xs font-bold">⏰ Taking longer than usual ({cookingTime}m)</p>
                    </div>
                  )}

                  {/* Order Header */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 text-lg">
                      Table #{order.tableNumber || index + 1}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Order ID: {order.id.slice(0, 8)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">
                          {getOrderAge(order.createdAt)}
                        </span>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${cookingTime < 10
                          ? 'bg-green-100 text-green-700'
                          : cookingTime < 20
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                        {cookingTime}m elapsed
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  {order.customer && (
                    <div className="mb-4 p-3.5 bg-orange-50/50 rounded-xl border border-orange-100">
                      <p className="text-[10px] font-extrabold text-orange-800 uppercase tracking-wider mb-0.5">Customer:</p>
                      <p className="text-sm font-black text-gray-900">{order.customer.name}</p>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-3.5 rounded-xl mb-4 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <span>📝</span>
                        <span>SPECIAL INSTRUCTIONS:</span>
                      </p>
                      <p className="text-xs font-medium leading-relaxed">{order.specialInstructions}</p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-bold text-gray-700 mb-2">Items Being Prepared:</p>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <span className="font-black text-gray-900 flex items-center">
                          <span className="bg-orange-500 text-white px-2 py-0.5 rounded-lg text-[10px] mr-2">
                            {item.quantity}x
                          </span>
                          {item.food?.name || 'Item'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Info Note */}
                  <div className="bg-orange-50/60 border border-orange-200 text-orange-800 p-2.5 rounded-xl text-center">
                    <p className="text-xs font-bold">
                      ℹ️ Food will be ready soon - stay alert!
                    </p>
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