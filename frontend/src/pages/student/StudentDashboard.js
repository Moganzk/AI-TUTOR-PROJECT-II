import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Star, 
  TrendingUp, 
  Calendar, 
  Target,
  Award,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Play,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    myCourses: [],
    upcomingAssignments: [],
    recentActivity: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [progressResp, coursesResp, assignmentsResp] = await Promise.all([
        apiService.student.progress(),
        apiService.courses.getCourses(),
        apiService.assignments.getAssignments()
      ]);
      const progressData = progressResp.data || {};
      const coursesData = coursesResp.data || {};
      const assignmentsData = assignmentsResp.data || {};

      // Extract courses array and filter enrolled courses
      const courses = coursesData.courses || [];
      const enrolledCourses = courses.filter(course => course.is_enrolled);

      // Transform data for dashboard
      const transformedData = {
        stats: {
          totalCourses: enrolledCourses.length || 0,
          completedCourses: enrolledCourses.filter(c => c.status === 'completed').length || 0,
          averageGrade: progressData.average_grade || 0,
          totalStudyHours: progressData.total_study_hours || 0,
          currentStreak: progressData.current_streak || 0,
          assignmentsCompleted: progressData.assignments_completed || 0,
          totalAssignments: progressData.total_assignments || 0
        },
        myCourses: enrolledCourses.slice(0, 4).map(course => ({
          id: course.id,
          title: course.title || course.name,
          instructor: course.instructor_name || 'Instructor TBD',
          progress: course.progress || 0,
          grade: course.grade || 'N/A',
          nextClass: course.next_lesson || 'No upcoming lessons',
          status: course.status || 'active'
        })),
        upcomingAssignments: assignmentsData.assignments
          ?.filter(assignment => assignment.status === 'pending' && assignment.due_date)
          .slice(0, 3)
          .map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            course: assignment.course_name || 'Course TBD',
            dueDate: new Date(assignment.due_date).toLocaleDateString(),
            priority: assignment.priority || 'medium'
          })) || [],
        recentActivity: progressData.recent_activity || [],
        achievements: progressData.achievements || []
      };

      setDashboardData(transformedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getGradeColor = (grade) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-600 dark:text-green-400';
    if (grade === 'B' || grade === 'B+') return 'text-blue-600 dark:text-blue-400';
    if (grade === 'C' || grade === 'C+') return 'text-yellow-600 dark:text-yellow-400';
    if (grade === 'D' || grade === 'F') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your learning progress and upcoming activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.stats.averageGrade}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.stats.currentStreak} days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Courses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h2>
                <a href="/student/courses" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all
                </a>
              </div>
            </div>
            <div className="p-6">
              {dashboardData.myCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No courses enrolled yet</p>
                  <a href="/courses" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Browse Courses
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.myCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{course.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{course.instructor}</p>
                        <div className="flex items-center mt-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{course.progress}%</span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className={`text-sm font-medium ${getGradeColor(course.grade)}`}>
                          {course.grade}
                        </div>
                        <button
                          onClick={() => window.location.href = `/courses/${course.id}`}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Continue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Assignments</h2>
                <a href="/student/assignments" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all
                </a>
              </div>
            </div>
            <div className="p-6">
              {dashboardData.upcomingAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No upcoming assignments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.course}</p>
                        <div className="flex items-center mt-2">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Due: {assignment.dueDate}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {dashboardData.recentActivity.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
