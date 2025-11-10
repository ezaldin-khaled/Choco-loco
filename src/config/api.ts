export const API_URL = process.env['REACT_APP_API_URL'] || 'http://164.90.215.173/graphql/';
export const MEDIA_URL = process.env['REACT_APP_MEDIA_URL'] || 'http://164.90.215.173/media';

/**
 * Get full image URL from API response
 * @param imagePath - Path from API (e.g., "/media/products/image.jpg" or "products/image.jpg")
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '/Assets/logo.png'; // Default fallback image
  }
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If starts with /media, remove it and prepend MEDIA_URL
  if (imagePath.startsWith('/media/')) {
    return `${MEDIA_URL}${imagePath.substring(6)}`;
  }
  
  // If just a path like "products/image.jpg", prepend MEDIA_URL
  if (imagePath.startsWith('media/')) {
    return `${MEDIA_URL}/${imagePath.substring(6)}`;
  }
  
  // Default: prepend MEDIA_URL with a slash
  return `${MEDIA_URL}/${imagePath}`;
};

