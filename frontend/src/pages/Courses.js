import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Play,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Calendar,
  TrendingUp,
  Award,
  ChevronRight,
  BookMarked,
  Video,
  FileText,
  MessageCircle,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CourseEnrollmentButton from '../components/CourseEnrollmentButton';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadCourses();
    loadSubjects();
  }, [filter]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data } = await apiService.courses.getCourses();
      if (data.success) {
        setCourses(data.courses || []);
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const { data } = await apiService.subjects.list();
      setSubjects(data.subjects || data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const { data } = await apiService.courses.enroll(courseId);
      if (data.success) {
        toast.success('Successfully enrolled in course!');
        loadCourses();
      } else toast.error(data.error || 'Failed to enroll in course');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
  const { data } = await apiService.courses.unenroll(courseId);
  if (data.success) { toast.success('Successfully unenrolled from course!'); loadCourses(); }
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      toast.error(error.response?.data?.error || 'Failed to unenroll from course');
    }
  };

  // Filter and sort courses (support legacy nested subject object as well as new string)
  const filteredCourses = courses.filter(course => {
    const subjectName = typeof course.subject === 'string' ? course.subject : (course.subject?.name || '');
    const instructorName = typeof course.instructor === 'string' ? course.instructor : (course.instructor?.name || '');
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'enrolled' && (course.is_enrolled || course.isEnrolled)) ||
      (filter === 'beginner' && course.level === 'beginner') ||
      (filter === 'intermediate' && course.level === 'intermediate') ||
      (filter === 'advanced' && course.level === 'advanced') ||
      subjectName.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'students':
        return (b.enrollment_count || 0) - (a.enrollment_count || 0);
      case 'updated':
        return new Date(b.updated_at) - new Date(a.updated_at);
      default:
        return 0;
    }
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const CourseCard = ({ course }) => (
    <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg">
      {/* Course Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-white opacity-50" />
        </div>
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center px-2 py-1 space-x-1 bg-black rounded-full bg-opacity-20">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-white">{course.rating}</span>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {course.title}
          </h3>
          <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
            {course.price}
          </span>
        </div>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4 mr-1" />
          <span className="mr-4">{course.students} students</span>
          <Clock className="w-4 h-4 mr-1" />
          <span className="mr-4">{course.duration}</span>
          <BookMarked className="w-4 h-4 mr-1" />
          <span>{course.lessons} lessons</span>
        </div>

        <div className="flex items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span>By {course.instructor}</span>
        </div>

        {/* Progress Bar (for students) */}
        {course.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{course.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <div 
                className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link 
            to={`/courses/${course.id}`}
            className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>

          <div className="flex items-center space-x-2">
            {user?.role === 'student' && (
              <CourseEnrollmentButton
                course={course}
                onEnrollmentChange={(courseId, isEnrolled) => {
                  // Normalize both snake_case and camelCase flags for downstream components
                  setCourses(prevCourses => prevCourses.map(c =>
                    c.id === courseId
                      ? { ...c, isEnrolled, is_enrolled: isEnrolled, progress: isEnrolled ? (c.progress || 0) : undefined }
                      : c
                  ));
                }}
              />
            )}

            {(user?.role === 'staff' || user?.role === 'admin') && (
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/courses/${course.id}/manage`}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Manage"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <Link 
                  to={`/courses/${course.id}/analytics`}
                  className="p-1 text-gray-500 hover:text-green-600"
                  title="Analytics"
                >
                  <BarChart3 className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const CourseListItem = ({ course }) => (
    <div className="p-6 transition-shadow bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg">
      <div className="flex items-start space-x-4">
        {/* Course Thumbnail */}
        <div className="flex items-center justify-center flex-shrink-0 w-24 h-24 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600">
          <BookOpen className="w-8 h-8 text-white" />
        </div>

        {/* Course Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {course.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {course.price}
              </span>
            </div>
          </div>

          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            {course.description}
          </p>

          <div className="flex items-center mb-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-4">By {course.instructor}</span>
            <Users className="w-4 h-4 mr-1" />
            <span className="mr-4">{course.students} students</span>
            <Clock className="w-4 h-4 mr-1" />
            <span className="mr-4">{course.duration}</span>
            <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
            <span>{course.rating}</span>
          </div>

          {/* Progress Bar (for students) */}
          {course.progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">{course.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Link 
                to={`/courses/${course.id}`}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View Details
              </Link>

              {user?.role === 'student' && (
                <>
                  {course.progress !== undefined ? (
                    <Link 
                      to={`/courses/${course.id}/learn`}
                      className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Continue
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="px-3 py-1 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Enroll Now
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to inject sample courses
  const injectSampleCourses = async () => {
    try {
      const { data } = await apiService.post('/api/inject-sample-courses-public', {});
      if (data.success) {
        toast.success('Sample courses injected successfully!');
        loadCourses();
      } else toast.error(data.error || 'Failed to inject sample courses');
    } catch (error) {
      console.error('Error injecting sample courses:', error);
      toast.error('Failed to inject sample courses');
    }
  };

  // Add inject button in header for testing
  const renderHeader = () => (
    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Courses
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user?.role === 'student' ? 'Discover and learn from our course catalog' : 'Manage your courses and track student progress'}
          </p>
        </div>

        <div className="flex gap-4">
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <Link 
              to="/courses/create"
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
          )}

          {/* Add sample courses button */}
          <button
            onClick={injectSampleCourses}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sample Courses</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {renderHeader()}

      {/* Filters and Search */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Courses</option>
                {user?.role === 'student' && (
                  <>
                    <option value="enrolled">Enrolled</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                  </>
                )}
                {subjects && subjects.length > 0 && (
                  <optgroup label="Subjects">
                    {subjects
                      .filter(s => s && s.name)
                      .sort((a,b) => a.name.localeCompare(b.name))
                      .map(s => (
                        <option key={s.id} value={s.name.toLowerCase()}>{s.name}</option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="students">Sort by Students</option>
              <option value="updated">Sort by Updated</option>
            </select>

            <div className="flex items-center p-1 bg-gray-100 rounded-lg dark:bg-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="space-y-6">
        {sortedCourses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg shadow dark:bg-gray-800">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No courses found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedCourses.map((course) => (
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

export default Courses;
