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

// -----------------------------------------------------------------------
// MOCK DATA — replace with real API calls, e.g.:
//   GET /api/restaurants                        -> RESTAURANTS
//   GET /api/restaurants/:id/menu?category=...    -> MENU_ITEMS[id][category]
// Keep the same shape so the component below doesn't need to change.
// -----------------------------------------------------------------------
const RESTAURANTS = [
  {
    id: 'yod-abyssinia',
    name: 'Yod Abyssinia Restaurant',
    location: 'Bole Road, Addis Ababa',
    hours: '08:00 - 23:00',
    open: true,
  },
  {
    id: 'tomoca-coffee',
    name: 'Tomoca Coffee',
    location: 'Wawel Street, Piazza, Addis Ababa',
    hours: '06:00 - 21:00',
    open: true,
  },
  {
    id: 'habesha-2000',
    name: 'Habesha 2000 Restaurant',
    location: 'Kazanchis, Addis Ababa',
    hours: '10:00 - 22:00',
    open: true,
  },
  {
    id: 'oda',
    name: 'Oda',
    location: 'To be updated',
    hours: '09:00 - 22:00',
    open: true,
  },
];

// Category identity — "Desserts" always reads pink, "Coffee" always reads
// espresso-brown, no matter which restaurant you're browsing.
const CATEGORIES = [
  {
    id: 'ethiopian', label: 'Ethiopian Food', icon: UtensilsCrossed,
    iconBg: 'bg-orange-100', iconText: 'text-orange-700',
    activeBg: 'bg-orange-600', activeGlow: 'shadow-orange-600/25',
    tile: 'from-orange-100 to-amber-50', tileIcon: 'text-orange-300',
  },
  {
    id: 'coffee', label: 'Coffee & Beverages', icon: Coffee,
    iconBg: 'bg-amber-100', iconText: 'text-amber-800',
    activeBg: 'bg-amber-800', activeGlow: 'shadow-amber-800/25',
    tile: 'from-amber-100 to-orange-50', tileIcon: 'text-amber-400',
  },
  {
    id: 'fastfood', label: 'Fast Food', icon: Sandwich,
    iconBg: 'bg-red-100', iconText: 'text-red-700',
    activeBg: 'bg-red-600', activeGlow: 'shadow-red-600/25',
    tile: 'from-red-100 to-orange-50', tileIcon: 'text-red-300',
  },
  {
    id: 'desserts', label: 'Desserts', icon: IceCream,
    iconBg: 'bg-pink-100', iconText: 'text-pink-700',
    activeBg: 'bg-pink-600', activeGlow: 'shadow-pink-600/25',
    tile: 'from-pink-100 to-rose-50', tileIcon: 'text-pink-300',
  },
];

const MENU_ITEMS = {
  'yod-abyssinia': {
    ethiopian: [
      { id: 'cdd8aed1-bd27-4bff-8f35-7633f4ddd945', name: 'Doro Wot with Injera', price: 250, rating: 0 },
      { id: 'f2c487f1-06e0-4850-b13d-0586a23d2192', name: 'Kitfo', price: 300, rating: 0 },
      { id: '3', name: 'Tibs', price: 220, rating: 0 },
    ],
    coffee: [
      { id: '9feb387a-c261-4d6a-b924-127ce70d0658', name: 'Ethiopian Coffee Ceremony', price: 80, rating: 0 },
    ],
    fastfood: [],
    desserts: [],
  },
  'tomoca-coffee': {
    ethiopian: [],
    coffee: [
      { id: 'a1aabbd4-d39d-4290-9441-5248c08b9204', name: 'Macchiato', price: 50, rating: 0 },
      { id: '6', name: 'Espresso', price: 45, rating: 0 },
      { id: '9feb387a-c261-4d6a-b924-127ce70d0658', name: 'Ethiopian Coffee Ceremony', price: 80, rating: 0 },
    ],
    fastfood: [],
    desserts: [],
  },
  'habesha-2000': {
    ethiopian: [
      { id: 8, name: 'Shiro Wot with Injera', price: 180, rating: 0 },
      { id: 9, name: 'Tibs Special', price: 260, rating: 0 },
    ],
    coffee: [],
    fastfood: [
      { id: 10, name: 'Chicken Burger', price: 150, rating: 0 },
    ],
    desserts: [
      { id: 11, name: 'Baklava', price: 90, rating: 0 },
    ],
  },
  oda: {
    ethiopian: [],
    coffee: [],
    fastfood: [],
    desserts: [],
  },
};
// -----------------------------------------------------------------------

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

        {/* --- HEADER BANNER / SEARCH BAR SECTION --- */}
        <div className="bg-[#F8F3EF] border-b border-orange-200/60 py-8 px-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Menu
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 italic font-medium">
                "Pick a restaurant, pick a category, and find your next favorite dish."
              </p>
            </div>

            <div className="relative w-full md:w-96">
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
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <main className="max-w-7xl mx-auto px-6 py-12">

          {/* Step 1: Restaurant Selector */}
          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">
            <span className="text-orange-600 font-bold">Step 1:</span> First, select a restaurant below.
          </p>

          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-10 space-y-2 mb-12">
              <Store className="w-10 h-10 text-orange-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-700">No restaurants match your search</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {filteredRestaurants.map((r) => {
                const isActive = r.id === selectedRestaurant;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRestaurant(r.id)}
                    className={`group text-left bg-white rounded-2xl p-5 shadow-sm border transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer ${isActive
                      ? 'border-orange-400 shadow-xl ring-2 ring-orange-500/30'
                      : 'border-orange-100 hover:border-orange-400 hover:shadow-xl'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl overflow-hidden shadow-md flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${isActive ? 'bg-orange-600' : 'bg-orange-50'
                        }`}>
                        <Store className={`w-6 h-6 ${isActive ? 'text-white' : 'text-orange-500'}`} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {r.open && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                            ● Open
                          </span>
                        )}
                        {isActive && (
                          <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className={`font-bold text-sm sm:text-base mb-1 leading-snug transition-colors ${isActive ? 'text-orange-600' : 'text-gray-900 group-hover:text-orange-600'
                      }`}>
                      {r.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 flex items-center space-x-1 mb-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{r.location}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      <span>{r.hours}</span>
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Category Chips */}
          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">
            <span className="text-orange-600 font-bold">Step 2:</span> Choose a category.
          </p>

          <div className="flex flex-wrap gap-2.5 mb-10">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = cat.id === selectedCategory;
              const count = MENU_ITEMS[selectedRestaurant]?.[cat.id]?.length || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer ${isActive
                    ? `${cat.activeBg} text-white shadow-lg ${cat.activeGlow}`
                    : 'bg-white text-gray-600 border border-orange-100 hover:border-orange-300 hover:shadow-sm'
                    }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/20' : `${cat.iconBg} ${cat.iconText}`
                    }`}>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                  </span>
                  <span className="whitespace-nowrap">{cat.label}</span>
                  <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Menu Items Grid */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {activeRestaurant?.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{cTheme.label} · Savor dishes made fresh to order</p>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-orange-100 p-14 text-center">
              <div className={`w-14 h-14 rounded-2xl ${cTheme.iconBg} ${cTheme.iconText} flex items-center justify-center mx-auto mb-4`}>
                <cTheme.icon className="w-6 h-6" />
              </div>
              <p className="text-gray-400 font-medium text-sm">
                {searchTerm
                  ? `No dishes match "${searchTerm}" in ${cTheme.label.toLowerCase()}.`
                  : `No ${cTheme.label.toLowerCase()} listed yet for ${activeRestaurant?.name}.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {filteredItems.map((item) => {
                const qtyInCart = cart.filter((c) => c.food.id === item.id).reduce((sum, c) => sum + c.quantity, 0);
                const reviewsOpen = openReviewItemId === item.id;
                const reviews = item.reviews || [];

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100 hover:border-orange-400 hover:shadow-xl transition-all duration-300 flex flex-col relative"
                  >
                    {/* Image-style tile (icon fallback, matches Categories' image container) */}
                    <div className={`h-40 w-full flex items-center justify-center bg-gradient-to-br ${cTheme.tile} relative overflow-hidden`}>
                      <cTheme.icon className={`w-11 h-11 ${cTheme.tileIcon} group-hover:scale-110 transition-transform duration-500`} />
                      <div className="absolute inset-0 bg-orange-950/5 group-hover:bg-transparent transition-colors" />
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