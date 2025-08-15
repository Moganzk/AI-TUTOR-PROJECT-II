import React, { useState } from 'react';
import apiService from '../../services/api';
import InteractiveAssignmentViewer from '../../components/InteractiveAssignmentViewer';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  User,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Assignments = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);

  React.useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await apiService.assignments.getAssignments();
        let rawAssignments = [];
        if (data.success && Array.isArray(data.assignments)) {
          rawAssignments = data.assignments;
        } else if (Array.isArray(data)) {
          rawAssignments = data;
        }
        const mappedAssignments = rawAssignments.map(a => ({
          id: a.id || a.assignment_id,
          title: a.title || a.name || 'Untitled',
          course: a.course_title || a.course || a.course_name || '',
          description: a.description || a.details || '',
          dueDate: a.due_date || a.dueDate || '',
          submittedDate: a.submitted_date || a.submittedDate || null,
          status: a.status || 'pending',
          grade: typeof a.grade === 'number' ? a.grade : (a.grade || null),
          maxGrade: a.max_grade || a.maxGrade || 100,
          feedback: a.feedback || '',
          attachments: Array.isArray(a.attachments) ? a.attachments : [],
          type: a.type || a.assignment_type || 'assignment',
        }));
        setAssignments(mappedAssignments);
      } catch (err) {
        toast.error('Error loading assignments');
        setAssignments([]);
      }
    };
    fetchAssignments();
  }, [user]);

  const openAssignmentModal = (assignment) => {
    setActiveAssignment(assignment);
    setShowModal(true);
  };

  const closeAssignmentModal = () => {
    setShowModal(false);
    setActiveAssignment(null);
  };

  const handleSubmissionComplete = () => {
    closeAssignmentModal();
    // Optionally refresh assignments after submission
    // fetchAssignments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'graded':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-4 h-4" />;
      case 'graded':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'overdue':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === 'all' || assignment.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const handleSubmitAssignment = async (assignmentId) => {
    try {
      // You can add file upload or answer submission here if needed
  const { data } = await apiService.assignments.submitAssignment(assignmentId, {});
      if (data.success) {
        toast.success('Assignment submitted successfully!');
        // Optionally refresh assignments after submission
        // fetchAssignments();
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch (err) {
      toast.error('Error submitting assignment');
    }
  };

  const handleDownloadFile = (filename) => {
    toast.success(`Downloading ${filename}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Assignments
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Track your assignments, submissions, and grades
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graded</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.filter(a => a.status === 'graded').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Grade</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(assignments.filter(a => a.grade).reduce((acc, a) => acc + a.grade, 0) / assignments.filter(a => a.grade).length)}%
              </p>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedTab('graded')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedTab === 'graded'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Graded
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
              <option value="course">Course</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2 space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {assignment.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(assignment.status)}`}>
                    {getStatusIcon(assignment.status)}
                    <span className="capitalize">{assignment.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div className="flex items-center mb-2 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{assignment.course}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                  {assignment.submittedDate && (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Submitted: {assignment.submittedDate}</span>
                    </div>
                  )}
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  {assignment.description}
                </p>
                {assignment.attachments.length > 0 && (
                  <div className="flex items-center mb-4 space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Attachments:</span>
                    {assignment.attachments.map((file, index) => (
                      <button
                        key={index}
                        onClick={() => handleDownloadFile(file)}
                        className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Download className="w-3 h-3" />
                        <span>{file}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="ml-6 text-right">
                {assignment.grade !== null && (
                  <div className="mb-2">
                    <span className={`text-2xl font-bold ${getGradeColor(assignment.grade, assignment.maxGrade)}`}>
                      {assignment.grade}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      /{assignment.maxGrade}
                    </span>
                  </div>
                )}
                {assignment.status === 'pending' && (
                  <button
                    onClick={() => openAssignmentModal(assignment)}
                    className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Open</span>
                  </button>
                )}
              </div>
            </div>
            {assignment.feedback && (
              <div className="p-4 mt-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-start space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="mb-1 font-medium text-gray-900 dark:text-white">
                      Instructor Feedback
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {assignment.feedback}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Assignment Modal */}
      {showModal && activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative flex items-center justify-center w-full h-full">
            <div className="absolute z-10 top-4 right-4">
              <button
                onClick={closeAssignmentModal}
                className="px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
            <div className="w-full h-full max-w-5xl p-6 mx-auto overflow-y-auto bg-white rounded-lg shadow-lg dark:bg-gray-900">
              <InteractiveAssignmentViewer
                assignment={activeAssignment}
                onSubmissionComplete={handleSubmissionComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
