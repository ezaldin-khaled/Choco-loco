// Get the base API URL from environment or use default
const getBaseApiUrl = (): string => {
  // If explicitly set in environment, use it
  if (process.env['REACT_APP_API_URL']) {
    return process.env['REACT_APP_API_URL'];
  }
  
  // If running on HTTPS, use HTTPS for API (to avoid mixed content errors)
  // Otherwise use HTTP
  // NOTE: If the API server doesn't support HTTPS, you'll need to:
  // 1. Set up HTTPS on the API server (recommended), OR
  // 2. Use a reverse proxy with SSL termination
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const protocol = isHttps ? 'https' : 'http';
  const url = `${protocol}://164.90.215.173/graphql/`;
  
  if (isHttps && typeof window !== 'undefined') {
    console.warn(`[API Config] Frontend is on HTTPS, using HTTPS for API: ${url}`);
    console.warn('[API Config] If API server doesn\'t support HTTPS, requests will fail. Set up HTTPS on the API server or use a reverse proxy.');
  }
  
  return url;
};

// Get the base media URL from environment or use default
const getBaseMediaUrl = (): string => {
  // If explicitly set in environment, use it
  if (process.env['REACT_APP_MEDIA_URL']) {
    return process.env['REACT_APP_MEDIA_URL'];
  }
  
  // If running on HTTPS, use HTTPS for media (to avoid mixed content errors)
  // Otherwise use HTTP
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const protocol = isHttps ? 'https' : 'http';
  return `${protocol}://164.90.215.173/media`;
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

