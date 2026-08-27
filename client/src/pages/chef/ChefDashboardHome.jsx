import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, ChefHat, Package, Bell, AlertCircle, TrendingUp, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChefDashboardHome() {
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    completed: 0,
    todayTotal: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');


      // Filter for this chef's restaurant orders
      const restaurantOrders = response.data.filter(
        (o) => !user.restaurantId || o.restaurantId === user.restaurantId
      );

      // Calculate stats
      const pending = restaurantOrders.filter((o) => o.status === 'PENDING').length;
      const preparing = restaurantOrders.filter((o) =>
        ['CONFIRMED', 'PREPARING'].includes(o.status)
      ).length;

      // Today's completed orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completed = restaurantOrders.filter(
        (o) =>
          ['DELIVERED', 'SERVED', 'COMPLETED'].includes(o.status) &&
          new Date(o.createdAt) >= today
      ).length;

      const todayTotal = restaurantOrders.filter(
        (o) => new Date(o.createdAt) >= today
      ).length;

      setStats({ pending, preparing, completed, todayTotal });

      // Get recent active orders (last 5)
      const activeOrders = restaurantOrders
        .filter((o) =>
          ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'READY_TO_SERVE'].includes(o.status)
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentOrders(activeOrders);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (socket) {
      if (user?.restaurantId) socket.emit('join_room', user.restaurantId);
      socket.emit('join_room', 'chef_global');

      const handleNewOrder = () => {
        fetchDashboardData();
      };

      const handleStatusUpdate = () => {
        fetchDashboardData();
      };

      socket.on('new_order', handleNewOrder);
      socket.on('order_status_updated', handleStatusUpdate);

      return () => {
        socket.off('new_order', handleNewOrder);
        socket.off('order_status_updated', handleStatusUpdate);
      };
    }
  }, [socket, user?.restaurantId]);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Welcome Banner / Header section */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-10 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Welcome Back, {user?.name}
                  <span className="ml-1">👨‍🍳</span>
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  Here's what's happening in your kitchen today
                </p>
              </div>
            </div>

            {stats.pending > 0 && (
              <Link
                to="/chef/orders/new"
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md animate-pulse"
              >
                <Bell className="w-4 h-4" />
                <span>{stats.pending} New Order{stats.pending !== 1 ? 's' : ''}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Minimized Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* New Orders */}
          <Link
            to="/chef/orders/new"
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] text-white flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold opacity-90 mb-1">New Orders Waiting</p>
              <h3 className="text-2xl font-black">{stats.pending}</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
          </Link>

          {/* In Progress */}
          <Link
            to="/chef/orders/cooking"
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] text-white flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold opacity-90 mb-1">Currently Cooking</p>
              <h3 className="text-2xl font-black">{stats.preparing}</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
          </Link>

          {/* Completed Today */}
          <Link
            to="/chef/orders/all"
            className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl p-4 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] text-white flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold opacity-90 mb-1">Completed Today</p>
              <h3 className="text-2xl font-black">{stats.completed}</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </Link>

          {/* Total Orders Today */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-md text-white flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90 mb-1">Total Orders Today</p>
              <h3 className="text-2xl font-black">{stats.todayTotal}</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/chef/orders/new"
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-orange-200 hover:border-orange-400 flex items-center space-x-3"
          >
            <div className="bg-orange-100 p-3 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-sm">View New Orders</h3>
              <p className="text-xs text-gray-600">Check pending orders</p>
            </div>
          </Link>

          <Link
            to="/chef/add-food"
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-green-200 hover:border-green-400 flex items-center space-x-3"
          >
            <div className="bg-green-100 p-3 rounded-lg">
              <ChefHat className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-sm">Add New Food</h3>
              <p className="text-xs text-gray-600">Submit for approval</p>
            </div>
          </Link>

          <Link
            to="/chef/profile"
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-blue-200 hover:border-blue-400 flex items-center space-x-3"
          >
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-sm">My Profile</h3>
              <p className="text-xs text-gray-600">View & edit profile</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900">Recent Active Orders</h2>
            <Link
              to="/chef/orders/all"
              className="text-orange-600 hover:text-orange-700 font-bold text-xs"
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-bold text-sm">No active orders at the moment</p>
              <p className="text-xs text-gray-400 mt-0.5">New orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, index) => {
                const isUrgent = new Date() - new Date(order.createdAt) > 15 * 60 * 1000;

                return (
                  <div
                    key={order.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${isUrgent
                      ? 'bg-red-50 border-red-300 animate-pulse'
                      : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2.5 rounded-lg shadow-xs">
                        <span className="font-black text-xs text-gray-900">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs sm:text-sm text-gray-900">
                            Order #{order.id.slice(0, 8)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.orderType === 'DELIVERY'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                              }`}
                          >
                            {order.orderType === 'DELIVERY' 
                              ? '🚚 Delivery' 
                              : `🍽️ Dine-In${order.tableNumber ? ` (Table ${order.tableNumber})` : ''}`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span
                            className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'
                              }`}
                          >
                            {getOrderAge(order.createdAt)}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold ${order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'PREPARING'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      <Link
                        to={`/chef/orders/${order.status === 'PENDING' ? 'new' : order.status === 'PREPARING' ? 'cooking' : 'all'}`}
                        className="text-orange-600 hover:text-orange-700 font-bold text-xs"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
