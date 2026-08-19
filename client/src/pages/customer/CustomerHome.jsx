import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Bike, ShieldCheck, Clock, CreditCard, Phone, Mail, MapPin, ArrowRight, MessageSquare, Users, Sparkles, Star } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';

const HERO_PHOTO = '/m1.jpg';
const DELIVERY_IMAGE = '/m8.jpg';

/* ---------------------------------------------------------
   Small utility hooks: scroll-reveal + count-up, both used
   to give the page a sense of arrival instead of static blocks.
--------------------------------------------------------- */

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}

const MARQUEE_ITEMS = [
  'Enjera Firfir', 'Doro Wat', 'Kitfo', 'Tibs', 'Shiro', 'Coffee Ceremony', 'Kikil', 'Gomen', 'Ayib',
];

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesRes = await API.get('/foods/categories');
      setCategories(categoriesRes.data);
      if (categoriesRes.data.length > 0) {
        setActiveCategory(categoriesRes.data[0].id);
      }

      // Fetch popular foods
      const popularRes = await API.get('/foods?popular=true');
      setPopularFoods(popularRes.data);

      // Fetch restaurants
      const restaurantsRes = await API.get('/restaurants');
      setRestaurants(restaurantsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set fallback data for demo
      setCategories([
        { id: '1', name: 'Traditional', image: '/m1.jpg', _count: { foods: 12 } },
        { id: '2', name: 'Burgers', image: '/m7.jpg', _count: { foods: 8 } },
        { id: '3', name: 'Pizza', image: '/m8.jpg', _count: { foods: 6 } },
      ]);
      setPopularFoods([
        { id: 1, name: 'Special Enjera Firfir', image: '/m1.jpg', rating: 5, reviews: [{id:1}], price: 120, restaurant: { name: 'Bole Restaurant' } },
        { id: 2, name: 'Doro Wat', image: '/m7.jpg', rating: 5, reviews: [], price: 150, restaurant: { name: 'Traditional House' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const discount = useCallback((price, oldPrice) => {
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }, []);

  const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round(sum / reviews.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#FFF8F3] to-[#FFEDDF] text-gray-800 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Global keyframes + font pairing: a warm display serif for headlines, clean sans for body */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,600&family=Work+Sans:wght@400;500;600;700;800&display=swap');

        .font-display { font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 60; }
        .font-body { font-family: 'Work Sans', sans-serif; }

        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-10px) rotate(1.5deg); } }
        @keyframes floatSlower { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
        @keyframes steamRise {
          0% { transform: translateY(0) scaleX(1); opacity: 0; }
          15% { opacity: .55; }
          100% { transform: translateY(-60px) scaleX(1.6); opacity: 0; }
        }
        @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes wipeIn { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0% 0 0); } }
        @keyframes slideUpIn { 0% { opacity: 0; transform: translateY(24px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-slower { animation: floatSlower 8s ease-in-out infinite; }
        .animate-wipe-in { animation: wipeIn 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards; }
        .animate-slide-up { animation: slideUpIn 0.5s ease-out forwards; }
        .marquee-track { animation: marqueeScroll 26s linear infinite; }
        .steam-wisp { animation: steamRise 3.2s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .animate-float-slow, .animate-float-slower, .animate-wipe-in, .marquee-track, .steam-wisp { animation: none !important; }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(#fed7aa_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none"></div>

      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-orange-200/50 rounded-full blur-3xl pointer-events-none animate-float-slower"></div>
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-orange-300/30 rounded-full blur-3xl pointer-events-none animate-float-slower"></div>

      <Navbar />

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={HERO_PHOTO}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-[0.16]"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 90% 75% at 68% 40%, black 30%, transparent 78%)',
              maskImage: 'radial-gradient(ellipse 90% 75% at 68% 40%, black 30%, transparent 78%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/40 via-transparent to-amber-100/30 mix-blend-multiply"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative flex justify-center lg:justify-start lg:translate-x-10 transition-transform">
            <div className="relative w-full max-w-[430px] aspect-[4/4.1] group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2.2rem] blur-sm opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
              <div className="absolute -inset-6 bg-gradient-to-br from-orange-200/20 via-amber-100/10 to-transparent rounded-[3rem] blur-3xl"></div>
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden animate-wipe-in">
                <img
                  src={HERO_PHOTO}
                  alt="Fresh gourmet meal, ready to order"
                  className="w-full h-full object-cover border-2 border-transparent group-hover:border-orange-500 transition-all duration-300 shadow-lg"
                />
              </div>

              <div className="absolute top-12 -left-4 sm:-left-8 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center space-x-2 border-2 border-white animate-float-slow z-10">
                <span className="text-xs">🍷</span>
                <div>
                  <p className="text-[8px] uppercase font-bold text-orange-100">Quick Order</p>
                  <p className="text-[11px] font-black">Order 5000+</p>
                </div>
              </div>

              <div className="absolute -top-3 -right-2 sm:right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center space-x-2.5 border-2 border-white animate-float-slower z-10">
                <div className="bg-white/20 p-1 rounded-xl">
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[8px] uppercase font-bold text-orange-100">Feedback</p>
                  <p className="text-[11px] font-black">Review 2330+</p>
                </div>
              </div>

              <div className="absolute bottom-4 -left-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center space-x-2.5 border-2 border-white z-10 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                <div className="bg-white/20 p-1 rounded-xl">
                  <Users className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[8px] uppercase font-bold text-orange-100">Active Community</p>
                  <p className="text-[11px] font-black">User 999+</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 text-center lg:text-left relative">
            <div className="space-y-1 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight">
                Why stay <span className="text-orange-600 italic">Hungry</span> !
              </h1>
              <p className="text-lg sm:text-xl font-bold text-orange-500 tracking-wide">
                when you can order always from
              </p>
            </div>

            <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-orange-600 animate-slide-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
              ማእድ <span className="italic">Ma'ad</span>
            </div>

            <p className="text-gray-700 font-extrabold text-base sm:text-lg animate-slide-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
              Discover delicious meals and order instantly
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-slide-up" style={{ animationDelay: '0.55s', opacity: 0 }}>
              <Link
                to="/categories"
                className="group inline-flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-600/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-600/40"
              >
                <span>Order Now</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- SCROLLING DISH MARQUEE: a spice-market banner between hero and story --- */}
      <div className="relative py-5 overflow-hidden bg-gradient-to-r from-[#3D1F0F] via-[#5C2A12] to-[#3D1F0F] border-y-2 border-orange-500/50 shadow-[inset_0_2px_12px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#3D1F0F] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#3D1F0F] to-transparent z-10 pointer-events-none"></div>
        <div className="flex whitespace-nowrap marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span key={idx} className="flex items-center mx-4 sm:mx-6 text-sm sm:text-base font-display font-bold text-amber-100 tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 mr-2 shrink-0" />
              <span className="uppercase">{item}</span>
              <span className="mx-4 sm:mx-6 text-orange-400/70">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* --- OVERALL RESTAURANT HIGHLIGHT SECTION --- */}
      <section className="py-14 bg-white/70 backdrop-blur-md border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal className="space-y-4 text-center lg:text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Great Food & Warm Hospitality
            </h2>
            <p className="text-gray-600 leading-relaxed text-base font-medium">
              We love serving delicious meals made with fresh and healthy ingredients. Come and enjoy wonderful dishes prepared just for you in a cozy and friendly place.
            </p>
            <div className="pt-2">
              <Link
                to="/restaurants"
                className="group inline-flex items-center space-x-2 text-orange-600 font-bold hover:text-orange-700 transition"
              >
                <span>Discover Our Kitchen</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150} className="flex justify-center">
            <div className="relative w-full max-w-[500px] group">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <img
                src="/m7.jpg"
                alt="Ma'ad Restaurant ambiance and dishes"
                className="relative w-full h-[320px] sm:h-[380px] object-cover rounded-[2rem] shadow-lg border-4 border-white transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- STUNNING FEATURES SECTION --- */}
      <section id="features" className="py-20 relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-amber-50/40 to-[#FFF5EE]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-orange-300/30 to-amber-300/30 blur-3xl rounded-full pointer-events-none animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-6 space-y-14 relative z-10">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
              Stunning Features That You Can Count On
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Remarkable Features that You Can Count! Built for speed, security, and exceptional user delight.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Clock, title: '24/7 Support', description: 'Round-the-clock dedicated customer assistance to ensure your orders run smoothly anytime.', badge: 'Always Open' },
              { icon: CreditCard, title: 'Easy Payment', description: 'Integrated smart payment gateways like Telebirr for seamless and secure transactions.', badge: 'Fast & Secure' },
              { icon: Bike, title: 'Fast Delivery', description: 'Real-time tracking and optimized logistics to get your food hot and fresh instantly.', badge: 'Live Tracking' },
              { icon: ShieldCheck, title: 'Multi-Role System', description: 'Synchronized portals for customers, kitchen chefs, waiters, delivery drivers, and managers.', badge: 'Smart Sync' },
            ].map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <Reveal key={idx} delay={idx * 120}>
                  <div className="group relative bg-white/90 backdrop-blur-2xl border border-orange-100/90 p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/[0.04] hover:shadow-2xl hover:shadow-orange-600/20 transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] flex flex-col justify-between overflow-hidden h-full">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-orange-600/50 transition-all duration-500">
                          <IconComponent className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 border border-orange-200/70 px-3 py-1 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                          {feature.badge}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US PHOTO COLLAGE GALLERY SECTION --- */}
      <section className="py-20 bg-white/70 backdrop-blur-md border-y border-orange-100/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl lg:text-4xl font-black text-orange-600 tracking-tight">
              Why Choose Us?
            </h2>
            <p className="text-gray-700 text-base sm:text-lg font-extrabold">
              What so Special About ማእድ?
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {[
              { img: '/m1.jpg', title: 'Find your daily meal' },
              { img: '/m7.jpg', title: 'Easy to food ordering system' },
              { img: DELIVERY_IMAGE, title: 'Fastest food delivery service' },
              { img: '/m1.jpg', title: 'Track your food order' },
            ].map((card, idx) => (
              <Reveal key={idx} delay={idx * 100}>
                <div className="group relative rounded-[2rem] overflow-hidden shadow-xl border-4 border-white h-[200px] sm:h-[240px] bg-gray-900 cursor-pointer">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 via-orange-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center px-8">
                    <h3 className="text-white text-2xl sm:text-3xl font-black tracking-tight transform -translate-x-4 group-hover:translate-x-0 transition-transform duration-300">
                      {card.title}
                    </h3>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- POPULAR RESTAURANTS SECTION --- */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-orange-600 font-extrabold uppercase tracking-widest text-xs">Featured</span>
              <span className="text-orange-500 text-lg">⭐</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Popular Restaurants
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Discover the best restaurants near you
            </p>
          </Reveal>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.slice(0, 6).map((restaurant, idx) => (
                <Reveal key={restaurant.id} delay={idx * 100}>
                  <Link
                    to={`/restaurants/${restaurant.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg shadow-orange-950/[0.03] border border-orange-100 hover:shadow-2xl hover:shadow-orange-600/10 transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={restaurant.coverImage || restaurant.logo || '/m7.jpg'}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{restaurant.rating.toFixed(1)}</span>
                      </div>
                      {restaurant.isOpen ? (
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                          Open Now
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                          Closed
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                        {restaurant.name}
                      </h3>
                      
                      <div className="flex items-start space-x-2 text-xs text-gray-600">
                        <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{restaurant.address}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="font-bold text-gray-700">
                            {restaurant.openingHours} - {restaurant.closingHours}
                          </span>
                        </div>
                        {restaurant.isDelivery && (
                          <div className="flex items-center space-x-1 text-green-600 font-bold">
                            <Bike className="w-4 h-4" />
                            <span>Delivery</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          {restaurant.foods?.length || 0} menu items
                        </span>
                        <button className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1">
                          <span>View Menu</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="py-20 bg-gradient-to-b from-[#FFF5EE] to-white">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-orange-200/50 pb-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 font-extrabold uppercase tracking-widest text-xs">Food Menu</span>
                <span className="text-orange-500 text-lg">🍃</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Popular Delicious Foods
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border ${
                    activeCategory === category.id
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-105'
                      : 'bg-white text-gray-700 border-orange-200/80 hover:border-orange-500 hover:text-orange-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularFoods.map((food, idx) => (
              <Reveal key={food.id} delay={idx * 90}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-lg shadow-orange-950/[0.03] border border-orange-100 hover:shadow-2xl hover:shadow-orange-600/10 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 h-full">
                  <div className="relative h-32 overflow-hidden bg-gray-100">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {food.oldPrice && (
                      <span className="absolute top-2 left-2 bg-orange-600 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-md">
                        -{discount(food.price, food.oldPrice)}%
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h3 className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                      {food.name}
                    </h3>

                    <div className="flex items-center space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 transition-colors duration-300 ${
                            i < food.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] font-bold text-gray-500 ml-1.5">
                        ({food.reviews?.length || 0})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base font-black text-orange-600">
                          {food.price}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 line-through">
                          {food.oldPrice}
                        </span>
                      </div>

                      <Link
                        to={`/food/${food.id}`}
                        className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center space-x-1"
                      >
                        <span>Order</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="bg-orange-600 text-white p-1.5 rounded-xl">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-black text-white">ማእድ <span className="text-orange-500 text-xs font-body">Ma'ad</span></span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              ማእድ is a complete multi-role food ordering and restaurant management package designed to empower food businesses and delight customers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-sm tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-orange-500 transition">Home</a></li>
              <li><a href="#categories" className="hover:text-orange-500 transition">Category</a></li>
              <li><a href="#about" className="hover:text-orange-500 transition">About Us</a></li>
              <li><Link to="/login" className="hover:text-orange-500 transition">Login / Join Us</Link></li>
            </ul>
          </div>

          <div id="privacy">
            <h4 className="text-white font-bold mb-3 text-sm tracking-wide">Support & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-orange-500 cursor-pointer transition">Privacy Policy</span></li>
              <li><span className="hover:text-orange-500 cursor-pointer transition">Terms & Conditions</span></li>
              <li><span className="hover:text-orange-500 cursor-pointer transition">Help Center</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-sm tracking-wide">Contact Us</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center space-x-2.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Adama, Ethiopia</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>hawig3521@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>+251 900 000 000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-gray-800 text-center text-[11px] text-gray-500 relative z-10">
          © {new Date().getFullYear()} ማእድ Restaurant Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}