import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Utensils, Heart, Phone, Mail, MapPin, Star, Plus, Eye, MessageCircle, ShoppingCart, CreditCard } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const { supportPhone, supportEmail, businessName } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Which food card currently has its reviews panel open
  const [openReviewFoodId, setOpenReviewFoodId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const categoriesRes = await API.get('/foods/categories');
      setCategories(categoriesRes.data);

      // Fetch foods (filtered by category if categoryId exists)
      const foodsUrl = categoryId ? `/foods?categoryId=${categoryId}` : '/foods?popular=true';
      const foodsRes = await API.get(foodsUrl);
      setFoods(foodsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Add a food item to the local cart (state + localStorage so it survives navigation)
  const handleAddToCart = (food) => {
    addToCart(food, 1, [], '');
  };

  const toggleReviews = (foodId) => {
    setOpenReviewFoodId((prev) => (prev === foodId ? null : foodId));
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {t('categories')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 italic font-medium">
                "Discover delicious meals and order your favorite cravings instantly."
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Search by category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-orange-200/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* --- CATEGORIES GRID --- */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            <div className="text-center py-12 space-y-3">
              <Utensils className="w-12 h-12 text-orange-400 mx-auto animate-spin" />
              <h3 className="text-xl font-bold text-gray-700">Loading categories...</h3>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Utensils className="w-12 h-12 text-orange-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-gray-700">No categories found</h3>
              <p className="text-gray-500 text-sm">Try searching for something else.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="group bg-white rounded-2xl p-5 shadow-sm border border-orange-100 hover:border-orange-400 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1.5"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md mb-4 bg-orange-50 relative group-hover:scale-110 transition-transform duration-500">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${category.image ? 'hidden' : ''}`}>
                      <Utensils className="w-10 h-10 text-orange-500" />
                    </div>
                    <div className="absolute inset-0 bg-orange-950/10 group-hover:bg-transparent transition-colors"></div>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                    {category.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {category._count?.foods || 0} Items
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* --- POPULAR FOODS UNDER CATEGORIES SECTION --- */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Best Reviewed Food
                </h2>
                <p className="text-sm text-gray-600 mt-1">Savor the highest-rated dishes from top local restaurants</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {filteredFoods.map((food) => {
                const rating = calculateRating(food.reviews);
                const reviewCount = food.reviews?.length || 0;
                const qtyInCart = cart.filter((c) => c.food.id === food.id).reduce((sum, c) => sum + c.quantity, 0);
                const reviewsOpen = openReviewFoodId === food.id;

                return (
                  <div
                    key={food.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100 hover:border-orange-400 hover:shadow-xl transition-all duration-300 flex flex-col relative"
                  >
                    {/* Image container — click through to full detail page */}
                    <Link to={`/foods/${food.id}`} className="h-40 w-full overflow-hidden relative bg-orange-50 block">
                      <img
                        src={food.image || '/m1.webp'}
                        alt={food.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = '/m1.webp'; }}
                      />
                    </Link>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">
                          {food.restaurant?.name || 'Restaurant'}
                        </span>
                        <Link to={`/foods/${food.id}`}>
                          <h3 className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                            {food.name}
                          </h3>
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center space-x-1 mt-1.5 text-xs text-gray-600">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold">{rating}</span>
                          <span className="text-gray-400">({reviewCount})</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-black text-orange-600">ETB {food.price}</span>
                        {qtyInCart > 0 && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            {qtyInCart} in cart
                          </span>
                        )}
                      </div>

                      {/* Action buttons: Detail / Reviews / Add to cart / Checkout */}
                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        <Link
                          to={`/foods/${food.id}`}
                          title="View details"
                          className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-[9px] font-bold">Detail</span>
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleReviews(food.id);
                          }}
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
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(food);
                          }}
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
                            onClick={() => setOpenReviewFoodId(null)}
                            className="text-gray-400 hover:text-gray-700 text-sm font-bold leading-none px-1"
                          >
                            ✕
                          </button>
                        </div>

                        {food.reviews && food.reviews.length > 0 ? (
                          <ul className="space-y-2 overflow-y-auto">
                            {food.reviews.map((review) => (
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
          </div>
        </main>
      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="bg-orange-600 text-white p-2 rounded-xl shadow-md">
                <Utensils className="w-5 h-5" />
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
              <li><Link to="/#about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link to="/#contact" className="hover:text-orange-500 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/#privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/#terms" className="hover:text-orange-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/#cookies" className="hover:text-orange-500 transition-colors">Cookie Policy</Link></li>
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