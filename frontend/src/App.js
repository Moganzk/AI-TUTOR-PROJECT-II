import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutUs from './pages/public/AboutUs';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

// Student Pages
import StudentHome from './pages/student/StudentHome';
import StudentDashboard from './pages/student/StudentDashboard';
import AITutorChat from './pages/student/AITutorChat';
import MyCourses from './pages/student/MyCourses';
import CourseDetail from './pages/student/CourseDetail';
import CourseLearning from './pages/student/CourseLearning';
import StudySessions from './pages/student/StudySessions';
import Assignments from './pages/student/Assignments';
import ProgressTracking from './pages/student/ProgressTracking';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentAchievements from './pages/student/StudentAchievements';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import CourseManagement from './pages/staff/CourseManagement';
import StudentProgress from './pages/staff/StudentProgress';
import ContentCreation from './pages/staff/ContentCreation';
import GradeBook from './pages/staff/GradeBook';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import NotificationManagement from './pages/admin/NotificationManagement';
import StudentActivityMonitoring from './pages/admin/StudentActivityMonitoring';
import SubjectManagement from './pages/admin/SubjectManagement';
import SystemSettings from './pages/admin/SystemSettings';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import AssignmentManagement from './pages/admin/AssignmentManagement';

// Layout Components
import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    // Redirect based on user role
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'staff':
        return <Navigate to="/staff/dashboard" replace />;
      case 'student':
      default:
        return <Navigate to="/student/dashboard" replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <PublicRoute>
                <PublicLayout>
                  <LandingPage />
                </PublicLayout>
              </PublicRoute>
            } />
            
            <Route path="/about" element={
              <PublicLayout>
                <AboutUs />
              </PublicLayout>
            } />
            
            <Route path="/signin" element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            } />
            
            <Route path="/signup" element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } />

            {/* Default Dashboard Route */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student/home" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <StudentHome />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <StudentDashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/student/ai-tutor" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <AITutorChat />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/student/courses" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <MyCourses />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/student/study-sessions" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <StudySessions />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/student/assignments" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <Assignments />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/student/progress" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <ProgressTracking />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            <Route path="/student/schedule" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <StudentSchedule />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            <Route path="/student/achievements" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <StudentAchievements />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            {/* Course Detail Routes */}
            <Route path="/courses/:id" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <CourseDetail />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            <Route path="/courses/:id/learn" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProtectedLayout>
                  <CourseLearning />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            {/* Staff Routes */}
            <Route path="/staff/dashboard" element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <ProtectedLayout>
                  <StaffDashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/staff/courses" element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <ProtectedLayout>
                  <CourseManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/staff/student-progress" element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <ProtectedLayout>
                  <StudentProgress />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/staff/content" element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <ProtectedLayout>
                  <ContentCreation />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/staff/gradebook" element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <ProtectedLayout>
                  <GradeBook />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProtectedLayout>
                  <AdminDashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProtectedLayout>
                  <UserManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProtectedLayout>
                  <NotificationManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/student-activity" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProtectedLayout>
                  <StudentActivityMonitoring />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/subjects" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProtectedLayout>
                  <SubjectManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProtectedLayout>
                  <SystemSettings />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProtectedLayout>
                  <ReportsAnalytics />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/assignments" element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <ProtectedLayout>
                  <AssignmentManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            {/* Common Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Settings />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Notifications />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
              },
            }}
          />
        </div>
      </Router>
        </NotificationProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
