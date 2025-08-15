import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, Eye, Archive, Trash2, Clock, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NotificationDropdown = ({ onNotificationClick }) => {
  const { token, unreadCount } = useAuth(); // Use unreadCount from AuthContext
  const { notifications, fetchNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load recent notifications
  const loadRecentNotifications = useCallback(async () => {
    try {
      setLoading(true);
      await fetchNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId, event) => {
    event.stopPropagation();
    try {
  await apiService.notifications.markRead(notificationId);
  loadRecentNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Archive notification
  const archiveNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
  await apiService.notifications.archive(notificationId);
  toast.success('Notification archived');
  loadRecentNotifications();
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast.error('Failed to archive notification');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
  await apiService.notifications.delete(notificationId);
  toast.success('Notification deleted');
  loadRecentNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Poll unread count
  // Removed local pollUnread; context handles periodic refresh

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load notifications on mount and when opened
  useEffect(() => {
    if (token && isOpen) {
      loadRecentNotifications();
    }
  }, [token, isOpen, loadRecentNotifications]);

  // Removed separate open effect (merged above)

  // Auto-refresh notifications every 30 seconds
  // Removed internal 30s refresh; context handles

  // Poll unread count every 20 seconds
  // Removed unread polling; context handles unread counts

  const getTypeIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'success': return <div className={`${iconClass} text-green-500`}>✓</div>;
      case 'warning': return <div className={`${iconClass} text-yellow-500`}>⚠</div>;
      case 'error': return <div className={`${iconClass} text-red-500`}>✕</div>;
      default: return <div className={`${iconClass} text-blue-500`}>ℹ</div>;
    }
  };

  const truncateText = (text, maxLength = 60) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </span>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => {
                  const notificationActions = notification.notification_user_actions?.[0] || {};
                  const isRead = notificationActions.is_read || notification.is_read;

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                        !isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => {
                        if (onNotificationClick) {
                          onNotificationClick(notification);
                        }
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Type Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium ${
                              isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                            }`}>
                              {truncateText(notification.title, 30)}
                            </h4>
                            {!isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {truncateText(notification.message)}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!isRead && (
                                <button
                                  onClick={(e) => markAsRead(notification.id, e)}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                  title="Mark as read"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => archiveNotification(notification.id, e)}
                                className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                                title="Archive"
                              >
                                <Archive className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => deleteNotification(notification.id, e)}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  if (onNotificationClick) {
                    onNotificationClick({ viewAll: true });
                  }
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
