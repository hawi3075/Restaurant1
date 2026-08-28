import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
  Utensils, Globe, LogOut, User as UserIcon, Menu, X,
  ShoppingBag, MapPin, HelpCircle, MessageSquare, LogIn,
  Store, Info, LayoutGrid, ShieldCheck, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Check, Eye, EyeOff, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import { useCart } from '../context/CartContext';

// --- Language Selection Modal Component ---
function LanguageModal({ isOpen, onClose }) {
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
    { code: 'om', name: 'Afaan Oromoo', native: 'Afaan Oromoo', flag: '🇪🇹' },
  ];

  if (!isOpen) return null;

  const handleLanguageSelect = (code) => {
    changeLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-orange-100 dark:border-gray-800 overflow-hidden">
        {/* Top Orange Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500 z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pt-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('chooseLanguage')}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('selectPreferredLanguage')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${language === lang.code
                  ? 'border-orange-600 bg-orange-50 text-orange-900 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-500 text-gray-800 dark:text-gray-200'
                  }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <span className="text-3xl">{lang.flag}</span>
                  <div>
                    <p className="font-bold text-base">{lang.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{lang.native}</p>
                  </div>
                </div>
                {language === lang.code && (
                  <div className="bg-orange-600 text-white p-2 rounded-xl shadow-md">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Integrated Auth Modal Component with Back Icon ---
function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse.credential);
    setGoogleLoading(false);
    if (result.success) {
      setSuccess('Signed in with Google!');
      setTimeout(() => {
        onClose();
        if (result.role === 'ADMIN') navigate('/admin');
        else if (result.role === 'CHEF') navigate('/chef');
        else if (result.role === 'WAITER') navigate('/waiter');
        else if (result.role === 'DRIVER') navigate('/driver');
        else navigate('/');
      }, 800);
    } else {
      setError(result.error || 'Google sign-in failed.');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const result = await login(formData.emailOrPhone, formData.password);

        if (result.success) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            onClose();

            // Redirect based on role
            if (result.role === 'ADMIN') {
              navigate('/admin');
            } else if (result.role === 'CHEF') {
              navigate('/chef');
            } else if (result.role === 'WAITER') {
              navigate('/waiter');
            } else if (result.role === 'DRIVER') {
              navigate('/driver');
            } else {
              navigate('/');
            }
          }, 1500);
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      } else {
        // Signup logic - validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match!');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        const result = await register({
          name: formData.name,
          email: formData.emailOrPhone,
          password: formData.password,
          phone: formData.phone
        });

        if (result.success) {
          setSuccess('Account created successfully! Welcome aboard!');
          setTimeout(() => {
            onClose();
            // User is already logged in after registration, just redirect
            navigate('/');
          }, 1500);
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 py-8 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">

      {/* Back Button (fixed to viewport, always visible even while card scrolls) */}
      <button
        onClick={onClose}
        className="fixed top-5 left-4 sm:left-6 z-[60] flex items-center space-x-1 p-2 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-md hover:bg-orange-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition text-xs font-bold cursor-pointer"
        title="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline pr-1">Back</span>
      </button>

      {/* Close Button (fixed to viewport, always visible even while card scrolls) */}
      <button
        onClick={onClose}
        className="fixed top-5 right-4 sm:right-6 z-[60] p-2 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-md hover:bg-orange-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500 transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Modal Card - height-capped and scrollable so nothing is ever cut off */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto my-2 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-orange-100 dark:border-gray-800 flex flex-col md:flex-row">

        {/* Top Orange Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500 z-10" />

        {/* Left / Main Form Side */}
        <div className="w-full md:w-1/2 p-6 sm:p-7 flex flex-col pt-6">

          <div className="space-y-1 mb-4">
            <div className="flex items-center space-x-2 text-orange-600 mb-1">
              <div className="p-2 bg-orange-100 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-black text-xl tracking-tight text-gray-900 dark:text-white">ማእድ Ma'ad</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isLogin ? 'Sign in to access your orders and favorites.' : 'Join us to explore the best food and restaurants.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium flex items-center space-x-2">
                <X className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs font-medium flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Hawi Girma"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {isLogin ? 'Email or Phone' : 'Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="emailOrPhone"
                  required
                  placeholder={isLogin ? 'hawig3521@gmail.com or phone' : 'hawig3521@gmail.com'}
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="+251 91 234 5678"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded text-orange-600 focus:ring-orange-500" />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="font-bold text-orange-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-600/25 transition text-xs uppercase tracking-wider cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4 text-xs text-gray-500 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-orange-600 hover:underline focus:outline-none cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

        </div>

        {/* Right Side: Google Login */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-orange-50/60 to-amber-50/40 dark:from-gray-800 dark:to-gray-800 p-6 sm:p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-orange-100 dark:border-gray-700 text-center">

          <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center text-orange-600 mb-4 border border-orange-100">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h3 className="font-black text-gray-900 dark:text-white text-lg mb-1">Quick & Secure Access</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            Connect instantly with your Google account for a streamlined ordering experience.
          </p>

          {success && (
            <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {googleLoading ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="w-full max-w-xs">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text={isLogin ? 'signin_with' : 'signup_with'}
                shape="rectangular"
                width="280"
              />
            </div>
          )}

          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-6">
            By continuing, you agree to Ma'ad's <span className="underline cursor-pointer">Terms & Conditions</span>.
          </p>

        </div>

      </div>
    </div>
  );
}

// --- Main Navbar Component ---
export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Modal State Management
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const openLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  // Get language display text
  const getLanguageDisplay = () => {
    const langMap = {
      'en': 'En',
      'am': 'አማ',
      'om': 'Af'
    };
    return langMap[language] || 'En';
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="bg-orange-600 text-white p-2 rounded-xl shadow-md">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              ማእድ <span className="text-orange-600 font-medium text-sm">Ma'ad</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 font-medium text-gray-600 dark:text-gray-300">
            <Link
              to="/"
              className={`flex items-center space-x-1 transition ${location.pathname === '/' ? 'text-orange-600 font-bold' : 'hover:text-orange-600 dark:hover:text-orange-500 text-gray-600 dark:text-gray-300'
                }`}
            >
              <Utensils className={`w-4 h-4 ${location.pathname === '/' ? 'text-orange-600' : ''}`} />
              <span>{t('home')}</span>
            </Link>

            <Link
              to="/categories"
              className={`transition ${location.pathname === '/categories' ? 'text-orange-600 font-bold' : 'hover:text-orange-600 dark:hover:text-orange-500 text-gray-600 dark:text-gray-300'
                }`}
            >
              {t('categories')}
            </Link>

            <Link
              to="/menu"
              className={`transition ${location.pathname === '/menu' ? 'text-orange-600 font-bold' : 'hover:text-orange-600 dark:hover:text-orange-500 text-gray-600 dark:text-gray-300'
                }`}
            >
              {t('menu') || 'Menu'}
            </Link>

            <Link
              to="/restaurants"
              className={`transition ${location.pathname === '/restaurants' ? 'text-orange-600 font-bold' : 'hover:text-orange-600 dark:hover:text-orange-500 text-gray-600 dark:text-gray-300'
                }`}
            >
              {t('restaurants')}
            </Link>

            <Link
              to="/about"
              className={`transition ${location.pathname === '/about' ? 'text-orange-600 font-bold' : 'hover:text-orange-600 dark:hover:text-orange-500 text-gray-600 dark:text-gray-300'
                }`}
            >
              {t('about')}
            </Link>

            <Link
              to="/contact"
              className={`transition ${location.pathname === '/contact' ? 'text-orange-600 font-bold' : 'hover:text-orange-600 dark:hover:text-orange-500 text-gray-600 dark:text-gray-300'
                }`}
            >
              {t('contact')}
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Order Now Button - Links to Menu/Restaurants */}
            <Link
              to="/restaurants"
              className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 transition-all text-sm cursor-pointer"
            >
              <Utensils className="w-4 h-4" />
              <span>{t('orderNow') || 'Order Now'}</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center w-9 h-9 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setLanguageModalOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>{getLanguageDisplay()}</span>
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="flex items-center justify-center w-9 h-9 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer relative"
              title="Cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* Top-level Log In / Sign Out toggle */}
            {!user ? (
              <button
                onClick={openLogin}
                className="hidden sm:flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-600/20 transition text-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-bold px-5 py-2.5 rounded-xl transition text-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}

            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition shadow-sm relative z-50 cursor-pointer"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Backdrop overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu Panel */}
      <div className={`fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h3 className="font-black text-xl text-gray-900 dark:text-white tracking-tight">Menu</h3>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Menu Items Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">

          {user && (
            <div className="flex items-center space-x-3 p-3.5 bg-orange-50 dark:bg-gray-800 rounded-2xl mb-2 border border-orange-100 dark:border-gray-700">
              <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-gray-900 dark:text-white truncate">{user.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Profile */}
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center space-x-4 p-3 rounded-2xl border border-transparent hover:bg-orange-50 dark:hover:bg-gray-800 hover:border-orange-100 dark:hover:border-gray-700 hover:text-orange-600 dark:hover:text-orange-500 hover:translate-x-1 hover:shadow-sm group transition-all duration-300"
          >
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-500 text-sm">{t('profile')}</span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className="flex items-center space-x-4 p-3 rounded-2xl border border-transparent hover:bg-orange-50 dark:hover:bg-gray-800 hover:border-orange-100 dark:hover:border-gray-700 hover:text-orange-600 dark:hover:text-orange-500 hover:translate-x-1 hover:shadow-sm group transition-all duration-300"
          >
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-500 text-sm flex items-center justify-between flex-1">
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </span>
          </Link>

          {/* My Address */}
          <Link
            to="/address"
            onClick={() => setMenuOpen(false)}
            className="flex items-center space-x-4 p-3 rounded-2xl border border-transparent hover:bg-orange-50 dark:hover:bg-gray-800 hover:border-orange-100 dark:hover:border-gray-700 hover:text-orange-600 dark:hover:text-orange-500 hover:translate-x-1 hover:shadow-sm group transition-all duration-300"
          >
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-500 text-sm">{t('myAddress')}</span>
          </Link>

          {/* My Orders */}
          <Link
            to="/orders"
            onClick={() => setMenuOpen(false)}
            className="flex items-center space-x-4 p-3 rounded-2xl border border-transparent hover:bg-orange-50 dark:hover:bg-gray-800 hover:border-orange-100 dark:hover:border-gray-700 hover:text-orange-600 dark:hover:text-orange-500 hover:translate-x-1 hover:shadow-sm group transition-all duration-300"
          >
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-500 text-sm">{t('myOrders')}</span>
          </Link>

          {/* Language */}
          <Link
            to="/language"
            onClick={() => setMenuOpen(false)}
            className="flex items-center space-x-4 p-3 rounded-2xl border border-transparent hover:bg-orange-50 dark:hover:bg-gray-800 hover:border-orange-100 dark:hover:border-gray-700 hover:text-orange-600 dark:hover:text-orange-500 hover:translate-x-1 hover:shadow-sm group transition-all duration-300"
          >
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              <Globe className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-500 text-sm">{t('language')}</span>
          </Link>

          {/* Help & Support */}
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="flex items-center space-x-4 p-3 rounded-2xl border border-transparent hover:bg-orange-50 dark:hover:bg-gray-800 hover:border-orange-100 dark:hover:border-gray-700 hover:text-orange-600 dark:hover:text-orange-500 hover:translate-x-1 hover:shadow-sm group transition-all duration-300"
          >
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-500 text-sm">{t('helpSupport')}</span>
          </Link>

          {/* Live Chat */}
          <Link
            to="/chat"
            onClick={() => setMenuOpen(false)}
            className="flex items-center space-x-4 p-3 rounded-2xl border border-transparent hover:bg-orange-50 dark:hover:bg-gray-800 hover:border-orange-100 dark:hover:border-gray-700 hover:text-orange-600 dark:hover:text-orange-500 hover:translate-x-1 hover:shadow-sm group transition-all duration-300"
          >
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-500 text-sm">{t('liveChat')}</span>
          </Link>

          {/* General Site Links */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-3 p-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 hover:translate-x-1 transition-all duration-300"
            >
              <Utensils className="w-4 h-4 text-orange-600" />
              <span>{t('home')}</span>
            </Link>
            <Link
              to="/categories"
              onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-3 p-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 hover:translate-x-1 transition-all duration-300"
            >
              <LayoutGrid className="w-4 h-4 text-orange-600" />
              <span>{t('categories')}</span>
            </Link>
            <Link
              to="/menu"
              onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-3 p-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 hover:translate-x-1 transition-all duration-300"
            >
              <Utensils className="w-4 h-4 text-orange-600" />
              <span>{t('menu') || 'Menu'}</span>
            </Link>
            <Link
              to="/restaurants"
              onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-3 p-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 hover:translate-x-1 transition-all duration-300"
            >
              <Store className="w-4 h-4 text-orange-600" />
              <span>{t('restaurants')}</span>
            </Link>
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-3 p-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 hover:translate-x-1 transition-all duration-300"
            >
              <Info className="w-4 h-4 text-orange-600" />
              <span>{t('about')}</span>
            </Link>
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-3 p-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 hover:translate-x-1 transition-all duration-300"
            >
              <Mail className="w-4 h-4 text-orange-600" />
              <span>{t('contact')}</span>
            </Link>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shrink-0">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 font-bold py-3 rounded-xl transition text-sm shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); openLogin(); }}
              className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/20 transition text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Join Us</span>
            </button>
          )}
        </div>

      </div>

      {/* Render the popup modal overlay component */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Render the language selection modal */}
      <LanguageModal
        isOpen={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
      />
    </>
  );
}