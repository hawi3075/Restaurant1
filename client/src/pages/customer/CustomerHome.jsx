import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Bike, ShieldCheck, Clock, CreditCard, Phone, Mail, MapPin, ArrowRight, MessageSquare, Users, Sparkles, Star, Store } from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

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

/* ---------------------------------------------------------
   Count-up number, used inside the floating stats bar so the
   figures feel earned rather than just printed on the page.
--------------------------------------------------------- */
function CountUp({ end, suffix = '', duration = 1400 }) {
  const [ref, inView] = useInView(0.4);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(end);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ---------------------------------------------------------
   Draggable, horizontally-scrollable category strip.
   Click-and-drag with the mouse (desktop) or swipe (touch/
   trackpad) to scroll sideways — same idea as the reference
   "Explore Our Wide Range of Food Categories" row.
--------------------------------------------------------- */
const CATEGORY_TILE_COLORS = [
  'from-violet-700/90 to-indigo-800/90',
  'from-fuchsia-700/90 to-purple-800/90',
  'from-sky-700/90 to-blue-900/90',
  'from-amber-600/90 to-yellow-800/90',
  'from-rose-700/90 to-red-900/90',
  'from-lime-700/90 to-emerald-800/90',
  'from-orange-600/90 to-red-800/90',
  'from-teal-600/90 to-cyan-800/90',
  'from-slate-700/90 to-gray-900/90',
  'from-pink-600/90 to-rose-800/90',
];

function CategoryScroller({ categories, activeCategory, onSelect }) {
  const trackRef = useRef(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const onMouseDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - track.offsetLeft,
      scrollLeft: track.scrollLeft,
      moved: false,
    };
    track.classList.add('cursor-grabbing');
  };

  const stopDrag = () => {
    dragState.current.isDown = false;
    trackRef.current?.classList.remove('cursor-grabbing');
  };

  const onMouseMove = (e) => {
    const track = trackRef.current;
    if (!track || !dragState.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 5) dragState.current.moved = true;
    track.scrollLeft = dragState.current.scrollLeft - walk;
  };

  return (
    <div
      ref={trackRef}
      onMouseDown={onMouseDown}
      onMouseLeave={stopDrag}
      onMouseUp={stopDrag}
      onMouseMove={onMouseMove}
      className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 cursor-grab select-none snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((category, idx) => {
        const isActive = activeCategory === category.id;
        const colorClass = CATEGORY_TILE_COLORS[idx % CATEGORY_TILE_COLORS.length];
        const count = category._count?.foods ?? 0;
        return (
          <button
            key={category.id}
            onClick={() => {
              if (!dragState.current.moved) onSelect(category.id);
            }}
            className={`group relative flex-shrink-0 w-40 sm:w-44 h-24 sm:h-28 snap-start rounded-2xl overflow-hidden shadow-lg transition-all duration-300 animate-slide-up ${
              isActive ? 'ring-4 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 -translate-y-1 scale-[1.03]' : 'hover:-translate-y-1 hover:scale-[1.02]'
            }`}
            style={{ animationDelay: `${idx * 70}ms`, opacity: 0 }}
          >
            {category.image && (
              <img
                src={category.image}
                alt=""
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none group-hover:scale-110 transition-transform duration-500"
              />
            )}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} mix-blend-multiply`} />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
            {isActive && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
            )}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-2 pointer-events-none">
              <span className="text-white font-black text-sm sm:text-base leading-tight drop-shadow">
                {category.name}
              </span>
              <span className="text-white/80 text-[11px] font-bold mt-1">
                {count}+ Items
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const MARQUEE_ITEMS = [
  'Enjera Firfir', 'Doro Wat', 'Kitfo', 'Tibs', 'Shiro', 'Coffee Ceremony', 'Kikil', 'Gomen', 'Ayib',
];

/* ---------------------------------------------------------
   Flat character illustrations for the journey section —
   drawn in the brand's own orange/amber palette rather than
   dropping in stock art, so they sit naturally on the page.
--------------------------------------------------------- */
function IllustrationStage({ children }) {
  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="stageGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE9D2" />
          <stop offset="100%" stopColor="#FFD3A0" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill="url(#stageGrad)" className="dark:opacity-90" />
      <ellipse cx="80" cy="132" rx="38" ry="7" fill="#EA580C" opacity="0.14" />
      {children}
    </svg>
  );
}

function OrderIllustration() {
  return (
    <IllustrationStage>
      {/* potted plant */}
      <g transform="translate(34,96)">
        <rect x="-8" y="18" width="16" height="14" rx="3" fill="#C2540C" />
        <path d="M 0 18 C -14 14, -16 -2, -2 -6 C 2 -14, 14 -10, 12 2 C 18 6, 14 18, 0 18 Z" fill="#4C9A5A" />
      </g>
      {/* standing figure */}
      <g transform="translate(94,44)">
        <circle cx="0" cy="0" r="13" fill="#F2B98A" />
        <path d="M -13 -2 C -13 -14, 13 -14, 13 -2 C 13 -8, -13 -8, -13 -2 Z" fill="#3D1F0F" />
        <path d="M -20 70 C -22 34, -10 16, 0 16 C 10 16, 22 34, 20 70 Z" fill="#EA580C" />
        <rect x="-18" y="66" width="14" height="20" rx="6" fill="#3D1F0F" />
        <rect x="4" y="66" width="14" height="20" rx="6" fill="#3D1F0F" />
      </g>
      {/* phone in hand */}
      <g transform="translate(118,58)">
        <rect x="-11" y="-16" width="22" height="34" rx="5" fill="#ffffff" stroke="#EA580C" strokeWidth="2" />
        <rect x="-6" y="-9" width="12" height="2.5" rx="1.2" fill="#F59E0B" />
        <rect x="-6" y="-3" width="8" height="2.5" rx="1.2" fill="#FED7AA" />
      </g>
    </IllustrationStage>
  );
}

function DeliveryIllustration() {
  return (
    <IllustrationStage>
      {/* motion lines */}
      <g stroke="#EA580C" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round">
        <line x1="18" y1="70" x2="34" y2="70" />
        <line x1="14" y1="82" x2="32" y2="82" />
        <line x1="20" y1="94" x2="34" y2="94" />
      </g>
      {/* scooter */}
      <g transform="translate(80,60)">
        <circle cx="-24" cy="52" r="11" fill="#3D1F0F" />
        <circle cx="26" cy="52" r="11" fill="#3D1F0F" />
        <circle cx="-24" cy="52" r="4" fill="#FFD3A0" />
        <circle cx="26" cy="52" r="4" fill="#FFD3A0" />
        <path d="M -24 52 L -6 52 L 10 20 L 30 20 L 26 52" fill="none" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="12" y="2" width="22" height="20" rx="5" fill="#F59E0B" />
        <rect x="18" y="-4" width="10" height="8" rx="2" fill="#EA580C" />
        {/* rider */}
        <circle cx="-2" cy="-2" r="11" fill="#F2B98A" />
        <path d="M -12 -6 C -12 -18, 10 -18, 10 -6 C 6 -10, -8 -10, -12 -6 Z" fill="#3D1F0F" />
        <path d="M -14 34 C -16 12, -6 -2, -2 -2 C 4 -2, 14 12, 12 34 Z" fill="#3D1F0F" />
      </g>
    </IllustrationStage>
  );
}

function EnjoyIllustration() {
  return (
    <IllustrationStage>
      {/* steam */}
      <g stroke="#ffffff" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" fill="none">
        <path className="steam-wisp" d="M 62 66 C 58 56, 68 50, 64 40" />
        <path className="steam-wisp" style={{ animationDelay: '0.8s' }} d="M 80 66 C 76 54, 86 48, 82 36" />
        <path className="steam-wisp" style={{ animationDelay: '1.6s' }} d="M 98 66 C 94 56, 104 50, 100 40" />
      </g>
      {/* bowl */}
      <g transform="translate(80,96)">
        <path d="M -40 0 C -40 24, -22 36, 0 36 C 22 36, 40 24, 40 0 Z" fill="#3D1F0F" />
        <ellipse cx="0" cy="0" rx="40" ry="12" fill="#F59E0B" />
        <circle cx="-12" cy="-2" r="6" fill="#EA580C" />
        <circle cx="8" cy="-4" r="7" fill="#C2540C" />
        <circle cx="0" cy="4" r="5" fill="#4C9A5A" />
        <circle cx="16" cy="2" r="4" fill="#FED7AA" />
      </g>
    </IllustrationStage>
  );
}

/* ---------------------------------------------------------
   Stats that back up the hero's confidence — pulled up onto
   the hero/marquee seam so they read as proof, not filler.
--------------------------------------------------------- */
const STATS = [
  { icon: Store, end: 150, suffix: '+', label: 'Partner Restaurants' },
  { icon: Users, end: 999, suffix: '+', label: 'Happy Customers' },
  { icon: Bike, end: 30, suffix: ' min', label: 'Average Delivery' },
];

/* ---------------------------------------------------------
   The three-beat journey from craving to plate. This is a
   genuine sequence, so numbering it is earned, not decorative.
--------------------------------------------------------- */
const JOURNEY_STEPS = [
  {
    Illustration: OrderIllustration,
    title: 'Browse & Order',
    description: "Pick from ma'ad's kitchens near you and place your order in a couple of taps — no minimums, no fuss.",
  },
  {
    Illustration: DeliveryIllustration,
    title: 'We Cook, We Ride',
    description: 'Your dish is prepared fresh and handed straight to a rider, tracked live from kitchen to your door.',
  },
  {
    Illustration: EnjoyIllustration,
    title: 'Enjoy, Still Warm',
    description: 'Delivered hot and on time — sit back, dig in, and rate the meal when you\'re done.',
  },
];

export default function LandingPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    branches: 0,
    customers: 0,
    orders: 0,
    reviews: 0,
    foods: 0,
  });

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

      // Fetch real stats from database
      try {
        const statsRes = await API.get('/restaurants/stats');
        setStatsData(statsRes.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setStatsData({
          branches: restaurantsRes.data ? restaurantsRes.data.length : 0,
          customers: 0,
          orders: 0,
          reviews: 0,
          foods: 0,
        });
      }
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
    <div className="app-page-warm dark:bg-gray-950 font-sans selection:bg-orange-500 selection:text-white relative transition-colors">
      {/* Global keyframes + font pairing: a warm display serif for headlines, clean sans for body */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,600&family=Work+Sans:wght@400;500;600;700;800&display=swap');

        .font-display { font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 60; }
        .font-body { font-family: 'Work Sans', sans-serif; }

        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(2.5deg); } }
        @keyframes floatSlower { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-22px) rotate(-2deg); } }
        @keyframes steamRise {
          0% { transform: translateY(0) scaleX(1); opacity: 0; }
          15% { opacity: .55; }
          100% { transform: translateY(-60px) scaleX(1.6); opacity: 0; }
        }
        @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes wipeIn { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0% 0 0); } }
        @keyframes slideUpIn { 0% { opacity: 0; transform: translateY(24px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes wiggle { 0%, 100% { transform: rotate(0deg) scale(1); } 25% { transform: rotate(-6deg) scale(1.05); } 75% { transform: rotate(6deg) scale(1.05); } }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.45); } 50% { box-shadow: 0 0 0 10px rgba(234,88,12,0); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes bounceX { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes dashFlow { to { stroke-dashoffset: -24; } }

        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-slower { animation: floatSlower 8s ease-in-out infinite; }
        .animate-wipe-in { animation: wipeIn 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards; }
        .animate-slide-up { animation: slideUpIn 0.5s ease-out forwards; }
        .marquee-track { animation: marqueeScroll 22s linear infinite; }
        .steam-wisp { animation: steamRise 3.2s ease-in-out infinite; }
        .animate-wiggle { animation: wiggle 2.4s ease-in-out infinite; }
        .animate-bob { animation: bob 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulseGlow 2.2s ease-in-out infinite; }
        .animate-gradient-shift { background-size: 200% 200%; animation: gradientShift 6s ease-in-out infinite; }
        .animate-bounce-x { animation: bounceX 1.2s ease-in-out infinite; }
        .animate-spin-slow { animation: spinSlow 10s linear infinite; }
        .journey-dash { stroke-dasharray: 1 14; animation: dashFlow 1.4s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .animate-float-slow, .animate-float-slower, .animate-wipe-in, .marquee-track, .steam-wisp,
          .animate-wiggle, .animate-bob, .animate-pulse-glow, .animate-gradient-shift, .animate-bounce-x, .animate-spin-slow, .journey-dash { animation: none !important; }
        }
      `}</style>

      <Navbar />

      <div className="relative overflow-x-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#fed7aa_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff14_1px,transparent_1px)] [background-size:24px_24px] opacity-50 dark:opacity-100 pointer-events-none"></div>

        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-br from-orange-200/50 to-amber-200/30 dark:from-orange-600/10 dark:to-amber-600/5 rounded-full blur-3xl pointer-events-none animate-float-slower animate-gradient-shift"></div>
        <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-gradient-to-br from-amber-200/40 to-orange-200/20 dark:from-amber-600/10 dark:to-orange-600/5 rounded-full blur-3xl pointer-events-none animate-float-slow animate-gradient-shift"></div>
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-orange-300/30 to-amber-300/20 dark:from-orange-500/10 dark:to-amber-500/5 rounded-full blur-3xl pointer-events-none animate-float-slower animate-gradient-shift"></div>

        {/* --- HERO SECTION --- */}
        <section id="home" className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={HERO_PHOTO}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-[0.16] dark:opacity-[0.22]"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 90% 75% at 68% 40%, black 30%, transparent 78%)',
              maskImage: 'radial-gradient(ellipse 90% 75% at 68% 40%, black 30%, transparent 78%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/40 via-transparent to-amber-100/30 dark:from-orange-900/20 dark:via-transparent dark:to-amber-900/10 mix-blend-multiply dark:mix-blend-normal"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative flex justify-center lg:justify-start lg:translate-x-10 transition-transform">
            <div className="relative w-full max-w-[430px] aspect-[4/4.1] group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2.2rem] blur-sm opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
              <div className="absolute -inset-6 bg-gradient-to-br from-orange-200/20 via-amber-100/10 to-transparent dark:from-orange-900/20 dark:via-amber-900/10 rounded-[3rem] blur-3xl"></div>
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden animate-wipe-in">
                <img
                  src={HERO_PHOTO}
                  alt="Fresh gourmet meal, ready to order"
                  className="w-full h-full object-cover border-2 border-transparent group-hover:border-orange-500 transition-all duration-300 shadow-lg"
                />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex space-x-3 pointer-events-none">
                  <span className="w-2 h-10 rounded-full bg-white/50 blur-[2px] steam-wisp"></span>
                  <span className="w-2 h-12 rounded-full bg-white/40 blur-[2px] steam-wisp" style={{ animationDelay: '0.8s' }}></span>
                  <span className="w-2 h-9 rounded-full bg-white/50 blur-[2px] steam-wisp" style={{ animationDelay: '1.6s' }}></span>
                </div>
              </div>

              <div className="absolute top-12 -left-4 sm:-left-8 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center space-x-2 border-2 border-white dark:border-gray-900 animate-float-slow z-10">
                <span className="text-xs">🍷</span>
                <div>
                  <p className="text-[8px] uppercase font-bold text-orange-100">Quick Order</p>
                  <p className="text-[11px] font-black">{statsData.orders > 0 ? `Order ${statsData.orders}+` : 'Order Direct'}</p>
                </div>
              </div>

              <div className="absolute -top-3 -right-2 sm:right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center space-x-2.5 border-2 border-white dark:border-gray-900 animate-float-slower z-10">
                <div className="bg-white/20 p-1 rounded-xl">
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[8px] uppercase font-bold text-orange-100">Feedback</p>
                  <p className="text-[11px] font-black">{statsData.reviews > 0 ? `Review ${statsData.reviews}+` : 'Reviews'}</p>
                </div>
              </div>

              <div className="absolute bottom-4 -left-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center space-x-2.5 border-2 border-white dark:border-gray-900 z-10 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                <div className="bg-white/20 p-1 rounded-xl">
                  <Users className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[8px] uppercase font-bold text-orange-100">Active Community</p>
                  <p className="text-[11px] font-black">{statsData.customers > 0 ? `User ${statsData.customers}+` : 'Community'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 text-center lg:text-left relative">
            <div className="space-y-1 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                {t('whyStayHungry')}
              </h1>
              <p className="text-lg sm:text-xl font-bold text-orange-500 dark:text-orange-400 tracking-wide">
                {t('tasteOfHome')}
              </p>
            </div>

            <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-orange-600 dark:text-orange-500 animate-slide-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
              ማእድ <span className="italic">Ma'ad</span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 font-extrabold text-base sm:text-lg animate-slide-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
              {t('tasteOfHome')}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-slide-up" style={{ animationDelay: '0.55s', opacity: 0 }}>
              <Link
                to="/categories"
                className="group relative inline-flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-600/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-600/40 overflow-hidden animate-pulse-glow"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
                <span className="relative">{t('orderNow')}</span>
                <ArrowRight className="relative w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 animate-bounce-x" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FLOATING STATS BAR: proof, pulled up onto the hero/marquee seam --- */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 -mt-2 mb-2">
        <Reveal>
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-orange-100/80 dark:border-gray-800 rounded-[2rem] shadow-2xl shadow-orange-950/[0.08] dark:shadow-black/30 px-6 sm:px-10 py-7 grid grid-cols-3 divide-x divide-orange-100 dark:divide-gray-800">
            {[
              { icon: Store, end: statsData.branches, suffix: '', label: 'Branches' },
              { icon: Users, end: statsData.customers, suffix: '', label: 'Happy Customers' },
              { icon: Bike, end: statsData.orders, suffix: '', label: 'Total Orders' },
            ].map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center px-2 sm:px-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/30 mb-3">
                    <StatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="font-display text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none">
                    <CountUp end={stat.end} suffix={stat.suffix} />
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-1.5">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* --- SCROLLING DISH MARQUEE: a spice-market banner between hero and story --- */}
      <div className="relative py-5 overflow-hidden bg-gradient-to-r from-[#3D1F0F] via-[#5C2A12] to-[#3D1F0F] border-y-2 border-orange-500/50 shadow-[inset_0_2px_12px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#3D1F0F] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#3D1F0F] to-transparent z-10 pointer-events-none"></div>
        <div className="flex whitespace-nowrap marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span key={idx} className="flex items-center mx-4 sm:mx-6 text-sm sm:text-base font-display font-bold text-amber-100 tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 mr-2 shrink-0 animate-spin-slow" />
              <span className="uppercase">{item}</span>
              <span className="mx-4 sm:mx-6 text-orange-400/70">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* --- HOW IT WORKS: the real three-step journey from craving to plate --- */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/40 to-white dark:from-gray-900 dark:via-gray-900/70 dark:to-gray-900/70 border-b border-orange-100/60 dark:border-gray-800">
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-gradient-to-br from-orange-300/25 to-amber-300/20 dark:from-orange-700/10 dark:to-amber-700/10 blur-3xl rounded-full pointer-events-none animate-float-slow"></div>
        <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-gradient-to-br from-amber-300/25 to-orange-300/20 dark:from-amber-700/10 dark:to-orange-700/10 blur-3xl rounded-full pointer-events-none animate-float-slower"></div>
        <div className="max-w-7xl mx-auto px-6 space-y-14 relative z-10">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-orange-600 dark:text-orange-400 font-extrabold uppercase tracking-widest text-xs">The Journey</span>
            <h2 className="font-display text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              From Craving to Plate
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
              Three steps, no detours — here's what happens the moment you tap order.
            </p>
          </Reveal>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">
            {/* connecting route, desktop only — a wandering dotted path like a delivery route */}
            <svg
              className="hidden md:block absolute top-16 left-0 w-full h-24 pointer-events-none"
              viewBox="0 0 900 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 175 50 C 230 10, 260 10, 300 40 C 340 70, 370 70, 420 50 C 470 30, 510 30, 560 55 C 600 75, 630 75, 670 50 C 700 32, 715 25, 725 50"
                stroke="#ea580c"
                strokeOpacity="0.4"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                className="journey-dash"
                strokeDasharray="1 14"
              />
            </svg>

            {JOURNEY_STEPS.map((item, idx) => {
              const StepIllustration = item.Illustration;
              return (
                <Reveal key={idx} delay={idx * 150} className="relative">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-36 h-36 sm:w-40 sm:h-40 animate-bob" style={{ animationDelay: `${idx * 0.3}s` }}>
                      <StepIllustration />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-xs">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- OVERALL RESTAURANT HIGHLIGHT SECTION --- */}
      <section className="py-14 bg-gradient-to-b from-white to-orange-50/30 dark:from-gray-900 dark:to-gray-950 border-b border-orange-100/60 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal className="space-y-4 text-center lg:text-left">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Great Food & Warm Hospitality
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base font-medium">
              We love serving delicious meals made with fresh and healthy ingredients. Come and enjoy wonderful dishes prepared just for you in a cozy and friendly place.
            </p>
            <div className="pt-2">
              <Link
                to="/restaurants"
                className="group inline-flex items-center space-x-2 text-orange-600 dark:text-orange-500 font-bold hover:text-orange-700 dark:hover:text-orange-400 transition"
              >
                <span>Discover Our Kitchen</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150} className="flex justify-center">
            <div className="relative w-full max-w-[500px] group animate-bob">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-300 animate-gradient-shift"></div>
              <img
                src="/m7.jpg"
                alt="Ma'ad Restaurant ambiance and dishes"
                className="relative w-full h-[320px] sm:h-[380px] object-cover rounded-[2rem] shadow-lg border-4 border-white dark:border-gray-900 transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- STUNNING FEATURES SECTION --- */}
      <section id="features" className="py-20 relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-amber-50/40 to-[#FFF5EE] dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-orange-300/30 to-amber-300/30 dark:from-orange-700/10 dark:to-amber-700/10 blur-3xl rounded-full pointer-events-none animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-6 space-y-14 relative z-10">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Stunning Features That You Can Count On
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
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
                  <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border border-orange-100/90 dark:border-gray-700 p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/[0.04] dark:shadow-black/20 hover:shadow-2xl hover:shadow-orange-600/20 transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] flex flex-col justify-between overflow-hidden h-full">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-orange-600/50 transition-all duration-500 animate-bob">
                          <IconComponent className="w-7 h-7 group-hover:animate-wiggle" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/70 dark:border-orange-800/50 px-3 py-1 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                          {feature.badge}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium leading-relaxed">
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
      <section className="py-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-y border-orange-100/60 dark:border-gray-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl lg:text-4xl font-black text-orange-600 dark:text-orange-500 tracking-tight">
              Why Choose Us?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg font-extrabold">
              What so Special About ማእድ?
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {[
              { img: '/m1.jpg', title: 'Find your daily meal' },
              { img: '/mg1.jpg', title: 'Easy food ordering system' },
              { img: '/m8.jpg', title: 'Fastest food delivery service' },
              { img: '/mg2.jpg', title: 'Track your food order' },
            ].map((card, idx) => (
              <Reveal key={idx} delay={idx * 100}>
                <div className="group relative rounded-[2rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-900 aspect-[16/10] sm:aspect-[16/9] w-full cursor-pointer">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
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
      <section className="pt-14 pb-8 bg-gradient-to-b from-white to-orange-50/30 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <Reveal className="text-center max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-orange-600 dark:text-orange-400 font-extrabold uppercase tracking-widest text-xs">{t('featuredCategories')}</span>
              <span className="text-orange-500 text-lg animate-bob">⭐</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('topRestaurants')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
              {t('tasteOfHome')}
            </p>
          </Reveal>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          ) : restaurants.length === 0 ? null : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.slice(0, 6).map((restaurant, idx) => (
                <Reveal key={restaurant.id} delay={idx * 100}>
                  <Link
                    to={`/restaurants/${restaurant.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg shadow-orange-950/[0.03] dark:shadow-black/20 border border-orange-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-orange-600/10 transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={restaurant.coverImage || restaurant.logo || '/m7.jpg'}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 text-gray-900 dark:text-white">
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
                      <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {restaurant.name}
                      </h3>
                      
                      <div className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{restaurant.address}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {restaurant.openingHours} - {restaurant.closingHours}
                          </span>
                        </div>
                        {restaurant.isDelivery && (
                          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 font-bold">
                            <Bike className="w-4 h-4" />
                            <span>{t('delivery')}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {restaurant.foods?.length || 0} menu items
                        </span>
                        <button className="bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-600 text-orange-600 dark:text-orange-400 hover:text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1">
                          <span>{t('exploreMenu')}</span>
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
      <section className="relative pt-8 pb-20 bg-gradient-to-b from-[#FFF5EE] to-white dark:from-gray-950 dark:to-gray-900 overflow-hidden">
        <div className="absolute -top-10 right-0 w-72 h-72 bg-gradient-to-br from-orange-300/25 to-amber-300/20 dark:from-orange-700/10 dark:to-amber-700/10 blur-3xl rounded-full pointer-events-none animate-float-slower"></div>

        <div className="max-w-7xl mx-auto px-6 space-y-6 relative z-10">
          <Reveal className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-orange-600 dark:text-orange-400 font-extrabold uppercase tracking-widest text-xs">{t('menu')}</span>
              <span className="text-orange-500 text-lg animate-wiggle">🍃</span>
            </div>
            <h2 className="relative inline-block font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('popularDishes')}
              <span className="absolute left-0 -bottom-1 h-1.5 w-2/3 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent"></span>
            </h2>
          </Reveal>

          <Reveal delay={80} className="relative">
            <CategoryScroller
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
            <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-14 bg-gradient-to-l from-[#FFF5EE] dark:from-gray-950 to-transparent flex items-center justify-end pr-1">
              <ArrowRight className="w-4 h-4 text-orange-500 animate-bounce-x" />
            </div>
          </Reveal>

          <Reveal delay={160} className="pt-4 flex justify-center sm:justify-start">
            <Link
              to="/menu"
              className="group relative inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-600/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-600/40 overflow-hidden animate-pulse-glow"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              <span className="relative">{t('exploreMenu') || 'Explore Full Menu'}</span>
              <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
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
    </div>
  );
}