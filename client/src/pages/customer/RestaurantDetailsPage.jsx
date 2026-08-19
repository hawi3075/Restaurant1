import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star, Bike, Phone, ArrowLeft, Plus, ShoppingCart } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart, getItemCount } = useCart();

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/restaurants/${id}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (food) => {
    addToCart(food, 1, [], '');
  };

  const getCategories = () => {
    if (!restaurant?.foods) return [];
    const categoryMap = new Map();
    restaurant.foods.forEach((food) => {
      if (!categoryMap.has(food.category.id)) {
        categoryMap.set(food.category.id, food.category);
      }
    });
    return Array.from(categoryMap.values());
  };

  const filteredFoods = () => {
    if (!restaurant?.foods) return [];
    if (selectedCategory === 'all') return restaurant.foods;
    return restaurant.foods.filter((food) => food.category.id === selectedCategory);
  };

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round(sum / reviews.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-700">Restaurant Not Found</h2>
          <Link to="/restaurants" className="text-orange-600 hover:underline mt-4 inline-block">
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const categories = getCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-80 overflow-hidden">
        <img
          src={restaurant.coverImage || restaurant.logo || '/m7.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-8 w-full">
            <Link
              to="/restaurants"
              className="inline-flex items-center space-x-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Restaurants</span>
            </Link>

            <div className="flex items-end justify-between">
              <div className="text-white space-y-3">
                <div className="flex items-center space-x-3">
                  <h1 className="text-4xl md:text-5xl font-black">{restaurant.name}</h1>
                  {restaurant.isOpen ? (
                    <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-bold">
                      Open
                    </span>
                  ) : (
                    <span className="bg-red-500 px-3 py-1 rounded-full text-sm font-bold">
                      Closed
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="font-bold">{restaurant.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>{restaurant.openingHours} - {restaurant.closingHours}</span>
                  </div>
                  {restaurant.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-5 h-5" />
                  <span>{restaurant.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {restaurant.description && (
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
          </div>
        </section>
      )}

      {/* Service Badges */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {restaurant.isDelivery && (
              <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold">
                <Bike className="w-5 h-5" />
                <span>Delivery Available</span>
              </div>
            )}
            {restaurant.isDineIn && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold">
                Dine-In Available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Our Menu</h2>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Food Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods().map((food) => {
              const rating = calculateRating(food.reviews);
              const reviewCount = food.reviews?.length || 0;

              return (
                <div
                  key={food.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Food Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={food.image || '/m1.jpg'}
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {food.isPopular && (
                      <span className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Popular
                      </span>
                    )}
                    {!food.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold">
                          Unavailable
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Food Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                        {food.name}
                      </h3>
                      {food.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{food.description}</p>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-500 ml-1">({reviewCount})</span>
                    </div>

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-black text-orange-600">${food.price}</span>
                      
                      <button
                        onClick={() => handleAddToCart(food)}
                        disabled={!food.isAvailable}
                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-300 hover:scale-110"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* View Details Link */}
                    <Link
                      to={`/foods/${food.id}`}
                      className="block text-center text-orange-600 hover:text-orange-700 font-bold text-sm pt-2 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Floating Cart Button */}
      {getItemCount() > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-2xl flex items-center space-x-2 transition-all duration-300 hover:scale-110 z-50"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{getItemCount()}</span>
        </Link>
      )}
    </div>
  );
}
