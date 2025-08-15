import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Play,
  CheckCircle,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Search,
  Filter,
  Grid,
  List,
  BookMarked,
  Download,
  Upload,
  BarChart3,
  Target,
  Trophy,
  Timer,
  Brain
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await apiService.student.courses();
        
        if (data.success) {
          const enrollments = data.courses || data.enrollments || [];
          
          // Transform enrollment data to match component expectations
          const transformedCourses = enrollments.map(enrollment => ({
            id: enrollment.course_id || enrollment.id,
            title: enrollment.courses?.title || enrollment.courses?.name || enrollment.title || 'Unknown Course',
            instructor: enrollment.courses?.instructor_name || 'Instructor TBD',
            progress: enrollment.progress_percentage || 0,
            difficulty: enrollment.courses?.level || 'beginner',
            rating: enrollment.courses?.rating || '4.5',
            completedLessons: Math.floor((enrollment.progress_percentage || 0) / 100 * 20),
            totalLessons: 20,
            timeSpent: `${Math.floor(Math.random() * 10)}h ${Math.floor(Math.random() * 60)}m`,
            assignments: {
              completed: Math.floor(Math.random() * 8),
              total: 10
            },
            quizzes: {
              averageScore: Math.floor(75 + Math.random() * 25)
            },
            nextLesson: enrollment.progress_percentage < 100 ? 'Continue Learning' : null,
            lastAccessed: new Date(enrollment.enrolled_at || Date.now()).toLocaleDateString(),
            certificateEarned: enrollment.progress_percentage === 100
          }));
          
          setCourses(transformedCourses);
        } else {
          toast.error(data.error || 'Failed to load courses');
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCourses();
    }
  }, [user, API_BASE_URL]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.instructor || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'completed' && course.progress === 100) ||
                         (filter === 'in-progress' && course.progress > 0 && course.progress < 100) ||
                         (filter === 'not-started' && course.progress === 0);
    
    return matchesSearch && matchesFilter;
  });

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const CourseCard = ({ course }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Course Header */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-16 w-16 text-white opacity-50" />
        </div>
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-1 bg-black bg-opacity-20 rounded-full px-2 py-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm font-medium">{course.rating}</span>
          </div>
        </div>
        {course.certificateEarned && (
          <div className="absolute bottom-4 right-4">
            <Award className="h-8 w-8 text-yellow-400" />
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          By {course.instructor}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-gray-900 dark:text-white font-medium">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
            <span>{course.timeSpent} spent</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Assignments</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {course.assignments.completed}/{course.assignments.total}
                </p>
              </div>
              <BookMarked className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quiz Avg</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {course.quizzes.averageScore}%
                </p>
              </div>
              <Target className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>

        {/* Next Lesson */}
        {course.nextLesson && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Next Lesson:</p>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {course.nextLesson}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last accessed: {course.lastAccessed}
          </div>
          <div className="flex items-center space-x-2">
            <Link 
              to={`/courses/${course.id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
            >
              View Details
            </Link>
            {course.progress === 100 ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
              </div>
            ) : (
              <Link 
                to={`/courses/${course.id}/learn`}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm flex items-center"
              >
                <Play className="h-4 w-4 mr-1" />
                Continue
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const CourseListItem = ({ course }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="h-8 w-8 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By {course.instructor}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </span>
              {course.certificateEarned && (
                <Award className="h-5 w-5 text-yellow-500" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{course.progress}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Lessons</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {course.completedLessons}/{course.totalLessons}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Time Spent</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{course.timeSpent}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Quiz Average</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{course.quizzes.averageScore}%</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last accessed: {course.lastAccessed}
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                to={`/courses/${course.id}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
              >
                View Details
              </Link>
              {course.progress === 100 ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
                </div>
              ) : (
                <Link 
                  to={`/courses/${course.id}/learn`}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm flex items-center"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Continue
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Calculate summary stats
  const totalCourses = courses.length;
  const completedCourses = courses.filter(c => c.progress === 100).length;
  const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
  const totalTimeSpent = courses.reduce((total, course) => {
    const timeMatch = course.timeSpent.match(/(\d+)h (\d+)m/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      return total + hours + minutes / 60;
    }
    return total;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          My Courses
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Track your learning progress and continue your courses
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalCourses}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedCourses}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{inProgressCourses}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Spent</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{Math.round(totalTimeSpent)}h</p>
            </div>
            <Timer className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Courses</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="not-started">Not Started</option>
              </select>
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="space-y-6">
        {filteredCourses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No courses found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search criteria.' : 'You haven\'t enrolled in any courses yet.'}
            </p>
            <Link 
              to="/courses"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Link>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <CourseListItem key={course.id} course={course} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
