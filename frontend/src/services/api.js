/**
 * API Service for AI Tutor Frontend
 * Centralized API calls with error handling and authentication
 */

import axios from 'axios';
import { API_CONFIG } from '../config';
import toast from 'react-hot-toast';

// Throttle guard for auth redirects to avoid rapid reload loops
let lastAuthRedirect = 0;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add additional headers for better compatibility
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle different error types
    if (response) {
      switch (response.status) {
        case 401: {
          // Suppress toast for 401 errors to reduce noise during initialization
          // These are expected when not authenticated
          console.debug('Authentication required for this resource');
          break; }
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(response.data?.error || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other errors
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  // Authentication endpoints
  auth = {
    login: (credentials) => api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
    register: (userData) => api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData),
    logout: () => api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
    refreshToken: () => api.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH),
    validate: () => api.post('/api/auth/validate')
  };

  // AI endpoints
  ai = {
  // Fixed: Use the correct backend endpoint /api/tutor/chat
  chat: (message, context) => api.post('/api/tutor/chat', { message, context }),
    generate: (prompt, options) => api.post(API_CONFIG.ENDPOINTS.AI.GENERATE, { prompt, ...options }),
  };

  // User endpoints
  users = {
  // Switch to /api/profile endpoints (backend aliases to /users/profile & /users/update)
  getProfile: () => api.get('/api/profile'),
  updateProfile: (userData) => api.put('/api/profile', userData),
  updatePassword: ({ currentPassword, newPassword }) => api.put('/api/profile/password', { currentPassword, newPassword }),
    getUsers: (params) => api.get(API_CONFIG.ENDPOINTS.USERS.LIST, { params }),
    deleteUser: (userId) => api.delete(`${API_CONFIG.ENDPOINTS.USERS.DELETE}/${userId}`),
  };

  // Notification endpoints (centralized)
  notifications = {
    list: (params) => api.get('/api/notifications', { params }),
    unreadCount: () => api.get('/api/notifications/unread-count'),
    markAllRead: () => api.put('/api/notifications/mark-all-read'),
    markRead: (id) => api.put(`/api/notifications/${id}/read`),
    archive: (id) => api.put(`/api/notifications/${id}/archive`),
    delete: (id) => api.delete(`/api/notifications/${id}`),
    bulkAction: (action, ids) => api.post('/api/notifications/bulk-action', { action, notification_ids: ids }),
    preferencesGet: () => api.get('/api/notifications/preferences'),
    preferencesUpdate: (prefs) => api.put('/api/notifications/preferences', prefs)
  };

  adminNotifications = {
    list: (params) => api.get('/api/admin/notifications', { params }),
    getRecipients: (id) => api.get(`/api/admin/notifications/${id}/recipients`),
    create: (data) => api.post('/api/admin/notifications', data),
    update: (id, data) => api.put(`/api/admin/notifications/${id}`, data),
    delete: (id) => api.delete(`/api/admin/notifications/${id}`)
  };

  adminUsers = {
    list: (params) => api.get('/api/admin/users', { params }),
    create: (userData) => api.post('/api/admin/users', userData),
    update: (userId, userData) => api.put(`/api/admin/users/${userId}`, userData),
    delete: (userId) => api.delete(`/api/admin/users/${userId}`),
    suspend: (userId, data) => api.put(`/api/admin/users/${userId}/suspend`, data),
    get: (userId) => api.get(`/api/admin/users/${userId}`)
  };

  admin = {
    stats: () => api.get('/api/admin/stats'),
    activities: () => api.get('/api/admin/activities'),
    sendNotification: (payload) => api.post('/api/notifications', payload)
  };

  // Course endpoints
  courses = {
    getCourses: (params) => api.get('/api/courses', { params }),
  createCourse: (courseData) => api.post('/api/courses', courseData),
  updateCourse: (courseId, courseData) => api.put(`/api/courses/${courseId}`, courseData),
  deleteCourse: (courseId) => api.delete(`/api/courses/${courseId}`),
    enroll: (courseId) => api.post(`/api/courses/${courseId}/enroll`),
    unenroll: (courseId) => api.delete(`/api/courses/${courseId}/unenroll`),
  getCourse: (courseId) => api.get(`/api/courses/${courseId}`),
    assignments: (courseId) => api.get(`/api/courses/${courseId}/assignments`),
    progress: (courseId) => api.get(`/api/courses/${courseId}/progress`)
  };

  subjects = {
    list: (params) => api.get('/api/subjects', { params }),
    create: (data) => api.post('/api/subjects', data),
    update: (id, data) => api.put(`/api/subjects/${id}`, data),
    delete: (id) => api.delete(`/api/subjects/${id}`)
  };

  student = {
    progress: () => api.get('/api/student/progress'),
    courses: () => api.get('/api/student/courses'),
    context: () => api.get('/api/student/context'),
    enrollments: (studentId) => api.get(`/api/students/${studentId}/enrollments`)
  };

  staff = {
    students: () => api.get('/api/staff/students'),
    studentDetail: (id) => api.get(`/api/staff/students/${id}`)
  };

  // Assignment endpoints
  assignments = {
    getAssignments: (params) => api.get(API_CONFIG.ENDPOINTS.ASSIGNMENTS.LIST, { params }),
    createAssignment: (assignmentData) => api.post(API_CONFIG.ENDPOINTS.ASSIGNMENTS.CREATE, assignmentData),
    updateAssignment: (assignmentId, assignmentData) => api.put(`${API_CONFIG.ENDPOINTS.ASSIGNMENTS.UPDATE}/${assignmentId}`, assignmentData),
    deleteAssignment: (assignmentId) => api.delete(`${API_CONFIG.ENDPOINTS.ASSIGNMENTS.DELETE}/${assignmentId}`),
  // Deprecated alias kept for backward compatibility; now routes to canonical endpoint
  submitAssignment: (assignmentId, submissionData) => api.post(`/api/assignments/${assignmentId}/submit`, submissionData),
  // canonical submission endpoint
  submit: (assignmentId, submissionData) => api.post(`/api/assignments/${assignmentId}/submit`, submissionData),
    publish: (assignmentId, is_published=true) => api.put(`/api/assignments/${assignmentId}/publish`, { is_published }),
    duplicate: (assignmentId) => api.post(`/api/assignments/${assignmentId}/duplicate`),
    statistics: (assignmentId) => api.get(`/api/assignments/${assignmentId}/statistics`),
    grantExtension: (assignmentId, payload) => api.post(`/api/assignments/${assignmentId}/extensions`, payload),
    validateSubmission: (assignmentId, payload) => api.post(`/api/assignments/${assignmentId}/validate-submission`, payload),
    submissionStatus: (assignmentId) => api.get(`/api/assignments/${assignmentId}/submission-status`),
    questionsGet: (assignmentId) => api.get(`/api/assignments/${assignmentId}/questions`),
  questionsAdd: (assignmentId, question) => api.post(`/api/assignments/${assignmentId}/questions`, question),
  submissionsList: (assignmentId) => api.get(`/api/assignments/${assignmentId}/submissions`) // manual list
  ,resources: (assignmentId) => api.get(`/api/assignments/${assignmentId}/resources`)
  };

  lessons = {
    list: (courseId) => api.get(`/api/courses/${courseId}/lessons`),
    create: (courseId, lesson) => api.post(`/api/courses/${courseId}/lessons`, lesson)
  };

  submissions = {
    manualGrade: (submissionId, payload) => api.post(`/api/submissions/${submissionId}/grade`, payload),
    getManualGrade: (submissionId) => api.get(`/api/submissions/${submissionId}/grade`),
    aiGrade: (submissionId, payload) => api.post(`/api/submissions/${submissionId}/ai-grade`, payload),
    answers: (submissionId) => api.get(`/api/submissions/${submissionId}/answers`)
  };

  gradebook = {
    get: (courseId) => api.get(`/api/courses/${courseId}/gradebook`)
  };

  notificationTemplates = {
    list: () => api.get('/api/admin/notifications/templates'),
    create: (data) => api.post('/api/admin/notifications/templates', data),
    update: (id, data) => api.put(`/api/admin/notifications/templates/${id}`, data),
    remove: (id) => api.delete(`/api/admin/notifications/templates/${id}`),
    send: (id, payload) => api.post(`/api/admin/notifications/templates/${id}/send`, payload),
    scheduled: () => api.get('/api/admin/notifications/scheduled'),
    cancelScheduled: (id) => api.delete(`/api/admin/notifications/scheduled/${id}/cancel`)
  };

  system = {
    health: () => api.get('/api/system/health'),
    logs: () => api.get('/api/system/logs'),
    backup: () => api.post('/api/system/backup'),
    securityAudit: () => api.get('/api/system/security-audit'),
    // subjects CRUD
    getSubjects: () => api.get('/api/subjects'),
    createSubject: (payload) => api.post('/api/subjects', payload),
    updateSubject: (id, payload) => api.put(`/api/subjects/${id}`, payload),
    deleteSubject: (id) => api.delete(`/api/subjects/${id}`),
  };

  learningResources = {
    list: (params={}) => api.get('/api/learning-resources', { params })
  };

  // Health check endpoints
  health = {
    check: () => api.get('/api/health'),
    status: () => api.get('/api/status'),
  };

  // Generic methods
  get = (endpoint, params = {}) => api.get(endpoint, { params });
  post = (endpoint, data = {}) => api.post(endpoint, data);
  put = (endpoint, data = {}) => api.put(endpoint, data);
  delete = (endpoint) => api.delete(endpoint);
  patch = (endpoint, data = {}) => api.patch(endpoint, data);

  // Utility methods
  setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  clearAuthToken = () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Upload file with progress
  uploadFile = (endpoint, formData, onProgress) => {
    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  };

  // Download file
  downloadFile = (endpoint, filename) => {
    return api.get(endpoint, {
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  };
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
