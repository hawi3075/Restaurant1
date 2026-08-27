import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Truck, Clock } from 'lucide-react';
import showToast from '../../components/Toast';

export default function ChefOrdersDelivery() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchDeliveryReadyOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');

      // Filter for delivery orders that are ready for pickup
      const deliveryReady = response.data.filter(
        (o) =>
          o.orderType === 'DELIVERY' &&
          o.status === 'READY' &&
          (!user.restaurantId || o.restaurantId === user.restaurantId)
      );

      // Sort by updated date (most recently ready first)
      deliveryReady.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setOrders(deliveryReady);
    } catch (err) {
      console.error('Error loading delivery ready orders:', err);
      showToast('Failed to load delivery orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryReadyOrders();

    if (socket && user.restaurantId) {
      socket.emit('join_room', user.restaurantId);

      socket.on('new_order', (newOrder) => {
        if (newOrder.restaurantId === user.restaurantId) {
          fetchDeliveryReadyOrders();
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.restaurantId === user.restaurantId) {
          fetchDeliveryReadyOrders();
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

  const getTimeSinceReady = (updatedAt) => {
    const minutes = Math.floor((Date.now() - new Date(updatedAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getFoodSummary = (items) => {
    if (!items || items.length === 0) return '—';
    const first = items[0];
    const label = `${first.quantity}x ${first.food?.name || 'Item'}`;
    return items.length > 1 ? `${label} +${items.length - 1} more` : label;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-12 text-center max-w-xl mx-auto mt-6">
            <Truck className="w-20 h-20 text-orange-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-800 mb-2">No Orders Ready</h3>
            <p className="text-gray-500 text-sm">Delivery orders will appear here once they're ready for pickup</p>
            <p className="text-xs text-orange-600 font-medium mt-1">Drivers will be notified automatically</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50/60 border-b border-orange-100">
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Photo</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">#</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Food Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const waitingTime = Math.floor((Date.now() - new Date(order.updatedAt)) / 60000);
                    const isWaitingLong = waitingTime > 10;
                    const firstItem = order.items?.[0];

                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-gray-100 last:border-0 hover:bg-orange-50/40 transition ${isWaitingLong ? 'bg-amber-50/60' : ''
                          }`}
                      >
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {firstItem?.food?.image ? (
                              <img
                                src={firstItem.food.image}
                                alt={firstItem.food.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Truck className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-black text-gray-900">#{index + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900 text-xs">#{order.id.slice(0, 8)}</p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {getTimeSinceReady(order.updatedAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-orange-100 text-orange-800 border border-orange-200">
                            Delivery
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900 text-xs">{order.customer?.name || '—'}</p>
                          {order.customer?.phone && (
                            <p className="text-[11px] text-gray-500">{order.customer.phone}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {getFoodSummary(order.items)}
                        </td>
                        <td className="px-4 py-3 font-black text-orange-600 text-sm">
                          ETB {order.totalAmount?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {isWaitingLong ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Waiting {waitingTime}m
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700 border border-green-200">
                              Ready
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {order.driver ? (
                            <span className="text-xs font-bold text-green-700">✓ {order.driver.name}</span>
                          ) : (
                            <span className="text-xs font-bold text-orange-600">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}