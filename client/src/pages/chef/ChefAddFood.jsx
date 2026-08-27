import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { PlusCircle, Upload, Link, X, Loader, ChefHat, AlertCircle } from 'lucide-react';

export default function ChefAddFood() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Fallback default categories
  const [categories, setCategories] = useState([
    { id: 'cat_1', name: 'Main Course' },
    { id: 'cat_2', name: 'Appetizers & Starters' },
    { id: 'cat_3', name: 'Traditional / Cultural' },
    { id: 'cat_4', name: 'Desserts & Sweets' },
    { id: 'cat_5', name: 'Beverages & Drinks' },
    { id: 'cat_6', name: 'Fast Food & Snacks' }
  ]);
  
  // Fallback default restaurants
  const [restaurants, setRestaurants] = useState([
    { id: 'rest_1', name: 'Yod Abyssinia Restaurant' },
    { id: 'rest_2', name: 'Dashen Traditional Restaurant' },
    { id: 'rest_3', name: 'Kategna Restaurant' }
  ]);
  
  const [submittedFoods, setSubmittedFoods] = useState([]);
  
  // Image handling states
  const [imageSourceType, setImageSourceType] = useState('file'); // 'file' or 'url'
  const [imagePreview, setImagePreview] = useState(null);
  
  // Custom handling states for 'Other'
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomRestaurant, setIsCustomRestaurant] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    customCategory: '',
    restaurantId: user?.restaurantId || '',
    customRestaurant: '',
    image: null,
    imageUrl: '',
    preparationTime: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spicyLevel: 'NONE',
  });

  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
    fetchSubmittedFoods();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      const data = Array.isArray(response.data) ? response.data : response.data?.categories || response.data?.data || [];
      if (data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories from API, using defaults:', err);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await API.get('/restaurants');
      const data = Array.isArray(response.data) ? response.data : response.data?.restaurants || response.data?.data || [];
      if (data.length > 0) {
        setRestaurants(data);
      }
    } catch (err) {
      console.error('Error loading restaurants from API, using defaults:', err);
    }
  };

  const fetchSubmittedFoods = async () => {
    try {
      const response = await API.get('/foods');
      const foodList = Array.isArray(response.data) ? response.data : response.data?.foods || response.data?.data || [];
      const chefFoods = foodList.filter(
        (food) => food.submittedBy === user?.id && food.status === 'PENDING'
      );
      setSubmittedFoods(chefFoods);
    } catch (err) {
      console.error('Error loading submitted foods:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'categoryId') {
      if (value === 'other') {
        setIsCustomCategory(true);
        setFormData((prev) => ({ ...prev, categoryId: 'other' }));
      } else {
        setIsCustomCategory(false);
        setFormData((prev) => ({ ...prev, categoryId: value, customCategory: '' }));
      }
      return;
    }

    if (name === 'restaurantId') {
      if (value === 'other') {
        setIsCustomRestaurant(true);
        setFormData((prev) => ({ ...prev, restaurantId: 'other' }));
      } else {
        setIsCustomRestaurant(false);
        setFormData((prev) => ({ ...prev, restaurantId: value, customRestaurant: '' }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setFormData((prev) => ({ ...prev, image: file, imageUrl: '' }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url, image: null }));
    setImagePreview(url);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null, imageUrl: '' }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    if (isCustomCategory && !formData.customCategory) {
      alert('Please provide a name for your custom category');
      return;
    }

    if (!isCustomCategory && !formData.categoryId) {
      alert('Please select a category');
      return;
    }

    if (isCustomRestaurant && !formData.customRestaurant) {
      alert('Please provide a name for your custom restaurant');
      return;
    }

    if (!isCustomRestaurant && !formData.restaurantId && !user?.restaurantId) {
      alert('Please select a restaurant');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', parseFloat(formData.price));
      
      if (isCustomCategory) {
        submitData.append('customCategory', formData.customCategory);
      } else {
        submitData.append('categoryId', formData.categoryId);
      }

      if (isCustomRestaurant) {
        submitData.append('customRestaurant', formData.customRestaurant);
      } else {
        submitData.append('restaurantId', formData.restaurantId || user?.restaurantId);
      }

      submitData.append('preparationTime', parseInt(formData.preparationTime, 10) || 15);
      submitData.append('isVegetarian', formData.isVegetarian);
      submitData.append('isVegan', formData.isVegan);
      submitData.append('isGlutenFree', formData.isGlutenFree);
      submitData.append('spicyLevel', formData.spicyLevel);
      // submittedBy and status are set by the backend automatically

      if (imageSourceType === 'file' && formData.image) {
        submitData.append('image', formData.image);
      } else if (imageSourceType === 'url' && formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }

      await API.post('/chef/foods', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (window.showToast) {
        window.showToast('Food submitted successfully! Waiting for admin approval.', 'success');
      } else {
        alert('Food submitted successfully! Waiting for admin approval.');
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        customCategory: '',
        restaurantId: user?.restaurantId || '',
        customRestaurant: '',
        image: null,
        imageUrl: '',
        preparationTime: '',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        spicyLevel: 'NONE',
      });
      setImagePreview(null);
      setIsCustomCategory(false);
      setIsCustomRestaurant(false);
      
      fetchSubmittedFoods();
    } catch (err) {
      console.error('Error submitting food:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to submit food';
      
      if (window.showToast) {
        window.showToast(errorMessage, 'error');
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Add New Food 🍳</h1>
              <p className="text-gray-600 mt-1">Submit new dishes for admin approval</p>
            </div>
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
              <ChefHat className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">Chef Submission Portal</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <PlusCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Submit New Food Item</h2>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Admin Approval Required</p>
                    <p className="text-xs mt-1">
                      Your submission will be reviewed by the admin team before it appears on the menu.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Food Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Margherita Pizza"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the dish, ingredients..."
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Price (Birr) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prep Time (minutes)</label>
                    <input
                      type="number"
                      name="preparationTime"
                      value={formData.preparationTime}
                      onChange={handleInputChange}
                      placeholder="15"
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={isCustomCategory ? 'other' : formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium bg-white"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id || cat._id} value={cat.id || cat._id}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="other">➕ Other (Custom Category)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Restaurant <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="restaurantId"
                      value={isCustomRestaurant ? 'other' : formData.restaurantId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium bg-white"
                      disabled={!!user?.restaurantId}
                      required
                    >
                      <option value="">Select Restaurant</option>
                      {restaurants.map((rest) => (
                        <option key={rest.id || rest._id} value={rest.id || rest._id}>
                          {rest.name}
                        </option>
                      ))}
                      <option value="other">➕ Other (Custom Restaurant)</option>
                    </select>
                  </div>
                </div>

                {isCustomCategory && (
                  <div className="p-4 bg-orange-50/50 border-2 border-orange-200 rounded-xl animate-fadeIn">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Custom Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customCategory"
                      value={formData.customCategory}
                      onChange={handleInputChange}
                      placeholder="Type your new category name here..."
                      className="w-full px-4 py-3 border-2 border-orange-400 bg-white rounded-xl focus:border-orange-600 focus:outline-none font-medium text-gray-900 shadow-inner"
                      required
                    />
                  </div>
                )}

                {isCustomRestaurant && (
                  <div className="p-4 bg-orange-50/50 border-2 border-orange-200 rounded-xl animate-fadeIn">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Custom Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customRestaurant"
                      value={formData.customRestaurant}
                      onChange={handleInputChange}
                      placeholder="Type your new restaurant name here..."
                      className="w-full px-4 py-3 border-2 border-orange-400 bg-white rounded-xl focus:border-orange-600 focus:outline-none font-medium text-gray-900 shadow-inner"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Spicy Level</label>
                  <select
                    name="spicyLevel"
                    value={formData.spicyLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium bg-white"
                  >
                    <option value="NONE">Not Spicy</option>
                    <option value="MILD">🌶️ Mild</option>
                    <option value="MEDIUM">🌶️🌶️ Medium</option>
                    <option value="HOT">🌶️🌶️🌶️ Hot</option>
                    <option value="EXTRA_HOT">🌶️🌶️🌶️🌶️ Extra Hot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Dietary Information</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isVegetarian"
                        checked={formData.isVegetarian}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="font-medium text-gray-700">🥬 Vegetarian</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isVegan"
                        checked={formData.isVegan}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="font-medium text-gray-700">🌱 Vegan</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isGlutenFree"
                        checked={formData.isGlutenFree}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="font-medium text-gray-700">🌾 Gluten-Free</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Food Image</label>
                  <div className="flex rounded-xl bg-gray-100 p-1 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageSourceType('file')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                        imageSourceType === 'file' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Upload className="w-4 h-4" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceType('url')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                        imageSourceType === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Link className="w-4 h-4" /> Image URL
                    </button>
                  </div>

                  {imageSourceType === 'file' ? (
                    !imagePreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-all bg-gray-50 hover:bg-orange-50">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <span className="text-sm font-bold text-gray-600">Click to upload image</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                        <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-xl border-4 border-gray-200" />
                        <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={handleImageUrlChange}
                        placeholder="https://example.com/image.webp"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                      />
                      {imagePreview && (
                        <div className="relative">
                          <img src={imagePreview} alt="URL Preview" className="w-full h-64 object-cover rounded-xl border-4 border-gray-200" />
                          <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-6 h-6" />
                      <span>Submit for Approval</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Pending Submissions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-black text-gray-900 mb-4">Pending Approval</h3>
              {submittedFoods.length === 0 ? (
                <div className="text-center py-8">
                  <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No pending submissions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submittedFoods.map((food) => (
                    <div key={food.id || food._id} className="border-2 border-yellow-200 bg-yellow-50 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        {food.image ? (
                          <img src={food.image} alt={food.name} className="w-16 h-16 rounded-lg object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ChefHat className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-black text-gray-900 text-sm">{food.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{food.price} Birr</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">
                            ⏳ Pending Review
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}