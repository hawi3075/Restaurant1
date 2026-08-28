import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Bike, Phone, ArrowLeft, Eye, MessageSquare, ShoppingCart, CreditCard, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal state for reviews
  const [selectedFoodReviews, setSelectedFoodReviews] = useState(null);

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

  const handleCheckoutNow = (food) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(food, 1, [], '');
    navigate('/checkout');
  };

  const getCategories = () => {
    if (!restaurant?.foods) return [];
    const categoryMap = new Map();
    restaurant.foods.forEach((food) => {
      if (food.category && !categoryMap.has(food.category.id)) {
        categoryMap.set(food.category.id, food.category);
      }
    });
    return Array.from(categoryMap.values());
  };

  const filteredFoods = () => {
    if (!restaurant?.foods) return [];
    if (selectedCategory === 'all') return restaurant.foods;
    return restaurant.foods.filter((food) => food.category?.id === selectedCategory);
  };

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round(sum / reviews.length);
  };

  if (loading) {
    return (
      <div className="app-page min-h-screen bg-[#FFFBF7]">
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="app-page min-h-screen bg-[#FFFBF7]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-700">{t('restaurantNotFound') || 'Restaurant not found'}</h2>
          <Link to="/restaurants" className="text-orange-600 hover:underline mt-4 inline-block font-semibold">
            {t('backToRestaurants') || 'Back to Restaurants'}
          </Link>
        </div>
      </div>
    );
  }

  const categories = getCategories();

  return (
    <div className="app-page min-h-screen bg-[#FFFBF7]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-80 overflow-hidden">
        <img
          src={restaurant.coverImage || restaurant.logo || '/m7.webp'}
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
              <span className="font-medium">{t('backToRestaurants') || 'Back to Restaurants'}</span>
            </Link>

            <div className="flex items-end justify-between">
              <div className="text-white space-y-3">
                <div className="flex items-center space-x-3">
                  <h1 className="text-4xl md:text-5xl font-black">{restaurant.name}</h1>
                  {restaurant.isOpen ? (
                    <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      {t('open') || 'Open'}
                    </span>
                  ) : (
                    <span className="bg-red-500 px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      {t('closed') || 'Closed'}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-6 text-sm flex-wrap gap-y-2">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="font-bold">{restaurant.rating ? restaurant.rating.toFixed(1) : '4.5'}</span>
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

                <div className="flex items-center space-x-2 text-sm text-gray-200">
                  <MapPin className="w-5 h-5 text-orange-400 shrink-0" />
                  <span>{restaurant.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {restaurant.description && (
        <section className="bg-white border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <p className="text-gray-700 leading-relaxed text-sm font-medium">{restaurant.description}</p>
          </div>
        </section>
      )}

      {/* Service Badges */}
      <section className="bg-white border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {restaurant.isDelivery && (
              <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-extrabold text-xs">
                <Bike className="w-4 h-4 text-emerald-600" />
                <span>{t('fastDelivery') || 'Fast Delivery'}</span>
              </div>
            )}
            {restaurant.isDineIn && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-extrabold text-xs">
                <span>{t('dineIn') || 'Dine-In Available'}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-4">{t('foodMenu') || 'Food Menu'}</h2>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer ${selectedCategory === 'all'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-white text-gray-700 hover:bg-orange-50 border border-orange-100'
                  }`}
              >
                {t('all') || 'All'}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer ${selectedCategory === category.id
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                      : 'bg-white text-gray-700 hover:bg-orange-50 border border-orange-100'
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
                  className="group bg-white rounded-3xl overflow-hidden border border-orange-100/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    {/* Food Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={food.image || '/m1.webp'}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = '/m1.webp'; }}
                      />
                      {food.isPopular && (
                        <span className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md">
                          {t('popular') || 'Popular'}
                        </span>
                      )}
                      {!food.isAvailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black">
                            {t('unavailable') || 'Unavailable'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Food Info */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                          {restaurant.name}
                        </span>
                        <h3 className="text-base font-black text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                          {food.name}
                        </h3>
                        {food.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 font-medium">{food.description}</p>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 pt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                              }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-gray-500 ml-1">({reviewCount})</span>
                      </div>

                      {/* Price */}
                      <div className="pt-1">
                        <span className="text-xl font-black text-orange-600">ETB {food.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Action Buttons Row (Detail, Reviews, Add, Checkout) */}
                  <div className="p-3 bg-orange-50/40 border-t border-orange-100/60 grid grid-cols-4 gap-1.5">
                    {/* Detail Button -> Redirects to Detail Page */}
                    <Link
                      to={`/foods/${food.id}`}
                      className="flex flex-col items-center justify-center p-2 bg-white hover:bg-orange-600 hover:text-white text-gray-700 rounded-xl border border-orange-100 transition-all shadow-2xs group/btn cursor-pointer"
                      title={t('viewDetails') || 'Detail'}
                    >
                      <Eye className="w-4 h-4 text-orange-500 group-hover/btn:text-white mb-0.5" />
                      <span className="text-[10px] font-black">{t('detail') || 'Detail'}</span>
                    </Link>

                    {/* Reviews Button -> Opens popup modal showing reviews or "no review" */}
                    <button
                      onClick={() => setSelectedFoodReviews(food)}
                      className="flex flex-col items-center justify-center p-2 bg-white hover:bg-orange-600 hover:text-white text-gray-700 rounded-xl border border-orange-100 transition-all shadow-2xs group/btn cursor-pointer"
                      title={t('reviews') || 'Reviews'}
                    >
                      <MessageSquare className="w-4 h-4 text-amber-500 group-hover/btn:text-white mb-0.5" />
                      <span className="text-[10px] font-black">{t('reviews') || 'Reviews'}</span>
                    </button>

                    {/* Add to Cart Button -> Adds to Cart */}
                    <button
                      onClick={() => handleAddToCart(food)}
                      disabled={!food.isAvailable}
                      className="flex flex-col items-center justify-center p-2 bg-white hover:bg-orange-600 hover:text-white text-gray-700 rounded-xl border border-orange-100 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer"
                      title={t('addToCart') || 'Add'}
                    >
                      <ShoppingCart className="w-4 h-4 text-orange-600 group-hover/btn:text-white mb-0.5" />
                      <span className="text-[10px] font-black">{t('add') || 'Add'}</span>
                    </button>

                    {/* Checkout Now Button -> Adds to Cart and redirects to /cart */}
                    <button
                      onClick={() => handleCheckoutNow(food)}
                      disabled={!food.isAvailable}
                      className="flex flex-col items-center justify-center p-2 bg-white hover:bg-emerald-600 hover:text-white text-gray-700 rounded-xl border border-orange-100 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer"
                      title={t('checkout') || 'Checkout'}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600 group-hover/btn:text-white mb-0.5" />
                      <span className="text-[10px] font-black">{t('checkout') || 'Checkout'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews Modal Popup */}
      {selectedFoodReviews && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-orange-100 relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedFoodReviews(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-5 pr-8">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{t('customerReviews') || 'Customer Reviews'}</span>
              <h3 className="text-xl font-black text-gray-900">{selectedFoodReviews.name}</h3>
            </div>

            {/* Reviews List or No Review Message */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {!selectedFoodReviews.reviews || selectedFoodReviews.reviews.length === 0 ? (
                <div className="py-12 text-center bg-orange-50/50 rounded-2xl border border-dashed border-orange-200">
                  <MessageSquare className="w-10 h-10 text-orange-300 mx-auto mb-2" />
                  <p className="text-base font-extrabold text-gray-800">No review</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('noReviewsYetHint') || 'Be the first to leave a review for this item!'}</p>
                </div>
              ) : (
                selectedFoodReviews.reviews.map((rev, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-gray-900">{rev.user?.name || rev.userName || 'Anonymous'}</span>
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{rev.comment || rev.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer / Close */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedFoodReviews(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-extrabold text-xs hover:bg-orange-600 transition-colors cursor-pointer"
              >
                {t('close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {getItemCount() > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-2xl flex items-center space-x-2 transition-all duration-300 hover:scale-110 z-50 cursor-pointer"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{getItemCount()}</span>
        </Link>
      )}
    </div>
  );
}