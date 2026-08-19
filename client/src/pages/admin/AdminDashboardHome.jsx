import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ShoppingBag, Users, Store, TrendingUp, 
  Clock, CheckCircle, XCircle, Package, Star, Award
} from 'lucide-react';
import API from '../../services/api';

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalRestaurants: 0,
    activeRestaurants: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topRatedFoods, setTopRatedFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersRes = await API.get('/orders');
      const orders = ordersRes.data;
      
      // Fetch customers
      const customersRes = await API.get('/users/customers');
      
      // Fetch restaurants
      const restaurantsRes = await API.get('/restaurants');
      const restaurants = restaurantsRes.data;

      // Fetch foods for Top Rated section
      const foodsRes = await API.get('/foods');
      const foods = foodsRes.data || [];

      // Calculate statistics
      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
      const deliveredOrders = orders.filter(o => ['DELIVERED', 'SERVED', 'COMPLETED'].includes(o.status));
      const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');
      const totalRevenue = orders
        .filter(o => ['DELIVERED', 'SERVED', 'COMPLETED'].includes(o.status))
        .reduce((sum, o) => sum + o.totalAmount, 0);

      setStats({
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        deliveredOrders: deliveredOrders.length,
        cancelledOrders: cancelledOrders.length,
        totalRevenue,
        totalCustomers: customersRes.data.length,
        totalRestaurants: restaurants.length,
        activeRestaurants: restaurants.filter(r => r.isOpen).length,
      });

      // Set recent orders (last 10)
      setRecentOrders(orders.slice(0, 10));

      // Build Top Rated Foods: only foods with at least 1 review, sorted by avg rating desc,
      // then by review count desc as a tiebreaker
      const rated = foods
        .map(food => ({
          ...food,
          avgRating: calculateRating(food.reviews),
          reviewCount: food.reviews?.length || 0,
        }))
        .filter(food => food.reviewCount > 0)
        .sort((a, b) => {
          if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
          return b.reviewCount - a.reviewCount;
        })
        .slice(0, 6);

      setTopRatedFoods(rated);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      DELIVERED: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +{stats.todayOrders} today
            </span>
          </div>
          <h3 className="text-2xl font-black text-gray-900">{stats.totalOrders}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Orders</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">${stats.totalRevenue.toFixed(2)}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900">{stats.totalCustomers}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Customers</p>
        </div>

        {/* Total Restaurants */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {stats.activeRestaurants} active
            </span>
          </div>
          <h3 className="text-2xl font-black text-gray-900">{stats.totalRestaurants}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Restaurants</p>
        </div>
      </div>

      {/* Order Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delivered Orders */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-bold text-gray-700">Delivered Orders</h4>
          </div>
          <p className="text-3xl font-black text-green-600">{stats.deliveredOrders}</p>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center space-x-3 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-bold text-gray-700">Cancelled Orders</h4>
          </div>
          <p className="text-3xl font-black text-red-600">{stats.cancelledOrders}</p>
        </div>

        {/* Today's Orders */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-gray-700">Today's Orders</h4>
          </div>
          <p className="text-3xl font-black text-blue-600">{stats.todayOrders}</p>
        </div>
      </div>

      {/* --- TOP RATED FOODS SECTION (NEW) --- */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Top Rated Foods</h2>
          </div>
        </div>

        <div className="p-6">
          {topRatedFoods.length === 0 ? (
            <div className="text-center py-10">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No rated foods yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRatedFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center space-x-4 bg-gray-50 hover:bg-orange-50 rounded-xl p-4 border border-gray-100 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-gray-900 truncate">
                      {food.name}
                    </h4>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(food.avgRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-500 ml-1">
                        ({food.reviewCount} {food.reviewCount === 1 ? 'Review' : 'Reviews'})
                      </span>
                    </div>
                    {food.restaurant?.name && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {food.restaurant.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">Recent Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {order.customer?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {order.restaurant?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold">
                        {order.orderType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}