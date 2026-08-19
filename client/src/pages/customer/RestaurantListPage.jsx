import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Star, Bike, ArrowRight, Search, Filter } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';

export default function RestaurantListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />

      {/* Header Section */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Discover Amazing Restaurants
            </h1>
            <p className="text-lg text-orange-100 max-w-2xl mx-auto">
              Browse through our curated list of top restaurants and find your next favorite meal
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-300"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => toggleFilter('isOpen')}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                filters.isOpen
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Open Now
            </button>
            <button
              onClick={() => toggleFilter('isDelivery')}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center space-x-2 ${
                filters.isDelivery
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Delivery</span>
            </button>
            <button
              onClick={() => toggleFilter('isDineIn')}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                filters.isDineIn
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Dine-In
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 text-gray-700 font-medium">
            Found {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Restaurants Found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/restaurants/${restaurant.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Restaurant Image */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={restaurant.coverImage || restaurant.logo || '/m7.jpg'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{restaurant.rating.toFixed(1)}</span>
                    </div>

                    {/* Status Badge */}
                    {restaurant.isOpen ? (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        Open Now
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        Closed
                      </div>
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                        {restaurant.name}
                      </h3>
                      {restaurant.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{restaurant.description}</p>
                      )}
                    </div>

                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{restaurant.address}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="font-bold">
                          {restaurant.openingHours} - {restaurant.closingHours}
                        </span>
                      </div>
                    </div>

                    {/* Service Badges */}
                    <div className="flex items-center gap-2 pt-2">
                      {restaurant.isDelivery && (
                        <span className="flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          <Bike className="w-3.5 h-3.5" />
                          <span>Delivery</span>
                        </span>
                      )}
                      {restaurant.isDineIn && (
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          Dine-In
                        </span>
                      )}
                    </div>

                    {/* View Menu Button */}
                    <div className="pt-2">
                      <button className="w-full bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg">
                        <span>View Menu</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
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
