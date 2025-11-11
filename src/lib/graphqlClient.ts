import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { ApolloLink, Observable } from '@apollo/client';
import { API_URL } from '../config/api';

// Get JWT token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

// Decode JWT token payload (for debugging)
export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
};

// Get CSRF token from cookies
const getCsrfToken = (): string | null => {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i];
    if (!c) continue;
    let cookie = c.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

// Error link to log detailed errors
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Log authorization errors (simplified)
      if (message?.includes('authorized') || message?.includes('Not authorized')) {
        console.error('[Auth Error] Not authorized - backend rejected the request');
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    const nError = networkError as any;
    
    // Check for mixed content errors (HTTPS page trying to access HTTP resource)
    if (networkError.message?.includes('Mixed Content') || 
        networkError.message?.includes('blocked:mixed-content') ||
        (typeof window !== 'undefined' && window.location.protocol === 'https:' && API_URL.startsWith('http://'))) {
      console.error('[Mixed Content Error] HTTPS page cannot access HTTP API');
      console.error('Current page protocol:', window.location.protocol);
      console.error('API URL:', API_URL);
      console.error('Solution: Ensure API URL uses HTTPS when frontend is on HTTPS');
    }
    
    // Check for CORS errors
    if (networkError.message?.includes('CORS') || networkError.message?.includes('cors')) {
      console.error('[CORS Error] Cross-origin request blocked');
      console.error('API URL:', API_URL);
      console.error('Current origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
    }
    
    if (nError.statusCode === 400) {
      console.error('400 Bad Request - Response body:', nError.result);
      console.error('Request was:', operation.operationName, operation.variables);
      console.error('Query:', operation.query.loc?.source.body);
    }
    
    // Log the full error details for debugging
    console.error('Network error details:', {
      message: networkError.message,
      name: networkError.name,
      statusCode: nError.statusCode,
      result: nError.result,
      response: nError.response,
    });
  }
});

// Helper function to check if variables contain File objects
const hasFiles = (variables: any): boolean => {
  if (!variables) return false;
  
  const checkValue = (value: any): boolean => {
    if (value instanceof File) return true;
    if (value instanceof FileList) return true;
    if (Array.isArray(value)) return value.some(checkValue);
    if (value && typeof value === 'object') {
      return Object.values(value).some(checkValue);
    }
    return false;
  };
  
  return checkValue(variables);
};

// Custom link to handle file uploads using GraphQL multipart request spec
const uploadLink = new ApolloLink((operation, forward) => {
  const { variables } = operation;
  
  // If no files, proceed normally
  if (!hasFiles(variables)) {
    return forward(operation);
  }
  
  // For file uploads, create FormData following GraphQL multipart request spec
  const formData = new FormData();
  const fileMap: { [key: string]: string[] } = {};
  let fileIndex = 0;
  
  // Process variables and extract files
  const processValue = (value: any, path: string[]): any => {
    if (value instanceof File) {
      const fileKey = fileIndex++;
      const fileKeyStr = fileKey.toString();
      const variablePath = path.length > 0 ? `variables.${path.join('.')}` : 'variables';
      if (!fileMap[fileKeyStr]) {
        fileMap[fileKeyStr] = [];
      }
      fileMap[fileKeyStr]!.push(variablePath);
      formData.append(fileKeyStr, value);
      return null; // Will be replaced with file reference in operations
    }
    if (value instanceof FileList) {
      const fileKey = fileIndex++;
      const fileKeyStr = fileKey.toString();
      const variablePath = path.length > 0 ? `variables.${path.join('.')}` : 'variables';
      if (!fileMap[fileKeyStr]) {
        fileMap[fileKeyStr] = [];
      }
      fileMap[fileKeyStr]!.push(variablePath);
      Array.from(value).forEach((file) => {
        formData.append(fileKeyStr, file);
      });
      return null;
    }
    if (Array.isArray(value)) {
      return value.map((item, index) => processValue(item, [...path, index.toString()]));
    }
    if (value && typeof value === 'object' && value !== null) {
      const processed: any = {};
      Object.keys(value).forEach((key) => {
        processed[key] = processValue(value[key], [...path, key]);
      });
      return processed;
    }
    return value;
  };
  
  const processedVariables = processValue(variables, []);
  
  // Create operations object
  const operations = {
    query: operation.query.loc?.source.body || operation.query,
    variables: processedVariables,
  };
  
  // Add operations and map to FormData
  formData.append('operations', JSON.stringify(operations));
  formData.append('map', JSON.stringify(fileMap));
  
  // Get auth headers
  const token = getAuthToken();
  const csrfToken = getCsrfToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  console.log('[Upload Link] Processing file upload:', {
    operationName: operation.operationName,
    fileMap,
    variables: processedVariables,
  });
  
  return new Observable((observer) => {
    fetch(API_URL, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            console.error('[Upload Link] Upload failed:', {
              status: response.status,
              statusText: response.statusText,
              body: text,
            });
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('[Upload Link] Upload successful:', data);
        observer.next({ data });
        observer.complete();
      })
      .catch((error) => {
        console.error('[Upload Link] Upload error:', error);
        observer.error(error);
      });
  });
});

// Create HTTP link with better error handling
const httpLink = createHttpLink({
  uri: API_URL,
  credentials: 'include', // Include cookies for CSRF token
  fetchOptions: {
    mode: 'cors',
  },
  fetch: async (uri, options) => {
    try {
      const response = await fetch(uri, options);
      return response;
    } catch (error: any) {
      // Enhanced error logging for network failures
      console.error('[HTTP Link] Fetch failed:', {
        uri,
        error: error.message,
        name: error.name,
        type: error.type,
      });
      
      // Check if it's a network error (connection refused, SSL error, etc.)
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('NetworkError') ||
          error.name === 'TypeError') {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const apiUrl = uri.toString();
        const isHttpsApi = apiUrl.startsWith('https://');
        
        if (isHttps && isHttpsApi) {
          console.error('[HTTP Link] ⚠️ HTTPS API request failed. Possible causes:');
          console.error('  1. API server does not support HTTPS (most likely)');
          console.error('  2. SSL certificate issue');
          console.error('  3. API server is down or unreachable');
          console.error('  4. CORS configuration issue');
          console.error('');
          console.error('🔍 To verify:');
          console.error('  - Open https://164.90.215.173/graphql/ in your browser');
          console.error('  - If it fails to load, HTTPS is not set up on the API server');
          console.error('');
          console.error('💡 Solutions:');
          console.error('  1. Set up HTTPS on the API server (recommended)');
          console.error('     - Use Let\'s Encrypt/Certbot');
          console.error('     - Configure nginx or your web server for HTTPS');
          console.error('  2. Use a reverse proxy with SSL termination');
          console.error('  3. Verify the API server actually supports HTTPS');
          console.error('');
          console.error('⚠️ IMPORTANT: If the API server only supports HTTP,');
          console.error('   you cannot use it from an HTTPS frontend due to mixed content blocking.');
          console.error('   You MUST set up HTTPS on the API server.');
        }
      }
      
      throw error;
    }
  },
});

// Create auth link to add JWT token and CSRF token to headers
const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();
  const csrfToken = getCsrfToken();
  
  // Debug: Log token presence (remove in production)
  if (token) {
    console.log('[Auth] JWT token found, adding to request headers');
  } else {
    console.warn('[Auth] No JWT token found in localStorage');
  }
  
  const authHeaders: Record<string, string> = {
    ...headers,
  };
  
  // Only set Content-Type for non-file upload requests
  // File uploads need multipart/form-data which the browser sets automatically
  if (!headers?.['content-type']?.includes('multipart/form-data')) {
    authHeaders['Content-Type'] = headers?.['content-type'] || 'application/json';
  }
  
  // Add JWT token if available
  // Backend expects "Bearer" prefix, not "JWT"
  if (token) {
    // Remove any whitespace from token
    const cleanToken = token.trim();
    authHeaders['Authorization'] = `Bearer ${cleanToken}`;
    
    // Debug: Log token (first/last 10 chars only for security)
    if (cleanToken.length > 20) {
      console.log(`[Auth] Token being sent: ${cleanToken.substring(0, 10)}...${cleanToken.substring(cleanToken.length - 10)}`);
    }
  }
  
  // Add CSRF token if available
  if (csrfToken) {
    authHeaders['X-CSRFToken'] = csrfToken;
  }
  
  return {
    headers: authHeaders,
  };
});

// Create Apollo Client instance
// Use uploadLink for file uploads, otherwise use standard httpLink with auth
export const apolloClient = new ApolloClient({
  link: from([errorLink, uploadLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Store JWT token
export const setAuthToken = (token: string) => {
  localStorage.setItem('jwt_token', token);
  // Reset Apollo Client cache to apply new auth headers
  apolloClient.resetStore();
};

// Remove JWT token
export const removeAuthToken = () => {
  localStorage.removeItem('jwt_token');
  // Reset Apollo Client cache to remove auth headers
  apolloClient.resetStore();
};

// Get session key for cart (generate if not exists)
export const getSessionKey = (): string => {
  let sessionKey = localStorage.getItem('cart_session_key');
  if (!sessionKey) {
    // Generate a unique session key
    // Format: cart_session_timestamp_random
    sessionKey = 'cart_session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('cart_session_key', sessionKey);
    console.log('Created new cart session:', sessionKey);
  }
  return sessionKey;
};

// Clear cart session (useful for logout or cart clear)
export const clearSessionKey = (): void => {
  localStorage.removeItem('cart_session_key');
  console.log('Cleared cart session');
};

