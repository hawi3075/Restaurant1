import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import { CheckCircle, Clock, Package, Truck, ChefHat, Filter, ImageOff } from 'lucide-react';
import showToast from '../../components/Toast';

// Shared grid template so the header row and every order row line up perfectly.
const GRID_COLS =
  'lg:grid-cols-[40px_28px_90px_90px_120px_minmax(140px,1fr)_90px_110px_140px]';

export default function ChefOrdersAll() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active'); // active, completed, all
  const socket = useSocket();
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');

      // Filter for this chef's restaurant orders
      const restaurantOrders = response.data.filter(
        (o) => !user.restaurantId || o.restaurantId === user.restaurantId
      );

      setOrders(restaurantOrders);
      applyFilter(restaurantOrders, statusFilter);
    } catch (err) {
      console.error('Error loading orders:', err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (ordersList, filter) => {
    let filtered = ordersList;

    if (filter === 'active') {
      filtered = ordersList.filter((o) =>
        ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'READY_TO_SERVE'].includes(o.status)
      );
    } else if (filter === 'completed') {
      filtered = ordersList.filter((o) =>
        ['DELIVERED', 'SERVED', 'COMPLETED', 'CANCELLED'].includes(o.status)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchOrders();

    if (socket && user.restaurantId) {
      socket.emit('join_room', user.restaurantId);

      socket.on('new_order', (newOrder) => {
        if (newOrder.restaurantId === user.restaurantId) {
          fetchOrders();
          showToast('New order received!', 'success');
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.restaurantId === user.restaurantId) {
          fetchOrders();
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

  useEffect(() => {
    applyFilter(orders, statusFilter);
  }, [statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: `Chef updated status to ${newStatus}`
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

      fetchOrders();
      showToast('Order status updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update order status:', err);
      showToast('Failed to update order status', 'error');
    }
  };

  const getOrderAge = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
      PREPARING: 'bg-purple-100 text-purple-800 border-purple-300',
      READY: 'bg-green-100 text-green-800 border-green-300',
      READY_TO_SERVE: 'bg-green-100 text-green-800 border-green-300',
      DELIVERED: 'bg-gray-100 text-gray-800 border-gray-300',
      SERVED: 'bg-gray-100 text-gray-800 border-gray-300',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  All Orders 📋
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">View and manage all orders</p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  statusFilter === 'active'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  statusFilter === 'all'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No Orders Found</h3>
            <p className="text-gray-500">
              {statusFilter === 'active' && 'No active orders at the moment'}
              {statusFilter === 'completed' && 'No completed orders yet'}
              {statusFilter === 'all' && 'No orders available'}
            </p>
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
              <span>Type</span>
              <span>Customer</span>
              <span>Food Name</span>
              <span className="text-right">Total</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {filteredOrders.map((order, index) => {
              const isUrgent = new Date() - new Date(order.createdAt) > 15 * 60 * 1000;
              const isActive = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'READY_TO_SERVE'].includes(order.status);
              const image = getOrderImage(order);

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 p-4 lg:py-3 lg:px-5 hover:shadow-md transition-all ${
                    isUrgent && isActive ? 'border-red-300' : 'border-gray-100'
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
                          <span className={`text-xs font-medium whitespace-nowrap ${isUrgent && isActive ? 'text-red-600' : 'text-gray-500'}`}>
                            {getOrderAge(order.createdAt)}
                          </span>
                        </div>
                      </div>
                      {/* Status shown here on mobile */}
                      <span className={`lg:hidden px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Type */}
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
                      {order.orderType === 'DINE_IN' && order.tableNumber && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black bg-orange-100 text-orange-700 border border-orange-300">
                          Table {order.tableNumber}
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

                    {/* Status — desktop only (mobile shown above next to Order ID) */}
                    <div className="hidden lg:block">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Action */}
                    <div>
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => updateStatus(order.id, 'CONFIRMED')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold text-xs transition-all hover:shadow-md whitespace-nowrap"
                        >
                          ✓ Accept
                        </button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateStatus(order.id, 'PREPARING')}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-bold text-xs transition-all hover:shadow-md whitespace-nowrap"
                        >
                          👨‍🍳 Start Preparing
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() =>
                            updateStatus(
                              order.id,
                              order.orderType === 'DELIVERY' ? 'READY' : 'READY_TO_SERVE'
                            )
                          }
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-bold text-xs transition-all hover:shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Ready</span>
                        </button>
                      )}
                      {!isActive && (
                        <span className="text-xs text-gray-400 italic">No action needed</span>
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