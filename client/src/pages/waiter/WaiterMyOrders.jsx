import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Clock, CheckCircle, Package, Filter } from 'lucide-react';
import showToast from '../../components/Toast';

export default function WaiterMyOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed
  const { user } = useAuth();

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');

      // Filter for dine-in orders at this waiter's restaurant
      const myOrders = response.data.filter(
        (o) => o.orderType === 'DINE_IN' && (!user.restaurantId || o.restaurantId === user.restaurantId)
      );

      setOrders(myOrders);
      applyFilter(myOrders, statusFilter);
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
        ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_TO_SERVE', 'SERVED'].includes(o.status)
      );
    } else if (filter === 'completed') {
      filtered = ordersList.filter((o) =>
        ['COMPLETED', 'CANCELLED'].includes(o.status)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  useEffect(() => {
    applyFilter(orders, statusFilter);
  }, [statusFilter]);

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
      READY_TO_SERVE: 'bg-green-100 text-green-800 border-green-300',
      SERVED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <div className="w-full px-8 lg:px-12 py-8 space-y-8">
        {/* Centered Title with Rectangular Orange Border Tag */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl border border-orange-200 shadow-xs">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Orders</h1>
            <div className="bg-orange-50 border border-orange-300 px-3 py-1 rounded-lg text-orange-600 font-bold shadow-2xs flex items-center space-x-1">
              <ClipboardList className="w-4 h-4 text-orange-500" />
              {filteredOrders.length > 0 && (
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-md font-black">
                  {filteredOrders.length}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            View and manage all your assigned orders
          </p>
        </div>

        {/* Filter Controls Bar (Reverted to previous layout width) */}
        <div className="flex items-center justify-end space-x-2 px-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${statusFilter === 'active'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
              }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${statusFilter === 'completed'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
              }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${statusFilter === 'all'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
              }`}
          >
            All
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-sm text-gray-500">
              {statusFilter === 'active' && 'No active orders at the moment'}
              {statusFilter === 'completed' && 'No completed orders yet'}
              {statusFilter === 'all' && 'No orders available'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all border border-gray-100 hover:border-orange-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <ClipboardList className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm">
                        Order #{index + 1} - Table #{order.tableNumber || 'N/A'}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {order.id.slice(0, 8)}</p>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">
                          {getOrderAge(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-base font-black text-orange-600 mt-1.5">
                      ETB {order.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-1">Customer:</p>
                    <p className="text-sm text-gray-900">{order.customer?.name || 'Guest'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-1">Items:</p>
                    <p className="text-sm text-gray-900">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {order.specialInstructions && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-700 p-2.5 rounded-lg">
                    <p className="text-xs font-bold mb-0.5">📝 Special Instructions:</p>
                    <p className="text-xs">{order.specialInstructions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}