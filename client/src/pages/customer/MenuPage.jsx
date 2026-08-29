import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Clock, Star, UtensilsCrossed, Coffee, Sandwich, IceCream,
  Store, Check, Eye, MessageCircle, ShoppingCart, CreditCard, Heart, Phone, Mail,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getFoodImageUrl, getRestaurantImageUrl } from '../../utils/imageUtils';
import API from '../../services/api';

function StarRow({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center space-x-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1">({count})</span>
    </div>
  );
}

export default function MenuPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const { supportPhone, supportEmail, businessName } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Which item's reviews panel is currently open
  const [openReviewItemId, setOpenReviewItemId] = useState(null);

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await API.get('/restaurants');
      setRestaurants(response.data);
      if (response.data.length > 0) {
        setSelectedRestaurant(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeRestaurant = restaurants.find((r) => r.id === selectedRestaurant);

  // Get unique categories from the selected restaurant's foods
  const categories = useMemo(() => {
    if (!activeRestaurant?.foods) return [];
    const categoryMap = new Map();
    activeRestaurant.foods.forEach((food) => {
      if (food.category && !categoryMap.has(food.category.id)) {
        categoryMap.set(food.category.id, food.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [activeRestaurant]);

  const filteredRestaurants = useMemo(
    () => restaurants.filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, restaurants]
  );

  // Get foods for selected restaurant and category
  const items = useMemo(() => {
    if (!activeRestaurant?.foods) return [];
    if (selectedCategory === 'all') return activeRestaurant.foods;
    return activeRestaurant.foods.filter((food) => food.category?.id === selectedCategory);
  }, [activeRestaurant, selectedCategory]);

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [items, searchTerm]
  );

  const handleSelectRestaurant = (id) => {
    setSelectedRestaurant(id);
    setSelectedCategory('all'); // reset to all categories on switch
  };

  const toggleReviews = (itemId) => {
    setOpenReviewItemId((prev) => (prev === itemId ? null : itemId));
  };

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round(sum / reviews.length);
  };

  // Add a menu item to the local cart (state + localStorage so it survives navigation)
  const handleAddToCart = (item) => {
    addToCart(item, 1, [], '');
  };

  return (
    <div className="app-page-warm font-sans selection:bg-orange-500 selection:text-white flex flex-col justify-between">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,600&family=Work+Sans:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Work Sans', sans-serif; }
      `}</style>

      <div>
        <Navbar />

        {/* --- MAIN CONTENT --- */}
        <main className="max-w-7xl mx-auto px-6 py-10">

          {/* Search Bar */}
          <div className="relative w-full mb-8">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-orange-200/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-12 h-12 text-orange-500 mx-auto animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading restaurants...</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">

              {/* --- SIDEBAR: Restaurant Selector --- */}
              <aside className="lg:w-72 lg:shrink-0">
                <div className="lg:sticky lg:top-24">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                    Restaurants
                  </p>

                  {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-10 space-y-2 bg-white rounded-2xl border border-dashed border-orange-200">
                      <Store className="w-8 h-8 text-orange-300 mx-auto" />
                      <h3 className="text-sm font-bold text-gray-700 px-4">No restaurants match your search</h3>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
                      {filteredRestaurants.map((r) => {
                        const isActive = r.id === selectedRestaurant;
                        return (
                          <button
                            key={r.id}
                            onClick={() => handleSelectRestaurant(r.id)}
                            className={`group text-left bg-white rounded-2xl p-3.5 shadow-sm border transition-all duration-300 cursor-pointer flex items-center gap-3 ${isActive
                              ? 'border-orange-400 shadow-md ring-2 ring-orange-500/25 bg-orange-50/40'
                              : 'border-orange-100 hover:border-orange-300 hover:shadow-md'
                              }`}
                          >
                            <div className={`w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-105 ${isActive ? 'bg-orange-600' : 'bg-orange-50'
                              }`}>
                              <Store className={`w-5 h-5 ${isActive ? 'text-white' : 'text-orange-500'}`} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h3 className={`font-bold text-xs sm:text-sm leading-snug truncate transition-colors ${isActive ? 'text-orange-600' : 'text-gray-900 group-hover:text-orange-600'
                                  }`}>
                                  {r.name}
                                </h3>
                                {isActive && (
                                  <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 flex items-center space-x-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-gray-400" />
                                <span className="truncate">{r.address}</span>
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-[10px] text-gray-400 flex items-center space-x-1">
                                  <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span>{r.openingHours} - {r.closingHours}</span>
                                </p>
                                {r.isOpen && (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full whitespace-nowrap ml-1">
                                    ● Open
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>

              {/* --- MAIN COLUMN: Categories + Items --- */}
              <div className="flex-1 min-w-0">
                {/* Category Chips */}
                {activeRestaurant && (
                  <div className="flex flex-wrap gap-2.5 mb-8">
                    {/* All Items Button */}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer ${selectedCategory === 'all'
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                        : 'bg-white text-gray-600 border border-orange-100 hover:border-orange-300 hover:shadow-sm'
                        }`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-orange-100 text-orange-700'
                        }`}>
                        <UtensilsCrossed className={`w-3.5 h-3.5 ${selectedCategory === 'all' ? 'text-white' : ''}`} />
                      </span>
                      <span className="whitespace-nowrap">All Items</span>
                      <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${selectedCategory === 'all' ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {activeRestaurant.foods?.length || 0}
                      </span>
                    </button>

                    {/* Real Categories from API */}
                    {categories.map((cat) => {
                      const isActive = cat.id === selectedCategory;
                      const count = activeRestaurant.foods?.filter((f) => f.category?.id === cat.id).length || 0;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer ${isActive
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                            : 'bg-white text-gray-600 border border-orange-100 hover:border-orange-300 hover:shadow-sm'
                            }`}
                        >
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className={`w-7 h-7 rounded-xl object-cover ${isActive ? 'ring-2 ring-white/30' : ''}`}
                            />
                          ) : (
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/20' : 'bg-orange-100 text-orange-700'
                              }`}>
                              <UtensilsCrossed className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                            </span>
                          )}
                          <span className="whitespace-nowrap">{cat.name}</span>
                          <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Menu Items Grid */}
                {activeRestaurant && (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                          {activeRestaurant?.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedCategory === 'all' ? 'All Menu Items' : categories.find((c) => c.id === selectedCategory)?.name} · Savor dishes made fresh to order
                        </p>
                      </div>
                    </div>

                    {filteredItems.length === 0 ? (
                      <div className="bg-white rounded-2xl border-2 border-dashed border-orange-100 p-14 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-4">
                          <UtensilsCrossed className="w-6 h-6" />
                        </div>
                        <p className="text-gray-400 font-medium text-sm">
                          {searchTerm
                            ? `No dishes match "${searchTerm}".`
                            : `No menu items available yet for ${activeRestaurant?.name}.`}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => {
                          const qtyInCart = cart.filter((c) => c.food.id === item.id).reduce((sum, c) => sum + c.quantity, 0);
                          const reviewsOpen = openReviewItemId === item.id;
                          const reviews = item.reviews || [];
                          const rating = calculateRating(reviews);

                          return (
                            <div
                              key={item.id}
                              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100 hover:border-orange-400 hover:shadow-xl transition-all duration-300 flex flex-col relative"
                            >
                              {/* Food Image */}
                              <div className="h-40 w-full overflow-hidden relative bg-orange-50">
                                <img
                                  src={getFoodImageUrl(item.image)}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getFoodImageUrl(null);
                                  }}
                                />
                              </div>

                              {/* Content */}
                              <div className="p-4 flex flex-col flex-grow justify-between">
                                <div>
                                  <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">
                                    {activeRestaurant?.name}
                                  </span>
                                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                    {item.name}
                                  </h3>
                                  <div className="mt-1.5">
                                    <StarRow rating={item.rating} count={reviews.length} />
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                  <span className="text-sm font-black text-orange-600">ETB {item.price}</span>
                                  {qtyInCart > 0 && (
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                      {qtyInCart} in cart
                                    </span>
                                  )}
                                </div>

                                {/* Action buttons: Detail / Reviews / Add / Checkout */}
                                <div className="mt-3 grid grid-cols-4 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/food/${item.id}`)}
                                    title="View details"
                                    className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span className="text-[9px] font-bold">Detail</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleReviews(item.id)}
                                    title="Customer reviews"
                                    className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors ${reviewsOpen
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white'
                                      }`}
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-[9px] font-bold">Reviews</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(item)}
                                    title="Add to cart"
                                    className="relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span className="text-[9px] font-bold">Add</span>
                                    {qtyInCart > 0 && (
                                      <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                                        {qtyInCart}
                                      </span>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!user) {
                                        navigate('/login');
                                      } else {
                                        if (qtyInCart === 0) {
                                          addToCart(item, 1, [], '');
                                        }
                                        navigate('/checkout');
                                      }
                                    }}
                                    title="Checkout"
                                    className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                    <span className="text-[9px] font-bold">Checkout</span>
                                  </button>
                                </div>
                              </div>

                              {/* Reviews popover — overlays the card when open */}
                              {reviewsOpen && (
                                <div className="absolute inset-2 z-20 bg-white rounded-xl shadow-2xl border border-orange-200 p-3 overflow-y-auto flex flex-col">
                                  <div className="flex items-center justify-between mb-2 shrink-0">
                                    <h4 className="text-xs font-black text-gray-900">Customer Reviews</h4>
                                    <button
                                      type="button"
                                      onClick={() => setOpenReviewItemId(null)}
                                      className="text-gray-400 hover:text-gray-700 text-sm font-bold leading-none px-1"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  {reviews.length > 0 ? (
                                    <ul className="space-y-2 overflow-y-auto">
                                      {reviews.map((review) => (
                                        <li key={review.id} className="border-b border-gray-100 pb-2 last:border-0">
                                          <div className="flex items-center space-x-0.5">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`}
                                              />
                                            ))}
                                          </div>
                                          <p className="text-[11px] font-bold text-gray-700 mt-1">
                                            {review.user?.name || 'Anonymous'}
                                          </p>
                                          {review.comment && (
                                            <p className="text-[11px] text-gray-500 leading-snug">{review.comment}</p>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-gray-400">No reviews yet.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="bg-orange-600 text-white p-2 rounded-xl shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                ማእድ <span className="text-orange-500 font-medium text-sm">Ma'ad</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Discover delicious meals and order instantly from the best local restaurants around you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-orange-500 transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-orange-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/cookies" className="hover:text-orange-500 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>Adama, Ethiopia</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>{supportPhone || '+251 900 000 000'}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>{supportEmail || 'support@maed.com'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {businessName || "ማእድ Ma'ad Restaurant Management System"}. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>for food lovers.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}