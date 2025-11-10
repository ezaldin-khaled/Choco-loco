// Get the base API URL from environment or use default
const getBaseApiUrl = (): string => {
  // If explicitly set in environment, use it
  if (process.env['REACT_APP_API_URL']) {
    return process.env['REACT_APP_API_URL'];
  }
  
  // API server supports HTTPS, so default to HTTPS
  // If frontend is on HTTP (local development), still use HTTPS for API
  // to avoid mixed content issues when frontend is eventually on HTTPS
  return 'https://164.90.215.173/graphql/';
};

// Get the base media URL from environment or use default
const getBaseMediaUrl = (): string => {
  // If explicitly set in environment, use it
  if (process.env['REACT_APP_MEDIA_URL']) {
    return process.env['REACT_APP_MEDIA_URL'];
  }
  
  // API server supports HTTPS, so default to HTTPS
  return 'https://164.90.215.173/media';
};

export const API_URL = getBaseApiUrl();
export const MEDIA_URL = getBaseMediaUrl();

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

