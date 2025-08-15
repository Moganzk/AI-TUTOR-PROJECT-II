import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Clock,
  PlusCircle,
  Edit,
  Eye,
  Calendar,
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import apiService from '../../services/api';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageProgress: 0,
    pendingGrades: 0,
    completedAssignments: 0,
    upcomingDeadlines: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick action handlers
  const handleCreateCourse = () => {
    toast.success('Opening Course Creation...');
    navigate('/staff/courses');
  };

  const handleGradeAssignments = () => {
    toast.success('Opening Grade Book...');
    navigate('/staff/gradebook');
  };

  const handleViewProgress = () => {
    toast.success('Opening Student Progress...');
    navigate('/staff/student-progress');
  };

  const handleScheduleClass = () => {
    toast.success('Opening Content Creation...');
    navigate('/staff/content');
  };

  const handleManageStudents = () => {
    toast.success('Opening Student Management...');
    navigate('/staff/student-progress');
  };

  const handleViewAllCourses = () => {
    toast.success('Opening All Courses...');
    navigate('/staff/courses');
  };

  const handleViewCourse = (courseId) => {
    toast.success('Opening Course Details...');
    navigate(`/staff/courses`); // Could be /staff/courses/${courseId} if individual course pages exist
  };

  const handleEditCourse = (courseId) => {
    toast.success('Opening Course Editor...');
    navigate(`/staff/courses`); // Could be /staff/courses/${courseId}/edit if individual course pages exist
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
  let coursesData = [];
  let assignmentsData = [];
  let studentsData = [];

  try { const { data } = await apiService.courses.getCourses(); coursesData = data.courses || []; } catch(e){ console.error('Courses load failed', e);} 
  try { const { data } = await apiService.assignments.getAssignments(); assignmentsData = data.assignments || []; } catch(e){ console.error('Assignments load failed', e);} 
  try { const { data } = await apiService.staff.getStudents(); studentsData = data.students || []; } catch(e){ console.error('Students load failed', e);} 

      // Calculate real stats
      const totalCourses = coursesData.length;
      const totalStudents = studentsData.length;
      const averageProgress = studentsData.length > 0 
        ? Math.round(studentsData.reduce((sum, student) => sum + (student.progress || 0), 0) / studentsData.length)
        : 0;
      const pendingGrades = assignmentsData.filter(a => a.status === 'submitted').length;
      const completedAssignments = assignmentsData.filter(a => a.status === 'graded').length;
      const upcomingDeadlines = assignmentsData.filter(a => {
        if (!a.due_date) return false;
        const dueDate = new Date(a.due_date);
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }).length;

      setStats({
        totalCourses,
        totalStudents,
        averageProgress,
        pendingGrades,
        completedAssignments,
        upcomingDeadlines
      });

      // Set recent activities based on real data
      const activities = [];
      
      // Add recent assignment submissions
      const recentSubmissions = assignmentsData
        .filter(a => a.status === 'submitted')
        .slice(0, 2)
        .map(assignment => ({
          id: `submission_${assignment.id}`,
          type: 'assignment_submitted',
          description: `New submission for ${assignment.title}`,
          time: assignment.updated_at ? new Date(assignment.updated_at).toLocaleString() : 'Recently',
          icon: BookOpen,
          color: 'bg-blue-500'
        }));

      activities.push(...recentSubmissions);

      // Add course progress updates
      if (coursesData.length > 0) {
        activities.push({
          id: 'course_progress',
          type: 'course_progress',
          description: `${totalCourses} active courses with ${totalStudents} total students`,
          time: 'Updated now',
          icon: Users,
          color: 'bg-green-500'
        });
      }

      // Add upcoming deadlines
      if (upcomingDeadlines > 0) {
        activities.push({
          id: 'upcoming_deadlines',
          type: 'deadline_approaching',
          description: `${upcomingDeadlines} assignment${upcomingDeadlines > 1 ? 's' : ''} due this week`,
          time: 'This week',
          icon: Clock,
          color: 'bg-red-500'
        });
      }

      setRecentActivities(activities.length > 0 ? activities : [
        {
          id: 'no_activity',
          type: 'info',
          description: 'No recent activities to display',
          time: 'Start teaching to see activities here',
          icon: Award,
          color: 'bg-gray-500'
        }
      ]);

      // Set courses data
      const formattedCourses = coursesData.slice(0, 4).map(course => {
        const courseStudents = studentsData.filter(s => s.course === course.title).length;
        const courseProgress = courseStudents > 0 
          ? Math.round(studentsData
              .filter(s => s.course === course.title)
              .reduce((sum, s) => sum + (s.progress || 0), 0) / courseStudents)
          : 0;
        
        return {
          id: course.id,
          title: course.title || course.name || 'Untitled Course',
          students: courseStudents,
          progress: courseProgress,
          nextDeadline: 'No upcoming deadlines',
          status: course.is_active ? 'active' : 'inactive'
        };
      });

      setMyCourses(formattedCourses);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set fallback empty data
      setStats({
        totalCourses: 0,
        totalStudents: 0,
        averageProgress: 0,
        pendingGrades: 0,
        completedAssignments: 0,
        upcomingDeadlines: 0
      });
      setRecentActivities([]);
      setMyCourses([]);
    } finally {
      setLoading(false);
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
            Staff Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.fullName || 'Instructor'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleCreateCourse}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="My Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="bg-green-500"
          change="+15 this month"
          changeType="increase"
        />
        <StatCard
          title="Average Progress"
          value={`${stats.averageProgress}%`}
          icon={Target}
          color="bg-purple-500"
          change="+5% this week"
          changeType="increase"
        />
        <StatCard
          title="Pending Grades"
          value={stats.pendingGrades}
          icon={Edit}
          color="bg-orange-500"
        />
        <StatCard
          title="Completed Assignments"
          value={stats.completedAssignments}
          icon={CheckCircle}
          color="bg-teal-500"
          change="+12 this week"
          changeType="increase"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlines}
          icon={Clock}
          color="bg-red-500"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* My Courses */}
        <div className="p-6 bg-white rounded-lg shadow lg:col-span-2 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              My Courses
            </h3>
            <button 
              onClick={handleViewAllCourses}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {myCourses.map((course) => (
              <div key={course.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-md dark:text-white">
                    {course.title}
                  </h4>
                  <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>{course.students} students</span>
                  <span>Next deadline: {course.nextDeadline}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full h-2 mb-3 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div 
                    className="h-2 bg-blue-600 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleViewCourse(course.id)}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button 
                    onClick={() => handleEditCourse(course.id)}
                    className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activities
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${activity.color}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <button 
            onClick={handleCreateCourse}
            className="p-4 transition-all duration-200 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 group"
          >
            <PlusCircle className="w-8 h-8 mx-auto mb-2 text-blue-600 transition-transform group-hover:scale-110" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Create Course</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Add new course</p>
          </button>
          <button 
            onClick={handleGradeAssignments}
            className="p-4 transition-all duration-200 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-300 group"
          >
            <Edit className="w-8 h-8 mx-auto mb-2 text-green-600 transition-transform group-hover:scale-110" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Grade Assignments</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Review submissions</p>
          </button>
          <button 
            onClick={handleViewProgress}
            className="p-4 transition-all duration-200 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-300 group"
          >
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600 transition-transform group-hover:scale-110" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">View Progress</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Track students</p>
          </button>
          <button 
            onClick={handleScheduleClass}
            className="p-4 transition-all duration-200 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-orange-300 group"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-600 transition-transform group-hover:scale-110" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Schedule Class</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Create content</p>
          </button>
          <button 
            onClick={handleManageStudents}
            className="p-4 transition-all duration-200 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-300 group"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-red-600 transition-transform group-hover:scale-110" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Students</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">View student data</p>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Important Notifications
        </h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 space-x-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Assignment deadline approaching
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Math Assignment #3 is due in 2 days
              </p>
            </div>
          </div>
          <div className="flex items-center p-3 space-x-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Course milestone reached
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Advanced Mathematics reached 85% completion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
