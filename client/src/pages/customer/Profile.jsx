import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import { showToast } from '../../components/Toast';
import { 
  User, Mail, Phone, MapPin, Camera, Edit3, Save, X, 
  ShieldCheck, ShoppingBag, ArrowRight, LogIn, UserPlus 
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  
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
      // Load user data from AuthContext and localStorage
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`) || user.avatar;
      
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: savedAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

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
      await API.put('/users/profile', {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address
      });
      
      // Update localStorage with new user data
      const updatedUser = { ...user, name: profileData.name, phone: profileData.phone, address: profileData.address };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // VIEW: IF NOT SIGNED IN (GUEST STATE)
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="w-full flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-orange-100/85 p-6 sm:p-8 text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
          
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto shadow-inner text-orange-600 ring-8 ring-orange-50">
            <User className="w-12 h-12" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Guest User</h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed px-2">
              Currently you are in guest mode, please sign in or sign up to view all features and manage your account.
            </p>
          </div>

          <div className="space-y-3">
            {/* Primary Sign In Button (Redirects to /login) */}
            <Link 
              to="/login"
              className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-orange-600/25 transition-all duration-300 group text-sm"
            >
              <LogIn className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Sign In</span>
            </Link>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Alternative Options: Google & Sign Up Button (Redirects to /signup) */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => alert("Google Sign-In integration hook goes here")}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-gray-200 hover:border-orange-300 bg-gray-50/50 hover:bg-orange-50/40 rounded-2xl text-gray-700 text-xs font-bold transition shadow-sm"
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
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 border border-orange-200 bg-orange-50 hover:bg-orange-100 rounded-2xl text-orange-700 text-xs font-bold transition shadow-sm group"
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header Banner Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>
          
          <div className="px-6 sm:px-10 pb-8 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 gap-6">
            
            {/* Editable Profile Image */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white">
                <img 
                  src={profileData.avatar} 
                  alt={profileData.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 bg-black/40 rounded-3xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                {profileData.name}
                <ShieldCheck className="w-6 h-6 text-orange-600" />
              </h1>
              <p className="text-sm font-medium text-gray-500">{profileData.email}</p>
            </div>

            {/* Edit / Save Actions */}
            <div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold px-5 py-2.5 rounded-xl border border-orange-200/60 transition shadow-sm text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl transition text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Card / Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center space-x-2">
            <User className="w-5 h-5 text-orange-600" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    disabled={!isEditing}
                    value={profileData.name}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border font-medium text-sm transition ${
                      isEditing 
                        ? 'bg-white border-orange-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none' 
                        : 'bg-gray-50/70 border-gray-200 text-gray-700 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    disabled
                    value={profileData.email}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-gray-50/70 border-gray-200 text-gray-700 cursor-not-allowed font-medium text-sm transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    name="phone"
                    disabled={!isEditing}
                    value={profileData.phone}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border font-medium text-sm transition ${
                      isEditing 
                        ? 'bg-white border-orange-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none' 
                        : 'bg-gray-50/70 border-gray-200 text-gray-700 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Location / Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    name="address"
                    disabled={!isEditing}
                    value={profileData.address}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border font-medium text-sm transition ${
                      isEditing 
                        ? 'bg-white border-orange-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none' 
                        : 'bg-gray-50/70 border-gray-200 text-gray-700 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

            </div>

            {isEditing && (
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-orange-600/25 transition text-sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Quick Links Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            to="/orders" 
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold shadow-inner">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition">My Orders</h4>
                <p className="text-xs text-gray-500">View order history & tracking</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition" />
          </Link>

          <Link 
            to="/address" 
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold shadow-inner">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition">Saved Addresses</h4>
                <p className="text-xs text-gray-500">Manage delivery locations</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition" />
          </Link>
        </div>

      </div>
      </div>
    </div>
  );
}