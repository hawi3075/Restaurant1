import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList,
  MapPin,
  Clock,
  DollarSign,
  Search,
  CheckCircle,
  Navigation,
  Package,
  ArrowUpRight
} from 'lucide-react';

export default function DriverMyDeliveries() {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, delivered, in-transit
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    inTransit: 0,
    totalEarnings: 0
  });
  const { user } = useAuth();

  const fetchMyDeliveries = async () => {
    try {
      setLoading(true);
      const response = await API.get('/orders');
      const myOrders = response.data.filter(
        (o) =>
          o.orderType === 'DELIVERY' &&
          o.driverId === user.id &&
          (o.status === 'OUT_FOR_DELIVERY' || o.status === 'DELIVERED')
      );
      
      myOrders.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setAllOrders(myOrders);

      // Calculate stats
      const delivered = myOrders.filter((o) => o.status === 'DELIVERED').length;
      const inTransit = myOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
      const totalEarnings = myOrders
        .filter((o) => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.totalAmount * 0.1), 0);

      setStats({
        total: myOrders.length,
        delivered,
        inTransit,
        totalEarnings
      });
    } catch (err) {
      console.error('Error fetching my deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDeliveries();
  }, [user.id]);

  useEffect(() => {
    let filtered = [...allOrders];

    // Apply status filter
    if (filter === 'delivered') {
      filtered = filtered.filter((o) => o.status === 'DELIVERED');
    } else if (filter === 'in-transit') {
      filtered = filtered.filter((o) => o.status === 'OUT_FOR_DELIVERY');
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((o) =>
        o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.deliveryAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [allOrders, filter, searchTerm]);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-orange-50/30">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent shadow-md"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 p-8">
      {/* Header Banner */}
      <div className="mb-8 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-orange-600 text-white p-3.5 rounded-2xl shadow-lg shadow-orange-600/20">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Deliveries</h1>
            <p className="text-gray-500 font-medium text-sm">Complete delivery history and performance metrics</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-50 text-orange-600 p-3.5 rounded-2xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Deliveries</p>
              <p className="text-3xl font-black text-gray-900 mt-0.5">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivered</p>
              <p className="text-3xl font-black text-gray-900 mt-0.5">{stats.delivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Transit</p>
              <p className="text-3xl font-black text-gray-900 mt-0.5">{stats.inTransit}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Earnings</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">ETB {stats.totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs tracking-wide transition-all ${
                filter === 'all'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs tracking-wide transition-all ${
                filter === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Delivered ({stats.delivered})
            </button>
            <button
              onClick={() => setFilter('in-transit')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs tracking-wide transition-all ${
                filter === 'in-transit'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              In Transit ({stats.inTransit})
            </button>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
              placeholder="Search customer, address..."
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
            <ClipboardList className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Deliveries Found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            {searchTerm
              ? 'No deliveries match your current search parameters.'
              : 'Your delivery history records will populate here once available.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-orange-200 transition-all"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Order Meta & Customer Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3.5 rounded-2xl mt-1 ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    {order.status === 'DELIVERED' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Navigation className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-black text-gray-900 text-lg tracking-tight">
                        Order #{allOrders.length - index}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {order.status === 'DELIVERED' ? 'DELIVERED' : 'IN TRANSIT'}
                      </span>
                    </div>

                    <div className="flex items-center text-xs text-gray-400 space-x-2 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(order.updatedAt)}</span>
                      <span>•</span>
                      <span>{order.items?.length || 0} items</span>
                    </div>

                    <div className="flex items-start space-x-2 pt-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {order.customer?.name || 'Valued Customer'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {order.deliveryAddress || 'Address details unavailable'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount & Earnings Summary Block */}
                <div className="flex items-center lg:items-end justify-between lg:justify-end w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 gap-6">
                  <div className="text-left lg:text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Total</p>
                    <p className="text-xl font-black text-gray-900 mt-0.5">
                      ETB {order.totalAmount?.toFixed(2)}
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border min-w-[130px] text-center ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-50/50 border-emerald-100'
                      : 'bg-amber-50/50 border-amber-100'
                  }`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                      {order.status === 'DELIVERED' ? 'Earned' : 'Will Earn'}
                    </p>
                    <p className={`text-base font-black ${
                      order.status === 'DELIVERED' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      ETB {(order.totalAmount * 0.1).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}