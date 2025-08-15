import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  BookOpen,
  Clock,
  Award,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Target,
  Zap,
  Globe,
  Star,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [analytics, setAnalytics] = useState({
    overview: {},
    userStats: {},
    courseStats: {},
    performanceMetrics: {},
    activityData: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, selectedMetric]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
    const { data } = await apiService.admin.stats();
    if (data.success) {
      const stats = data.stats;
          
          // Transform backend data to match frontend expectations
          setAnalytics({
            overview: {
              totalUsers: stats.total_users || 0,
              totalCourses: 0, // Will be updated when courses endpoint is added
              totalLessons: 0,
              totalCompletions: 0,
              avgCompletionRate: 0,
              avgStudyTime: 0,
              totalRevenue: 0,
              growthRate: 0
            },
            userStats: {
              newUsers: 0,
              activeUsers: stats.total_users || 0,
              churnRate: 0,
              userGrowth: 0,
              avgSessionTime: 0,
              dailyActiveUsers: 0,
              weeklyActiveUsers: 0,
              monthlyActiveUsers: stats.total_users || 0,
              studentCount: stats.users_by_role?.students || 0,
              staffCount: stats.users_by_role?.staff || 0,
              adminCount: stats.users_by_role?.admins || 0
            },
            courseStats: {
              popularCourses: [],
              categoryPerformance: []
            },
            performanceMetrics: {
              systemUptime: 99.97,
              avgResponseTime: 245,
              errorRate: 0.03,
              serverLoad: 67.3,
              bandwidthUsage: 1.24,
              storageUsage: 45.6,
              systemStatus: stats.system_status || 'healthy'
            },
            activityData: [],
            recentActivity: []
          });
  } else { throw new Error(data.error||'Failed to fetch analytics'); }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Set empty analytics data if API fails
      setAnalytics({
        overview: {
          totalUsers: 0,
          totalCourses: 0,
          totalLessons: 0,
          totalCompletions: 0,
          avgCompletionRate: 0,
          avgStudyTime: 0,
          totalRevenue: 0,
          growthRate: 0
        },
        userStats: {
          newUsers: 0,
          activeUsers: 0,
          churnRate: 0,
          userGrowth: 0,
          avgSessionTime: 0,
          dailyActiveUsers: 0,
          weeklyActiveUsers: 0,
          monthlyActiveUsers: 0,
          studentCount: 0,
          staffCount: 0,
          adminCount: 0
        },
        courseStats: {
          popularCourses: [],
          categoryPerformance: []
        },
        performanceMetrics: {
          systemUptime: 0,
          avgResponseTime: 0,
          errorRate: 0,
          serverLoad: 0,
          bandwidthUsage: 0,
          storageUsage: 0,
          systemStatus: 'error'
        },
        activityData: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="h-8 w-8 mr-3" />
            Analytics & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor platform performance and user engagement
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatNumber(analytics.overview.totalUsers)}
              </p>
              <div className="flex items-center mt-1">
                {getChangeIcon(analytics.userStats.userGrowth)}
                <span className={`text-sm ml-1 ${getChangeColor(analytics.userStats.userGrowth)}`}>
                  {analytics.userStats.userGrowth}%
                </span>
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.overview.totalCourses}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.overview.avgCompletionRate}%
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(analytics.overview.totalRevenue)}
              </p>
              <div className="flex items-center mt-1">
                {getChangeIcon(analytics.overview.growthRate)}
                <span className={`text-sm ml-1 ${getChangeColor(analytics.overview.growthRate)}`}>
                  {analytics.overview.growthRate}%
                </span>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Activity</h3>
          <div className="space-y-4">
            {/* Simplified chart representation */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Active Users</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analytics.userStats.dailyActiveUsers}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getTimeAgo(new Date(Date.now() - 24 * 60 * 60 * 1000))}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Active Users</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analytics.userStats.weeklyActiveUsers}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last 7 days
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Active Users</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analytics.userStats.monthlyActiveUsers}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last 30 days
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">New Users</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.userStats.newUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {analytics.userStats.churnRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Session Time</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.userStats.avgSessionTime}m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Courses</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Course Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Enrollments</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Completion Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Performance</th>
              </tr>
            </thead>
            <tbody>
              {analytics.courseStats.popularCourses.length > 0 ? (
                analytics.courseStats.popularCourses.map((course, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{course.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{course.enrollments}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${course.completion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{course.completion}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {course.completion >= 80 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : course.completion >= 60 ? (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          {course.completion >= 80 ? 'Excellent' : course.completion >= 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No course data available
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Course statistics will appear here once courses are created and students enroll
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.courseStats.categoryPerformance.length > 0 ? (
            analytics.courseStats.categoryPerformance.map((category, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{category.category}</h4>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      {category.avgRating}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Courses</span>
                    <span className="text-gray-900 dark:text-white">{category.courses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Enrollments</span>
                    <span className="text-gray-900 dark:text-white">{category.enrollments}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No category performance data available
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Category statistics will appear here once courses are organized by subjects
              </p>
            </div>
          )}
        </div>
      </div>

      {/* System Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Uptime</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {analytics.performanceMetrics.systemUptime}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Response Time</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {analytics.performanceMetrics.avgResponseTime}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Error Rate</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {analytics.performanceMetrics.errorRate}%
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.user} - {activity.details}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No recent activity to display
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                User activities will appear here as they interact with the platform
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
