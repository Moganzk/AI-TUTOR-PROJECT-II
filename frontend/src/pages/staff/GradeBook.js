import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  FileText,
  Edit,
  MessageSquare,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Target,
  BarChart3,
  PieChart,
  User,
  Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const GradeBook = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('overview');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Data will be loaded from API
  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: 1, name: 'Python Programming' },
    { id: 2, name: 'Advanced Mathematics' },
    { id: 3, name: 'Web Development' },
    { id: 4, name: 'Database Systems' }
  ];

  const assignments = [
    { id: 'all', name: 'All Assignments' },
    { id: 1, name: 'Python Functions Assignment', course: 'Python Programming', maxPoints: 100, dueDate: '2024-01-20' },
    { id: 2, name: 'Calculus Problem Set', course: 'Advanced Mathematics', maxPoints: 150, dueDate: '2024-01-25' },
    { id: 3, name: 'HTML/CSS Project', course: 'Web Development', maxPoints: 200, dueDate: '2024-01-30' },
    { id: 4, name: 'Database Design Quiz', course: 'Database Systems', maxPoints: 50, dueDate: '2024-01-15' }
  ];

  const submissions = [
    {
      id: 1,
      studentName: 'Alice Johnson',
      studentEmail: 'alice@example.com',
      studentId: 'S001',
      assignmentId: 1,
      assignmentName: 'Python Functions Assignment',
      course: 'Python Programming',
      submittedDate: '2024-01-18',
      grade: 85,
      maxPoints: 100,
      status: 'graded',
      feedback: 'Great work on the function implementation. Consider adding more error handling.',
      rubricScores: {
        functionality: 20,
        codeQuality: 18,
        documentation: 15,
        creativity: 12
      },
      attachments: ['assignment1.py', 'readme.txt']
    },
    {
      id: 2,
      studentName: 'Bob Smith',
      studentEmail: 'bob@example.com',
      studentId: 'S002',
      assignmentId: 2,
      assignmentName: 'Calculus Problem Set',
      course: 'Advanced Mathematics',
      submittedDate: '2024-01-24',
      grade: null,
      maxPoints: 150,
      status: 'pending',
      feedback: '',
      rubricScores: {},
      attachments: ['solutions.pdf']
    },
    {
      id: 3,
      studentName: 'Carol Davis',
      studentEmail: 'carol@example.com',
      studentId: 'S003',
      assignmentId: 3,
      assignmentName: 'HTML/CSS Project',
      course: 'Web Development',
      submittedDate: '2024-01-29',
      grade: 92,
      maxPoints: 200,
      status: 'graded',
      feedback: 'Excellent responsive design and clean code structure.',
      rubricScores: {
        htmlStructure: 25,
        cssDesign: 23,
        responsiveness: 24,
        functionality: 20
      },
      attachments: ['project.zip', 'screenshots.pdf']
    },
    {
      id: 4,
      studentName: 'David Wilson',
      studentEmail: 'david@example.com',
      studentId: 'S004',
      assignmentId: 4,
      assignmentName: 'Database Design Quiz',
      course: 'Database Systems',
      submittedDate: '2024-01-14',
      grade: 48,
      maxPoints: 50,
      status: 'graded',
      feedback: 'Good understanding of normalization concepts.',
      rubricScores: {
        theory: 24,
        application: 24
      },
      attachments: []
    }
  ];

  const studentGrades = [
    {
      studentId: 'S001',
      studentName: 'Alice Johnson',
      course: 'Python Programming',
      assignments: [
        { name: 'Functions Assignment', grade: 85, maxPoints: 100 },
        { name: 'Classes Quiz', grade: 92, maxPoints: 50 },
        { name: 'Final Project', grade: null, maxPoints: 200 }
      ],
      overallGrade: 88.5,
      attendance: 95,
      participation: 90
    },
    {
      studentId: 'S002',
      studentName: 'Bob Smith',
      course: 'Web Development',
      assignments: [
        { name: 'HTML Project', grade: 78, maxPoints: 100 },
        { name: 'CSS Layout', grade: 85, maxPoints: 100 },
        { name: 'JavaScript Quiz', grade: 72, maxPoints: 50 }
      ],
      overallGrade: 78.4,
      attendance: 87,
      participation: 75
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'late':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getGradeColor = (grade, maxPoints) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.assignmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || 
                         submission.course === courses.find(c => c.id === parseInt(selectedCourse))?.name;
    const matchesAssignment = selectedAssignment === 'all' || 
                            submission.assignmentId === parseInt(selectedAssignment);
    return matchesSearch && matchesCourse && matchesAssignment;
  });

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowGradeModal(true);
  };

  const handleSaveGrade = () => {
    toast.success('Grade saved successfully');
    setShowGradeModal(false);
    setSelectedSubmission(null);
  };

  const handleSendFeedback = (submissionId) => {
    toast.success('Feedback sent to student');
  };

  const handleExportGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Create CSV data
      const csvData = [
        ['Student', 'Assignment', 'Grade', 'Status', 'Submitted Date', 'Graded Date'],
        ...submissions.map(sub => [
          sub.student_name || 'Unknown',
          sub.assignment_title || 'Unknown',
          sub.grade || 'Not graded',
          sub.status || 'Unknown',
          sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'N/A',
          sub.graded_at ? new Date(sub.graded_at).toLocaleDateString() : 'N/A'
        ])
      ];

      // Convert to CSV string
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gradebook_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Grades exported successfully! 📊');
    } catch (error) {
      console.error('Error exporting grades:', error);
      toast.error('Failed to export grades');
    }
  };

  const handleBulkGrade = () => {
    toast.success('Bulk grading initiated');
  };

  const gradeStats = {
    totalSubmissions: submissions.length,
    gradedSubmissions: submissions.filter(s => s.status === 'graded').length,
    pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
    averageGrade: submissions.filter(s => s.grade !== null).reduce((acc, s) => acc + (s.grade / s.maxPoints) * 100, 0) / submissions.filter(s => s.grade !== null).length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Grade Book
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage student grades, assignments, and provide feedback
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportGrades}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
            <button
              onClick={handleBulkGrade}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Edit className="h-5 w-5" />
              <span>Bulk Grade</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {gradeStats.totalSubmissions}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graded</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {gradeStats.gradedSubmissions}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {gradeStats.pendingSubmissions}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Grade</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {gradeStats.averageGrade.toFixed(1)}%
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedView === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('submissions')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedView === 'submissions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => setSelectedView('gradebook')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedView === 'gradebook'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Grade Book
          </button>
        </div>
      </div>

      {selectedView === 'submissions' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search submissions..."
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
                
                <select
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {assignments.map(assignment => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Grade
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
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {submission.studentName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {submission.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {submission.assignmentName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {submission.course}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {submission.submittedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.grade !== null ? (
                          <div className={`text-sm font-medium ${getGradeColor(submission.grade, submission.maxPoints)}`}>
                            {submission.grade}/{submission.maxPoints}
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round((submission.grade / submission.maxPoints) * 100)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Not graded
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleGradeSubmission(submission)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSendFeedback(submission.id)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toast.success('Downloading submission')}
                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedView === 'gradebook' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Overall Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {studentGrades.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.studentName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.studentId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {student.course}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getGradeColor(student.overallGrade, 100)}`}>
                        {student.overallGrade}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {student.attendance}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toast.success('Viewing detailed grades')}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toast.success('Sending grade report')}
                          className="text-green-600 hover:text-green-700 dark:text-green-400"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Grade Submission
                </h2>
                <button
                  onClick={() => setShowGradeModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student: {selectedSubmission.studentName}
                  </label>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assignment: {selectedSubmission.assignmentName}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grade (out of {selectedSubmission.maxPoints})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedSubmission.maxPoints}
                    defaultValue={selectedSubmission.grade || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Feedback
                  </label>
                  <textarea
                    rows={4}
                    defaultValue={selectedSubmission.feedback}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowGradeModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGrade}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save Grade
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeBook;
