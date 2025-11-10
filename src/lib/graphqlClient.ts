import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
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
    if (nError.statusCode === 400) {
      console.error('400 Bad Request - Response body:', nError.result);
      console.error('Request was:', operation.operationName, operation.variables);
      console.error('Query:', operation.query.loc?.source.body);
    }
  }
});

// Create HTTP link
const httpLink = createHttpLink({
  uri: API_URL,
  credentials: 'include', // Include cookies for CSRF token
  fetchOptions: {
    mode: 'cors',
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
    'Content-Type': 'application/json',
  };
  
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
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
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

