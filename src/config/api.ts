// Get the base API URL from environment or use default
const getBaseApiUrl = (): string => {
  let url: string;
  
  // If explicitly set in environment, use it
  if (process.env['REACT_APP_API_URL']) {
    url = process.env['REACT_APP_API_URL'];
  } else {
    // API server supports HTTPS, so default to HTTPS
    url = 'https://164.90.215.173/graphql/';
  }
  
  // If frontend is on HTTPS and API URL is HTTP, convert to HTTPS
  // This prevents mixed content errors
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
    console.warn(`[API Config] Converted HTTP API URL to HTTPS: ${url}`);
  }
  
  return url;
};

// Get the base backend URL from environment or use default
const getBaseBackendUrl = (): string => {
  let url: string;
  
  // If explicitly set in environment, use it
  if (process.env['REACT_APP_BACKEND_URL']) {
    url = process.env['REACT_APP_BACKEND_URL'];
  } else {
    // API server supports HTTPS, so default to HTTPS
    url = 'https://164.90.215.173';
  }
  
  // Remove trailing slash if present
  url = url.replace(/\/$/, '');
  
  // If frontend is on HTTPS and backend URL is HTTP, convert to HTTPS
  // This prevents mixed content errors
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
    console.warn(`[API Config] Converted HTTP backend URL to HTTPS: ${url}`);
  }
  
  return url;
};

export const API_URL = getBaseApiUrl();
export const BACKEND_URL = getBaseBackendUrl();
// Keep MEDIA_URL for backward compatibility, but it's now just the backend URL
export const MEDIA_URL = BACKEND_URL;

/**
 * Get full image URL from API response
 * According to the guide: Full Image URL = Backend URL + Image Path
 * 
 * @param imagePath - Path from API (e.g., "/media/products/image.jpg" or "/products/image.jpg")
 * @returns Full URL to the image (e.g., "https://164.90.215.173/media/products/image.jpg")
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '/Assets/logo.png'; // Default fallback image
  }
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Normalize the path: ensure it starts with /
  let normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // If path starts with /products/, /categories/, etc. but not /media/, add /media/ prefix
  // Backend sometimes returns "/products/image.jpg" instead of "/media/products/image.jpg"
  if (normalizedPath.startsWith('/products/') || 
      normalizedPath.startsWith('/categories/') ||
      normalizedPath.startsWith('/brands/') ||
      normalizedPath.startsWith('/headers/') ||
      normalizedPath.startsWith('/icons/')) {
    if (!normalizedPath.startsWith('/media/')) {
      normalizedPath = `/media${normalizedPath}`;
    }
  }
  
  // Formula: Backend URL + Image Path
  // Example: "https://164.90.215.173" + "/media/products/image.jpg"
  return `${BACKEND_URL}${normalizedPath}`;
};

