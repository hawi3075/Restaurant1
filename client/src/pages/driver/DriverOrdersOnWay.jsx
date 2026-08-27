import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Navigation,
  AlertCircle,
  DollarSign
} from 'lucide-react';

export default function DriverOrdersOnWay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchOnWayOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      const onWayOrders = response.data.filter(
        (o) =>
          o.orderType === 'DELIVERY' &&
          o.status === 'OUT_FOR_DELIVERY' &&
          (!o.driverId || o.driverId === user?.id)
      );
      setOrders(onWayOrders);
    } catch (err) {
      console.error('Error fetching on-way orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnWayOrders();

    if (socket) {
      socket.emit('join_room', 'driver_global');
      if (user?.id) socket.emit('join_user_room', user.id);

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.status === 'OUT_FOR_DELIVERY' && (!updatedOrder.driverId || updatedOrder.driverId === user?.id)) {
          setOrders((prev) => {
            const exists = prev.find((o) => o.id === updatedOrder.id);
            if (exists) {
              return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
            }
            return [updatedOrder, ...prev];
          });
        } else {
          setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('order_status_updated');
      }
    };
  }, [socket, user?.id]);

  const confirmDelivered = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: 'DELIVERED',
        driverId: user.id,
        notes: `Delivered by ${user.name}`,
      });

      if (socket) {
        const order = orders.find((o) => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: 'DELIVERED',
          driverId: user.id,
          customerId: order?.customerId,
          restaurantId: order?.restaurantId,
        });
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      if (window.showToast) {
        window.showToast('Delivery confirmed! Earnings updated', 'success');
      }
    } catch (err) {
      console.error('Failed to confirm delivery:', err);
      alert('Failed to confirm delivery');
    }
  };

  const getDeliveryDuration = (updatedAt) => {
    const minutes = Math.floor((Date.now() - new Date(updatedAt)) / 60000);
    if (minutes < 1) return 'Just started';
    if (minutes < 60) return `${minutes}m in transit`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m in transit`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">On the Way</h1>
            <p className="text-sm text-gray-600">Active deliveries in progress</p>
          </div>
        </div>
      </div>

      {/* Active Deliveries Count */}
      {orders.length > 0 && (
        <div className="mb-5 bg-orange-100 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-orange-600 animate-pulse" />
            <span className="text-sm font-bold text-orange-800">
              {orders.length} {orders.length === 1 ? 'delivery' : 'deliveries'} in progress
            </span>
          </div>
        </div>
      )}

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No Active Deliveries</h3>
          <p className="text-sm text-gray-500">Your in-progress deliveries will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order, index) => {
            const isUrgent = new Date() - new Date(order.updatedAt) > 30 * 60 * 1000;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all ${
                  isUrgent ? 'border-red-300 ring-1 ring-red-200' : 'border-orange-200'
                }`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-black text-gray-900 text-base">Order #{index + 1}</h3>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                        {getDeliveryDuration(order.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Navigation className="w-3 h-3 animate-pulse" />
                    <span>IN TRANSIT</span>
                  </span>
                </div>

                {/* Urgency Alert */}
                {isUrgent && (
                  <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center space-x-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-xs font-bold text-red-800">
                      Delivery taking longer than expected
                    </span>
                  </div>
                )}

                {/* Customer Info - Highlighted */}
                <div className="mb-3 p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg border border-orange-200">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-orange-800 font-black mb-1">DELIVER TO:</p>
                      <p className="text-sm font-black text-gray-900">
                        {order.customer?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        {order.deliveryAddress || 'Address not available'}
                      </p>
                      {order.customer?.phone && (
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="mt-2 flex items-center space-x-1 bg-white px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-orange-600" />
                          <span className="text-xs text-orange-600 font-bold">
                            {order.customer.phone}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Picked up from:</p>
                      <p className="text-sm font-bold text-gray-900">
                        {order.restaurant?.name || 'Ma\'ad Restaurant'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="mb-3 p-2.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-bold mb-1.5">
                    {order.items?.length || 0} items in order
                  </p>
                  <div className="space-y-1">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="text-xs text-gray-600">
                        • {item.quantity}x {item.food?.name}
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{order.items.length - 2} more
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Total & Earnings */}
                <div className="mb-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-600">Order Total:</span>
                    <span className="text-base font-black text-gray-900">ETB {order.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-bold text-gray-700">Your Earning:</span>
                    </div>
                    <span className="text-xs font-black text-green-600">
                      +ETB {(order.totalAmount * 0.1).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-3 text-xs bg-amber-50 rounded-lg p-2">
                  <span className="text-gray-500">Payment: </span>
                  <span className="font-bold text-gray-900">{order.paymentMethod || 'Cash on Delivery'}</span>
                  {order.paymentMethod === 'CASH' && (
                    <span className="text-amber-600 ml-2">💵 Collect cash</span>
                  )}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                    <p className="text-xs font-bold text-yellow-800 mb-0.5">⚠️ Special Instructions:</p>
                    <p className="text-xs text-yellow-700">{order.specialInstructions}</p>
                  </div>
                )}

                {/* Confirm Delivered Button */}
                <button
                  onClick={() => confirmDelivered(order.id)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg font-bold text-sm transition-all hover:shadow-md flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Delivered</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}