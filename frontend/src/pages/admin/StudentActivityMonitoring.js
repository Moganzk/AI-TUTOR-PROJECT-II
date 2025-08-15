import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Activity, 
  Users, 
  Clock, 
  BookOpen,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  Target,
  Award,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const StudentActivityMonitoring = () => {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Data will be loaded from API
  const activityData = {
    overview: {
      totalStudents: 127,
      activeStudents: 98,
      averageStudyTime: 3.2,
      completionRate: 78,
      loginRate: 85,
      engagementScore: 82
    },
    trends: {
      studyHours: [
        { day: 'Mon', hours: 4.2 },
        { day: 'Tue', hours: 3.8 },
        { day: 'Wed', hours: 4.5 },
        { day: 'Thu', hours: 3.9 },
        { day: 'Fri', hours: 4.1 },
        { day: 'Sat', hours: 2.8 },
        { day: 'Sun', hours: 3.2 }
      ],
      engagement: [
        { day: 'Mon', score: 85 },
        { day: 'Tue', score: 78 },
        { day: 'Wed', score: 92 },
        { day: 'Thu', score: 88 },
        { day: 'Fri', score: 81 },
        { day: 'Sat', score: 70 },
        { day: 'Sun', score: 75 }
      ]
    },
    courseActivity: [
      {
        course: 'Python Programming',
        students: 45,
        avgStudyTime: 4.2,
        completionRate: 85,
        engagementScore: 88,
        trend: 'up'
      },
      {
        course: 'Web Development',
        students: 38,
        avgStudyTime: 3.8,
        completionRate: 72,
        engagementScore: 79,
        trend: 'stable'
      },
      {
        course: 'Database Systems',
        students: 28,
        avgStudyTime: 3.2,
        completionRate: 68,
        engagementScore: 75,
        trend: 'down'
      },
      {
        course: 'Advanced Mathematics',
        students: 32,
        avgStudyTime: 2.8,
        completionRate: 62,
        engagementScore: 71,
        trend: 'up'
      }
    ],
    studentActivity: [
      {
        id: 1,
        name: 'Alice Johnson',
        course: 'Python Programming',
        lastActive: '2024-01-15 14:30',
        studyTime: 5.2,
        loginFrequency: 12,
        completionRate: 92,
        engagementScore: 95,
        status: 'highly_active',
        trend: 'up'
      },
      {
        id: 2,
        name: 'Bob Smith',
        course: 'Web Development',
        lastActive: '2024-01-15 10:15',
        studyTime: 3.8,
        loginFrequency: 8,
        completionRate: 78,
        engagementScore: 82,
        status: 'active',
        trend: 'stable'
      },
      {
        id: 3,
        name: 'Carol Davis',
        course: 'Database Systems',
        lastActive: '2024-01-12 16:45',
        studyTime: 1.2,
        loginFrequency: 3,
        completionRate: 45,
        engagementScore: 58,
        status: 'at_risk',
        trend: 'down'
      },
      {
        id: 4,
        name: 'David Wilson',
        course: 'Advanced Mathematics',
        lastActive: '2024-01-15 09:20',
        studyTime: 4.5,
        loginFrequency: 10,
        completionRate: 88,
        engagementScore: 90,
        status: 'highly_active',
        trend: 'up'
      }
    ]
  };

  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: 'python', name: 'Python Programming' },
    { id: 'web', name: 'Web Development' },
    { id: 'database', name: 'Database Systems' },
    { id: 'math', name: 'Advanced Mathematics' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'highly_active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'at_risk':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
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

  const getEngagementColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredStudents = activityData.studentActivity.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || 
                         student.course.toLowerCase().includes(selectedCourse.toLowerCase());
    return matchesSearch && matchesCourse;
  });

  const handleExportData = () => {
    console.log('Exporting activity data...');
  };

  const handleRefreshData = () => {
    console.log('Refreshing data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Student Activity Monitoring
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Monitor student engagement and learning activity in real-time
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshData}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activityData.overview.totalStudents}
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
                {activityData.overview.activeStudents}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Study Time</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activityData.overview.averageStudyTime}h
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activityData.overview.completionRate}%
              </p>
            </div>
            <Target className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Login Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activityData.overview.loginRate}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activityData.overview.engagementScore}%
              </p>
            </div>
            <Award className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Trends
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedTimeframe('day')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedTimeframe === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Today
            </button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Daily Study Hours
            </h3>
            <div className="space-y-2">
              {activityData.trends.studyHours.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {day.day}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(day.hours / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {day.hours}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Daily Engagement Score
            </h3>
            <div className="space-y-2">
              {activityData.trends.engagement.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {day.day}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${day.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {day.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Course Activity
        </h2>
        
        <div className="space-y-4">
          {activityData.courseActivity.map((course, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.course}
                  </span>
                  {getTrendIcon(course.trend)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {course.students} students
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {course.avgStudyTime}h
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Avg Study Time
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {course.completionRate}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Completion Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getEngagementColor(course.engagementScore)}`}>
                    {course.engagementScore}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Engagement Score
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Activity Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Individual Student Activity
          </h2>
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
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Study Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.course}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {student.studyTime}h
                      </span>
                      {getTrendIcon(student.trend)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {student.completionRate}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getEngagementColor(student.engagementScore)}`}>
                      {student.engagementScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                      {student.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentActivityMonitoring;
