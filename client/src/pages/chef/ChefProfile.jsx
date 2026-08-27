import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { User, Mail, Phone, Camera, Save, Loader, ChefHat, CheckCircle, AlertCircle, Edit3, X } from 'lucide-react';

export default function ChefProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Controls edit/view mode
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialties: '',
    experienceYears: '',
    avatar: null,
  });

  const showInlineMessage = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        specialties: user.specialties || '',
        experienceYears: user.experienceYears || '',
        avatar: null,
      });

      const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (savedAvatar) {
        setAvatarPreview(savedAvatar);
      } else if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showInlineMessage('Image size should be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setAvatarPreview(base64Image);
        if (user?.id) {
          localStorage.setItem(`avatar_${user.id}`, base64Image);
        }
        showInlineMessage('Profile photo updated!', 'success');
      };
      reader.readAsDataURL(file);

      setFormData({ ...formData, avatar: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone || '');
      submitData.append('bio', formData.bio || '');
      submitData.append('specialties', formData.specialties || '');
      submitData.append('experienceYears', formData.experienceYears || '0');

      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }

      const response = await API.put('/users/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (updateUser) {
        updateUser(response.data);
      }

      showInlineMessage('Profile updated successfully!', 'success');
      setIsEditing(false); // Switch back to view mode after saving
    } catch (err) {
      console.error('Error updating profile:', err);
      showInlineMessage(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="px-8 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Notification Banner */}
          {notification.message && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center space-x-3 shadow-sm ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
              }`}>
              {notification.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-bold">{notification.message}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Profile Header with Avatar */}
            <div className="relative bg-gradient-to-r from-orange-500 to-amber-600 p-8 text-white">

              {/* Edit / Cancel Mode Toggle Button - now on the orange banner */}
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`absolute top-6 right-6 flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${isEditing
                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white/40'
                    : 'bg-white hover:bg-orange-50 text-orange-600'
                  }`}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-white text-orange-600 p-3 rounded-full cursor-pointer hover:bg-orange-50 transition-all shadow-lg border-2 border-orange-200">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-black mb-2">{formData.name || user?.name}</h2>
                  <p className="text-orange-100 mb-3">{formData.email || user?.email}</p>
                  <div className="flex items-center space-x-4">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-bold">
                      🔥 Professional Chef
                    </span>
                    {formData.experienceYears && (
                      <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-bold">
                        📅 {formData.experienceYears} years experience
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-6 h-6 text-orange-600" />
                  <span>Basic Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name {isEditing && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address {isEditing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="chef@example.com"
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+251 912 345 678"
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      placeholder="e.g., 5"
                      min="0"
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
                  <ChefHat className="w-6 h-6 text-orange-600" />
                  <span>Professional Details</span>
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      About Me
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows="4"
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium resize-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Specialties & Cuisines
                    </label>
                    <input
                      type="text"
                      name="specialties"
                      value={formData.specialties}
                      onChange={handleInputChange}
                      placeholder="e.g., Ethiopian cuisine, Italian pasta"
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button Footer - Only shows when editing */}
              {isEditing && (
                <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100 animate-fadeIn">
                  <p className="text-sm text-gray-500">* Required fields</p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-black text-base transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}