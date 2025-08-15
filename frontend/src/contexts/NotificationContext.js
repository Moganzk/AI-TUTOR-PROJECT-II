import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchUnreadCount, isAuthenticated, token } = useAuth();
  
  // Track 401 errors to prevent spam logging
  const has401ErrorLogged = useRef(false);
  const pollingIntervalRef = useRef(null);
  const isInitialMount = useRef(true);

  // Helper: Check if user can make authenticated requests
  const canMakeAuthenticatedRequest = useCallback(() => {
    return isAuthenticated && token && token.trim().length > 0;
  }, [isAuthenticated, token]);

  // Helper: Reset 401 error tracking on successful auth
  const resetErrorTracking = useCallback(() => {
    has401ErrorLogged.current = false;
  }, []);

  // Helper: Log 401 errors only once to prevent console spam
  const handleAuthError = useCallback((error, operation) => {
    if (error.response?.status === 401) {
      if (!has401ErrorLogged.current) {
        console.warn(`Authentication required for ${operation}. User may need to log in.`);
        has401ErrorLogged.current = true;
      }
      return true; // Indicates this was a handled auth error
    }
    return false; // Not an auth error, should be logged normally
  }, []);

  // Core notification fetching logic
  const fetchNotifications = useCallback(async () => {
    // Early return if user cannot make authenticated requests
    if (!canMakeAuthenticatedRequest()) {
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await apiService.notifications.list();
      setNotifications(data.notifications || []);
      
      // Reset error tracking on successful request
      resetErrorTracking();
      
      // Trigger unread count update if available
      if (fetchUnreadCount) {
        fetchUnreadCount();
      }
    } catch (error) {
      // Handle 401 errors gracefully without spam
      const isAuthError = handleAuthError(error, 'notification fetching');
      
      // Log non-auth errors normally
      if (!isAuthError) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [canMakeAuthenticatedRequest, fetchUnreadCount, resetErrorTracking, handleAuthError]);

  // Cleanup function to stop all polling and clear state
  const cleanup = useCallback(() => {
    // Stop any active polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Clear notifications on logout
    setNotifications([]);
    setLoading(false);
    
    // Reset error tracking
    resetErrorTracking();
  }, [resetErrorTracking]);

  // Create new notification (admin only)
  const createNotification = async (notificationData) => {
    if (!canMakeAuthenticatedRequest()) {
      toast.error('Authentication required to create notifications');
      return { success: false, error: 'Not authenticated' };
    }

    setLoading(true);
    try {
      const { data } = await apiService.post('/api/notifications', notificationData);
      if (data.success) {
        toast.success('Notification sent successfully! 📢');
        fetchNotifications(); // Refresh notifications list
        return { success: true, data };
      } else {
        toast.error(data.error || 'Failed to send notification');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const isAuthError = handleAuthError(error, 'notification creation');
      if (!isAuthError) {
        console.error('Error creating notification:', error);
        toast.error('Failed to send notification');
      }
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!canMakeAuthenticatedRequest()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      await apiService.put(`/api/notifications/${notificationId}/read`);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      
      // Update unread count
      if (fetchUnreadCount) {
        fetchUnreadCount();
      }
      
      return { success: true };
    } catch (error) {
      const isAuthError = handleAuthError(error, 'marking notification as read');
      if (!isAuthError) {
        console.error('Error marking notification as read:', error);
      }
      return { success: false, error: error.message };
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!canMakeAuthenticatedRequest()) {
      toast.error('Authentication required');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      await apiService.put('/api/notifications/mark-all-read');
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      // Update unread count
      if (fetchUnreadCount) {
        fetchUnreadCount();
      }
      
      toast.success('All notifications marked as read');
      return { success: true };
    } catch (error) {
      const isAuthError = handleAuthError(error, 'marking all notifications as read');
      if (!isAuthError) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Failed to mark notifications as read');
      }
      return { success: false, error: error.message };
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!canMakeAuthenticatedRequest()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      await apiService.delete(`/api/notifications/${notificationId}`);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      
      // Update unread count
      if (fetchUnreadCount) {
        fetchUnreadCount();
      }
      
      toast.success('Notification deleted');
      return { success: true };
    } catch (error) {
      const isAuthError = handleAuthError(error, 'deleting notification');
      if (!isAuthError) {
        console.error('Error deleting notification:', error);
        toast.error('Failed to delete notification');
      }
      return { success: false, error: error.message };
    }
  };

  // Add notification to context (for real-time updates)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (fetchUnreadCount) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  // Main effect: Handle authentication state changes
  useEffect(() => {
    // Skip API calls on initial mount if no token or not authenticated
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Only fetch on initial mount if we're definitely authenticated
      if (canMakeAuthenticatedRequest()) {
        // Small delay to ensure auth context is fully initialized
        const timer = setTimeout(() => {
          fetchNotifications();
        }, 100);
        return () => clearTimeout(timer);
      }
      return;
    }

    // For subsequent changes, handle immediately
    if (canMakeAuthenticatedRequest()) {
      fetchNotifications();
    } else {
      cleanup();
    }
  }, [canMakeAuthenticatedRequest, fetchNotifications, cleanup]);

  // Cleanup effect: Ensure proper cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const value = {
    notifications,
    loading,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;