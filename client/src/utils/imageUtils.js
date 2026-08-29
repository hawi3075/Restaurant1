import API from '../services/api';

/**
 * Get full image URL for display
 * Handles Cloudinary URLs, uploaded images, public folder images, and external URLs
 */
export const getImageUrl = (imagePath, fallback = '/m1.webp') => {
  if (!imagePath) return fallback;
  
  // External URL or Cloudinary URL - use as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Legacy local uploaded file - prepend API base URL (for old images before Cloudinary)
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
  return getImageUrl(imagePath, '/mg1.webp');
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