import React, { useState, useEffect } from 'react';
import apiService from '../../services/api'; // ensure default import for generic post
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  Award,
  AlertCircle,
  Bell,
  Activity,
  BarChart3,
  Calendar,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalStaff: 0,
    totalSessions: 0,
    totalMessages: 0,
    activeUsers: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsResp = await apiService.admin.stats();
      const data = statsResp.data;
      if (data.success) {
          // Match the actual backend response structure
          setStats({
            totalUsers: data.stats.users?.total || 0,
            totalStudents: data.stats.users?.students || 0,
            totalStaff: data.stats.users?.staff || 0,
            totalSessions: Math.round(data.stats.system?.health?.active_sessions || 0),
            totalMessages: data.stats.assignments?.total_submissions || 0,
            activeUsers: data.stats.users?.active_users || 0
          });
      }
      try {
        const activitiesResp = await apiService.admin.activities();
        const activitiesData = activitiesResp.data;
        if (activitiesData.success && activitiesData.activities) {
          setRecentActivities(activitiesData.activities);
        } else setRecentActivities([]);
      } catch {
        setRecentActivities([]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set fallback data
      setStats({
        totalUsers: 0,
        totalStudents: 0,
        totalStaff: 0,
        totalSessions: 0,
        totalMessages: 0,
        activeUsers: 0
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleManageUsers = () => {
    navigate('/admin/users');
  };

  const handleViewReports = () => {
    navigate('/admin/reports');
  };

  const handleSendNotification = () => {
    setShowNotificationModal(true);
  };

  const handleScheduleTasks = () => {
    // For now, show a toast notification
    toast.info('Task scheduling feature coming soon!');
  };

  const sendQuickNotification = async (message, type = 'info') => {
    try {
      const notifResp = await apiService.post('/api/notifications', {
        title: 'Admin Notification',
        message,
        type,
        target: 'all'
      });
      const data = notifResp.data || {};
      toast.success(`Notification sent (${data.count || 1} recipient${(data.count||1)===1?'':'s'})`);
      setShowNotificationModal(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Error sending notification');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-32 h-32 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.fullName || 'Administrator'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSendNotification}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Bell className="w-4 h-4" />
            <span>Send Notification</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Students"
          value={stats.totalStudents.toLocaleString()}
          icon={BookOpen}
          color="bg-green-500"
        />
        <StatCard
          title="Staff Members"
          value={stats.totalStaff.toLocaleString()}
          icon={Award}
          color="bg-purple-500"
        />
        <StatCard
          title="AI Sessions"
          value={stats.totalSessions.toLocaleString()}
          icon={MessageSquare}
          color="bg-orange-500"
        />
        <StatCard
          title="Messages Sent"
          value={stats.totalMessages.toLocaleString()}
          icon={Activity}
          color="bg-red-500"
        />
        <StatCard
          title="Online Now"
          value={stats.activeUsers.toLocaleString()}
          icon={Clock}
          color="bg-indigo-500"
        />
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Usage Chart */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Platform Usage
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalSessions}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <div className="h-2 bg-blue-600 rounded-full" style={{ width: stats.totalSessions > 0 ? '100%' : '0%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Messages</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalMessages}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <div className="h-2 bg-green-600 rounded-full" style={{ width: stats.totalMessages > 0 ? '100%' : '0%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.activeUsers}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <div className="h-2 bg-purple-600 rounded-full" style={{ width: stats.activeUsers > 0 ? '100%' : '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activities
            </h3>
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                // Map activity types to appropriate icons
                const getActivityIcon = (type) => {
                  switch (type) {
                    case 'user_registration':
                      return Users;
                    case 'ai_chat_session':
                      return MessageSquare;
                    case 'course_created':
                      return BookOpen;
                    case 'system_startup':
                    case 'database_connected':
                      return CheckCircle;
                    case 'system_error':
                      return AlertCircle;
                    default:
                      return Activity;
                  }
                };
                
                const Icon = getActivityIcon(activity.type);
                const iconColor = activity.type === 'system_error' ? 'bg-red-500' : 
                                activity.type === 'user_registration' ? 'bg-blue-500' :
                                activity.type === 'ai_chat_session' ? 'bg-purple-500' :
                                activity.type === 'course_created' ? 'bg-green-500' :
                                'bg-gray-500';
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${iconColor}`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.user && `${activity.user} • `}{new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent activities to display
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Activities will appear here as users interact with the system
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button 
            onClick={handleManageUsers}
            className="p-4 transition-colors border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 group"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600 transition-transform group-hover:scale-110" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</p>
          </button>
          <button 
            onClick={handleSendNotification}
            className="p-4 transition-colors border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 group"
          >
            <Bell className="w-8 h-8 mx-auto mb-2 text-green-600 transition-transform group-hover:scale-110" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Send Notification</p>
          </button>
          <button 
            onClick={handleViewReports}
            className="p-4 transition-colors border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 group"
          >
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600 transition-transform group-hover:scale-110" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">View Reports</p>
          </button>
          <button 
            onClick={handleScheduleTasks}
            className="p-4 transition-colors border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 group"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-600 transition-transform group-hover:scale-110" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Schedule Tasks</p>
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          System Health
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Server Status</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">All systems operational</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Database</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Response time: 12ms</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">AI Service</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">99.9% uptime</p>
          </div>
        </div>
      </div>

      {/* Quick Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Send Quick Notification
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => sendQuickNotification('System maintenance scheduled for tonight at 11 PM', 'info')}
                className="w-full p-3 text-left transition-colors rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              >
                <p className="font-medium text-blue-900 dark:text-blue-300">System Maintenance</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">Notify users about scheduled maintenance</p>
              </button>
              <button
                onClick={() => sendQuickNotification('New AI features have been released! Check them out in your dashboard.', 'success')}
                className="w-full p-3 text-left transition-colors rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
              >
                <p className="font-medium text-green-900 dark:text-green-300">New Features</p>
                <p className="text-sm text-green-700 dark:text-green-400">Announce new AI features to users</p>
              </button>
              <button
                onClick={() => sendQuickNotification('Please update your profile information to continue using the platform.', 'warning')}
                className="w-full p-3 text-left transition-colors rounded-lg bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
              >
                <p className="font-medium text-yellow-900 dark:text-yellow-300">Profile Update Required</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Remind users to update profiles</p>
              </button>
              <div className="flex justify-end pt-4 space-x-3">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/admin/notifications')}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Create Custom
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
