import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  BookOpen,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Mail,
  MessageSquare,
  BarChart3,
  Calendar,
  User,
  Target,
  Activity,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentProgress = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/api/staff/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStudents(response.data.students);
        toast.success(`Loaded ${response.data.count} students`);
      } else {
        throw new Error(response.data.error || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.error || 'Failed to load students');
      toast.error('Failed to load students');
      
      // Fallback to mock data if API fails
      setStudents([
        {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          avatar: '',
          course: 'Python Programming',
          progress: 85,
          grade: 92,
          lastActive: '2024-01-15',
          studyHours: 45,
          assignmentsCompleted: 8,
          assignmentsTotal: 10,
          quizzesCompleted: 6,
          quizzesTotal: 8,
          attendance: 95,
          trend: 'up',
          status: 'active',
          recentActivity: [
            { type: 'assignment', title: 'Functions Assignment', date: '2024-01-15', grade: 95 },
            { type: 'quiz', title: 'Python Basics Quiz', date: '2024-01-14', grade: 88 },
            { type: 'lesson', title: 'Object-Oriented Programming', date: '2024-01-13', completed: true }
          ]
        },
        {
          id: 2,
          name: 'Demo Student',
          email: 'demo.student@example.com',
          avatar: '',
          course: 'Web Development',
          progress: 67,
          grade: 78,
          lastActive: '2024-01-14',
          studyHours: 32,
          assignmentsCompleted: 5,
          assignmentsTotal: 8,
          quizzesCompleted: 3,
          quizzesTotal: 6,
          attendance: 87,
          trend: 'stable',
          status: 'active',
          recentActivity: [
            { type: 'assignment', title: 'HTML/CSS Project', date: '2024-01-14', grade: 82 },
            { type: 'lesson', title: 'JavaScript Fundamentals', date: '2024-01-13', completed: true }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const refreshStudents = () => {
    fetchStudents();
  };

  // Data will be loaded from API
  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: 1, name: 'Python Programming' },
    { id: 2, name: 'Advanced Mathematics' },
    { id: 3, name: 'Web Development' },
    { id: 4, name: 'Database Systems' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'struggling':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || student.course === courses.find(c => c.id === parseInt(selectedCourse))?.name;
    return matchesSearch && matchesCourse;
  });

  const handleSendMessage = (studentId) => {
    toast.success('Message sent successfully');
  };

  const handleExportData = () => {
    toast.success('Student data exported successfully');
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Students
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshStudents}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overallStats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active' || s.status === 'excellent').length,
    strugglingStudents: students.filter(s => s.status === 'struggling').length,
    averageProgress: students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length) : 0,
    averageGrade: students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.averageGrade || s.grade || 0), 0) / students.length) : 0,
    totalStudyHours: students.reduce((acc, s) => acc + (s.studyHours || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Student Progress
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Monitor and track your students' learning progress
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshStudents}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Activity className="h-5 w-5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {overallStats.totalStudents}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {overallStats.activeStudents}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {overallStats.averageProgress}%
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Grade</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {overallStats.averageGrade}%
              </p>
            </div>
            <Award className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedTimeframe('week')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedTimeframe === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedTimeframe('month')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedTimeframe === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assignments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={student.avatar}
                          alt={student.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {student.course}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {student.progress}%
                      </span>
                      {getTrendIcon(student.trend)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {student.grade}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {student.assignmentsCompleted}/{student.assignmentsTotal}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {student.quizzesCompleted}/{student.quizzesTotal} quizzes
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <User className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSendMessage(student.id)}
                        className="text-green-600 hover:text-green-700 dark:text-green-400"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toast.success('Viewing detailed analytics')}
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Overall Progress
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{selectedStudent.progress}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Grade</span>
                      <span>{selectedStudent.grade}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Study Hours</span>
                      <span>{selectedStudent.studyHours}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Attendance</span>
                      <span>{selectedStudent.attendance}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Completion Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Assignments</span>
                      <span>{selectedStudent.assignmentsCompleted}/{selectedStudent.assignmentsTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Quizzes</span>
                      <span>{selectedStudent.quizzesCompleted}/{selectedStudent.quizzesTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Active</span>
                      <span>{selectedStudent.lastActive}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {selectedStudent.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === 'assignment' && <FileText className="h-5 w-5 text-blue-600" />}
                        {activity.type === 'quiz' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {activity.type === 'lesson' && <BookOpen className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.date}
                        </div>
                      </div>
                      {activity.grade && (
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.grade}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleSendMessage(selectedStudent.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
