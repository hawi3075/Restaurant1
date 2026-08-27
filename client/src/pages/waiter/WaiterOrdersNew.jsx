import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, Users, Bell } from 'lucide-react';
import showToast from '../../components/Toast';
import DashboardHeader from '../../components/DashboardHeader';

export default function WaiterOrdersNew() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchNewOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      
      // Filter for new dine-in orders (PENDING status)
      const newOrders = response.data.filter(
        (o) =>
          o.orderType === 'DINE_IN' &&
          o.status === 'PENDING' &&
          (!user.restaurantId || o.restaurantId === user.restaurantId)
      );

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

    if (socket && user.restaurantId) {
      socket.emit('join_room', user.restaurantId);

      socket.on('new_order', (newOrder) => {
        if (newOrder.orderType === 'DINE_IN' && newOrder.restaurantId === user.restaurantId) {
          fetchNewOrders();
          showToast('🔔 New dine-in order received!', 'success');
          new Audio('/notification.mp3').play().catch(() => {});
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.orderType === 'DINE_IN' && updatedOrder.restaurantId === user.restaurantId) {
          fetchNewOrders();
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">New Coming Orders</h1>
            <div className="bg-orange-50 border border-orange-300 px-3 py-1 rounded-lg text-orange-600 font-bold shadow-2xs flex items-center space-x-1">
              <Bell className="w-4 h-4 text-orange-500" />
              {orders.length > 0 && (
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-md font-black">
                  {orders.length}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {orders.length === 0 
              ? 'No new orders waiting' 
              : 'New orders ready to be confirmed by kitchen'}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center max-w-2xl mx-auto">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">All Caught Up! 🎉</h3>
            <p className="text-sm text-gray-600">No new orders waiting for confirmation</p>
            <p className="text-xs text-gray-400 mt-1">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order, index) => {
              const waitingTime = Math.floor((Date.now() - new Date(order.createdAt)) / 60000);
              const isUrgent = waitingTime > 5;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                    isUrgent ? 'border-red-400 bg-red-50/10' : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {/* Urgency Banner */}
                  {isUrgent && (
                    <div className="bg-red-500 text-white text-center py-2 rounded-xl mb-4 font-black text-xs uppercase tracking-wider shadow-sm">
                      ⚠️ WAITING FOR {waitingTime} MINUTES!
                    </div>
                  )}

                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">
                        Table #{order.tableNumber || index + 1}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">Order ID: {order.id.slice(0, 8)}</p>
                      <div className="flex items-center space-x-1.5 mt-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className={`text-xs font-bold ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                          {getOrderAge(order.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-orange-100 text-orange-800 border border-orange-300">
                      NEW
                    </span>
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
                    <p className="text-xs font-bold text-gray-700 mb-2">Order Items:</p>
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
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-3">
                      <span className="font-black text-gray-900 text-sm">Total Amount:</span>
                      <span className="font-black text-orange-600 text-lg">ETB {order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="bg-orange-50/60 border border-orange-200 text-orange-800 p-2.5 rounded-xl text-center">
                    <p className="text-xs font-bold">
                      ℹ️ Waiting for kitchen confirmation
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