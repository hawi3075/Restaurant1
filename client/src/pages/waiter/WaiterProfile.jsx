import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import showToast from '../../components/Toast';
import { User, Mail, Phone, Camera, Save, Loader, Utensils, Building, Edit3, X } from 'lucide-react';

export default function WaiterProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    experienceYears: '',
    avatar: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
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
        showToast('Image size should be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setAvatarPreview(base64Image);
        localStorage.setItem(`avatar_${user.id}`, base64Image);
        showToast('Profile photo updated!', 'success');
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

      showToast('Profile updated successfully!', 'success');
      setIsEditing(false); // Close edit form on successful save
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Profile Header with Avatar */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <User className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-white text-orange-600 p-2 rounded-full cursor-pointer hover:bg-orange-50 transition-all shadow-md border-2 border-orange-200">
                        <Camera className="w-3.5 h-3.5" />
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
                    <h2 className="text-xl font-black mb-1">{user?.name}</h2>
                    <p className="text-orange-100 text-sm mb-2">{user?.email}</p>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold">
                        🍽️ Professional Waiter
                      </span>
                      {formData.experienceYears && (
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold">
                          📅 {formData.experienceYears} years experience
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit / Close Toggle Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="self-start sm:self-center bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-sm flex items-center space-x-2"
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
              </div>
            </div>

            {/* Content: View Mode vs Edit Form Mode */}
            {!isEditing ? (
              /* VIEW MODE */
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-base font-black text-gray-900 mb-3 flex items-center space-x-2">
                    <User className="w-4 h-4 text-orange-600" />
                    <span>Basic Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-500">Full Name</p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">{user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Email Address</p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">{user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Phone Number</p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Years of Experience</p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">
                        {user?.experienceYears ? `${user.experienceYears} years` : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-gray-900 mb-2">About Me</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-700 font-medium">
                      {user?.bio || 'No bio added yet. Click "Edit Profile" to tell us about your service philosophy!'}
                    </p>
                  </div>
                </div>

                {user?.restaurant && (
                  <div>
                    <h3 className="text-base font-black text-gray-900 mb-3 flex items-center space-x-2">
                      <Building className="w-4 h-4 text-orange-600" />
                      <span>Restaurant</span>
                    </h3>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white p-2.5 rounded-lg shadow-sm">
                          <Building className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600">Currently working at</p>
                          <p className="text-base font-black text-gray-900">{user.restaurant.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* EDIT FORM MODE */
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <h3 className="text-base font-black text-gray-900 mb-3 flex items-center space-x-2">
                    <User className="w-4 h-4 text-orange-600" />
                    <span>Edit Information</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="waiter@example.com"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+251 912 345 678"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        placeholder="e.g., 3"
                        min="0"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    About Me
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your service philosophy, and what you enjoy about being a waiter..."
                    rows="3"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm font-medium resize-none"
                  />
                </div>

                {user?.restaurant && (
                  <div>
                    <h3 className="text-base font-black text-gray-900 mb-3 flex items-center space-x-2">
                      <Building className="w-4 h-4 text-orange-600" />
                      <span>Restaurant</span>
                    </h3>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white p-2.5 rounded-lg">
                          <Building className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600">Currently working at</p>
                          <p className="text-base font-black text-gray-900">{user.restaurant.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">* Required fields</p>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-2.5 rounded-lg font-black text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
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
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}