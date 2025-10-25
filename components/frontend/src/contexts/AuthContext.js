import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for existing token in localStorage
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        // Validate token with backend (mock implementation)
        const isValid = await validateToken(token);
        if (isValid) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (token) => {
    // Mock token validation - in real app, this would call your backend
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock validation logic
      return token && token.length > 0;
    } catch (error) {
      return false;
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      // Mock OAuth2/Keycloak login flow
      const authResponse = await mockOAuth2Login(credentials);
      
      if (authResponse.success) {
        // Store authentication data
        localStorage.setItem('authToken', authResponse.token);
        localStorage.setItem('userData', JSON.stringify(authResponse.user));
        localStorage.setItem('workspace', authResponse.workspace);
        
        setUser(authResponse.user);
        setIsAuthenticated(true);
        
        message.success('Login successful!');
        navigate('/');
        return { success: true };
      } else {
        throw new Error(authResponse.error || 'Login failed');
      }
    } catch (error) {
      message.error(error.message || 'Login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const mockOAuth2Login = async (credentials) => {
    // Mock OAuth2/Keycloak integration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate different workspace backends based on login
    const workspaces = {
      'user@company1.com': { name: 'company1', backend: 'https://api.company1.com' },
      'user@company2.com': { name: 'company2', backend: 'https://api.company2.com' },
      'demo@eventfeed.com': { name: 'demo', backend: 'https://demo-api.eventfeed.com' }
    };
    
    const workspace = workspaces[credentials.email] || workspaces['demo@eventfeed.com'];
    
    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        name: credentials.email.split('@')[0],
        email: credentials.email,
        avatar: 'resources/user-avatars/user1.png',
        role: 'user',
        permissions: ['read', 'write', 'create_events']
      },
      workspace: workspace
    };
  };

  const logout = () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('workspace');
    
    setUser(null);
    setIsAuthenticated(false);
    
    message.success('Logged out successfully!');
    navigate('/login');
  };

  const refreshToken = async () => {
    try {
      // Mock token refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newToken = 'refreshed-token-' + Date.now();
      localStorage.setItem('authToken', newToken);
      return newToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      // Mock profile update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      message.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      message.error('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    refreshToken,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return function WithAuthComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate('/login');
      }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
};