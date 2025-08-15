import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Users,
  Target,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Settings,
  Send,
  MessageSquare,
  GraduationCap,
  BookOpen,
  PenTool,
  Clipboard,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Flag,
  Mail,
  Phone,
  User,
  Link,
  Save,
  X
} from 'lucide-react';

const AssignmentManagementPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    submissions: true,
    grading: true,
    analytics: true
  });

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    course: '',
    type: 'essay',
    maxPoints: 100,
    dueDate: '',
    allowLateSubmissions: true,
    latePenalty: 10,
    attempts: 1,
    instructions: '',
    rubric: [],
    attachments: [],
    visibility: 'published',
    groupAssignment: false,
    requiresReview: false
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [extensionModal, setExtensionModal] = useState(false);
  const [extensionData, setExtensionData] = useState({ assignmentId: null, student_id: '', extra_days: 1 });
  const [analyticsData, setAnalyticsData] = useState({});
  const [validationResult, setValidationResult] = useState(null);

  const assignmentTypes = [
    { id: 'essay', name: 'Essay', icon: FileText },
    { id: 'quiz', name: 'Quiz', icon: Target },
    { id: 'project', name: 'Project', icon: Clipboard },
    { id: 'presentation', name: 'Presentation', icon: GraduationCap },
    { id: 'lab', name: 'Lab Report', icon: BookOpen },
    { id: 'homework', name: 'Homework', icon: PenTool },
    { id: 'exam', name: 'Exam', icon: Award },
    { id: 'discussion', name: 'Discussion', icon: MessageSquare }
  ];

  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: 'math', name: 'Mathematics' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'biology', name: 'Biology' },
    { id: 'history', name: 'History' }
  ];

  const filters = [
    { id: 'all', name: 'All Assignments' },
    { id: 'published', name: 'Published' },
    { id: 'draft', name: 'Draft' },
    { id: 'active', name: 'Active' },
    { id: 'overdue', name: 'Overdue' },
    { id: 'completed', name: 'Completed' }
  ];

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setAssignments([
          {
            id: 1,
            title: 'Calculus Integration Problems',
            description: 'Solve the integration problems from Chapter 7',
            course: 'math',
            courseName: 'Mathematics',
            type: 'homework',
            maxPoints: 100,
            dueDate: '2024-02-15T23:59:00Z',
            createdDate: '2024-01-20T10:00:00Z',
            allowLateSubmissions: true,
            latePenalty: 10,
            attempts: 2,
            instructions: 'Complete all problems showing your work. Use proper mathematical notation.',
            rubric: [
              { criteria: 'Correctness', points: 40, description: 'Correct answers with proper steps' },
              { criteria: 'Clarity', points: 30, description: 'Clear mathematical notation and explanations' },
              { criteria: 'Completeness', points: 30, description: 'All problems attempted' }
            ],
            attachments: [
              { name: 'problem_set.pdf', size: '2.3 MB', type: 'pdf' },
              { name: 'formula_sheet.pdf', size: '1.1 MB', type: 'pdf' }
            ],
            visibility: 'published',
            status: 'active',
            groupAssignment: false,
            requiresReview: false,
            totalStudents: 45,
            submissions: 32,
            graded: 18,
            pending: 14,
            averageGrade: 82.5,
            submissionRate: 71,
            onTimeSubmissions: 28,
            lateSubmissions: 4
          },
          {
            id: 2,
            title: 'Physics Lab Report: Momentum Conservation',
            description: 'Write a comprehensive lab report on momentum conservation experiment',
            course: 'physics',
            courseName: 'Physics',
            type: 'lab',
            maxPoints: 150,
            dueDate: '2024-02-20T23:59:00Z',
            createdDate: '2024-01-18T14:00:00Z',
            allowLateSubmissions: true,
            latePenalty: 15,
            attempts: 1,
            instructions: 'Follow the standard lab report format. Include hypothesis, methodology, results, and conclusion.',
            rubric: [
              { criteria: 'Hypothesis', points: 20, description: 'Clear and testable hypothesis' },
              { criteria: 'Methodology', points: 40, description: 'Detailed experimental procedure' },
              { criteria: 'Results', points: 50, description: 'Accurate data presentation and analysis' },
              { criteria: 'Conclusion', points: 40, description: 'Logical conclusions supported by data' }
            ],
            attachments: [
              { name: 'lab_instructions.pdf', size: '1.8 MB', type: 'pdf' },
              { name: 'data_template.xlsx', size: '45 KB', type: 'excel' }
            ],
            visibility: 'published',
            status: 'active',
            groupAssignment: true,
            requiresReview: true,
            totalStudents: 32,
            submissions: 24,
            graded: 12,
            pending: 12,
            averageGrade: 87.3,
            submissionRate: 75,
            onTimeSubmissions: 20,
            lateSubmissions: 4
          },
          {
            id: 3,
            title: 'Chemistry Quiz: Organic Reactions',
            description: 'Multiple choice quiz on organic chemistry reactions',
            course: 'chemistry',
            courseName: 'Chemistry',
            type: 'quiz',
            maxPoints: 50,
            dueDate: '2024-01-30T23:59:00Z',
            createdDate: '2024-01-25T11:30:00Z',
            allowLateSubmissions: false,
            latePenalty: 0,
            attempts: 1,
            instructions: 'Answer all questions. You have 45 minutes to complete the quiz.',
            rubric: [
              { criteria: 'Accuracy', points: 50, description: 'Correct answers to all questions' }
            ],
            attachments: [],
            visibility: 'draft',
            status: 'draft',
            groupAssignment: false,
            requiresReview: false,
            totalStudents: 38,
            submissions: 0,
            graded: 0,
            pending: 0,
            averageGrade: 0,
            submissionRate: 0,
            onTimeSubmissions: 0,
            lateSubmissions: 0
          },
          {
            id: 4,
            title: 'History Essay: World War II Analysis',
            description: 'Write an analytical essay on the causes and consequences of World War II',
            course: 'history',
            courseName: 'History',
            type: 'essay',
            maxPoints: 200,
            dueDate: '2024-01-25T23:59:00Z',
            createdDate: '2024-01-10T16:45:00Z',
            allowLateSubmissions: true,
            latePenalty: 20,
            attempts: 1,
            instructions: 'Write a 1500-word essay analyzing the causes and consequences of World War II.',
            rubric: [
              { criteria: 'Thesis', points: 40, description: 'Clear and arguable thesis statement' },
              { criteria: 'Evidence', points: 80, description: 'Strong evidence and examples' },
              { criteria: 'Analysis', points: 50, description: 'Thoughtful analysis and interpretation' },
              { criteria: 'Writing', points: 30, description: 'Clear writing and proper citations' }
            ],
            attachments: [
              { name: 'essay_guidelines.pdf', size: '890 KB', type: 'pdf' },
              { name: 'sources.pdf', size: '3.2 MB', type: 'pdf' }
            ],
            visibility: 'published',
            status: 'overdue',
            groupAssignment: false,
            requiresReview: true,
            totalStudents: 28,
            submissions: 26,
            graded: 22,
            pending: 4,
            averageGrade: 78.9,
            submissionRate: 93,
            onTimeSubmissions: 21,
            lateSubmissions: 5
          },
          {
            id: 5,
            title: 'Biology Project: Ecosystem Study',
            description: 'Group project studying local ecosystem biodiversity',
            course: 'biology',
            courseName: 'Biology',
            type: 'project',
            maxPoints: 300,
            dueDate: '2024-03-01T23:59:00Z',
            createdDate: '2024-01-15T13:20:00Z',
            allowLateSubmissions: true,
            latePenalty: 25,
            attempts: 1,
            instructions: 'Work in groups of 3-4 to study a local ecosystem. Present findings in a comprehensive report.',
            rubric: [
              { criteria: 'Research', points: 80, description: 'Thorough research and data collection' },
              { criteria: 'Analysis', points: 100, description: 'Detailed analysis of findings' },
              { criteria: 'Presentation', points: 70, description: 'Clear and engaging presentation' },
              { criteria: 'Collaboration', points: 50, description: 'Effective teamwork and contribution' }
            ],
            attachments: [
              { name: 'project_guidelines.pdf', size: '2.1 MB', type: 'pdf' },
              { name: 'research_template.docx', size: '125 KB', type: 'word' }
            ],
            visibility: 'published',
            status: 'active',
            groupAssignment: true,
            requiresReview: true,
            totalStudents: 35,
            submissions: 8,
            graded: 2,
            pending: 6,
            averageGrade: 91.5,
            submissionRate: 23,
            onTimeSubmissions: 8,
            lateSubmissions: 0
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // Simulate API call for submissions
      setSubmissions([
        {
          id: 1,
          assignmentId: 1,
          studentId: 1,
          studentName: 'Emily Johnson',
          studentEmail: 'emily.johnson@email.com',
          submissionDate: '2024-01-24T18:30:00Z',
          status: 'submitted',
          grade: 85,
          feedback: 'Good work on most problems. Need to show more steps in problem 3.',
          files: [
            { name: 'calculus_homework.pdf', size: '1.2 MB', type: 'pdf' }
          ],
          attempts: 1,
          isLate: false,
          gradedBy: 'Dr. Sarah Johnson',
          gradedDate: '2024-01-25T10:00:00Z'
        },
        {
          id: 2,
          assignmentId: 1,
          studentId: 2,
          studentName: 'Michael Chen',
          studentEmail: 'michael.chen@email.com',
          submissionDate: '2024-01-23T20:15:00Z',
          status: 'graded',
          grade: 78,
          feedback: 'Several calculation errors. Please review integration by parts.',
          files: [
            { name: 'homework_solutions.pdf', size: '980 KB', type: 'pdf' }
          ],
          attempts: 1,
          isLate: false,
          gradedBy: 'Dr. Sarah Johnson',
          gradedDate: '2024-01-24T14:20:00Z'
        },
        {
          id: 3,
          assignmentId: 2,
          studentId: 3,
          studentName: 'Sarah Williams',
          studentEmail: 'sarah.williams@email.com',
          submissionDate: '2024-01-22T16:45:00Z',
          status: 'pending',
          grade: null,
          feedback: '',
          files: [
            { name: 'momentum_lab_report.pdf', size: '2.8 MB', type: 'pdf' },
            { name: 'data_analysis.xlsx', size: '156 KB', type: 'excel' }
          ],
          attempts: 1,
          isLate: false,
          gradedBy: null,
          gradedDate: null
        }
      ]);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const assignment = {
        id: Date.now(),
        ...newAssignment,
        createdDate: new Date().toISOString(),
        status: newAssignment.visibility === 'published' ? 'active' : 'draft',
        totalStudents: 0,
        submissions: 0,
        graded: 0,
        pending: 0,
        averageGrade: 0,
        submissionRate: 0,
        onTimeSubmissions: 0,
        lateSubmissions: 0
      };
      
      setAssignments([assignment, ...assignments]);
      setNewAssignment({
        title: '',
        description: '',
        course: '',
        type: 'essay',
        maxPoints: 100,
        dueDate: '',
        allowLateSubmissions: true,
        latePenalty: 10,
        attempts: 1,
        instructions: '',
        rubric: [],
        attachments: [],
        visibility: 'published',
        groupAssignment: false,
        requiresReview: false
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleDeleteAssignment = (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    }
  };

  const handleGradeSubmission = (grade, feedback) => {
    if (selectedSubmission) {
      setSubmissions(submissions.map(s => 
        s.id === selectedSubmission.id 
          ? { 
              ...s, 
              grade: parseInt(grade), 
              feedback, 
              status: 'graded',
              gradedBy: user.name,
              gradedDate: new Date().toISOString()
            }
          : s
      ));
      setShowGradingModal(false);
      setSelectedSubmission(null);
    }
  };

  const publishAssignment = async (assignmentId, publish=true) => {
    try { setActionLoading(true); await apiService.assignments.publish(assignmentId, publish); fetchAssignments(); } catch(e){ console.error(e);} finally { setActionLoading(false);} };
  const duplicateAssignment = async (assignmentId) => {
    try { setActionLoading(true); await apiService.assignments.duplicate(assignmentId); fetchAssignments(); } catch(e){ console.error(e);} finally { setActionLoading(false);} };
  const openExtension = (assignmentId) => { setExtensionData({ assignmentId, student_id:'', extra_days:1 }); setExtensionModal(true); };
  const grantExtension = async () => { try { setActionLoading(true); await apiService.assignments.grantExtension(extensionData.assignmentId, { student_id: extensionData.student_id, extra_days: extensionData.extra_days }); setExtensionModal(false);} catch(e){ console.error(e);} finally { setActionLoading(false);} };
  const viewStatistics = async (assignmentId) => { try { setActionLoading(true); const { data } = await apiService.assignments.statistics(assignmentId); setAnalyticsData(prev=>({...prev,[assignmentId]:data})); } catch(e){ console.error(e);} finally { setActionLoading(false);} };
  const validateSubmission = async (assignmentId) => { try { setActionLoading(true); const { data } = await apiService.assignments.validateSubmission(assignmentId, { content: 'sample answer text' }); setValidationResult({ assignmentId, ...data}); setTimeout(()=>setValidationResult(v=>v&&v.assignmentId===assignmentId?{...v,visible:true}:v),0);} catch(e){ console.error(e);} finally { setActionLoading(false);} };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || assignment.status === selectedFilter;
    const matchesCourse = selectedCourse === 'all' || assignment.course === selectedCourse;
    
    return matchesSearch && matchesFilter && matchesCourse;
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'created':
        aValue = new Date(a.createdDate);
        bValue = new Date(b.createdDate);
        break;
      case 'due':
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
        break;
      case 'submissions':
        aValue = a.submissions;
        bValue = b.submissions;
        break;
      default:
        aValue = new Date(a.createdDate);
        bValue = new Date(b.createdDate);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = assignmentTypes.find(t => t.id === type);
    return typeConfig ? typeConfig.icon : FileText;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role && !['staff','admin'].includes(user.role)) {
    return <div className="p-8 text-center text-red-600">Access denied</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Clipboard className="h-8 w-8 mr-3" />
            Assignment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, manage, and grade assignments for your courses
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assignments</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.length}
              </p>
            </div>
            <Clipboard className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Grading</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.reduce((sum, a) => sum + a.pending, 0)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Grade</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.length > 0 ? (assignments.reduce((sum, a) => sum + a.averageGrade, 0) / assignments.length).toFixed(1) : '0'}%
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submission Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.length > 0 ? (assignments.reduce((sum, a) => sum + a.submissionRate, 0) / assignments.length).toFixed(0) : '0'}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assignments..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {filters.map(filter => (
                  <option key={filter.id} value={filter.id}>{filter.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course:</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="created">Created Date</option>
                <option value="due">Due Date</option>
                <option value="title">Title</option>
                <option value="submissions">Submissions</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {sortedAssignments.map(assignment => {
          const IconComponent = getTypeIcon(assignment.type);
          const daysUntilDue = getDaysUntilDue(assignment.dueDate);
          
          if (viewMode === 'grid') {
            return (
              <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {assignment.courseName}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {assignment.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(assignment.dueDate)}
                    </p>
                    {daysUntilDue >= 0 && (
                      <p className={`text-xs ${daysUntilDue <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                        {daysUntilDue} days left
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Max Points</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {assignment.maxPoints}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {assignment.submissions}/{assignment.totalStudents}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {assignment.pending} pending
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {assignment.averageGrade.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {assignment.groupAssignment && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-full">
                        <Users className="h-3 w-3 mr-1" />
                        Group
                      </span>
                    )}
                    {assignment.requiresReview && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-full">
                        <Flag className="h-3 w-3 mr-1" />
                        Review
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {assignment.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                        {assignment.groupAssignment && (
                          <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-full">
                            <Users className="h-3 w-3 mr-1" />
                            Group
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {assignment.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span>{assignment.courseName}</span>
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                        <span>{assignment.maxPoints} points</span>
                        <span>{assignment.submissions}/{assignment.totalStudents} submitted</span>
                        <span>{assignment.pending} pending</span>
                        <span>Avg: {assignment.averageGrade.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedAssignment.title}
              </h2>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Assignment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Assignment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Course</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedAssignment.courseName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedAssignment.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(selectedAssignment.dueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Max Points</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedAssignment.maxPoints}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedAssignment.description}
                  </p>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Instructions</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedAssignment.instructions}
                  </p>
                </div>
              </div>
              
              {/* Submissions Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Submissions Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAssignment.totalStudents}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submissions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAssignment.submissions}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Grading</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAssignment.pending}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Grade</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAssignment.averageGrade.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Recent Submissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Recent Submissions
                </h3>
                <div className="space-y-3">
                  {submissions
                    .filter(s => s.assignmentId === selectedAssignment.id)
                    .slice(0, 5)
                    .map(submission => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {submission.studentName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Submitted {formatDateTime(submission.submissionDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {submission.grade ? (
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {submission.grade}/{selectedAssignment.maxPoints}
                            </span>
                          ) : (
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                              Pending
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowGradingModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Assignment
            </h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Course
                  </label>
                  <select
                    value={newAssignment.course}
                    onChange={(e) => setNewAssignment({...newAssignment, course: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.filter(c => c.id !== 'all').map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newAssignment.type}
                    onChange={(e) => setNewAssignment({...newAssignment, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {assignmentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Points
                  </label>
                  <input
                    type="number"
                    value={newAssignment.maxPoints}
                    onChange={(e) => setNewAssignment({...newAssignment, maxPoints: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Attempts Allowed
                  </label>
                  <input
                    type="number"
                    value={newAssignment.attempts}
                    onChange={(e) => setNewAssignment({...newAssignment, attempts: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instructions
                </label>
                <textarea
                  value={newAssignment.instructions}
                  onChange={(e) => setNewAssignment({...newAssignment, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="4"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAssignment.allowLateSubmissions}
                    onChange={(e) => setNewAssignment({...newAssignment, allowLateSubmissions: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Allow Late Submissions</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAssignment.groupAssignment}
                    onChange={(e) => setNewAssignment({...newAssignment, groupAssignment: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Group Assignment</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAssignment.requiresReview}
                    onChange={(e) => setNewAssignment({...newAssignment, requiresReview: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Requires Review</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {showGradingModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Grade Submission - {selectedSubmission.studentName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Student</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedSubmission.studentName} ({selectedSubmission.studentEmail})
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Submission Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDateTime(selectedSubmission.submissionDate)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Files</p>
                <div className="space-y-2">
                  {selectedSubmission.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{file.size}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleGradeSubmission(formData.get('grade'), formData.get('feedback'));
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grade
                    </label>
                    <input
                      type="number"
                      name="grade"
                      defaultValue={selectedSubmission.grade || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="0"
                      max={selectedAssignment?.maxPoints || 100}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Points
                    </label>
                    <input
                      type="number"
                      value={selectedAssignment?.maxPoints || 100}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Feedback
                  </label>
                  <textarea
                    name="feedback"
                    defaultValue={selectedSubmission.feedback || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="4"
                    placeholder="Provide feedback for the student..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowGradingModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Advanced Assignment Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(a => (
            <div key={a.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  {a.title}
                </h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(a.status)}`}>
                  {a.status}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button onClick={() => publishAssignment(a.id, a.visibility !== 'published')} className="text-xs bg-green-600 text-white px-2 py-1 rounded">{a.visibility==='published'?'Unpublish':'Publish'}</button>
                <button onClick={() => duplicateAssignment(a.id)} className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Duplicate</button>
                <button onClick={() => openExtension(a.id)} className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Extension</button>
                <button onClick={() => viewStatistics(a.id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Stats</button>
                <button onClick={() => validateSubmission(a.id)} className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Validate</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extension Modal */}
      {extensionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Grant Extension</h3>
            <input placeholder="Student ID" value={extensionData.student_id} onChange={e=>setExtensionData({...extensionData, student_id:e.target.value})} className="w-full border px-2 py-1 rounded" />
            <input type="number" min={1} value={extensionData.extra_days} onChange={e=>setExtensionData({...extensionData, extra_days:parseInt(e.target.value)})} className="w-full border px-2 py-1 rounded" />
            <div className="flex gap-2 pt-2">
              <button onClick={grantExtension} disabled={actionLoading} className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50">Grant</button>
              <button onClick={()=>setExtensionModal(false)} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedAssignments.length === 0 && (
        <div className="text-center py-12">
          <Clipboard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No assignments found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first assignment to get started'}
          </p>
        </div>
      )}

      {/* Validation Result Toast */}
      {validationResult && (
        <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-slide-in">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Submission Validation</h4>
              {validationResult.valid ? (
                <p className="text-xs text-green-600 dark:text-green-400">Valid submission. {validationResult.message || ''}</p>
              ) : (
                <p className="text-xs text-red-600 dark:text-red-400">Invalid submission. {validationResult.message || ''}</p>
              )}
              {validationResult.details && <pre className="mt-2 text-[10px] bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">{JSON.stringify(validationResult.details,null,2)}</pre>}
            </div>
            <button onClick={()=>setValidationResult(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2">✕</button>
          </div>
        </div>
      )}
      {/* Analytics Panels */}
      {Object.keys(analyticsData).length>0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignment Analytics</h3>
          <div className="space-y-4">
            {Object.entries(analyticsData).map(([aid,data]) => (
              <div key={aid} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Assignment #{aid}</h4>
                  <span className="text-xs text-gray-500">Updated {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><div className="text-gray-500">Mean</div><div className="font-semibold">{data.mean_grade ?? '—'}</div></div>
                  <div><div className="text-gray-500">Median</div><div className="font-semibold">{data.median_grade ?? '—'}</div></div>
                  <div><div className="text-gray-500">Std Dev</div><div className="font-semibold">{data.std_dev ?? '—'}</div></div>
                  <div><div className="text-gray-500">Submissions</div><div className="font-semibold">{data.submission_count ?? '—'}</div></div>
                </div>
                {data.grade_distribution && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Grade Distribution</div>
                    <div className="flex space-x-1 h-4">
                      {Object.entries(data.grade_distribution).map(([bucket,val]) => (
                        <div key={bucket} style={{width:`${Math.max(val,1)}%`}} className="bg-blue-500/60 text-[8px] text-white flex items-center justify-center rounded-sm" title={`${bucket}: ${val}%`}>{val>5?val:''}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagementPage;
