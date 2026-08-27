import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import { showToast } from '../../components/Toast';
import { 
  User, Mail, Phone, MapPin, Camera, Edit3, Save, X, 
  ShieldCheck, ShoppingBag, ArrowRight, LogIn, UserPlus, Sparkles
} from 'lucide-react';

/* ---------------------------------------------------------
   Shared font pairing + motion, matching the landing page's
   design system so /profile doesn't feel like a different app.
--------------------------------------------------------- */
function ProfileStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,600&family=Work+Sans:wght@400;500;600;700;800&display=swap');

      .font-display { font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 60; }
      .font-body { font-family: 'Work Sans', sans-serif; }

      @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
      @keyframes slideUpIn { 0% { opacity: 0; transform: translateY(18px); } 100% { opacity: 1; transform: translateY(0); } }
      @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.35); } 50% { box-shadow: 0 0 0 8px rgba(234,88,12,0); } }
      @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
      .animate-slide-up { animation: slideUpIn 0.55s ease-out forwards; }
      .animate-gradient-shift { background-size: 200% 200%; animation: gradientShift 7s ease-in-out infinite; }
      .animate-pulse-glow { animation: pulseGlow 2.2s ease-in-out infinite; }
      .animate-spin-slow { animation: spinSlow 12s linear infinite; }

      @media (prefers-reduced-motion: reduce) {
        .animate-float-slow, .animate-slide-up, .animate-gradient-shift, .animate-pulse-glow, .animate-spin-slow { animation: none !important; }
      }
    `}</style>
  );
}

function BackgroundFlourish() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(#fed7aa_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-100 pointer-events-none" />
      <div className="absolute top-10 -left-20 w-[380px] h-[380px] bg-gradient-to-br from-orange-200/40 to-amber-200/20 dark:from-orange-600/10 dark:to-amber-600/5 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-0 -right-16 w-[420px] h-[420px] bg-gradient-to-br from-amber-200/40 to-orange-200/20 dark:from-amber-600/10 dark:to-orange-600/5 rounded-full blur-3xl pointer-events-none animate-float-slow" style={{ animationDelay: '1.5s' }} />
    </>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Edit state for user profile details
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users/profile');
      const data = res.data;
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`) || user.avatar;

      const profileAddress = data.address || (data.addresses && data.addresses.length > 0 ? data.addresses[data.addresses.length - 1].fullAddress : '') || user.address || '';

      setProfileData({
        name: data.name || user.name || '',
        email: data.email || user.email || '',
        phone: data.phone || user.phone || '',
        address: profileAddress,
        avatar: savedAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      });

      const updatedUser = {
        ...user,
        name: data.name || user.name,
        email: data.email || user.email,
        phone: data.phone || user.phone,
        address: profileAddress
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error fetching profile:', err);
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`) || user.avatar;
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: savedAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Changes
  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload / Selection simulation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setProfileData({ ...profileData, avatar: imageData });
        
        // Save to localStorage immediately
        if (user?.id) {
          localStorage.setItem(`avatar_${user.id}`, imageData);
          showToast('Profile picture updated!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await API.put('/users/profile', {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address
      });
      
      const serverUser = res.data.user || {};
      const savedPhone = serverUser.phone !== undefined ? serverUser.phone : profileData.phone;
      const savedAddress = serverUser.address !== undefined ? serverUser.address : profileData.address;

      setProfileData((prev) => ({
        ...prev,
        name: serverUser.name || profileData.name,
        phone: savedPhone,
        address: savedAddress
      }));

      const updatedUser = { 
        ...user, 
        name: serverUser.name || profileData.name, 
        phone: savedPhone, 
        address: savedAddress 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.response?.data?.error || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fieldClasses = (editable) =>
    `w-full pl-11 pr-4 py-3 rounded-2xl border font-medium text-sm transition-all duration-300 ${
      editable
        ? 'bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-700 focus:ring-4 focus:ring-orange-500/15 focus:border-orange-500 outline-none shadow-sm'
        : 'bg-gray-50/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed'
    }`;

  // ==========================================
  // VIEW: IF NOT SIGNED IN (GUEST STATE)
  // ==========================================
  if (!user) {
    return (
      <div className="app-page relative overflow-hidden font-body dark:bg-gray-950 transition-colors">
        <ProfileStyles />
        <BackgroundFlourish />
        <Navbar />
        <div className="relative w-full flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-orange-950/[0.08] dark:shadow-black/30 border border-orange-100/85 dark:border-gray-800 p-6 sm:p-8 text-center space-y-5 relative overflow-hidden animate-slide-up" style={{ opacity: 0 }}>
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 animate-gradient-shift" />

            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 opacity-20 animate-pulse-glow" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40 rounded-full flex items-center justify-center shadow-inner text-orange-600 dark:text-orange-400 ring-8 ring-orange-50 dark:ring-gray-800">
                <User className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('pleaseLogin')}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed px-2">
                {t('loginToViewOrders')}
              </p>
            </div>

            <div className="space-y-3">
              {/* Primary Sign In Button (Redirects to /login) */}
              <Link 
                to="/login"
                className="group relative w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-orange-600/25 transition-all duration-300 overflow-hidden animate-pulse-glow text-sm"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <LogIn className="relative w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="relative">Sign In</span>
              </Link>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              {/* Alternative Options: Google & Sign Up Button (Redirects to /signup) */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => alert("Google Sign-In integration hook goes here")}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 bg-gray-50/50 dark:bg-gray-800 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 rounded-2xl text-gray-700 dark:text-gray-200 text-xs font-bold transition shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.17 21.32 7.23 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.5-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.12 0 9.83 0 12s.43 3.88 1.18 5.39l4.09-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <Link 
                  to="/signup"
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 rounded-2xl text-orange-700 dark:text-orange-400 text-xs font-bold transition shadow-sm group"
                >
                  <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Sign Up</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-page relative overflow-hidden dark:bg-gray-950 transition-colors">
        <ProfileStyles />
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: IF SIGNED IN (AUTHENTICATED DASHBOARD)
  // ==========================================
  return (
    <div className="app-page relative overflow-hidden font-body dark:bg-gray-950 transition-colors">
      <ProfileStyles />
      <BackgroundFlourish />
      <Navbar />
      <div className="relative py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header Banner Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-orange-950/[0.06] dark:shadow-black/30 border border-orange-100/70 dark:border-gray-800 overflow-hidden animate-slide-up" style={{ opacity: 0 }}>
          <div className="h-40 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 animate-gradient-shift relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="absolute inset-0 bg-black/10" />
            <Sparkles className="absolute top-5 right-8 w-6 h-6 text-white/50 animate-spin-slow" />
            <Sparkles className="absolute bottom-6 right-24 w-4 h-4 text-white/30 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          </div>
          
          <div className="px-6 sm:px-10 pb-8 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 gap-6">
            
            {/* Editable Profile Image */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[1.85rem] opacity-0 group-hover:opacity-100 blur transition duration-300" />
              <div className="relative w-32 h-32 rounded-[1.75rem] border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden bg-white">
                <img 
                  src={profileData.avatar} 
                  alt={profileData.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 bg-black/45 rounded-[1.75rem] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-7 h-7 mb-1" />
                <span className="text-xs font-semibold">Change</span>
              </label>
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </div>

            {/* Name & Badge */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="font-display text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                {profileData.name}
                <span className="inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full border border-orange-200/70 dark:border-orange-800/50">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{profileData.email}</p>
            </div>

            {/* Edit / Save Actions */}
            <div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-bold px-5 py-2.5 rounded-xl border border-orange-200/60 dark:border-orange-800/50 transition-all duration-300 hover:-translate-y-0.5 shadow-sm text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{t('editProfile')}</span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold px-5 py-2.5 rounded-xl transition text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>{t('cancel')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Card / Form */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-orange-950/[0.06] dark:shadow-black/30 border border-orange-100/70 dark:border-gray-800 p-6 sm:p-10 animate-slide-up" style={{ opacity: 0, animationDelay: '120ms' }}>
          <h3 className="font-display text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
              <User className="w-4.5 h-4.5" />
            </span>
            <span>{t('personalInfo')}</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('fullName')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-orange-500/70">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    disabled={!isEditing}
                    value={profileData.name}
                    onChange={handleChange}
                    className={fieldClasses(isEditing)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('emailAddress')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    disabled
                    value={profileData.email}
                    className={fieldClasses(false)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('phoneNumber')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-orange-500/70">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    name="phone"
                    disabled={!isEditing}
                    value={profileData.phone}
                    onChange={handleChange}
                    className={fieldClasses(isEditing)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('location')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-orange-500/70">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    name="address"
                    disabled={!isEditing}
                    value={profileData.address}
                    onChange={handleChange}
                    className={fieldClasses(isEditing)}
                  />
                </div>
              </div>

            </div>

            {isEditing && (
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="group relative flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-orange-600/25 transition-all duration-300 overflow-hidden text-sm"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  {saving ? (
                    <>
                      <div className="relative animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="relative">{t('loading')}</span>
                    </>
                  ) : (
                    <>
                      <Save className="relative w-4 h-4" />
                      <span className="relative">{t('saveChanges')}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Quick Links Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up" style={{ opacity: 0, animationDelay: '220ms' }}>
          <Link 
            to="/orders" 
            className="group bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 rounded-[1.75rem] border border-orange-100/70 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-orange-600/10 hover:border-orange-200 dark:hover:border-orange-800 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">{t('myOrders')}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('trackOrders')}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link 
            to="/address" 
            className="group bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 rounded-[1.75rem] border border-orange-100/70 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-orange-600/10 hover:border-orange-200 dark:hover:border-orange-800 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">{t('addresses')}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('myAddress')}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition" />
          </Link>
        </div>

      </div>
      </div>
    </div>
  );
}