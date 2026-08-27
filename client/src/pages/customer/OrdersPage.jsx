import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck, ChefHat, Filter, Eye, Star } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ReviewModal from '../../components/ReviewModal';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import showToast from '../../components/Toast';


export default function OrdersPage() {
  const { user } = useAuth();
  const { t, statusLabel } = useLanguage();
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Real-time: listen for order status updates from chef/driver/waiter
  useEffect(() => {
    if (!socket || !user) return;

    // Join user room so we get personal order updates
    socket.emit('join_user_room', user.id);

    const handleStatusUpdate = (updatedOrder) => {
      // Only update if this is our order
      if (updatedOrder.customerId === user.id) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === updatedOrder.id
              ? { ...o, status: updatedOrder.status, updatedAt: updatedOrder.updatedAt }
              : o
          )
        );

        const statusMessages = {
          CONFIRMED: '✅ Your order has been confirmed!',
          PREPARING: '👨‍🍳 Your order is being prepared!',
          READY: '📦 Your order is ready for pickup!',
          READY_TO_SERVE: '🍽️ Your order is ready to serve!',
          OUT_FOR_DELIVERY: '🚗 Your order is out for delivery!',
          DELIVERED: '✅ Your order has been delivered!',
          SERVED: '✅ Your order has been served!',
          CANCELLED: '❌ Your order has been cancelled.',
        };

        if (statusMessages[updatedOrder.status]) {
          showToast(statusMessages[updatedOrder.status], 'success');
          try {
            new Audio('/notification.mp3').play().catch(() => { });
          } catch (e) { }
        }
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [socket, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PREPARING: 'bg-purple-100 text-purple-700',
      READY: 'bg-indigo-100 text-indigo-700',
      OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-700',
      READY_TO_SERVE: 'bg-teal-100 text-teal-700',
      DELIVERED: 'bg-green-100 text-green-700',
      SERVED: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        return <Clock className="w-4 h-4" />;
      case 'PREPARING':
        return <ChefHat className="w-4 h-4" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-4 h-4" />;
      case 'DELIVERED':
      case 'SERVED':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredOrders = () => {
    if (filter === 'all') return orders;
    if (filter === 'pending') {
      return orders.filter((o) =>
        ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'READY_TO_SERVE'].includes(o.status)
      );
    }
    if (filter === 'completed') {
      return orders.filter((o) => ['DELIVERED', 'SERVED', 'COMPLETED'].includes(o.status));
    }
    return orders;
  };

  if (!user) {
    return (
      <div className="app-page">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">{t('pleaseLogin')}</h2>
          <p className="text-gray-600 mb-8">{t('loginToViewOrders')}</p>
          <Link
            to="/login"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl transition-all"
          >
            {t('loginNow')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">{t('myOrders')}</h1>
          <p className="text-gray-600">{t('trackOrders')}</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${filter === 'all'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {t('allOrders')}
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${filter === 'pending'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {t('active')}
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${filter === 'completed'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {t('completed')}
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredOrders().length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">{t('noOrdersFound')}</h3>
            <p className="text-gray-500 mb-8">
              {filter === 'all' ? t('noOrdersYet') : `No ${filter} orders at the moment`}
            </p>
            <Link
              to="/"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl transition-all"
            >
              {t('startShopping')}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders().map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-black text-gray-900">
                        {t('order')} #{order.id.slice(0, 8)}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span>{statusLabel(order.status)}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">{t('total')}</div>
                    <div className="text-2xl font-black text-orange-600">ETB {order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Restaurant Info */}
                {order.restaurant && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={order.restaurant.logo || '/m7.jpg'}
                        alt={order.restaurant.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{order.restaurant.name}</h4>
                        <p className="text-sm text-gray-600">{order.restaurant.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.food?.image || '/m1.jpg'}
                          alt={item.food?.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <h5 className="font-bold text-gray-900">{item.food?.name}</h5>
                          <p className="text-sm text-gray-600">{t('quantity')}: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">ETB {(item.unitPrice * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">ETB {item.unitPrice} each</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Type and Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {order.orderType === 'DELIVERY' ? (
                      <>
                        <Truck className="w-4 h-4" />
                        <span>{t('delivery')}</span>
                      </>
                    ) : (
                      <>
                        <ChefHat className="w-4 h-4" />
                        <span>{t('dineIn')}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Leave Review Button for Completed Orders */}
                    {['DELIVERED', 'SERVED', 'COMPLETED'].includes(order.status) && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setReviewModalOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                      >
                        <Star className="w-4 h-4" />
                        <span>{t('writeReview')}</span>
                      </button>
                    )}

                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-bold text-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t('viewDetails')}</span>
                    </Link>
                  </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-bold">{t('orderNotes')}:</span> {order.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onSuccess={() => {
          fetchOrders();
        }}
      />
    </div>
  );
}