import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Bell, CheckCircle, Clock, Archive, Trash2, Eye, RefreshCw, AlertCircle, XCircle, Search, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserNotifications = () => {
  const { token, unreadCount, setUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiService.notifications.list({
        include_archived: showArchived,
        include_deleted: showDeleted,
        type: filterType !== 'all' ? filterType : undefined
      });
      setNotifications(data.notifications || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token, showArchived, showDeleted, filterType]);

  const markAsRead = async (notificationId) => {
    try {
      await apiService.notifications.markRead(notificationId);
      toast.success('Notification marked as read');
      loadNotifications();
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const archiveNotification = async (notificationId) => {
    try {
      await apiService.notifications.archive(notificationId);
      toast.success('Notification archived');
      loadNotifications();
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast.error('Failed to archive notification');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await apiService.notifications.delete(notificationId);
      toast.success('Notification deleted');
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) {
      toast.error('Please select notifications first');
      return;
    }
    try {
      const response = await apiService.notifications.bulkAction(action, selectedNotifications);
      const data = response.data;
      toast.success(`${action} action completed for ${data.affected_count || selectedNotifications.length} notifications`);
      setSelectedNotifications([]);
      loadNotifications();
      if (action === 'read') {
        const { data: unreadData } = await apiService.notifications.getUnreadCount();
        if (unreadData) setUnreadCount(unreadData.unread_count);
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast.error(`Failed to perform ${action} action`);
    }
  };

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => prev.includes(notificationId)
      ? prev.filter(id => id !== notificationId)
      : [...prev, notificationId]);
  };

  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(visibleIds);
  };

  const clearSelection = () => setSelectedNotifications([]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const filteredNotifications = notifications.filter(n => {
    const term = searchTerm.toLowerCase();
    return n.title.toLowerCase().includes(term) || n.message.toLowerCase().includes(term);
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-300 dark:bg-gray-700 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your notifications and stay updated</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"><div className="flex items-center"><Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" /><div className="ml-3"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</p></div></div></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"><div className="flex items-center"><Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" /><div className="ml-3"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p></div></div></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"><div className="flex items-center"><Archive className="w-8 h-8 text-gray-600 dark:text-gray-400" /><div className="ml-3"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Archived</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.archived || 0}</p></div></div></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"><div className="flex items-center"><CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" /><div className="ml-3"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.read || 0}</p></div></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search notifications..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" /></div>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="all">All Types</option><option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center"><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)} className="mr-2" /><span className="text-sm text-gray-600 dark:text-gray-400">Show Archived</span></label>
              <label className="flex items-center"><input type="checkbox" checked={showDeleted} onChange={e=>setShowDeleted(e.target.checked)} className="mr-2" /><span className="text-sm text-gray-600 dark:text-gray-400">Show Deleted</span></label>
              <button onClick={loadNotifications} className="p-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"><RefreshCw className="w-5 h-5" /></button>
            </div>
          </div>
          {selectedNotifications.length>0 && (<div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg"><span className="text-sm text-blue-600 dark:text-blue-400">{selectedNotifications.length} notification(s) selected</span><div className="flex items-center space-x-2"><button onClick={()=>handleBulkAction('read')} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Mark Read</button><button onClick={()=>handleBulkAction('archive')} className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">Archive</button><button onClick={()=>handleBulkAction('delete')} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Delete</button><button onClick={clearSelection} className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700">Clear</button></div></div>)}
          {filteredNotifications.length>0 && (<div className="mt-4"><button onClick={selectAllVisible} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Select all visible ({filteredNotifications.length})</button></div>)}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {filteredNotifications.length===0 ? (
            <div className="p-12 text-center"><Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3><p className="text-gray-600 dark:text-gray-400">{searchTerm ? 'Try adjusting your search terms or filters' : 'You have no notifications at this time'}</p></div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map(notification => {
                const actions = notification.notification_user_actions?.[0] || {};
                const isRead = actions.is_read || notification.is_read;
                const isArchived = actions.is_archived || notification.is_archived;
                const isDeleted = actions.is_deleted || notification.is_deleted;
                return (
                  <div key={notification.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 ${!isRead?'bg-blue-50 dark:bg-blue-900/10':''} ${isArchived?'opacity-75':''} ${isDeleted?'opacity-50':''}`}>
                    <div className="flex items-start space-x-4">
                      <input type="checkbox" checked={selectedNotifications.includes(notification.id)} onChange={()=>toggleNotificationSelection(notification.id)} className="mt-1" />
                      <div className="flex-shrink-0 mt-1">{getTypeIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0" onClick={()=> notification.link && (window.location.href = notification.link)}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-medium ${isRead?'text-gray-600 dark:text-gray-400':'text-gray-900 dark:text-white'} ${notification.link?'cursor-pointer hover:underline':''}`}>{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            {!isRead && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                            {isArchived && <Archive className="w-4 h-4 text-gray-500" />}
                            {isDeleted && <Trash2 className="w-4 h-4 text-red-500" />}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{new Date(notification.created_at).toLocaleString()}</span></span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(notification.priority)}`}>{notification.priority} priority</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!isRead && <button onClick={(e)=>{e.stopPropagation(); markAsRead(notification.id);}} className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" title="Mark as read"><Eye className="w-4 h-4" /></button>}
                            {!isArchived && !isDeleted && <button onClick={(e)=>{e.stopPropagation(); archiveNotification(notification.id);}} className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400" title="Archive"><Archive className="w-4 h-4" /></button>}
                            {!isDeleted && <button onClick={(e)=>{e.stopPropagation(); deleteNotification(notification.id);}} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>}
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
      </div>
    </div>
  );
};

export default UserNotifications;

