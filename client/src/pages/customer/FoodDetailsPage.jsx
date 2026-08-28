import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, MapPin, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export default function FoodDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    fetchFoodDetails();
  }, [id]);

  const fetchFoodDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/foods/${id}`);
      setFood(response.data);
    } catch (error) {
      console.error('Error fetching food details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const calculateTotal = () => {
    if (!food) return 0;
    return food.price * quantity;
  };

  const handleAddToCart = () => {
    addToCart(food, quantity, [], specialInstructions);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-700">{t('foodNotFound')}</h2>
          <Link to="/" className="text-orange-600 hover:underline mt-4 inline-block font-semibold">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  const rating = calculateRating(food.reviews);
  const reviewCount = food.reviews?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Back Button */}
        <Link
          to={`/restaurants/${food.restaurant.id}`}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors font-medium group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>{t('backTo')} {food.restaurant.name}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column - Image & Restaurant Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            {/* Main Product Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-100 group">
              <img
                src={food.image || '/m1.webp'}
                alt={food.name}
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = '/m1.webp'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
              
              {food.isPopular && (
                <span className="absolute top-4 left-4 bg-orange-500/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase">
                  🔥 Popular Choice
                </span>
              )}

              {!food.isAvailable && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-red-600 text-white px-6 py-2.5 rounded-2xl text-lg font-bold shadow-xl">
                    Currently Unavailable
                  </span>
                </div>
              )}
            </div>

            {/* Restaurant Info Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">Available From</span>
              <Link
                to={`/restaurants/${food.restaurant.id}`}
                className="flex items-center space-x-4 group/rest"
              >
                <img
                  src={food.restaurant.logo || '/m7.webp'}
                  alt={food.restaurant.name}
                  className="w-14 h-14 rounded-2xl object-cover shadow-inner"
                  onError={(e) => { e.target.src = '/m7.webp'; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-gray-900 group-hover/rest:text-orange-600 truncate transition-colors">
                    {food.restaurant.name}
                  </h4>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="truncate">{food.restaurant.address}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>{food.restaurant.openingHours} - {food.restaurant.closingHours}</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column - Details & Purchasing Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase">
                  {food.category?.name || 'Dish'}
                </span>
                
                {/* Rating Badge */}
                <div className="flex items-center space-x-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="text-sm font-bold text-amber-900">
                    {rating.toFixed(1)} <span className="text-amber-600 font-normal">({reviewCount})</span>
                  </span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">{food.name}</h1>
              
              {food.description && (
                <p className="text-gray-600 text-base leading-relaxed mb-6">{food.description}</p>
              )}

              {/* Price Banner */}
              <div className="flex items-baseline space-x-2 pt-4 border-t border-gray-100">
                <span className="text-xs uppercase font-bold text-gray-400">Unit Price:</span>
                <span className="text-3xl font-black text-orange-600">{food.price.toFixed(2)} Br</span>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Special Instructions</h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests? (e.g., less spicy, no onions)"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none resize-none text-sm text-gray-800 transition-all"
                rows="3"
              />
            </div>

            {/* Quantity and Order Action Bar */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Quantity</span>
                  <div className="inline-flex items-center space-x-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center shadow-sm transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-black text-gray-900 min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Total Amount</span>
                  <span className="text-3xl font-black text-orange-600">
                    {calculateTotal().toFixed(2)} Br
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!food.isAvailable}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{food.isAvailable ? 'Add to Cart' : 'Currently Unavailable'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Customer Reviews</h2>
            <div className="text-sm font-semibold text-gray-500">{reviewCount} total feedback</div>
          </div>
          
          {reviewCount === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No Reviews Yet</h3>
              <p className="text-sm text-gray-400">Be the first to review this dish after your order!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {food.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{review.customer.name}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  )}
                  {review.image && (
                    <img
                      src={review.image}
                      alt="Review attachment"
                      className="rounded-2xl w-full h-40 object-cover border border-gray-100"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}