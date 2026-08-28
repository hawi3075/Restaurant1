import API from '../services/api';

/**
 * Get full image URL for display
 * Handles uploaded images, public folder images, and external URLs
 */
export const getImageUrl = (imagePath, fallback = '/m1.webp') => {
  if (!imagePath) return fallback;
  
  // External URL - use as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // Uploaded file - prepend API base URL
  if (imagePath.startsWith('/uploads')) {
    const baseUrl = API.defaults.baseURL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }
  
  // Public folder file - use as is
  return imagePath;
};

/**
 * Get restaurant cover image URL with appropriate fallback
 */
export const getRestaurantImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/mg1.jpg');
};

/**
 * Get food image URL with appropriate fallback
 */
export const getFoodImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/m7.webp');
};

/**
 * Get category image URL with appropriate fallback
 */
export const getCategoryImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/m8.webp');
};
