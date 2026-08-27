import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  MapPin,
  Phone,
  Navigation,
  Package,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function DriverOrdersNew() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchNewOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      const newOrders = response.data.filter(
        (o) => o.orderType === 'DELIVERY' && ['READY', 'READY_TO_SERVE'].includes(o.status)
      );
      setOrders(newOrders);
    } catch (err) {
      console.error('Error fetching new orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewOrders();

    if (socket) {
      socket.emit('join_room', 'driver_global');
      if (user?.id) socket.emit('join_user_room', user.id);

      socket.on('new_order', (newOrder) => {
        if (newOrder.orderType === 'DELIVERY' && (newOrder.status === 'READY' || newOrder.status === 'READY_TO_SERVE')) {
          setOrders((prev) => [newOrder, ...prev]);
          if (window.showToast) {
            window.showToast('🔔 FOOD IS READY, PLEASE SERVE / PICK UP!', 'success');
          }
          new Audio('/notification.mp3').play().catch(() => {});
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.orderType === 'DELIVERY' && ['READY', 'READY_TO_SERVE'].includes(updatedOrder.status)) {
          setOrders((prev) => {
            const exists = prev.find((o) => o.id === updatedOrder.id);
            if (exists) return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
            return [updatedOrder, ...prev];
          });
        } else {
          setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new_order');
        socket.off('order_status_updated');
      }
    };
  }, [socket, user?.id]);

  const acceptDelivery = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: 'OUT_FOR_DELIVERY',
        driverId: user.id,
        notes: `Driver ${user.name} accepted delivery`,
      });

      if (socket) {
        const order = orders.find((o) => o.id === orderId);
        socket.emit('update_order_status', {
          orderId,
          status: 'OUT_FOR_DELIVERY',
          driverId: user.id,
          customerId: order?.customerId,
          restaurantId: order?.restaurantId,
        });
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      if (window.showToast) {
        window.showToast('Delivery accepted! Navigate to On the Way', 'success');
      }
    } catch (err) {
      console.error('Failed to accept delivery:', err);
      alert('Failed to accept delivery');
    }
  };

  const getOrderAge = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
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
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">New Orders from Chef</h1>
            <p className="text-sm text-gray-600">Ready for pickup and delivery</p>
          </div>
        </div>
      </div>

      {/* Orders Count */}
      {orders.length > 0 && (
        <div className="mb-5 bg-orange-100 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-800">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} available for delivery
            </span>
          </div>
        </div>
      )}

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No New Orders</h3>
          <p className="text-sm text-gray-500">New delivery orders from the chef will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order, index) => {
            const isUrgent = new Date() - new Date(order.createdAt) > 15 * 60 * 1000;

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
                      <span className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-gray-500'}`}>
                        {getOrderAge(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                    READY
                  </span>
                </div>

                {/* Restaurant Info */}
                <div className="mb-3 p-2.5 bg-amber-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Pick up from:</p>
                      <p className="text-sm font-bold text-gray-900">
                        {order.restaurant?.name || 'Ma\'ad Restaurant'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.restaurant?.address || 'Main Branch'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-3 p-2.5 bg-orange-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-bold">Deliver to:</p>
                      <p className="text-sm font-bold text-gray-900">
                        {order.customer?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.deliveryAddress || 'Address not available'}
                      </p>
                      {order.customer?.phone && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Phone className="w-3 h-3 text-orange-600" />
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="text-xs text-orange-600 hover:underline font-bold"
                          >
                            {order.customer.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-3">
                  <p className="text-xs text-gray-600 font-bold mb-1.5">Order Items:</p>
                  <div className="space-y-1">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs bg-gray-50 p-1.5 rounded">
                        <span className="text-gray-700">
                          {item.quantity}x {item.food?.name}
                        </span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-xs text-gray-500 text-center py-1">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Total */}
                <div className="flex justify-between items-center border-t pt-2.5 mb-3">
                  <span className="text-xs font-bold text-gray-600">Order Total:</span>
                  <span className="text-base font-black text-gray-900">ETB {order.totalAmount?.toFixed(2)}
                  </span>
                </div>

                {/* Delivery Fee */}
                <div className="mb-3 bg-amber-50 rounded-lg p-2 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-bold text-gray-700">Your Earning:</span>
                  </div>
                  <span className="text-xs font-black text-amber-600">
                    +ETB {(order.totalAmount * 0.1).toFixed(2)}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="mb-3 text-xs">
                  <span className="text-gray-500">Payment: </span>
                  <span className="font-bold text-gray-900">{order.paymentMethod || 'Cash on Delivery'}</span>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                    <p className="text-xs font-bold text-yellow-800 mb-0.5">Special Instructions:</p>
                    <p className="text-xs text-yellow-700">{order.specialInstructions}</p>
                  </div>
                )}

                {/* Accept Button */}
                <button
                  onClick={() => acceptDelivery(order.id)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg font-bold text-sm transition-all hover:shadow-md flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Accept & Pick Up</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}