import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, Utensils, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import showToast from '../../components/Toast';
import DashboardHeader from '../../components/DashboardHeader';

export default function WaiterDashboardHome() {
  const [stats, setStats] = useState({
    inKitchen: 0,
    readyToServe: 0,
    served: 0,
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
      
      const dineInOrders = response.data.filter(
        (o) => o.orderType === 'DINE_IN' && (!user.restaurantId || o.restaurantId === user.restaurantId)
      );

      const inKitchen = dineInOrders.filter((o) =>
        ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)
      ).length;
      
      const readyToServe = dineInOrders.filter((o) => o.status === 'READY_TO_SERVE').length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const served = dineInOrders.filter(
        (o) =>
          ['SERVED', 'COMPLETED'].includes(o.status) &&
          new Date(o.createdAt) >= today
      ).length;

      const todayTotal = dineInOrders.filter(
        (o) => new Date(o.createdAt) >= today
      ).length;

      setStats({ inKitchen, readyToServe, served, todayTotal });

      const activeOrders = dineInOrders
        .filter((o) =>
          ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_TO_SERVE', 'SERVED'].includes(o.status)
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentOrders(activeOrders);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (socket && user?.restaurantId) {
      socket.emit('join_room', user.restaurantId);

      socket.on('new_order', (newOrder) => {
        if (newOrder.orderType === 'DINE_IN' && newOrder.restaurantId === user.restaurantId) {
          fetchDashboardData();
          showToast('New dine-in order received!', 'success');
        }
      });

      socket.on('order_status_updated', (updatedOrder) => {
        if (updatedOrder.orderType === 'DINE_IN' && updatedOrder.restaurantId === user.restaurantId) {
          fetchDashboardData();
          
          if (updatedOrder.status === 'READY_TO_SERVE') {
            showToast('Order ready to serve!', 'success');
            new Audio('/notification.mp3').play().catch(() => {});
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
  }, [socket, user?.restaurantId]);

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

      <div className="px-8 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section Header with Orange Touch */}
        <div className="bg-gradient-to-r from-orange-50/80 via-white to-amber-50/40 border border-orange-200/70 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-500 text-white p-3.5 rounded-2xl shadow-md shadow-orange-500/20">
              <Utensils className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Welcome to Waiter Page, {user?.name || 'Waiter'}! 🍽️
              </h1>
              <p className="text-sm text-gray-600 font-medium mt-0.5">
                Here's what's happening in your service area today
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-orange-100/80 px-4 py-2 rounded-xl border border-orange-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">Active Service</span>
          </div>
        </div>

        {/* Stats Cards with Orange Hover Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* In Kitchen */}
          <Link
            to="/waiter/orders/cooking"
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{stats.inKitchen}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">In Kitchen</p>
          </Link>

          {/* Ready to Serve */}
          <Link
            to="/waiter/orders/ready"
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6" />
              </div>
              {stats.readyToServe > 0 && (
                <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                  READY
                </span>
              )}
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{stats.readyToServe}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ready to Serve</p>
          </Link>

          {/* Served Today */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-400 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{stats.served}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Served Today</p>
          </div>

          {/* All Orders */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-400 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{stats.todayTotal}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">All Orders</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/waiter/orders/ready"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-400 group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-50 p-4 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <AlertCircle className="w-6 h-6 text-orange-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base">Ready Orders</h3>
                <p className="text-xs text-gray-500">Serve to customers</p>
              </div>
            </div>
          </Link>

          <Link
            to="/waiter/new-order"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-400 group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-50 p-4 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Utensils className="w-6 h-6 text-orange-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base">New Order (POS)</h3>
                <p className="text-xs text-gray-500">Create walk-in order</p>
              </div>
            </div>
          </Link>

          <Link
            to="/waiter/profile"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-400 group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-50 p-4 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Users className="w-6 h-6 text-orange-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base">My Profile</h3>
                <p className="text-xs text-gray-500">View & edit profile</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">Recent Active Orders</h2>
            <Link
              to="/waiter/orders/new"
              className="text-orange-600 hover:text-orange-700 font-bold text-xs"
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-bold text-sm">No active orders at the moment</p>
              <p className="text-xs text-gray-400 mt-0.5">New orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <div
                  key={order.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    order.status === 'READY_TO_SERVE'
                      ? 'bg-orange-50/50 border-orange-200'
                      : 'bg-gray-50/50 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <span className="font-black text-gray-900 text-sm">
                        Table #{order.tableNumber || index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-gray-900 text-sm">
                          Order #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">
                          {getOrderAge(order.createdAt)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        order.status === 'READY_TO_SERVE'
                          ? 'bg-orange-100 text-orange-800'
                          : order.status === 'SERVED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <Link
                      to={`/waiter/orders/${
                        order.status === 'READY_TO_SERVE' ? 'ready' : 'cooking'
                      }`}
                      className="text-orange-600 hover:text-orange-700 font-bold text-xs"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}