/**
 * Configuration for the AI Tutor Frontend
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh'
    },
    AI: {
      CHAT: '/api/chat', // migrated to /api alias
      GENERATE: '/api/ai/generate'
    },
    USERS: {
  PROFILE: '/api/profile',
  UPDATE: '/api/profile',
  LIST: '/api/admin/users',
  DELETE: '/api/admin/users'
    },
    COURSES: {
      LIST: '/api/courses',
      CREATE: '/api/courses',
      UPDATE: '/api/courses',
      DELETE: '/api/courses',
      ENROLL: '/api/courses'
    },
    ASSIGNMENTS: {
      LIST: '/api/assignments',
      CREATE: '/api/assignments',
      UPDATE: '/api/assignments',
      DELETE: '/api/assignments',
  SUBMIT: '/api/assignments'
    },
    HEALTH: '/health',
    STATUS: '/status'
  }
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'AI Tutor Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Intelligent tutoring system with AI-powered learning',
  
  // Theme Configuration
  THEME: {
    DEFAULT: 'light',
    STORAGE_KEY: 'ai-tutor-theme'
  },
  
  // Auth Configuration
  AUTH: {
    TOKEN_STORAGE_KEY: 'ai-tutor-token',
    USER_STORAGE_KEY: 'ai-tutor-user',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    REMEMBER_ME_TIMEOUT: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  
  // UI Configuration
  UI: {
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 300,
    SIDEBAR_WIDTH: 256,
    HEADER_HEIGHT: 64
  },
  
  // Roles
  ROLES: {
    ADMIN: 'admin',
    STAFF: 'staff',
    STUDENT: 'student'
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100]
  }
};

// Environment Configuration
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY
};

// Export default configuration
export default {
  ...API_CONFIG,
  ...APP_CONFIG,
  ...ENV_CONFIG
};
