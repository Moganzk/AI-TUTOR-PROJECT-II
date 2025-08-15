import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { 
  Users, 
  Activity, 
  Clock, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  Search,
  Download,
  Eye,
  User,
  Award,
  RefreshCw,
  X
} from 'lucide-react';

const StudentActivityPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('7d');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    fetchActivityData();
  }, [timeFilter]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchActivityData();
      }, 30000); // Refresh every 30 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, timeFilter]);

  const fetchStudents = async () => {
    try {
      const { data } = await apiService.staff.students();
      if (data.success && data.students) setStudents(data.students);
    } catch (e) {
      console.error('Error fetching students', e);
      toast.error('Error fetching students');
    }
  };

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      // Placeholder: backend endpoint maybe /api/admin/student-activity; reuse direct call through apiService.get
      const { data } = await apiService.get(`/api/admin/student-activity`, { period: timeFilter });
      if (data.success && data.activities) setActivityData(data.activities); else setActivityData([]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setActivityData([]);
    } finally { setLoading(false); }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const { data } = await apiService.staff.studentDetail(studentId);
      if (data.success && data.student) { setSelectedStudent(data.student); setShowDetailsModal(true);} else toast.error('Failed to fetch student details');
    } catch (e) { console.error('Error fetching student details', e); toast.error('Error fetching student details'); }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'chat_session':
        return MessageSquare;
      case 'assignment_submission':
        return BookOpen;
      case 'course_enrollment':
        return Award;
      case 'login':
        return User;
      case 'quiz_completion':
        return Target;
      default:
        return Activity;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'chat_session':
        return 'bg-blue-500';
      case 'assignment_submission':
        return 'bg-green-500';
      case 'course_enrollment':
        return 'bg-purple-500';
      case 'login':
        return 'bg-gray-500';
      case 'quiz_completion':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
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

  const filteredActivities = activityData.filter(activity => {
    if (!activity) return false;
    
    const studentName = activity.student_name || '';
    const description = activity.description || '';
    const subject = activity.subject || '';
    
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           subject.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const exportActivityData = () => {
    if (filteredActivities.length === 0) {
      toast.error('No activity data to export');
      return;
    }

    try {
      const csvContent = [
        ['Student Name', 'Activity Type', 'Description', 'Subject', 'Timestamp', 'Duration (min)', 'Grade'].join(','),
        ...filteredActivities.map(activity => [
          `"${activity.student_name}"`,
          `"${activity.activity_type}"`,
          `"${activity.description}"`,
          `"${activity.subject || ''}"`,
          `"${new Date(activity.timestamp).toLocaleString()}"`,
          activity.duration || '',
          activity.grade || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student_activity_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Activity data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export activity data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading('Refreshing activity data...', { id: 'refresh' });
    try {
      await Promise.all([fetchActivityData(), fetchStudents()]);
      toast.success('Activity data refreshed successfully', { id: 'refresh' });
    } catch (error) {
      toast.error('Failed to refresh data', { id: 'refresh' });
    } finally {
      setRefreshing(false);
    }
  };

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
          <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
            <Activity className="w-8 h-8 mr-3" />
            Student Activity Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and track student engagement and progress
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              id="auto-refresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-600 dark:text-gray-400">
              Auto-refresh (30s)
            </label>
          </div>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={exportActivityData}
            disabled={filteredActivities.length === 0}
            className="flex items-center px-4 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {filteredActivities.length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {new Set(filteredActivities.map(a => a.student_id)).size}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chat Sessions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {filteredActivities.filter(a => a.activity_type === 'chat_session').length}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignments</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {filteredActivities.filter(a => a.activity_type === 'assignment_submission').length}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            {autoRefresh && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Live updates enabled</span>
              </div>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredActivities.length} activities found
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity Timeline
        </h3>
        <div className="space-y-4">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => {
              const Icon = getActivityIcon(activity.activity_type);
              return (
                <div key={activity.id} className="flex items-start p-4 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {activity.student_name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {getTimeAgo(activity.timestamp)}
                        </span>
                        <button
                          onClick={() => fetchStudentDetails(activity.student_id)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      {activity.subject && (
                        <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                          {activity.subject}
                        </span>
                      )}
                      {activity.duration && (
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.duration} min
                        </span>
                      )}
                      {activity.grade && (
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Award className="w-3 h-3 mr-1" />
                          {activity.grade}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No activities found for the selected period
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Student Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full dark:bg-gray-700">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Progress</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {selectedStudent.progress}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">Assignments</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {selectedStudent.completedAssignments}/{selectedStudent.totalAssignments}
                        </p>
                      </div>
                      <BookOpen className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recent Activity
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last activity: {selectedStudent.lastActivity}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Average grade: {selectedStudent.averageGrade}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
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

export default StudentActivityPage;