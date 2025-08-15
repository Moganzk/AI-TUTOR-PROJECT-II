import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  BookOpen,
  Target,
  Award,
  Users,
  Send,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bot,
  Zap,
  Star,
  Brain,
  X,
  List,
  Save
} from 'lucide-react';
import LearningResources from '../../components/LearningResources';
import AssignmentQuestionBuilder from '../../components/AssignmentQuestionBuilder';

const AssignmentManagement = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [createdAssignmentId, setCreatedAssignmentId] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    course_id: '',
    assignment_type: 'homework',
    due_date: '',
    max_points: 100,
    max_attempts: 1,
    time_limit_minutes: 60,
    instructions: '',
    subject: '',
    status: 'active',
    grading_method: 'manual', // 'manual' or 'ai'
    auto_grade: false
  });

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchAssignments = async () => { try { setLoading(true); const { data } = await apiService.assignments.getAssignments(); setAssignments(data.assignments||[]);} catch(e){ console.error('Error fetching assignments', e); setAssignments([]);} finally { setLoading(false);} };

  const fetchCourses = async () => { try { const { data } = await apiService.courses.getCourses(); setCourses(data.courses||[]);} catch(e){ console.error('Error fetching courses', e); setCourses([]);} };

  const handleCreateAssignment = async () => { try { const assignmentData = { ...assignmentForm, due_date:new Date(assignmentForm.due_date).toISOString(), max_points:parseInt(assignmentForm.max_points), max_attempts:parseInt(assignmentForm.max_attempts), time_limit_minutes:parseInt(assignmentForm.time_limit_minutes)}; const { data } = await apiService.assignments.createAssignment(assignmentData); if (data.success){ setCreatedAssignmentId(data.assignment?.id); setShowCreateModal(false); setShowQuestionBuilder(true); alert('✅ Assignment created successfully! Now add questions to complete the assignment.'); } else alert(data.error||'❌ Failed to create assignment'); } catch(e){ console.error('Error creating assignment', e); alert('❌ Error creating assignment. Please try again.'); } };

  const handleUpdateAssignment = async () => { try { const assignmentData = { ...assignmentForm, due_date:new Date(assignmentForm.due_date).toISOString(), course_id:parseInt(assignmentForm.course_id), max_points:parseInt(assignmentForm.max_points), max_attempts:parseInt(assignmentForm.max_attempts), time_limit_minutes:parseInt(assignmentForm.time_limit_minutes)}; const { data } = await apiService.assignments.updateAssignment(selectedAssignment.id, assignmentData); if (data.success){ fetchAssignments(); setShowEditModal(false); setSelectedAssignment(null);
        resetForm();
        alert('✅ Assignment updated successfully!');
  } else alert(data.error||'❌ Failed to update assignment'); } catch(e){ console.error('Error updating assignment', e); alert('❌ Error updating assignment. Please try again.'); } };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const { data } = await apiService.assignments.deleteAssignment(assignmentId);
      if (data.success !== false) {
        fetchAssignments();
        alert('✅ Assignment deleted successfully!');
      } else {
        alert(data.error || '❌ Failed to delete assignment. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('❌ Error deleting assignment. Please try again.');
    }
  };

  const handleViewSubmissions = async (assignment) => {
    try {
      const { data } = await apiService.assignments.listSubmissions(assignment.id);
      setSubmissions(data.submissions || data || []);
      setSelectedAssignment(assignment);
      setShowSubmissionsModal(true);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('❌ Error loading submissions. Please try again.');
    }
  };

  const handleAIGrading = async (submissionId) => {
    try {
      setGradingSubmission(submissionId);
      const { data } = await apiService.submissions.aiGrade(submissionId);
      if (data.success !== false) {
        alert(`✅ AI Grading Complete!\nScore: ${data.grade?.points_earned}/${selectedAssignment?.max_points || 100}\nConfidence: ${Math.round((data.confidence_score || 0.85) * 100)}%`);
        handleViewSubmissions(selectedAssignment);
      } else {
        alert(`❌ AI Grading Failed: ${data.message || data.error || 'Please try manual grading'}`);
      }
    } catch (error) {
      console.error('Error in AI grading:', error);
      alert('❌ Error during AI grading. Please try again.');
    } finally {
      setGradingSubmission(null);
    }
  };

  const handleGenerateRubric = async (assignmentId) => {
    try {
      const { data } = await apiService.assignments.generateRubric(assignmentId);
      if (data.success !== false) {
        alert(`✅ AI-Generated Rubric:\n\n${data.rubric}`);
      } else {
        alert(`❌ Failed to generate rubric: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating rubric:', error);
      alert('❌ Error generating rubric. Please try again.');
    }
  };

  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      course_id: assignment.course_id?.toString() || '',
      assignment_type: assignment.assignment_type || 'homework',
      due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
      max_points: assignment.max_points || 100,
      max_attempts: assignment.max_attempts || 1,
      time_limit_minutes: assignment.time_limit_minutes || 60,
      instructions: assignment.instructions || '',
      subject: assignment.subject || '',
      status: assignment.status || 'active'
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setAssignmentForm({
      title: '',
      description: '',
      course_id: '',
      assignment_type: 'homework',
      due_date: '',
      max_points: 100,
      max_attempts: 1,
      time_limit_minutes: 60,
      instructions: '',
      subject: '',
      status: 'active'
    });
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || assignment.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'homework': return <FileText className="w-5 h-5" />;
      case 'quiz': return <Target className="w-5 h-5" />;
      case 'exam': return <Award className="w-5 h-5" />;
      case 'project': return <BookOpen className="w-5 h-5" />;
      case 'lab': return <Settings className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const tabs = [
    { id: 'all', label: 'All', count: assignments.length },
    { id: 'active', label: 'Active', count: assignments.filter(a => a.status === 'active').length },
    { id: 'draft', label: 'Draft', count: assignments.filter(a => a.status === 'draft').length },
    { id: 'archived', label: 'Archived', count: assignments.filter(a => a.status === 'archived').length }
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
            Assignment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, edit, and manage assignments for your courses
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.filter(a => a.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.filter(a => a.status === 'draft').length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assignments.reduce((sum, a) => sum + (a.submission_count || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
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

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Assignment
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Course
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Type
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Due Date
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Points
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Questions
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getTypeIcon(assignment.assignment_type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {assignment.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {assignment.description?.substring(0, 60)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {assignment.course_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {assignment.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/20 dark:text-blue-200">
                      {assignment.assignment_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                    {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                    {assignment.max_points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {assignment.question_count || 0}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        question{(assignment.question_count || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setCreatedAssignmentId(assignment.id);
                          setShowQuestionBuilder(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Manage Questions"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(assignment)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="View Submissions"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleGenerateRubric(assignment.id)}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        title="Generate AI Rubric"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowResourcesModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                        title="View Learning Resources"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(assignment)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit Assignment"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Create New Assignment
            </h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter assignment title"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course *
                  </label>
                  <select
                    value={assignmentForm.course_title}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, course_title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assignment Type
                  </label>
                  <select
                    value={assignmentForm.assignment_type}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignment_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="homework">Homework</option>
                    <option value="quiz">Quiz</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.due_date}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Points
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.max_points}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, max_points: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.max_attempts}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, max_attempts: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time Limit (min)
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.time_limit_minutes}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, time_limit_minutes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description *
                  </label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter assignment description"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instructions
                  </label>
                  <textarea
                    value={assignmentForm.instructions}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, instructions: e.target.value }))}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter detailed instructions for students"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={assignmentForm.subject}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Mathematics, Science, English"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={assignmentForm.status}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create & Add Questions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {showEditModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Edit Assignment: {selectedAssignment.title}
            </h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter assignment title"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course *
                  </label>
                  <select
                    value={assignmentForm.course_id}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, course_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assignment Type
                  </label>
                  <select
                    value={assignmentForm.assignment_type}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignment_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="homework">Homework</option>
                    <option value="quiz">Quiz</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.due_date}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Points
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.max_points}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, max_points: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.max_attempts}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, max_attempts: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time Limit (min)
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.time_limit_minutes}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, time_limit_minutes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description *
                  </label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter assignment description"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instructions
                  </label>
                  <textarea
                    value={assignmentForm.instructions}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, instructions: e.target.value }))}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter detailed instructions for students"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={assignmentForm.subject}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Mathematics, Science, English"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={assignmentForm.status}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAssignment(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAssignment}
                className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                <span>Update Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Submissions for: {selectedAssignment.title}
            </h3>
            
            <div className="space-y-4">
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <div key={submission.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {submission.users?.name || 'Unknown Student'}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          submission.status === 'graded' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                        }`}>
                          {submission.status}
                        </span>
                        <button
                          onClick={() => handleAIGrading(submission.id)}
                          disabled={gradingSubmission === submission.id}
                          className="flex items-center px-3 py-1 space-x-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                          {gradingSubmission === submission.id ? (
                            <>
                              <div className="w-3 h-3 border-b-2 border-white rounded-full animate-spin"></div>
                              <span>Grading...</span>
                            </>
                          ) : (
                            <>
                              <Bot className="w-3 h-3" />
                              <span>AI Grade</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 mb-3 rounded bg-gray-50 dark:bg-gray-700">
                      <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Submission Content:</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {submission.content || 'No content provided'}
                      </p>
                    </div>
                    
                    {submission.grade && (
                      <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20">
                        <h5 className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-300">Grade & Feedback:</h5>
                        <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
                          Score: {submission.grade.points_earned}/{selectedAssignment.max_points || 100}
                        </p>
                        {submission.grade.feedback && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {submission.grade.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowSubmissionsModal(false);
                  setSelectedAssignment(null);
                  setSubmissions([]);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Builder Modal */}
      {showQuestionBuilder && createdAssignmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedAssignment ? `Manage Questions - ${selectedAssignment.title}` : 'Add Questions to Assignment'}
              </h3>
              <button
                onClick={() => {
                  setShowQuestionBuilder(false);
                  setCreatedAssignmentId(null);
                  setSelectedAssignment(null);
                  resetForm();
                  fetchAssignments(); // Refresh assignments list
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {!selectedAssignment && (
              <div className="p-4 mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Assignment created successfully!</strong> Now add questions to complete your assignment. 
                  Students will see these questions when they take the assignment.
                </p>
              </div>
            )}
            
            {selectedAssignment && (
              <div className="p-4 mb-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Question Management:</strong> Add, edit, or remove questions for this assignment. 
                  Changes will be reflected immediately for students.
                </p>
              </div>
            )}
            
            <AssignmentQuestionBuilder 
              assignmentId={createdAssignmentId}
              questions={[]}
              onQuestionsUpdate={(questions) => {
                console.log('Questions updated:', questions);
              }}
            />

            {/* Inline Basic Questions CRUD (fallback if component lacks functionality) */}
            <div className="mt-6 border-t pt-4 dark:border-gray-700">
              <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-100">Quick Question Adder</h4>
              <QuickQuestionsEditor assignmentId={createdAssignmentId} />
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowQuestionBuilder(false);
                  setCreatedAssignmentId(null);
                  setSelectedAssignment(null);
                  resetForm();
                  fetchAssignments();
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {selectedAssignment ? 'Close' : 'Finish Later'}
              </button>
              {!selectedAssignment && (
                <button
                  onClick={() => {
                    setShowQuestionBuilder(false);
                    setCreatedAssignmentId(null);
                    setSelectedAssignment(null);
                    resetForm();
                    fetchAssignments();
                    alert('✅ Assignment completed! Students can now access it.');
                  }}
                  className="flex items-center px-4 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Assignment</span>
                </button>
              )}
              {selectedAssignment && (
                <button
                  onClick={() => {
                    setShowQuestionBuilder(false);
                    setCreatedAssignmentId(null);
                    setSelectedAssignment(null);
                    resetForm();
                    fetchAssignments();
                    alert('✅ Questions updated successfully!');
                  }}
                  className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Learning Resources Modal */}
      {showResourcesModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Learning Resources for: {selectedAssignment.title}
            </h3>
            
            <LearningResources assignmentId={selectedAssignment.id} />
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowResourcesModal(false);
                  setSelectedAssignment(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Close
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
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first assignment'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;

// Lightweight internal component for quick add/delete (Stage 1 parity)
const QuickQuestionsEditor = ({ assignmentId }) => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [options, setOptions] = useState('');
  const [correct, setCorrect] = useState('');
  const [points, setPoints] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => { try { setLoading(true); const { data } = await apiService.assignments.getQuestions?.(assignmentId); setItems(data.questions||[]);} catch(e){ console.error(e); } finally { setLoading(false);} };
  useEffect(()=>{ if(assignmentId) load(); },[assignmentId]);

  const add = async () => { try { const payload = { question_text:questionText, question_type:questionType, options: options? options.split('|').map(o=>o.trim()):[], correct_answer: correct, points: parseInt(points)||1 }; const { data } = await apiService.assignments.addQuestion?.(assignmentId, payload); if(data.success!==false){ setQuestionText(''); setOptions(''); setCorrect(''); setPoints(1); load(); } } catch(e){ console.error(e);} };
  const del = async (id) => { if(!window.confirm('Delete question?')) return; try { const { data } = await apiService.assignments.deleteQuestion?.(id); if(data.success!==false) load(); } catch(e){ console.error(e);} };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={questionText} onChange={e=>setQuestionText(e.target.value)} placeholder="Question text" className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
        <select value={questionType} onChange={e=>setQuestionType(e.target.value)} className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600">
          <option value="multiple_choice">Multiple Choice</option>
          <option value="short_answer">Short Answer</option>
          <option value="essay">Essay</option>
          <option value="true_false">True/False</option>
        </select>
        <input value={options} onChange={e=>setOptions(e.target.value)} placeholder="Options (pipe | separated)" className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 md:col-span-2" />
        <input value={correct} onChange={e=>setCorrect(e.target.value)} placeholder="Correct answer" className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
        <input type="number" min={1} value={points} onChange={e=>setPoints(e.target.value)} className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
      </div>
      <button type="button" onClick={add} disabled={!questionText} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Add Question</button>
      <div className="max-h-56 overflow-y-auto space-y-2 border-t pt-2 dark:border-gray-700">
        {loading && <div className="text-xs text-gray-500">Loading...</div>}
        {!loading && items.length===0 && <div className="text-xs text-gray-500">No questions yet.</div>}
        {items.map(q=> (
          <div key={q.id} className="p-2 border rounded flex justify-between items-start text-xs dark:border-gray-600">
            <div className="pr-2">
              <div className="font-medium text-gray-800 dark:text-gray-100">{q.question_text}</div>
              <div className="text-gray-500 dark:text-gray-400">Type: {q.question_type} | Points: {q.points}</div>
            </div>
            <button onClick={()=>del(q.id)} className="text-red-600 hover:text-red-700">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
