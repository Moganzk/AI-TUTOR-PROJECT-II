import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import InteractiveAssignmentViewer from '../../components/InteractiveAssignmentViewer';
import apiService from '../../services/api';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Star,
  Award,
  User,
  BookOpen,
  Send,
  MessageSquare,
  Flag,
  Target,
  TrendingUp,
  BarChart3,
  Play
} from 'lucide-react';

const AssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAssignmentViewer, setShowAssignmentViewer] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.assignments.getAssignments();
      setAssignments(data.assignments || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    try {
      await apiService.assignments.submitAssignment(assignmentId, { content: submissionText });
      loadAssignments();
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSubmissionFile(file);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || assignment.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'submitted': return 'Submitted';
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'homework': return <FileText className="w-5 h-5" />;
      case 'quiz': return <Target className="w-5 h-5" />;
      case 'lab_report': return <BarChart3 className="w-5 h-5" />;
      case 'essay': return <Edit className="w-5 h-5" />;
      case 'programming': return <BookOpen className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'hard': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'urgent': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tabs = [
    { id: 'all', label: 'All', count: assignments.length },
    { id: 'pending', label: 'Pending', count: assignments.filter(a => a.status === 'pending').length },
    { id: 'in_progress', label: 'In Progress', count: assignments.filter(a => a.status === 'in_progress').length },
    { id: 'submitted', label: 'Submitted', count: assignments.filter(a => a.status === 'submitted').length },
    { id: 'completed', label: 'Completed', count: assignments.filter(a => a.status === 'completed').length },
    { id: 'overdue', label: 'Overdue', count: assignments.filter(a => a.status === 'overdue').length }
  ];

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
            <FileText className="w-8 h-8 mr-3" />
            Assignments & Quizzes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your assignments and track your progress
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assignments</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{assignments.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Grade</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(assignments.filter(a => a.grade !== null).reduce((sum, a) => sum + (a.grade / a.maxPoints * 100), 0) / assignments.filter(a => a.grade !== null).length) || 0}%
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          {/* Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assignments..."
                className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1 space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(assignment.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center mb-2 space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assignment.title}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {getStatusText(assignment.status)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority}
                    </span>
                  </div>
                  
                  <p className="mb-3 text-gray-600 dark:text-gray-400">
                    {assignment.description}
                  </p>
                  
                  <div className="flex items-center mb-3 space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {assignment.course}
                    </span>
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {assignment.instructor}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(assignment.estimatedTime)}
                    </span>
                    <span className={`flex items-center ${getDifficultyColor(assignment.difficulty)}`}>
                      <Flag className="w-4 h-4 mr-1" />
                      {assignment.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Due: {formatDate(assignment.dueDate)}
                    </span>
                    <span className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      {assignment.points}/{assignment.maxPoints} points
                    </span>
                    {assignment.attempts > 0 && (
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {assignment.attempts}/{assignment.maxAttempts} attempts
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {assignment.status === 'pending' || assignment.status === 'in_progress' ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowAssignmentViewer(true);
                      }}
                      className="flex items-center px-4 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <Play className="w-4 h-4" />
                      <span>Take Assignment</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmissionModal(true);
                      }}
                      className="flex items-center px-4 py-2 space-x-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Send className="w-4 h-4" />
                      <span>Quick Submit</span>
                    </button>
                  </>
                ) : assignment.status === 'submitted' ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Submitted {formatDate(assignment.submission.submittedAt)}
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ) : assignment.status === 'completed' ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {assignment.grade}/{assignment.maxPoints} ({Math.round(assignment.grade / assignment.maxPoints * 100)}%)
                    </span>
                    <Award className="w-5 h-5 text-green-500" />
                  </div>
                ) : assignment.status === 'overdue' ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {Math.abs(getDaysUntilDue(assignment.dueDate))} days overdue
                    </span>
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                ) : null}
              </div>
            </div>
            
            {assignment.attachments.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Attachments:</h4>
                <div className="flex flex-wrap gap-2">
                  {assignment.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center px-3 py-1 space-x-2 bg-gray-100 rounded-lg dark:bg-gray-700">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{attachment.name}</span>
                      <span className="text-xs text-gray-500">({attachment.size})</span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {assignment.feedback && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Feedback:</h4>
                <p className="p-3 text-sm text-gray-600 rounded-lg dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20">
                  {assignment.feedback}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Assignment Viewer Modal */}
      {showAssignmentViewer && selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-gray-900">
          <div className="min-h-screen">
            {/* Header with close button */}
            <div className="sticky top-0 z-10 px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Assignment: {selectedAssignment.title}
                </h2>
                <button
                  onClick={() => {
                    setShowAssignmentViewer(false);
                    setSelectedAssignment(null);
                  }}
                  className="p-2 text-gray-500 rounded-lg hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Assignment Viewer Content */}
            <div className="p-6">
              <InteractiveAssignmentViewer
                assignment={{
                  id: selectedAssignment.id,
                  title: selectedAssignment.title,
                  description: selectedAssignment.description,
                  instructions: selectedAssignment.instructions || 'Complete all questions and submit your assignment.',
                  due_date: selectedAssignment.dueDate,
                  max_points: selectedAssignment.maxPoints,
                  points_possible: selectedAssignment.maxPoints
                }}
                onSubmissionComplete={(submission) => {
                  // Handle successful submission
                  setShowAssignmentViewer(false);
                  setSelectedAssignment(null);
                  // Refresh assignments to show updated status
                  loadAssignments();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Submission Modal */}
      {showSubmissionModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Submit: {selectedAssignment.title}
            </h3>
            
            <div className="p-4 mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This is a quick submission option for text-based assignments. 
                For assignments with questions, use the "Take Assignment" button for the full interactive experience.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Comments/Notes
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add any comments or notes about your submission..."
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {submissionFile && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {submissionFile.name} ({Math.round(submissionFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowSubmissionModal(false);
                  setSubmissionText('');
                  setSubmissionFile(null);
                  setSelectedAssignment(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitAssignment(selectedAssignment.id)}
                className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                <span>Submit Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="py-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No assignments found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'No assignments match the selected filter'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
