import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Star, Bike, ArrowRight, Search, Store } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getRestaurantImageUrl } from '../../utils/imageUtils';

export default function RestaurantListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    isOpen: false,
    isDelivery: false,
    isDineIn: false,
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [searchTerm, filters, restaurants]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await API.get('/restaurants');
      setRestaurants(response.data);
      setFilteredRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = [...restaurants];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filters
    if (filters.isOpen) {
      filtered = filtered.filter((r) => r.isOpen);
    }
    if (filters.isDelivery) {
      filtered = filtered.filter((r) => r.isDelivery);
    }
    if (filters.isDineIn) {
      filtered = filtered.filter((r) => r.isDineIn);
    }

    setFilteredRestaurants(filtered);
  };

  const toggleFilter = (filterName) => {
    setFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  return (
    <div className="app-page min-h-screen bg-[#FFFBF7]">
      <Navbar />

      {/* Minimized Header with mg3.webp Background */}
      <section className="relative bg-gray-900 text-white py-10 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-orange-500/20">
        {/* Background Image with a subtle overlay for text readability */}
        <div className="absolute inset-0 z-0">
          <img
            src="/mg3.webp"
            alt="Restaurant Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              {t('discoverRestaurants') || 'Discover Restaurants'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 font-medium mt-1 drop-shadow-sm">
              {t('discoverRestaurantsHint') || 'Browse curated local spots and find your next favorite meal.'}
            </p>
          </div>

          {/* Search and Filters grouped compactly */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder={t('searchRestaurants') || 'Search restaurants...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 backdrop-blur-md border border-white/30 rounded-xl text-xs font-semibold text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-black/60 transition-all shadow-inner"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => toggleFilter('isOpen')}
                className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap backdrop-blur-md ${filters.isOpen
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40 border border-orange-500'
                    : 'bg-black/40 text-gray-200 border border-white/30 hover:bg-black/60 hover:text-white'
                  }`}
              >
                {t('openNow') || 'Open Now'}
              </button>

              <button
                onClick={() => toggleFilter('isDelivery')}
                className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap backdrop-blur-md ${filters.isDelivery
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40 border border-orange-500'
                    : 'bg-black/40 text-gray-200 border border-white/30 hover:bg-black/60 hover:text-white'
                  }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>{t('delivery') || 'Delivery'}</span>
              </button>

              <button
                onClick={() => toggleFilter('isDineIn')}
                className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap backdrop-blur-md ${filters.isDineIn
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40 border border-orange-500'
                    : 'bg-black/40 text-gray-200 border border-white/30 hover:bg-black/60 hover:text-white'
                  }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t('dineIn') || 'Dine-In'}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Results Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Found <span className="text-orange-600 font-black">{filteredRestaurants.length}</span> restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent shadow-sm"></div>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-orange-200 p-16 text-center shadow-xs max-w-md mx-auto">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-base font-bold text-gray-800 mb-1">{t('restaurantNotFound') || 'No restaurants found'}</h3>
              <p className="text-gray-400 text-xs">{t('noItemsFound') || 'Try adjusting your search terms or filters.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/restaurants/${restaurant.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-orange-100/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  {/* Restaurant Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={getRestaurantImageUrl(restaurant.coverImage || restaurant.logo)}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = getRestaurantImageUrl(null); }}
                    />

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-md">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{restaurant.rating ? restaurant.rating.toFixed(1) : '4.5'}</span>
                    </div>

                    {/* Status Badge */}
                    {restaurant.isOpen ? (
                      <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>{t('openNow') || 'Open'}</span>
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 bg-rose-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black shadow-md">
                        <span>{t('closed') || 'Closed'}</span>
                      </div>
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                        {restaurant.name}
                      </h3>
                      {restaurant.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 font-medium">{restaurant.description}</p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-orange-50 text-xs">
                      <div className="flex items-center space-x-2 text-gray-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                      </div>

                      {restaurant.openingHours && restaurant.closingHours && (
                        <div className="flex items-center space-x-2 text-gray-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{restaurant.openingHours} - {restaurant.closingHours}</span>
                        </div>
                      )}
                    </div>

                    {/* Service Badges */}
                    <div className="flex items-center gap-2">
                      {restaurant.isDelivery && (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                          <Bike className="w-3 h-3 text-emerald-600" />
                          <span>{t('delivery') || 'Delivery'}</span>
                        </span>
                      )}
                      {restaurant.isDineIn && (
                        <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                          <Store className="w-3 h-3 text-blue-600" />
                          <span>{t('dineIn') || 'Dine-In'}</span>
                        </span>
                      )}
                    </div>

                    {/* View Menu Button */}
                    <div className="pt-1">
                      <div className="w-full bg-orange-50 group-hover:bg-orange-600 text-orange-600 group-hover:text-white font-extrabold text-xs py-2.5 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-2xs">
                        <span>{t('viewMenu') || 'View Menu'}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}