import React, { createContext, useReducer, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import api, { apiService } from '../services/api';

// Auth Context
const AuthContext = createContext();

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'AUTH_CHECK_COMPLETE':
      return { ...state, loading: false };
    default:
      return state;
  }
};

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'), // Set to true if token exists
  loading: true, // Start with loading true to prevent premature redirects
  error: null,
  unreadCount: 0
};

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Configure axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // You can add a verify token endpoint here
          // For now, we'll assume the token is valid
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: userData, token }
          });
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_CHECK_COMPLETE' });
        }
      } else {
        dispatch({ type: 'AUTH_CHECK_COMPLETE' });
      }
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await apiService.auth.login({ email, password });

      // Backend returns 'access_token', frontend expects 'token'
      const token = response.data.access_token || response.data.token;
      const user = response.data.user;
      
      if (!token || !user) {
        throw new Error('Invalid response format from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });

      toast.success(`Welcome back, ${user.name || user.full_name}! 🎓`);
      
      return { success: true, user, token };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
  const response = await apiService.auth.register(userData);
      
      // Don't automatically log in after registration - user needs to confirm email
      dispatch({ type: 'LOGIN_FAILURE', payload: null }); // Reset loading state
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    localStorage.setItem('user', JSON.stringify({ ...state.user, ...userData }));
  };

  const fetchUnreadCount = useCallback(async () => {
    // Only fetch if user is authenticated and has a token
    if (!state.token || !state.isAuthenticated) return;
    try {
      const res = await apiService.notifications.unreadCount();
      dispatch({ type: 'SET_UNREAD_COUNT', payload: res.data.unread_count });
    } catch (err) {
      // Only log error if it's not a 401 (which is expected when not authenticated)
      if (err.response?.status !== 401) {
        console.error('Failed to fetch unread notification count:', err);
      }
    }
  }, [state.token, state.isAuthenticated]);

  // Fetch unread count periodically when authenticated
  useEffect(() => {
    let intervalId;
    if (state.isAuthenticated) {
      fetchUnreadCount(); // Fetch immediately
      intervalId = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isAuthenticated, fetchUnreadCount]);

  // Function to set unread count (can be removed if not used elsewhere)
  const setUnreadCount = (count) => {
    dispatch({ type: 'SET_UNREAD_COUNT', payload: count });
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    updateUser,
    setUnreadCount, // Keep for now, might be useful
    fetchUnreadCount, // Expose the fetcher
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
