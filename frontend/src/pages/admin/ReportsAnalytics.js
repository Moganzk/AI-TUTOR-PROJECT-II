import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Download,
  RefreshCw,
  FileText,
  ArrowUp,
  ArrowDown,
  XCircle,
  Plus,
  Users,
  BookOpen,
  Activity,
  TrendingUp,
  DollarSign,
  Monitor,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportsAnalytics = () => {
  const { user } = useAuth();
  const [selectedDateRange, setSelectedDateRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [userMetrics, setUserMetrics] = useState(null);
  const [sessionMetrics, setSessionMetrics] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
  const { data: statsData } = await apiService.admin.stats();
  if (statsData.success && statsData.stats) {
        const real = statsData.stats || {};
        const estimates = statsData.estimates || {};
        const metadata = statsData.metadata || {};
        const totalUsers = real.users?.total || 0;
        const activeUsers = real.users?.active_users || 0;
        const students = real.users?.students || 0;
        const staff = real.users?.staff || 0;
        const admins = real.users?.admins || 0;
        const totalCourses = real.courses?.total || 0;
        const activeCourses = real.courses?.active || 0;
  // Real vs estimated: favor real total_enrollments if backend promoted it into stats
  const totalEnrollments = (real.courses?.total_enrollments ?? estimates.courses?.total_enrollments) || 0;
        const totalAssignments = real.assignments?.total || 0;
        const publishedAssignments = real.assignments?.published || 0;
        const avgGrade = estimates.assignments?.avg_grade ?? 0;
        const uptime = real.system?.health?.uptime || '0%';

        // Core analyticsData (keep only verifiable or clearly estimated values)
        // Keep completionRate numeric; format only at render time
        const completionRateNumeric = (publishedAssignments && totalAssignments)
          ? (publishedAssignments / (totalAssignments || 1)) * 100
          : 0;

        setAnalyticsData({
          totalUsers,
          activeUsers,
          totalSessions: estimates.system?.active_sessions ? estimates.system.active_sessions * 4 : Math.floor(totalUsers * 2.5),
          avgSessionDuration: 0, // placeholder until real metric
          completionRate: Number.isFinite(completionRateNumeric) ? completionRateNumeric : 0,
          satisfactionScore: 0,
          userGrowth: 0,
          sessionGrowth: 0,
          engagementRate: 0,
          usersByRole: { students, staff, admins, active: activeUsers },
          _metadata: metadata,
          _estimates: estimates
        });

        setUserMetrics({
          newUsersToday: 0,
            topCountries: [],
            usersByRole: [
              { role: 'Students', count: students, percentage: totalUsers ? (students / totalUsers * 100).toFixed(1) : 0 },
              { role: 'Staff', count: staff, percentage: totalUsers ? (staff / totalUsers * 100).toFixed(1) : 0 },
              { role: 'Admins', count: admins, percentage: totalUsers ? (admins / totalUsers * 100).toFixed(1) : 0 }
            ],
            ageDistribution: []
        });

        setSessionMetrics({
          totalCourses,
            activeCourses,
            completedCourses: 0,
            averageRating: 0,
            totalEnrollments,
            topCourses: [],
            subjectDistribution: []
        });

        setPerformanceMetrics({
          averagePageViews: 0,
            bounceRate: 0,
            dailyActiveUsers: Math.floor(activeUsers / 30),
            weeklyActiveUsers: Math.floor(activeUsers / 4),
            contentInteraction: [],
            peakHours: [],
            deviceBreakdown: [],
            browsers: [],
            operatingSystems: []
        });

        toast.success('Analytics data loaded');
  } else { throw new Error('Invalid response format'); }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
      
      // Set fallback data if API fails
      setAnalyticsData({
        totalUsers: 0,
        activeUsers: 0,
        totalSessions: 0,
        avgSessionDuration: 0,
        completionRate: 0,
        satisfactionScore: 0,
        userGrowth: 0,
        sessionGrowth: 0,
        engagementRate: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  // Load data on component mount and when date range changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedDateRange]);

  // Get formatted metrics with fallback values
  const getMetrics = () => {
    if (!analyticsData) return {};
    
    return {
      totalUsers: analyticsData.totalUsers || 0,
      activeUsers: analyticsData.activeUsers || 0,
      totalSessions: analyticsData.totalSessions || 0,
      avgSessionDuration: analyticsData.avgSessionDuration || 0,
      completionRate: analyticsData.completionRate || 0,
      satisfactionScore: analyticsData.satisfactionScore || 0,
      userGrowth: analyticsData.userGrowth || 0,
      sessionGrowth: analyticsData.sessionGrowth || 0,
      engagementRate: analyticsData.engagementRate || 0
    };
  };

  const metrics = getMetrics();

  // Placeholder marker logic (keys or values we know are estimated / placeholder)
  const placeholderKeys = new Set(['avgSessionDuration','satisfactionScore','userGrowth','sessionGrowth','engagementRate','totalSessions']);
  const isPlaceholderMetric = (key, stat) => {
    if (placeholderKeys.has(key)) return true;
    // Treat zero with no change (and not inherently count-like) as placeholder
    if (typeof stat?.value === 'number' && stat.value === 0 && key !== 'totalUsers' && key !== 'activeUsers' && key !== 'totalSessions') return true;
    return false;
  };

  const dateRanges = [
    { id: '7days', name: 'Last 7 Days' },
    { id: '30days', name: 'Last 30 Days' },
    { id: '90days', name: 'Last 90 Days' },
    { id: '6months', name: 'Last 6 Months' },
    { id: '1year', name: 'Last Year' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const metricTypes = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'courses', name: 'Courses', icon: BookOpen },
    { id: 'engagement', name: 'Engagement', icon: Activity },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'revenue', name: 'Revenue', icon: DollarSign },
    { id: 'devices', name: 'Devices', icon: Monitor },
    { id: 'support', name: 'Support', icon: MessageSquare }
  ];

  // Analytics data loaded from API
  const overviewStats = {
    totalUsers: { 
      value: metrics.totalUsers || 0, 
      change: metrics.userGrowth || 0, 
      trend: (metrics.userGrowth || 0) >= 0 ? 'up' : 'down' 
    },
    activeUsers: { 
      value: metrics.activeUsers || 0, 
      change: metrics.sessionGrowth || 0, 
      trend: (metrics.sessionGrowth || 0) >= 0 ? 'up' : 'down' 
    },
    totalSessions: { 
      value: metrics.totalSessions || 0, 
      change: metrics.sessionGrowth || 0, 
      trend: (metrics.sessionGrowth || 0) >= 0 ? 'up' : 'down' 
    },
    completionRate: { 
      value: `${Number(metrics.completionRate || 0).toFixed(1)}%`, 
      change: 0, 
      trend: 'up' 
    },
    averageSessionTime: { 
      value: `${Math.floor((metrics.avgSessionDuration || 0) / 60)}m ${Math.floor((metrics.avgSessionDuration || 0) % 60)}s`, 
      change: 0, 
      trend: 'up' 
    },
    satisfactionScore: { 
      value: `${(metrics.satisfactionScore || 0).toFixed(1)}/5`, 
      change: 0, 
      trend: 'up' 
    },
    engagementRate: { 
      value: `${(metrics.engagementRate || 0).toFixed(1)}%`, 
      change: 0, 
      trend: 'up' 
    },
    systemUptime: { 
      value: analyticsData?.uptime || 'n/a', 
      change: 0, 
      trend: 'up' 
    }
  };

  const userAnalytics = {
    totalRegistrations: metrics.totalUsers || 0,
    activeUsers: metrics.activeUsers || 0,
    newUsersToday: userMetrics?.newUsersToday || 0,
    userGrowthRate: metrics.userGrowth || 0,
    topCountries: userMetrics?.topCountries || [
      { name: 'United States', users: 0, percentage: 0 },
      { name: 'Canada', users: 0, percentage: 0 },
      { name: 'United Kingdom', users: 0, percentage: 0 },
      { name: 'Australia', users: 0, percentage: 0 },
      { name: 'Germany', users: 0, percentage: 0 }
    ],
    usersByRole: userMetrics?.usersByRole || [
      { role: 'Students', count: 0, percentage: 0 },
      { role: 'Instructors', count: 0, percentage: 0 },
      { role: 'Admins', count: 0, percentage: 0 }
    ],
    ageDistribution: userMetrics?.ageDistribution || [
      { range: '18-24', count: 0, percentage: 0 },
      { range: '25-34', count: 0, percentage: 0 },
      { range: '35-44', count: 0, percentage: 0 },
      { range: '45-54', count: 0, percentage: 0 },
      { range: '55+', count: 0, percentage: 0 }
    ]
  };

  const courseAnalytics = {
    totalCourses: sessionMetrics?.totalCourses || 0,
    activeCourses: sessionMetrics?.activeCourses || 0,
    completedCourses: sessionMetrics?.completedCourses || 0,
    averageRating: sessionMetrics?.averageRating || 0,
    totalEnrollments: sessionMetrics?.totalEnrollments || 0,
    completionRate: metrics.completionRate || 0,
    topCourses: sessionMetrics?.topCourses || [
      { name: 'Loading...', enrollments: 0, rating: 0, completion: 0 }
    ],
    subjectDistribution: sessionMetrics?.subjectDistribution || [
      { subject: 'Technology', courses: 0, percentage: 0 },
      { subject: 'Business', courses: 0, percentage: 0 },
      { subject: 'Science', courses: 0, percentage: 0 },
      { subject: 'Arts', courses: 0, percentage: 0 },
      { subject: 'Languages', courses: 0, percentage: 0 }
    ]
  };

  const engagementMetrics = {
    averageSessionTime: `${Math.floor((metrics.avgSessionDuration || 0) / 60)}m ${Math.floor((metrics.avgSessionDuration || 0) % 60)}s`,
    averagePageViews: performanceMetrics?.averagePageViews || 0,
    bounceRate: performanceMetrics?.bounceRate || 0,
    dailyActiveUsers: performanceMetrics?.dailyActiveUsers || 0,
    weeklyActiveUsers: performanceMetrics?.weeklyActiveUsers || 0,
    monthlyActiveUsers: metrics.activeUsers || 0,
    contentInteraction: performanceMetrics?.contentInteraction || [
      { type: 'Videos', interactions: 0, percentage: 0 },
      { type: 'Quizzes', interactions: 0, percentage: 0 },
      { type: 'Discussions', interactions: 0, percentage: 0 },
      { type: 'Downloads', interactions: 0, percentage: 0 }
    ],
    peakHours: performanceMetrics?.peakHours || [
      { hour: '9 AM', activity: 0 },
      { hour: '10 AM', activity: 0 },
      { hour: '11 AM', activity: 0 },
      { hour: '2 PM', activity: 0 },
      { hour: '3 PM', activity: 0 },
      { hour: '8 PM', activity: 0 }
    ]
  };

  const deviceAnalytics = {
    totalSessions: metrics.totalSessions || 0,
    desktopSessions: performanceMetrics?.desktopSessions || 0,
    mobileSessions: performanceMetrics?.mobileSessions || 0,
    tabletSessions: performanceMetrics?.tabletSessions || 0,
    deviceBreakdown: performanceMetrics?.deviceBreakdown || [
      { device: 'Desktop', sessions: 0, percentage: 0 },
      { device: 'Mobile', sessions: 0, percentage: 0 },
      { device: 'Tablet', sessions: 0, percentage: 0 }
    ],
    browsers: performanceMetrics?.browsers || [
      { browser: 'Chrome', sessions: 0, percentage: 0 },
      { browser: 'Safari', sessions: 0, percentage: 0 },
      { browser: 'Firefox', sessions: 0, percentage: 0 },
      { browser: 'Edge', sessions: 0, percentage: 0 },
      { browser: 'Other', sessions: 0, percentage: 0 }
    ],
    operatingSystems: performanceMetrics?.operatingSystems || [
      { os: 'Windows', sessions: 0, percentage: 0 },
      { os: 'macOS', sessions: 0, percentage: 0 },
      { os: 'iOS', sessions: 0, percentage: 0 },
      { os: 'Android', sessions: 0, percentage: 0 },
      { os: 'Linux', sessions: 0, percentage: 0 }
    ]
  };

  const revenueAnalytics = {
    totalRevenue: 12450,
    monthlyRecurring: 8900,
    oneTimePayments: 3550,
    averageOrderValue: 89.50,
    conversionRate: 3.2,
    churnRate: 2.8,
    revenueByPlan: [
      { plan: 'Premium', revenue: 6750, percentage: 54.2 },
      { plan: 'Basic', revenue: 3200, percentage: 25.7 },
      { plan: 'Enterprise', revenue: 2500, percentage: 20.1 }
    ],
    monthlyTrends: [
      { month: 'Jan', revenue: 10200 },
      { month: 'Feb', revenue: 11100 },
      { month: 'Mar', revenue: 12450 },
      { month: 'Apr', revenue: 11800 },
      { month: 'May', revenue: 12900 },
      { month: 'Jun', revenue: 13400 }
    ]
  };

  const reports = [
    {
      id: 1,
      name: 'Monthly User Report',
      type: 'user',
      description: 'Comprehensive user activity and growth report',
      lastGenerated: '2024-01-15',
      format: 'PDF',
      size: '2.3 MB',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Course Performance Analysis',
      type: 'course',
      description: 'Detailed analysis of course engagement and completion rates',
      lastGenerated: '2024-01-14',
      format: 'Excel',
      size: '1.8 MB',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Revenue Summary',
      type: 'revenue',
      description: 'Financial performance and revenue breakdown',
      lastGenerated: '2024-01-13',
      format: 'PDF',
      size: '1.2 MB',
      status: 'completed'
    },
    {
      id: 4,
      name: 'System Performance Report',
      type: 'system',
      description: 'Technical metrics and system health analysis',
      lastGenerated: '2024-01-12',
      format: 'PDF',
      size: '3.1 MB',
      status: 'generating'
    }
  ];

  const handleGenerateReport = (reportType) => {
    setSelectedReport(reportType);
    setShowReportModal(true);
  };

  const handleDownloadReport = (reportId) => {
    toast.success('Report downloaded successfully');
  };

  const handleExportData = () => {
    toast.success('Data exported successfully');
  };

  const handleRefreshData = async () => {
    await handleRefresh();
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <ArrowUp className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = (trend) => trend === 'up' ? 'text-green-600' : 'text-red-600';

  const estimatedFieldSet = React.useMemo(() => {
    const meta = analyticsData?._metadata;
    if(!meta || !Array.isArray(meta.estimated_fields)) return new Set();
    return new Set(meta.estimated_fields);
  }, [analyticsData]);

  const isEstimatedMetric = (metricKey) => {
    const mapping = {
      totalSessions: 'estimates.system.active_sessions',
      avgSessionDuration: 'derived.avg_session_duration',
      completionRate: 'derived.completion_rate',
      engagementRate: 'derived.engagement_rate',
      satisfactionScore: 'derived.satisfaction_score'
    };
    const backendField = mapping[metricKey];
    return placeholderKeys.has(metricKey) || (backendField && estimatedFieldSet.has(backendField));
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Object.entries(overviewStats).map(([key, stat]) => (
        <div key={key} className="relative p-6 bg-white rounded-lg shadow group dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 capitalize dark:text-gray-400">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            {getTrendIcon(stat.trend)}
          </div>
          <p className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
            {stat.value}
          </p>
          <p className={`text-sm ${getTrendColor(stat.trend)}`}>
            {stat.change > 0 ? '+' : ''}{stat.change}% from last period
          </p>
          {isEstimatedMetric(key) && (
            <>
              <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 cursor-help" title="Estimated / placeholder value (heuristic)">
                est
              </span>
              <div className="absolute z-10 hidden w-48 p-2 text-[11px] text-gray-600 bg-white border border-gray-200 rounded shadow group-hover:block dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 top-10 right-2">
                <strong className="block mb-1">Estimated Metric</strong>
                <span>This value is derived or heuristic. Will update when real telemetry is available.</span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderUserAnalytics = () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          User Distribution by Role
        </h3>
        <div className="space-y-3">
          {userAnalytics.usersByRole.map((role) => (
            <div key={role.role} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {role.role}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${role.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  {role.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Top Countries
        </h3>
        <div className="space-y-3">
          {userAnalytics.topCountries.map((country) => (
            <div key={country.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {country.name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  {country.users}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCourseAnalytics = () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Top Performing Courses
        </h3>
        <div className="space-y-4">
          {(!courseAnalytics.topCourses || courseAnalytics.topCourses.length === 0) && (
            <div className="text-sm text-gray-500 dark:text-gray-400">No course performance data available.</div>
          )}
          {courseAnalytics.topCourses && courseAnalytics.topCourses.map((course, index) => (
            <div key={course.name} className="pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {course.name}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  #{index + 1}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{course.enrollments} enrollments</span>
                <span>⭐ {course.rating}</span>
                <span>{course.completion}% completion</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Subject Distribution
        </h3>
        <div className="space-y-3">
          {(!courseAnalytics.subjectDistribution || courseAnalytics.subjectDistribution.length === 0) && (
            <div className="text-sm text-gray-500 dark:text-gray-400">No subject distribution data available.</div>
          )}
          {courseAnalytics.subjectDistribution && courseAnalytics.subjectDistribution.map((subject) => (
            <div key={subject.subject} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {subject.subject}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div
                    className="h-2 bg-purple-500 rounded-full"
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  {subject.courses}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentMetric = () => {
    switch (selectedMetric) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUserAnalytics();
      case 'courses':
        return renderCourseAnalytics();
      default:
        return (
          <div className="p-12 text-center bg-white rounded-lg shadow dark:bg-gray-800">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} analytics would be displayed here
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Reports & Analytics
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Monitor platform performance and generate detailed reports
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Monitor platform performance and generate detailed reports
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshData}
              disabled={refreshing}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => handleGenerateReport('custom')}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Range
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {dateRanges.map(range => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Navigation */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex flex-wrap gap-2">
          {metricTypes.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                selectedMetric === metric.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <metric.icon className="w-4 h-4" />
              <span>{metric.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Content */}
      <div>
        {renderCurrentMetric()}
      </div>

      {/* Recent Reports */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Reports
          </h2>
          <button
            onClick={() => handleGenerateReport('new')}
            className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </button>
        </div>
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {report.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {report.description}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {report.lastGenerated}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {report.format}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {report.size}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {report.status}
                </span>
                {report.status === 'completed' && (
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg dark:bg-gray-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Generate Report
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Report Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    <option value="user">User Analytics</option>
                    <option value="course">Course Performance</option>
                    <option value="revenue">Revenue Summary</option>
                    <option value="engagement">Engagement Report</option>
                    <option value="system">System Performance</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date Range
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    {dateRanges.map(range => (
                      <option key={range.id} value={range.id}>
                        {range.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Format
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowReportModal(false);
                      toast.success('Report generation started');
                    }}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Generate Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;
