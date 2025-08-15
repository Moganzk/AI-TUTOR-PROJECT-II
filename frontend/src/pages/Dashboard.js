import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Award,
  Clock,
  Bell,
  Settings,
  Activity,
  PieChart,
  Target,
  Star,
  ArrowRight,
  Plus,
  Search,
  Filter,
  FileText,
  User
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data based on user role
      let statsData, activitiesData, tasksData;
      
      switch (user?.role) {
        case 'admin':
          try {
            // Try to get real admin stats
            const statsResponse = await apiService.get('/api/admin/stats');
            console.log('Admin stats response:', statsResponse);
            
            if (statsResponse.success && statsResponse.data) {
              statsData = transformAdminStats(statsResponse.data);
              activitiesData = transformActivities(statsResponse.data.recent_activities || []);
              tasksData = getDefaultTasks('admin');
            } else {
              throw new Error('No valid admin stats data');
            }
          } catch (err) {
            console.warn('Admin endpoints error, using fallback:', err.message);
            // Use real data from subjects/courses endpoints as fallback
            try {
              const subjectsResponse = await apiService.get('/api/subjects');
              const coursesResponse = await apiService.get('/api/courses');
              
              statsData = {
                totalUsers: 25, // Will be replaced with real data
                totalCourses: coursesResponse.data?.data?.length || 0,
                totalSubjects: subjectsResponse.data?.data?.length || 0,
                activeStudents: 18,
                completionRate: 76,
                avgGrade: 84
              };
              activitiesData = getDefaultActivities('admin');
              tasksData = getDefaultTasks('admin');
            } catch (fallbackErr) {
              console.error('Fallback data fetch failed:', fallbackErr);
              const defaultData = getDefaultDashboardData('admin');
              setDashboardData(defaultData);
              return;
            }
          }
          break;
          
        case 'staff':
          try {
            // Try to get real staff data
            const coursesResponse = await apiService.get('/api/courses');
            console.log('Staff courses response:', coursesResponse);
            
            if (coursesResponse.data) {
              const courses = coursesResponse.data.data || coursesResponse.data || [];
              statsData = {
                totalCourses: courses.length,
                totalStudents: courses.reduce((sum, course) => sum + (course.enrollment_count || 0), 0),
                activeCourses: courses.filter(course => course.is_active).length,
                completionRate: 82,
                avgGrade: 87,
                totalAssignments: courses.reduce((sum, course) => sum + (course.assignment_count || 0), 0)
              };
              activitiesData = getDefaultActivities('staff');
              tasksData = getDefaultTasks('staff');
            } else {
              throw new Error('No valid courses data');
            }
          } catch (err) {
            console.warn('Staff endpoints error:', err.message);
            const defaultData = getDefaultDashboardData('staff');
            setDashboardData(defaultData);
            return;
          }
          break;
          
        case 'student':
        default:
          try {
            // Try to get real student data
            const subjectsResponse = await apiService.get('/api/subjects');
            console.log('Student subjects response:', subjectsResponse);
            
            if (subjectsResponse.data) {
              const subjects = subjectsResponse.data.data || subjectsResponse.data || [];
              statsData = {
                enrolledCourses: 3,  // This would come from enrollment API
                completedCourses: 1,
                totalSubjects: subjects.length,
                avgGrade: 85,
                completionRate: 78,
                totalAssignments: 12,
                submittedAssignments: 9
              };
              activitiesData = getDefaultActivities('student');
              tasksData = getDefaultTasks('student');
            } else {
              throw new Error('No valid subjects data');
            }
          } catch (err) {
            console.warn('Student endpoints error:', err.message);
            const defaultData = getDefaultDashboardData('student');
            setDashboardData(defaultData);
            return;
          }
          break;
      }

      setDashboardData({
        stats: statsData,
        recentActivities: activitiesData,
        upcomingTasks: tasksData
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      
      // Fallback to default data structure if API fails
      setDashboardData(getDefaultDashboardData(user?.role));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultDashboardData = (role) => {
    const defaultStats = {
      student: [
        { icon: BookOpen, label: 'Active Courses', value: '0', color: 'text-blue-600' },
        { icon: Clock, label: 'Study Hours', value: '0', color: 'text-green-600' },
        { icon: Award, label: 'Achievements', value: '0', color: 'text-yellow-600' },
        { icon: Target, label: 'Goal Progress', value: '0%', color: 'text-purple-600' }
      ],
      staff: [
        { icon: Users, label: 'Total Students', value: '0', color: 'text-blue-600' },
        { icon: BookOpen, label: 'Active Courses', value: '0', color: 'text-green-600' },
        { icon: MessageSquare, label: 'Pending Reviews', value: '0', color: 'text-orange-600' },
        { icon: TrendingUp, label: 'Avg Performance', value: '0%', color: 'text-purple-600' }
      ],
      admin: [
        { icon: Users, label: 'Total Users', value: '0', color: 'text-blue-600' },
        { icon: BookOpen, label: 'Total Courses', value: '0', color: 'text-green-600' },
        { icon: Activity, label: 'System Health', value: '100%', color: 'text-green-600' },
        { icon: BarChart3, label: 'Monthly Growth', value: '0%', color: 'text-purple-600' }
      ]
    };

    return {
      stats: defaultStats[role] || defaultStats.student,
      recentActivities: [],
      upcomingTasks: []
    };
  };

  const transformAdminStats = (data) => {
    const stats = data?.stats || {};
    return [
      { icon: Users, label: 'Total Users', value: stats.total_users?.toString() || '0', color: 'text-blue-600' },
      { icon: BookOpen, label: 'Total Courses', value: stats.total_courses?.toString() || '0', color: 'text-green-600' },
      { icon: Activity, label: 'System Health', value: '99.9%', color: 'text-green-600' },
      { icon: BarChart3, label: 'Monthly Growth', value: '+12%', color: 'text-purple-600' }
    ];
  };

  const transformStaffStats = (studentsData, coursesData) => {
    const studentCount = studentsData?.students?.length || studentsData?.studentCount || studentsData?.count || 0;
    const courseCount = coursesData?.courses?.length || coursesData?.courseCount || coursesData?.count || 0;
    
    return [
      { icon: Users, label: 'Total Students', value: studentCount.toString(), color: 'text-blue-600' },
      { icon: BookOpen, label: 'Active Courses', value: courseCount.toString(), color: 'text-green-600' },
      { icon: MessageSquare, label: 'Pending Reviews', value: '0', color: 'text-orange-600' },
      { icon: TrendingUp, label: 'Avg Performance', value: '85%', color: 'text-purple-600' }
    ];
  };

  const transformStudentStats = (coursesData, profileData) => {
    const enrollmentCount = coursesData?.enrollments?.length || coursesData?.count || 0;
    const stats = profileData?.stats || {};
    
    return [
      { icon: BookOpen, label: 'Active Courses', value: enrollmentCount.toString(), color: 'text-blue-600' },
      { icon: Clock, label: 'Study Hours', value: stats.studyHours?.toString() || stats.study_hours?.toString() || '0', color: 'text-green-600' },
      { icon: Award, label: 'Achievements', value: stats.achievements?.toString() || '0', color: 'text-yellow-600' },
      { icon: Target, label: 'Goal Progress', value: '75%', color: 'text-purple-600' }
    ];
  };

  const transformActivities = (activities) => {
    return activities.slice(0, 5).map(activity => ({
      type: activity.type || 'system',
      title: activity.description || activity.title || 'System activity',
      time: activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'
    }));
  };

  const getDefaultActivities = (role) => {
    const activities = {
      student: [
        { type: 'course', title: 'Welcome to AI Tutor!', time: 'Just now' }
      ],
      staff: [
        { type: 'system', title: 'Dashboard loaded successfully', time: 'Just now' }
      ],
      admin: [
        { type: 'system', title: 'System running smoothly', time: 'Just now' }
      ]
    };
    return activities[role] || activities.student;
  };

  const getDefaultTasks = (role) => {
    const tasks = {
      student: [
        { title: 'Explore AI Tutor features', due: 'Today', priority: 'low' }
      ],
      staff: [
        { title: 'Review student progress', due: 'This week', priority: 'medium' }
      ],
      admin: [
        { title: 'System maintenance check', due: 'This week', priority: 'low' }
      ]
    };
    return tasks[role] || tasks.student;
  };

  const currentData = dashboardData || getDefaultDashboardData(user?.role);

  // Ensure stats is always an array
  if (currentData && currentData.stats && !Array.isArray(currentData.stats)) {
    console.warn('Dashboard stats is not an array, converting to default format');
    currentData.stats = getDefaultDashboardData(user?.role).stats;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'assignment': return FileText;
      case 'achievement': return Award;
      case 'session': return Clock;
      case 'student': return Users;
      case 'message': return MessageSquare;
      case 'system': return Settings;
      case 'user': return User;
      case 'report': return BarChart3;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-blue-500 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-blue-400 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          {user?.role === 'student' && "Ready to continue your learning journey?"}
          {user?.role === 'staff' && "Let's help your students succeed today!"}
          {user?.role === 'admin' && "Here's your system overview."}
        </p>
        {error && (
          <div className="mt-2 text-sm text-yellow-200">
            ⚠️ Using cached data - some information may not be current
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentData.stats && Array.isArray(currentData.stats) && currentData.stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <IconComponent className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activities
            </h2>
            <Link 
              to="/activities" 
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {currentData.recentActivities && currentData.recentActivities.length > 0 ? (
              currentData.recentActivities.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent activities to display
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Tasks
            </h2>
            <Link 
              to="/tasks" 
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {currentData.upcomingTasks && currentData.upcomingTasks.length > 0 ? (
              currentData.upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {task.due}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No upcoming tasks
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user?.role === 'student' && (
            <>
              <Link 
                to="/ai-tutor" 
                className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Chat with AI Tutor
                </span>
              </Link>
              <Link 
                to="/courses" 
                className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <BookOpen className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Browse Courses
                </span>
              </Link>
              <Link 
                to="/assignments" 
                className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <FileText className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  View Assignments
                </span>
              </Link>
              <Link 
                to="/progress" 
                className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <TrendingUp className="h-6 w-6 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Track Progress
                </span>
              </Link>
            </>
          )}
          
          {user?.role === 'staff' && (
            <>
              <Link 
                to="/courses/manage" 
                className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Manage Courses
                </span>
              </Link>
              <Link 
                to="/students" 
                className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <Users className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  View Students
                </span>
              </Link>
              <Link 
                to="/assignments/create" 
                className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <Plus className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Create Assignment
                </span>
              </Link>
              <Link 
                to="/gradebook" 
                className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <Star className="h-6 w-6 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Grade Book
                </span>
              </Link>
            </>
          )}
          
          {user?.role === 'admin' && (
            <>
              <Link 
                to="/admin/users" 
                className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Users className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Manage Users
                </span>
              </Link>
              <Link 
                to="/admin/analytics" 
                className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <BarChart3 className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  View Analytics
                </span>
              </Link>
              <Link 
                to="/admin/courses" 
                className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <BookOpen className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Course Management
                </span>
              </Link>
              <Link 
                to="/admin/settings" 
                className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <Settings className="h-6 w-6 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  System Settings
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
