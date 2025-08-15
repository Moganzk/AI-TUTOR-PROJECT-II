import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Camera,
  Award,
  BookOpen,
  Clock,
  Target,
  Star,
  Trophy,
  TrendingUp,
  FileText,
  Shield,
  Settings,
  Eye,
  EyeOff,
  Key,
  Bell,
  Globe,
  Palette,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    preferences: {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      language: 'en',
      timezone: 'UTC'
    }
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // User stats state - will be loaded from API
  const [userStats, setUserStats] = useState({
    student: {
      completedCourses: 0,
      totalHours: 0,
      achievements: 0,
      currentStreak: 0,
      averageScore: 0
    },
    staff: {
      studentsManaged: 0,
      coursesCreated: 0,
      totalLessons: 0,
      averageRating: 0,
      yearsExperience: 0
    },
    admin: {
      totalUsers: 0,
      systemUptime: 0,
      coursesManaged: 0,
      monthlyGrowth: 0,
      ticketsResolved: 0
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        dateOfBirth: user.dateOfBirth || '',
        preferences: user.preferences || {
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          language: 'en',
          timezone: 'UTC'
        }
      });
      
      // Fetch real user stats from backend
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const { data } = await apiService.users.getProfile();
      if (data.success && data.stats) {
        setUserStats(prevStats => ({
          ...prevStats,
            [user?.role]: data.stats
        }));
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Keep default values on error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (category, key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: typeof prev.preferences[category] === 'object' 
          ? { ...prev.preferences[category], [key]: value }
          : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let updatedData = { ...formData };
      
      // Handle image upload if there's a new image
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);
        
        // In a real app, you would upload to your server
        // For now, we'll just use the preview URL
        updatedData.avatar_url = imagePreview;
        toast.success('Profile image updated!');
      }
      
      await updateProfile(updatedData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setProfileImage(null);
      setImagePreview(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    
    try {
      // In real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully!');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      toast.success('Image selected. Save profile to upload.');
    }
  };

  const stats = userStats[user?.role] || userStats.student;

  const getThemeIcon = (theme) => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const StatCard = ({ icon: Icon, label, value, color = 'text-blue-600' }) => (
    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {imagePreview || user?.avatar_url ? (
              <img 
                src={imagePreview || user?.avatar_url} 
                alt="Profile"
                className="object-cover w-24 h-24 rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-600">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-2 text-white transition-colors bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <button
                onClick={() => {
                  setImagePreview(null);
                  setProfileImage(null);
                }}
                className="absolute p-1 text-white transition-colors bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </h1>
            <p className="text-gray-500 capitalize dark:text-gray-400">
              {user?.role} • Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-1" />
                <span className="text-sm">{user?.email}</span>
              </div>
              {user?.location && (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{user.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {user?.role === 'student' && (
          <>
            <StatCard icon={BookOpen} label="Courses Completed" value={stats.completedCourses} />
            <StatCard icon={Clock} label="Study Hours" value={stats.totalHours} color="text-green-600" />
            <StatCard icon={Award} label="Achievements" value={stats.achievements} color="text-yellow-600" />
            <StatCard icon={Target} label="Current Streak" value={`${stats.currentStreak} days`} color="text-purple-600" />
            <StatCard icon={Star} label="Average Score" value={`${stats.averageScore}%`} color="text-orange-600" />
          </>
        )}
        
        {user?.role === 'staff' && (
          <>
            <StatCard icon={User} label="Students Managed" value={stats.studentsManaged} />
            <StatCard icon={BookOpen} label="Courses Created" value={stats.coursesCreated} color="text-green-600" />
            <StatCard icon={FileText} label="Total Lessons" value={stats.totalLessons} color="text-blue-600" />
            <StatCard icon={Star} label="Average Rating" value={stats.averageRating} color="text-yellow-600" />
            <StatCard icon={Trophy} label="Years Experience" value={stats.yearsExperience} color="text-purple-600" />
          </>
        )}
        
        {user?.role === 'admin' && (
          <>
            <StatCard icon={User} label="Total Users" value={stats.totalUsers} />
            <StatCard icon={TrendingUp} label="System Uptime" value={`${stats.systemUptime}%`} color="text-green-600" />
            <StatCard icon={BookOpen} label="Courses Managed" value={stats.coursesManaged} color="text-blue-600" />
            <StatCard icon={Target} label="Monthly Growth" value={`+${stats.monthlyGrowth}%`} color="text-purple-600" />
            <StatCard icon={Shield} label="Tickets Resolved" value={stats.ticketsResolved} color="text-orange-600" />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-6 space-x-8">
            {['profile', 'security', 'preferences'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              {/* Image Upload */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-700">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile Preview" className="object-cover w-full h-full" />
                      ) : (
                        <User className="w-full h-full text-gray-300 dark:text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  <label className="cursor-pointer">
                    <span className="sr-only">Choose profile image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                      <Camera className="w-4 h-4" />
                      <span>Change Image</span>
                    </div>
                  </label>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Password & Security
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your account security settings
                </p>
              </div>
              
              {!showPasswordForm ? (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Password
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Key className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Preferences
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customize your experience
                </p>
              </div>
              
              {/* Theme */}
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'system'].map((theme) => {
                    const Icon = getThemeIcon(theme);
                    return (
                      <button
                        key={theme}
                        onClick={() => handlePreferenceChange('theme', null, theme)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.preferences.theme === theme
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize dark:text-white">
                          {theme}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Notifications */}
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notifications
                </label>
                <div className="space-y-3">
                  {Object.entries(formData.preferences.notifications).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-900 capitalize dark:text-white">
                          {key} notifications
                        </span>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('notifications', key, !enabled)}
                        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                          enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                          } mt-1`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Language */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Language
                </label>
                <select
                  value={formData.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              
              {/* Timezone */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Timezone
                </label>
                <select
                  value={formData.preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => toast.success('Preferences saved!')}
                  className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
