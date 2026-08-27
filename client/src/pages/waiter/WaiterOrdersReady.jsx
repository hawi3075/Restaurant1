import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, Users, Utensils } from 'lucide-react';
import showToast from '../../components/Toast';

export default function WaiterOrdersReady() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');

      const readyOrders = response.data.filter(
        (o) =>
          o.orderType === 'DINE_IN' &&
          o.status === 'READY_TO_SERVE' &&
          (!user.restaurantId || o.restaurantId === user.restaurantId)
      );

      readyOrders.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setOrders(readyOrders);
    } catch (err) {
      console.error('Error loading ready orders:', err);
      showToast('Failed to load ready orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyOrders();

    if (socket && user.restaurantId) {
      socket.emit('join_room', user.restaurantId);

      socket.on('new_order', (newOrder) => {
        if (newOrder.orderType === 'DINE_IN' && newOrder.restaurantId === user.restaurantId) {
          fetchReadyOrders();
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.orderType === 'DINE_IN' && updatedOrder.restaurantId === user.restaurantId) {
          fetchReadyOrders();

          if (updatedOrder.status === 'READY_TO_SERVE') {
            showToast('🔔 FOOD IS READY, PLEASE SERVE!', 'success');
            new Audio('/notification.mp3').play().catch(() => { });
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

  const markAsServed = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: 'SERVED',
        notes: 'Order served to customer by waiter'
      });

      if (socket) {
        const order = orders.find(o => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: 'SERVED',
          restaurantId: user.restaurantId,
          customerId: order?.customerId,
        });
      }

      fetchReadyOrders();
      showToast('Order marked as served successfully!', 'success');
    } catch (err) {
      console.error('Failed to mark as served:', err);
      showToast('Failed to update order status', 'error');
    }
  };

  const getTimeSinceReady = (updatedAt) => {
    const minutes = Math.floor((Date.now() - new Date(updatedAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Food Ready to Serve</h1>
            <div className="bg-orange-50 border border-orange-300 px-3 py-1 rounded-lg text-orange-600 font-bold shadow-2xs flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-orange-500 animate-pulse" />
              {orders.length > 0 && (
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-md font-black">
                  {orders.length} READY
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {orders.length === 0
              ? 'No orders ready for serving yet'
              : 'Orders ready to be served to customers'}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center max-w-2xl mx-auto">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No Orders Ready</h3>
            <p className="text-sm text-gray-600 mb-1">Orders will appear here once kitchen finishes preparing them</p>
            <p className="text-xs text-gray-400">You'll receive notifications automatically</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alert Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl p-5 shadow-sm max-w-4xl mx-auto">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-black text-sm tracking-wide">✓ Orders Ready for Service!</h3>
                  <p className="text-xs opacity-90 mt-0.5">
                    {orders.length} order{orders.length !== 1 ? 's are' : ' is'} ready to be served to customers
                  </p>
                </div>
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {orders.map((order, index) => {
                const waitingTime = Math.floor((Date.now() - new Date(order.updatedAt)) / 60000);
                const isWaitingLong = waitingTime > 5;

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${isWaitingLong ? 'border-orange-400 bg-orange-50/10' : 'border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    {/* Ready Banner */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-center py-2 rounded-xl mb-4 font-black text-xs uppercase tracking-wider shadow-2xs">
                      <div className="flex items-center justify-center space-x-1.5">
                        <CheckCircle className="w-4 h-4" />
                        <span>READY TO SERVE NOW!</span>
                      </div>
                    </div>

                    {/* Waiting Alert */}
                    {isWaitingLong && (
                      <div className="bg-orange-100 border border-orange-300 text-orange-800 p-2.5 rounded-xl mb-4 text-center">
                        <p className="text-xs font-bold">⏰ Food has been ready for {waitingTime} minutes</p>
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
                            Ready {getTimeSinceReady(order.updatedAt)}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-orange-100 text-orange-700 border border-orange-300">
                          READY
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    {order.customer && (
                      <div className="mb-4 p-3.5 bg-orange-50/50 rounded-xl border border-orange-100">
                        <p className="text-[10px] font-extrabold text-orange-800 uppercase tracking-wider mb-0.5">Customer:</p>
                        <p className="text-sm font-black text-gray-900">{order.customer.name}</p>
                        {order.customer.phone && (
                          <p className="text-xs text-gray-600 mt-0.5">📞 {order.customer.phone}</p>
                        )}
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
                      <p className="text-xs font-bold text-gray-700 mb-2">Ready to Serve:</p>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                          <span className="font-black text-gray-900 flex items-center">
                            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-lg text-[10px] mr-2">
                              {item.quantity}x
                            </span>
                            {item.food?.name || 'Item'}
                          </span>
                          <span className="font-bold text-gray-700">ETB {(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-gray-100 mt-2">
                        <span className="font-black text-gray-900 text-sm">Total:</span>
                        <span className="font-black text-orange-600 text-base">ETB {order.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Mark as Served Button */}
                    <button
                      onClick={() => markAsServed(order.id)}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>MARK AS SERVED</span>
                    </button>
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