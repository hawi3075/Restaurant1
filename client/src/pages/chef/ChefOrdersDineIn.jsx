import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, Clock } from 'lucide-react';
import showToast from '../../components/Toast';

export default function ChefOrdersDineIn() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchDineInReadyOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');

      // Filter for dine-in orders that are ready to serve
      const dineInReady = response.data.filter(
        (o) =>
          o.orderType === 'DINE_IN' &&
          o.status === 'READY_TO_SERVE' &&
          (!user.restaurantId || o.restaurantId === user.restaurantId)
      );

      // Sort by updated date (most recently ready first)
      dineInReady.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setOrders(dineInReady);
    } catch (err) {
      console.error('Error loading dine-in ready orders:', err);
      showToast('Failed to load dine-in orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDineInReadyOrders();

    if (socket && user.restaurantId) {
      socket.emit('join_room', user.restaurantId);

      socket.on('new_order', (newOrder) => {
        if (newOrder.restaurantId === user.restaurantId) {
          fetchDineInReadyOrders();
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.restaurantId === user.restaurantId) {
          fetchDineInReadyOrders();
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
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Orders Ready</h3>
            <p className="text-sm text-gray-500">Dine-in orders will appear here once they're ready to serve</p>
            <p className="text-xs text-gray-400 mt-1">Waiters will be notified automatically</p>
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
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Table</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const waitingTime = Math.floor((Date.now() - new Date(order.updatedAt)) / 60000);
                    const isWaitingLong = waitingTime > 5;
                    const firstItem = order.items?.[0];

                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-gray-100 last:border-0 hover:bg-orange-50/40 transition ${isWaitingLong ? 'bg-yellow-50/60' : ''
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
                              <ChefHat className="w-5 h-5 text-gray-300" />
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
                            Dine-In
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
                        <td className="px-4 py-3">
                          {order.tableNumber ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                              #{order.tableNumber}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-black text-orange-600 text-sm">
                          ETB {order.totalAmount?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {isWaitingLong ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                              Waiting {waitingTime}m
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700 border border-green-200">
                              Ready
                            </span>
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