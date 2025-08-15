import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';
import { 
  GraduationCap,
  Menu,
  Home,
  MessageSquare,
  BookOpen,
  Users,
  Settings,
  Bell,
  User,
  LogOut,
  BarChart3,
  Calendar,
  FileText,
  Briefcase,
  Activity,
  ChevronDown,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

const ProtectedLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { user, logout } = useAuth();
  const { theme, changeTheme, themes } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Refs for click outside detection
  const profileRef = useRef(null);
  const themeRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close all dropdowns when route changes
  useEffect(() => {
    setIsProfileOpen(false);
    setShowThemeMenu(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleThemeMenu = () => {
    setShowThemeMenu(!showThemeMenu);
  };

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    setShowThemeMenu(false);
  };

  const getThemeIcon = (themeId) => {
    switch (themeId) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Monitor;
    }
  };

  const handleLogout = async () => {
    try {
      setIsProfileOpen(false);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout fails
      navigate('/');
    }
  };

  const handleProfileNavigation = (path) => {
    setIsProfileOpen(false);
    navigate(path);
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Assignment Management', href: '/admin/assignments', icon: FileText },
          { name: 'Notification Management', href: '/admin/notifications', icon: Bell },
          { name: 'Student Activity', href: '/admin/student-activity', icon: Activity },
          { name: 'Subject Management', href: '/admin/subjects', icon: BookOpen },
          { name: 'System Settings', href: '/admin/settings', icon: Settings },
          { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
          { name: 'Profile', href: '/profile', icon: User },
          { name: 'My Notifications', href: '/notifications', icon: Bell },
        ];
      case 'staff':
        return [
          { name: 'Dashboard', href: '/staff/dashboard', icon: Home },
          { name: 'Course Management', href: '/staff/courses', icon: BookOpen },
          { name: 'Assignment Management', href: '/admin/assignments', icon: FileText },
          { name: 'Student Progress', href: '/staff/student-progress', icon: BarChart3 },
          { name: 'Content Creation', href: '/staff/content', icon: FileText },
          { name: 'Grade Book', href: '/staff/gradebook', icon: Briefcase },
          { name: 'Profile', href: '/profile', icon: User },
          { name: 'Settings', href: '/settings', icon: Settings },
          { name: 'Notifications', href: '/notifications', icon: Bell },
        ];
      case 'student':
      default:
        return [
          { name: 'Dashboard', href: '/student/dashboard', icon: Home },
          { name: 'AI Tutor', href: '/student/ai-tutor', icon: MessageSquare },
          { name: 'My Courses', href: '/student/courses', icon: BookOpen },
          { name: 'Study Sessions', href: '/student/study-sessions', icon: Calendar },
          { name: 'Assignments', href: '/student/assignments', icon: FileText },
          { name: 'Progress', href: '/student/progress', icon: BarChart3 },
          { name: 'Profile', href: '/profile', icon: User },
          { name: 'Settings', href: '/settings', icon: Settings },
          { name: 'Notifications', href: '/notifications', icon: Bell },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-600 to-purple-600 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">AI Tutor</span>
          </div>
        </div>
        
        <nav className="mt-8 px-4 h-full overflow-y-auto pb-16 sidebar-nav">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={`${item.name}-${item.href}`}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus-ring ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 header-sticky">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white lg:hidden focus-ring"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white responsive-text-lg">
                  Welcome back, {user?.name}!
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <div className="relative" ref={themeRef}>
                  <button
                    onClick={toggleThemeMenu}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Change theme"
                  >
                    {(() => {
                      const ThemeIcon = getThemeIcon(theme);
                      return <ThemeIcon className="h-5 w-5" />;
                    })()}
                  </button>

                  {/* Theme Menu */}
                  {showThemeMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Theme
                        </div>
                        {themes.map((themeOption) => {
                          const ThemeIcon = getThemeIcon(themeOption.id);
                          return (
                            <button
                              key={themeOption.id}
                              onClick={() => handleThemeChange(themeOption.id)}
                              className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                theme === themeOption.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <ThemeIcon className="mr-3 h-4 w-4" />
                              {themeOption.name}
                              {theme === themeOption.id && (
                                <span className="ml-auto text-xs">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <NotificationDropdown 
                  onNotificationClick={(notification) => {
                    if (notification.viewAll) {
                      navigate('/notifications');
                    } else {
                      // Handle individual notification click if needed
                      navigate('/notifications');
                    }
                  }}
                />

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-2">
                        <button
                          onClick={() => handleProfileNavigation('/profile')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </button>
                        <button
                          onClick={() => handleProfileNavigation('/settings')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <Settings className="mr-3 h-4 w-4" />
                          Settings
                        </button>
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden content-stable">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ProtectedLayout;
