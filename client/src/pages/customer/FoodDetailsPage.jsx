import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, MapPin, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function FoodDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
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

  const toggleAddon = (addon) => {
    if (selectedAddons.find((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const calculateTotal = () => {
    const basePrice = food.price * quantity;
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0) * quantity;
    return basePrice + addonsPrice;
  };

  const handleAddToCart = () => {
    addToCart(food, quantity, selectedAddons, specialInstructions);
    navigate('/cart');
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

  if (!food) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-700">Food Item Not Found</h2>
          <Link to="/" className="text-orange-600 hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const rating = calculateRating(food.reviews);
  const reviewCount = food.reviews?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          to={`/restaurants/${food.restaurant.id}`}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to {food.restaurant.name}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={food.image || '/m1.jpg'}
                alt={food.name}
                className="w-full h-[500px] object-cover"
              />
              {food.isPopular && (
                <span className="absolute top-6 left-6 bg-orange-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  🔥 Popular Choice
                </span>
              )}
              {!food.isAvailable && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-6 py-3 rounded-2xl text-xl font-bold">
                    Currently Unavailable
                  </span>
                </div>
              )}
            </div>

            {/* Restaurant Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Available at</h3>
              <Link
                to={`/restaurants/${food.restaurant.id}`}
                className="flex items-start space-x-4 hover:bg-orange-50 p-3 rounded-xl transition-colors"
              >
                <img
                  src={food.restaurant.logo || '/m7.jpg'}
                  alt={food.restaurant.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 hover:text-orange-600">
                    {food.restaurant.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{food.restaurant.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {food.restaurant.openingHours} - {food.restaurant.closingHours}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                  {food.category.name}
                </span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-4">{food.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-700">
                  {rating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>

              {/* Description */}
              {food.description && (
                <p className="text-gray-700 leading-relaxed text-lg">{food.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-1">Price</div>
              <div className="text-4xl font-black text-orange-600">${food.price.toFixed(2)}</div>
            </div>

            {/* Add-ons */}
            {food.addons && food.addons.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add-ons (Optional)</h3>
                <div className="space-y-3">
                  {food.addons.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedAddons.find((a) => a.id === addon.id)}
                          onChange={() => toggleAddon(addon)}
                          className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <span className="font-bold text-gray-900">{addon.name}</span>
                      </div>
                      <span className="font-bold text-orange-600">+${addon.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Special Instructions</h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests? (e.g., less spicy, no onions)"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                rows="3"
              />
            </div>

            {/* Quantity and Add to Cart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
              {/* Quantity Selector */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-700" />
                  </button>
                  <span className="text-2xl font-black text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-4 border-t-2 border-gray-100">
                <span className="text-lg font-bold text-gray-700">Total</span>
                <span className="text-3xl font-black text-orange-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!food.isAvailable}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>{food.isAvailable ? 'Add to Cart' : 'Unavailable'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-black text-gray-900 mb-8">Customer Reviews</h2>
          
          {reviewCount === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <div className="text-gray-400 text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500">Be the first to review this dish!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {food.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{review.customer.name}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  )}
                  {review.image && (
                    <img
                      src={review.image}
                      alt="Review"
                      className="mt-4 rounded-xl w-full h-48 object-cover"
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
