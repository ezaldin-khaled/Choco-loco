import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { TOKEN_AUTH } from '../lib/queries';
import { setAuthToken, removeAuthToken, getAuthToken } from '../lib/graphqlClient';

interface User {
  id: string;
  username: string;
  email: string;
  isStaff: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [tokenAuth] = useMutation(TOKEN_AUTH);

  useEffect(() => {
    // Check if user is already logged in by checking for JWT token
    const token = getAuthToken();
    if (token) {
      // Token exists, verify if it's valid by checking user data
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          // Invalid stored user data, clear it
          localStorage.removeItem('adminUser');
          removeAuthToken();
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data } = await tokenAuth({
        variables: { username, password },
      });

      if (data?.tokenAuth?.token) {
        const { token, user: userData } = data.tokenAuth;
        
        console.log('[Login] User data received:', {
          id: userData?.id,
          username: userData?.username,
          email: userData?.email,
          isStaff: userData?.isStaff,
        });
        
        // Check if user is staff (admin)
        if (!userData?.isStaff) {
          console.warn('[Login] User does not have staff privileges');
          throw new Error('Access denied. Staff privileges required.');
        }

        // Store JWT token
        setAuthToken(token);
        
        // Store user data
        const userInfo = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          isStaff: userData.isStaff,
        };
        setUser(userInfo);
        localStorage.setItem('adminUser', JSON.stringify(userInfo));
        
        console.log('[Login] User authenticated successfully with staff privileges');
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle GraphQL errors
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        throw new Error(error.graphQLErrors[0].message || 'Invalid credentials');
      }
      // Handle network errors
      if (error.networkError) {
        throw new Error('Network error. Please try again.');
      }
      // Re-throw if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    removeAuthToken();
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
};

