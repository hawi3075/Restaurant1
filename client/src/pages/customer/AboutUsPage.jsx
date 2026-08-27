import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils, Heart, Phone, Mail, MapPin, CheckCircle, Target, Lightbulb,
  Award, Users, Smile, Coffee, ShieldCheck, Zap, Globe, Pizza, Flame,
  Soup, Sandwich,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

// Signature accent trio — paprika (heritage), deep teal (the wider world),
// turmeric gold (the bridge between the two).
const PAPRIKA = '#C1440E';
const PAPRIKA_DARK = '#9C380B';
const TEAL = '#0F5C5C';
const TEAL_DARK = '#0B4646';
const GOLD = '#C99A1E';

const CUISINE_STAMPS = [
  { label: 'Ethiopian Classics', sub: 'Injera & wot', icon: Utensils, color: PAPRIKA },
  { label: 'Italian & Pizza', sub: 'Wood-fired favorites', icon: Pizza, color: GOLD },
  { label: 'Indian & Spice Route', sub: 'Curries & biryani', icon: Flame, color: TEAL },
  { label: 'Pan-Asian', sub: 'Noodles & stir-fry', icon: Soup, color: PAPRIKA },
  { label: 'Middle Eastern Grill', sub: 'Kebabs & mezze', icon: Sandwich, color: GOLD },
  { label: 'Café & Continental', sub: 'Breakfast & brew', icon: Coffee, color: TEAL },
];

export default function AboutUsPage() {
  const { supportPhone, supportEmail, businessName } = useSettings();
  const [stats, setStats] = useState({
    foodsCount: 0,
    restaurantsCount: 0,
    ordersCount: 0,
    chefsCount: 0,
    loading: true,
  });

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const fetchLiveStats = async () => {
    try {
      const res = await API.get('/restaurants/stats');
      if (res.data) {
        setStats({
          foodsCount: res.data.foods ?? 0,
          restaurantsCount: res.data.branches ?? 0,
          ordersCount: res.data.orders ?? 0,
          chefsCount: res.data.chefs ?? 0,
          loading: false,
        });
      }
    } catch (err) {
      console.error('Error fetching live stats:', err.message);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="app-page-warm font-sans selection:bg-orange-500 selection:text-white flex flex-col justify-between min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,600&family=Work+Sans:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Work Sans', sans-serif; }
        @keyframes stampIn {
          from { opacity: 0; transform: scale(0.85) rotate(var(--stamp-rot, 0deg)); }
          to { opacity: 1; transform: scale(1) rotate(var(--stamp-rot, 0deg)); }
        }
        .stamp-badge { animation: stampIn 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .stamp-badge { animation: none; }
        }
      `}</style>

      <div>
        <Navbar />

        {/* --- 1. ABOUT SECTION --- */}
        <section className="max-w-7xl mx-auto px-6 pt-14 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Chef Image & Badge */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-orange-50 max-w-md mx-auto lg:mx-0 border border-orange-100">
                <img
                  src="/m8.webp"
                  alt="Professional chef preparing a global menu"
                  className="w-full h-[420px] object-cover"
                />
              </div>

              {/* Bottom Quote Box */}
              <div className="absolute -bottom-6 left-4 right-4 sm:left-12 sm:right-12 bg-gray-900 text-white p-5 rounded-2xl shadow-xl border border-gray-800">
                <p className="text-xs sm:text-sm italic font-medium" style={{ color: '#F4C79A' }}>
                  "At ማእድ (Ma'ad), food is our culture — every cuisine finds a home at our table."
                </p>
              </div>
            </div>

            {/* Right: Content & Highlights */}
            <div className="space-y-6 mt-6 lg:mt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className="font-display italic text-sm font-bold tracking-wide px-3 py-1 rounded-full border"
                    style={{ color: PAPRIKA_DARK, borderColor: `${PAPRIKA}40`, backgroundColor: `${PAPRIKA}0F` }}
                  >
                    About ማእድ Ma'ad
                  </span>
                  <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${PAPRIKA}80, transparent)` }}></span>
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-[1.05]">
                  One Platform,<br />
                  <span style={{ color: PAPRIKA }}>Every Cuisine</span> You Crave
                </h2>
              </div>

              <p className="text-gray-600 text-base leading-relaxed font-body">
                ማእድ (Ma'ad) is Ethiopia's premier multi-restaurant digital dining platform. Founded in
                Adama, we partner with beloved Habesha kitchens serving organic teff injera and
                hand-blended berbere stews, alongside international restaurants bringing Italian
                pizza, Indian curries, pan-Asian noodles, Middle Eastern grills and café classics
                to the same app. Wherever your appetite travels, one order gets it to your door.
              </p>

              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-gray-700 font-body">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" style={{ color: TEAL }} />
                  100% natural ingredients
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" style={{ color: TEAL }} />
                  Local & international kitchens
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" style={{ color: TEAL }} />
                  Real-time order tracking
                </li>
              </ul>

              {/* Highlight Item 1 */}
              <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white shadow-sm border border-orange-100">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: `${PAPRIKA}1A`, color: PAPRIKA }}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 mb-1">Verified Kitchen Partners</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-body">
                    Every partner restaurant — Ethiopian or international — is hand-selected and
                    audited for strict food safety, authentic flavor, and pristine kitchen hygiene.
                  </p>
                </div>
              </div>

              {/* Highlight Item 2 */}
              <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white shadow-sm border border-orange-100">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: `${TEAL}1A`, color: TEAL }}
                >
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 mb-1">Express Socket-Powered Delivery</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-body">
                    Our real-time dispatch engine routes every order — from injera to sushi — straight
                    to the kitchen and a live driver, so it arrives hot no matter the cuisine.
                  </p>
                </div>
              </div>

              {/* Highlight Item 3 */}
              <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white shadow-sm border border-orange-100">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: `${GOLD}26`, color: GOLD }}
                >
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 mb-1">A Menu Without Borders</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-body">
                    Craving something new? Browse Italian, Indian, Chinese and Middle Eastern kitchens
                    right next to your favorite traditional Ethiopian spots.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* --- 3. FLAVORS FROM AROUND THE WORLD (signature section) --- */}
        <section className="py-16 px-6 border-y" style={{ backgroundColor: '#1B1712', borderColor: '#332C22' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-2">
              <div
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: GOLD }}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Where flavors from every kitchen meet</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
                A World of Flavors, Delivered Locally
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base font-body">
                We stamp every cuisine on our menu the way a well-loved passport collects its journeys.
                Pick a stamp, pick a craving.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {CUISINE_STAMPS.map((cuisine, i) => {
                const Icon = cuisine.icon;
                const rotation = i % 2 === 0 ? -4 : 4;
                return (
                  <div
                    key={cuisine.label}
                    className="stamp-badge flex flex-col items-center text-center gap-2"
                    style={{ '--stamp-rot': `${rotation}deg`, animationDelay: `${i * 80}ms` }}
                  >
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center border-[3px] border-dashed"
                      style={{
                        borderColor: cuisine.color,
                        color: cuisine.color,
                        backgroundColor: `${cuisine.color}14`,
                        transform: `rotate(${rotation}deg)`,
                      }}
                    >
                      <Icon className="w-9 h-9" />
                    </div>
                    <span className="text-white font-bold text-sm font-body leading-tight">
                      {cuisine.label}
                    </span>
                    <span className="text-gray-500 text-xs font-body">{cuisine.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- 4. VISION, MISSION, GOALS SECTION --- */}
        <section className="bg-white/60 py-20 border-y border-orange-100/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Column: Vision, Mission, Goals Cards */}
            <div className="space-y-6">

              {/* Vision Card */}
              <div className="bg-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex items-start space-x-5 border border-gray-800">
                <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: PAPRIKA }}>
                  <Target className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2 text-white">Our Vision</h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-body">
                    To become the table where Ethiopia meets the world — bridging beloved traditional
                    cuisine and global favorites within one seamless, instant-delivery experience.
                  </p>
                </div>
              </div>

              {/* Mission Card */}
              <div className="bg-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex items-start space-x-5 border border-gray-800">
                <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: TEAL }}>
                  <Lightbulb className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2 text-white">Our Mission</h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-body">
                    Empowering local Ethiopian chefs and international restaurant partners alike with
                    modern tools, so every customer can order fresh, authentic food from any cuisine,
                    any night of the week.
                  </p>
                </div>
              </div>

              {/* Goals Card */}
              <div className="bg-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex items-start space-x-5 border border-gray-800">
                <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: GOLD }}>
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2 text-white">Our Commitments</h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-body">
                    Maintain 100% natural ingredient standards, keep growing our roster of Ethiopian
                    and international kitchens across every major city, and ensure complete order
                    transparency from kitchen to doorstep.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Restaurant Atmosphere Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-orange-100">
                <img
                  src="/m1.webp"
                  alt="Restaurant interior serving diverse international cuisine"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-2xl -z-10 opacity-80" style={{ backgroundColor: TEAL }}></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gray-900 rounded-2xl -z-10"></div>
            </div>

          </div>
        </section>

        {/* --- 5. STATISTICS COUNTER SECTION --- */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">

            {[
              { icon: Coffee, count: stats.foodsCount, label: 'Available Dishes, Local & Global', color: PAPRIKA },
              { icon: Users, count: stats.restaurantsCount, label: 'Partner Kitchens & Branches', color: TEAL },
              { icon: Smile, count: stats.ordersCount, label: 'Satisfied Orders Served', color: GOLD },
              { icon: Award, count: stats.chefsCount, label: 'Master Chefs & Kitchen Staff', color: PAPRIKA },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center p-8 rounded-3xl bg-white shadow-md border border-orange-100 hover:shadow-xl transition-all"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm border-4"
                    style={{ borderColor: stat.color, backgroundColor: `${stat.color}14` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <h3 className="font-display text-3xl font-black mb-1 text-gray-900">
                    {stats.loading ? '...' : stat.count}
                  </h3>
                  <p className="text-sm font-bold text-gray-500">{stat.label}</p>
                </div>
              );
            })}

          </div>
        </section>

      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="text-white p-2 rounded-xl shadow-md" style={{ backgroundColor: PAPRIKA }}>
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                ማእድ <span className="font-medium text-sm" style={{ color: '#F0A874' }}>Ma'ad</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ethiopian classics and global favorites, delivered instantly from the best kitchens
              around you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-orange-400 transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-orange-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-orange-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/cookies" className="hover:text-orange-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: PAPRIKA }} />
                <span>Adama, Ethiopia</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: PAPRIKA }} />
                <span>{supportPhone || '+251 900 000 000'}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: PAPRIKA }} />
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
            <Heart className="w-3.5 h-3.5 fill-current" style={{ color: PAPRIKA }} />
            <span>for food lovers everywhere.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}