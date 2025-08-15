w/**
 * Assignment Creator Page
 * Allows staff/admin to create assignments with questions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AssignmentQuestionBuilder from '../../components/AssignmentQuestionBuilder';
import { 
  Save, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Target,
  Settings,
  Eye,
  Plus,
  BookOpen,
  Users,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const AssignmentCreator = () => {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    assignment_type: 'homework',
    max_points: 100,
    due_date: '',
    allow_late_submission: true,
    late_penalty_percent: 10,
    max_attempts: 1,
    time_limit_minutes: null,
    is_published: false,
    requires_file_upload: false,
    allowed_file_types: [],
    max_file_size_mb: 10,
    auto_grade: false
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const assignmentTypes = [
    { value: 'quiz', label: 'Quiz', description: 'Auto-graded questions with time limit' },
    { value: 'homework', label: 'Homework', description: 'Regular assignment with manual grading' },
    { value: 'project', label: 'Project', description: 'Large assignment requiring file submission' },
    { value: 'essay', label: 'Essay', description: 'Written response assignment' },
    { value: 'presentation', label: 'Presentation', description: 'Presentation assignment' }
  ];

  const fileTypes = [
    'pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx', 
    'xls', 'xlsx', 'zip', 'rar', 'jpg', 'jpeg', 'png', 'gif'
  ];

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
    if (assignmentId) {
      setIsEditing(true);
      fetchAssignment();
    }
  }, [courseId, assignmentId]);

  const fetchCourse = async () => {
    try {
      const response = await apiService.get(`/api/courses/${courseId}`);
      if (response.data.success) {
        setCourse(response.data.course);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course information');
    }
  };

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/assignments/${assignmentId}`);
      if (response.data.success) {
        const assignmentData = response.data.assignment;
        setAssignment({
          ...assignmentData,
          due_date: assignmentData.due_date ? new Date(assignmentData.due_date).toISOString().slice(0, 16) : ''
        });
        
        // Fetch questions
        const questionsResponse = await apiService.get(`/api/assignments/${assignmentId}/questions`);
        if (questionsResponse.data.success) {
          setQuestions(questionsResponse.data.questions || []);
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setAssignment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileTypeToggle = (fileType) => {
    setAssignment(prev => ({
      ...prev,
      allowed_file_types: prev.allowed_file_types.includes(fileType)
        ? prev.allowed_file_types.filter(type => type !== fileType)
        : [...prev.allowed_file_types, fileType]
    }));
  };

  const validateAssignment = () => {
    if (!assignment.title.trim()) {
      toast.error('Assignment title is required');
      return false;
    }
    if (!assignment.description.trim()) {
      toast.error('Assignment description is required');
      return false;
    }
    if (assignment.max_points <= 0) {
      toast.error('Maximum points must be greater than 0');
      return false;
    }
    if (assignment.due_date && new Date(assignment.due_date) <= new Date()) {
      toast.error('Due date must be in the future');
      return false;
    }
    return true;
  };

  const handleSave = async (publish = false) => {
    if (!validateAssignment()) return;

    setSaving(true);
    try {
      const assignmentData = {
        ...assignment,
        course_id: courseId,
        created_by: user.id,
        is_published: publish || assignment.is_published,
        due_date: assignment.due_date ? new Date(assignment.due_date).toISOString() : null
      };

      let response;
      if (isEditing) {
        response = await apiService.put(`/api/assignments/${assignmentId}`, assignmentData);
      } else {
        response = await apiService.post('/api/assignments', assignmentData);
      }

      if (response.data.success) {
        const savedAssignment = response.data.assignment;
        toast.success(`Assignment ${isEditing ? 'updated' : 'created'} successfully!`);
        
        if (!isEditing) {
          // Redirect to edit mode for the new assignment
          navigate(`/staff/courses/${courseId}/assignments/${savedAssignment.id}/edit`);
        } else {
          // Update local state
          setAssignment(prev => ({ ...prev, ...savedAssignment }));
        }
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} assignment`);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Open assignment in preview mode
    window.open(`/assignments/${assignmentId || 'preview'}?preview=true`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-32 h-32 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/staff/courses/${courseId}`)}
          className="flex items-center mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Course
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Assignment' : 'Create Assignment'}
            </h1>
            {course && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Course: {course.title}
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            {isEditing && (
              <button
                onClick={handlePreview}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg dark:text-gray-400 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg dark:text-gray-400 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  {assignment.is_published ? 'Update & Publish' : 'Save & Publish'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={assignment.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter assignment title"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description *
                </label>
                <textarea
                  value={assignment.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description of the assignment"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instructions
                </label>
                <textarea
                  value={assignment.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Detailed instructions for students"
                />
              </div>
            </div>
          </div>

          {/* Assignment Type */}
          <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              Assignment Type
            </h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {assignmentTypes.map((type) => (
                <label key={type.value} className="cursor-pointer">
                  <div className={`p-4 border-2 rounded-lg transition-colors ${
                    assignment.assignment_type === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="assignment_type"
                        value={type.value}
                        checked={assignment.assignment_type === type.value}
                        onChange={(e) => handleInputChange('assignment_type', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 font-medium text-gray-900 dark:text-white">
                        {type.label}
                      </span>
                    </div>
                    <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Questions Section */}
          {isEditing && (assignment.assignment_type === 'quiz' || assignment.assignment_type === 'homework') && (
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <AssignmentQuestionBuilder
                assignmentId={assignmentId}
                questions={questions}
                onQuestionsUpdate={setQuestions}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Max Points
                  </label>
                  <input
                    type="number"
                    value={assignment.max_points}
                    onChange={(e) => handleInputChange('max_points', parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    value={assignment.max_attempts}
                    onChange={(e) => handleInputChange('max_attempts', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={assignment.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {assignment.assignment_type === 'quiz' && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={assignment.time_limit_minutes || ''}
                    onChange={(e) => handleInputChange('time_limit_minutes', e.target.value ? parseInt(e.target.value) : null)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="No limit"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Late Submission */}
          <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Late Submission
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={assignment.allow_late_submission}
                  onChange={(e) => handleInputChange('allow_late_submission', e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Allow late submissions
                </span>
              </label>
              
              {assignment.allow_late_submission && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Late Penalty (%)
                  </label>
                  <input
                    type="number"
                    value={assignment.late_penalty_percent}
                    onChange={(e) => handleInputChange('late_penalty_percent', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* File Upload Settings */}
          <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              File Upload
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={assignment.requires_file_upload}
                  onChange={(e) => handleInputChange('requires_file_upload', e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Require file upload
                </span>
              </label>
              
              {assignment.requires_file_upload && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      value={assignment.max_file_size_mb}
                      onChange={(e) => handleInputChange('max_file_size_mb', parseInt(e.target.value) || 10)}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Allowed File Types
                    </label>
                    <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-32">
                      {fileTypes.map((type) => (
                        <label key={type} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={assignment.allowed_file_types.includes(type)}
                            onChange={() => handleFileTypeToggle(type)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            .{type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Auto-grading */}
          {assignment.assignment_type === 'quiz' && (
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Grading
              </h3>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={assignment.auto_grade}
                  onChange={(e) => handleInputChange('auto_grade', e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Enable auto-grading
                </span>
              </label>
              
              {assignment.auto_grade && (
                <div className="p-3 mt-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Only multiple choice and true/false questions will be auto-graded
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentCreator;