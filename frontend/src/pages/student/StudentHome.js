import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Award,
  Clock,
  Play,
  CheckCircle,
  Target,
  Star,
  ArrowRight,
  Bell,
  Users,
  BarChart3,
  Zap,
  Brain,
  Timer,
  Trophy
} from 'lucide-react';

const StudentHome = () => {
  const { user } = useAuth();

  // Dashboard data will be loaded from API
  const dashboardData = {
    stats: [
      { icon: BookOpen, label: 'Active Courses', value: '0', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      { icon: Clock, label: 'Study Hours', value: '0', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
      { icon: Award, label: 'Achievements', value: '0', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
      { icon: Target, label: 'Goal Progress', value: '0%', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' }
    ],
    recentCourses: [],
    upcomingAssignments: [],
    studyStreak: 0,
    todayGoal: { completed: 0, total: 0 },
    weeklyProgress: 0
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 🎓
        </h1>
        <p className="text-blue-100 mb-4">
          Ready to continue your learning journey? You're doing great with a {dashboardData.studyStreak}-day study streak!
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-300" />
            <span className="text-sm">Study Streak: {dashboardData.studyStreak} days</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-300" />
            <span className="text-sm">Today's Goal: {dashboardData.todayGoal.completed}/{dashboardData.todayGoal.total}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, index) => {
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
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Continue Learning
              </h2>
              <Link 
                to="/student/courses" 
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentCourses.map((course) => (
                <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {course.progress}% complete
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Next: {course.nextLesson}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Due: {course.due}
                      </p>
                    </div>
                    <Link 
                      to={`/student/courses/${course.id}/learn`}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm flex items-center"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Continue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Assignments
              </h2>
              <Link 
                to="/student/assignments" 
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData.upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {assignment.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {assignment.course}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Due: {assignment.due}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/student/ai-tutor" 
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white block">
                AI Tutor
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Get instant help
              </span>
            </div>
          </Link>
          
          <Link 
            to="/student/courses" 
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-green-600" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white block">
                My Courses
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Continue learning
              </span>
            </div>
          </Link>
          
          <Link 
            to="/student/assignments" 
            className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Calendar className="h-6 w-6 text-purple-600" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white block">
                Assignments
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                View deadlines
              </span>
            </div>
          </Link>
          
          <Link 
            to="/student/progress" 
            className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-yellow-600" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white block">
                Progress
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Track performance
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          This Week's Progress
        </h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Weekly Goal Progress
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {dashboardData.weeklyProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${getProgressColor(dashboardData.weeklyProgress)}`}
            style={{ width: `${dashboardData.weeklyProgress}%` }}
          ></div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{day}</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index < 5 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {index < 5 ? <CheckCircle className="h-4 w-4" /> : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
