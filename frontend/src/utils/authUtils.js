/**
 * Authentication Utilities
 * Helper functions for handling authentication and token management
 */

import toast from 'react-hot-toast';

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Handle authentication errors with user-friendly messages
 */
export const handleAuthError = (error) => {
  const errorCode = error.response?.data?.code;
  const errorMessage = error.response?.data?.message;
  
  switch (errorCode) {
    case 'AUTH_TOKEN_MISSING':
      toast.error('Please log in to continue');
      redirectToLogin();
      break;
    case 'AUTH_TOKEN_EXPIRED':
      toast.error('Your session has expired. Please log in again.');
      clearAuth();
      redirectToLogin();
      break;
    case 'AUTH_TOKEN_INVALID':
      toast.error('Invalid session. Please log in again.');
      clearAuth();
      redirectToLogin();
      break;
    case 'AUTH_USER_NOT_FOUND':
      toast.error('Account not found. Please contact support.');
      clearAuth();
      redirectToLogin();
      break;
    default:
      toast.error(errorMessage || 'Authentication error. Please try again.');
      if (error.response?.status === 401) {
        clearAuth();
        redirectToLogin();
      }
  }
};

/**
 * Redirect to login page
 */
export const redirectToLogin = () => {
  // Avoid redirect loop if already on login page
  if (window.location.pathname !== '/signin') {
    window.location.replace('/signin');
  }
};

/**
 * Validate token with backend
 */
export const validateToken = async () => { 
  try {
    const token = getAuthToken();
    if (!token) {
      return { valid: false, error: 'No token found' };
    }


    const { apiService } = await import('../services/api');
    try {
      const { data } = await apiService.auth.validate();
      return { valid: data.valid, user: data.user };
    } catch (e) { return { valid:false, error:'Token validation failed'}; }
  } catch (error) {
    console.error('Token validation error:', error);
    clearAuth();
    return { valid: false, error: 'Network error during validation' };
  }
};

/**
 * Check user role
 */
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};

/**
 * Check if user is admin
 */
export const isAdmin = () => hasRole('admin');

/**
 * Check if user is staff
 */
export const isStaff = () => hasRole(['staff', 'admin']);

/**
 * Check if user is student
 */
export const isStudent = () => hasRole('student');

/**
 * Format user display name
 */
export const getUserDisplayName = (user = null) => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return 'Guest';
  
  return currentUser.name || currentUser.email || 'User';
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role = null) => {
  const currentUser = getCurrentUser();
  const userRole = role || currentUser?.role;
  
  switch (userRole) {
    case 'admin':
      return '👑 Administrator';
    case 'staff':
      return '👨‍🏫 Staff';
    case 'student':
      return '🎓 Student';
    default:
      return '👤 User';
  }
};

/**
 * Auto-refresh token before expiration
 */
export const setupTokenRefresh = () => {
  const token = getAuthToken();
  if (!token) return;

  try {
    // Decode JWT to get expiration time
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    // Refresh token 5 minutes before expiration
    const refreshTime = timeUntilExpiration - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      setTimeout(() => {
        validateToken().then(result => {
          if (!result.valid) {
            toast.error('Session expired. Please log in again.');
            redirectToLogin();
          }
        });
      }, refreshTime);
    } else {
      // Token already expired or expires soon
      validateToken().then(result => {
        if (!result.valid) {
          redirectToLogin();
        }
      });
    }
  } catch (error) {
    console.error('Error setting up token refresh:', error);
  }
};

export default {
  isAuthenticated,
  getCurrentUser,
  getAuthToken,
  clearAuth,
  handleAuthError,
  redirectToLogin,
  validateToken,
  hasRole,
  isAdmin,
  isStaff,
  isStudent,
  getUserDisplayName,
  getRoleDisplayName,
  setupTokenRefresh
};