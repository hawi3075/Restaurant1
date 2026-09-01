import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../../components/ImageUpload';
import showToast from '../../components/Toast';
import API from '../../services/api';

export default function AdminProfile() {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({ ...prev, profileImage: imageUrl }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await API.put('/users/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        profileImage: formData.profileImage
      });

      // Update auth context with new user data
      if (updateUserProfile) {
        updateUserProfile(response.data);
      }

      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('All password fields are required', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setLoading(true);
      await API.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      showToast('Password changed successfully!', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Error changing password:', error);
      showToast(error.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 text-orange-600 p-4 rounded-2xl">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">Profile Picture</h2>
          <div className="flex items-center space-x-6">
            {/* Current Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-orange-200 shadow-lg">
                {formData.profileImage ? (
                  <img 
                    src={formData.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=f97316&color=fff&size=200&bold=true`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white text-4xl font-black">
                    {formData.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full shadow-lg hover:bg-orange-700 transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Section */}
            <div className="flex-1">
              <ImageUpload
                currentImage={formData.profileImage}
                onImageUpload={handleImageUpload}
                label="Upload New Picture"
                aspectRatio="1:1"
              />
              <p className="text-xs text-gray-500 mt-2">
                Recommended: Square image (400x400px). Max size: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-6">Personal Information</h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Full Name *</span>
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span>Email Address *</span>
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>Phone Number</span>
                </div>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                placeholder="+251 900 000 000"
              />
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={user?.role || 'ADMIN'}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium text-gray-500"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900">Security</h2>
            {!showPasswordSection && (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            )}
          </div>

          {showPasswordSection ? (
            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Current Password *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition flex items-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-500">
              Keep your account secure by using a strong password and changing it regularly.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
