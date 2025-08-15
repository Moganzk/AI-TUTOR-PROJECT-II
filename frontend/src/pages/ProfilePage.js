import React, { useState, useEffect } from 'react';
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
  Upload,
  Shield,
  Award,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  Users,
  Settings,
  Eye,
  EyeOff,
  Key,
  AlertCircle,
  CheckCircle,
  Lock,
  Unlock,
  Link,
  Github,
  Linkedin,
  Twitter,
  Globe
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: '',
    birthDate: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    specialization: '',
    yearsOfExperience: '',
    education: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    coursesCompleted: 0,
    totalPoints: 0,
    studyHours: 0,
    achievements: 0,
    currentStreak: 0,
    longestStreak: 0
  });

  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
    loadStats();
    loadAchievements();
    loadRecentActivity();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

  const { apiService } = await import('../services/api');
  const { data } = await apiService.users.getProfile();
      
      if (data.success && data.profile) {
        const profile = data.profile;
        setProfileData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          bio: profile.bio || '',
          avatar: profile.avatar || '',
          birthDate: profile.birthDate || '',
          website: profile.website || '',
          github: profile.github || '',
          linkedin: profile.linkedin || '',
          twitter: profile.twitter || '',
          specialization: profile.specialization || '',
          yearsOfExperience: profile.yearsOfExperience || '',
          education: profile.education || ''
        });

        // Update stats if available
        if (data.stats) {
          setStats(data.stats);
        }

        // Update recent activity if available
        if (data.recentActivity) {
          setRecentActivity(data.recentActivity);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
      
      // Fallback to basic user data from auth context
      setProfileData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        bio: '',
        avatar: '',
        birthDate: '',
        website: '',
        github: '',
        linkedin: '',
        twitter: '',
        specialization: '',
        yearsOfExperience: '',
        education: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Stats are now loaded as part of loadProfileData() from the /profile endpoint
      // This function is kept for compatibility but the real stats come from the profile API
      // Set fallback stats if not loaded from profile endpoint
      if (!stats.coursesCompleted && !stats.coursesCreated) {
        if (user?.role === 'student') {
          setStats({
            coursesCompleted: 0,
            totalPoints: 0,
            studyHours: 0,
            achievements: 0,
            currentStreak: 0,
            longestStreak: 0
          });
        } else if (user?.role === 'staff') {
          setStats({
            coursesCreated: 0,
            totalStudents: 0,
            avgRating: 0,
            totalHours: 0,
            coursesCompleted: 0,
            achievements: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAchievements([]);
        return;
      }

      const { apiService } = await import('../services/api');
      const { data } = await apiService.get('/api/achievements');
      if (data.success && data.achievements) {
        setAchievements(data.achievements);
      } else {
        setAchievements([
          {
            id: 1,
            title: 'Welcome to AI Tutor',
            description: 'Successfully created your account',
            icon: '🎓',
            date: new Date().toISOString().split('T')[0],
            type: 'milestone'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      setAchievements([]);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Recent activity is now loaded as part of loadProfileData() from the /profile endpoint
      // This function is kept for compatibility but the real activity comes from the profile API
      // Set fallback activity if not loaded from profile endpoint
      if (recentActivity.length === 0) {
        setRecentActivity([
          {
            id: 1,
            type: 'profile_updated',
            title: 'Profile Updated',
            description: 'Updated profile information',
            date: new Date().toISOString(),
            icon: User
          },
          {
            id: 2,
            type: 'account_created',
            title: 'Account Created',
            description: 'Welcome to AI Tutor platform',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            icon: Award
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    
    if (!profileData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const { apiService } = await import('../services/api');
      const { data } = await apiService.users.updateProfile(profileData);
      if (data.success) {
        if (data.profile) {
          setProfileData({
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            email: data.profile.email || '',
            phone: data.profile.phone || '',
            address: data.profile.address || '',
            bio: data.profile.bio || '',
            avatar: data.profile.avatar || '',
            birthDate: data.profile.birthDate || '',
            website: data.profile.website || '',
            github: data.profile.github || '',
            linkedin: data.profile.linkedin || '',
            twitter: data.profile.twitter || '',
            specialization: data.profile.specialization || '',
            yearsOfExperience: data.profile.yearsOfExperience || '',
            education: data.profile.education || ''
          });
        }
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else throw new Error(data.error || 'Failed to update profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    if (!passwordData.currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }
    
    try {
      const { apiService } = await import('../services/api');
      const response = await apiService.users.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      const data = response.data;

      if (data && data.success) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
      } else {
        throw new Error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password. Please try again.');
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
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

      // Simulate file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({...profileData, avatar: e.target.result});
        toast.success('Avatar updated! Save profile to apply changes.');
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const renderStats = () => {
    if (user?.role === 'student') {
      return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Courses</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.coursesCompleted}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Points</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats.totalPoints}
                </p>
              </div>
              <Star className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Study Hours</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stats.studyHours}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Achievements</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {stats.achievements}
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Current Streak</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {stats.currentStreak}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.longestStreak}
                </p>
              </div>
              <Award className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>
      );
    } else if (user?.role === 'staff') {
      return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Courses Created</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.coursesCreated}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Total Students</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats.totalStudents}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stats.avgRating}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading profile...</span>
        </div>
      ) : (
        <>
          {/* Profile Header */}
          <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="relative px-6 pb-6">
          <div className="flex flex-col -mt-16 sm:flex-row sm:items-end sm:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 p-2 bg-white rounded-full shadow-lg dark:bg-gray-800">
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Profile" 
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 text-white bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700">
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p className="text-gray-600 capitalize dark:text-gray-400">
                    {user?.role}
                  </p>
                  {profileData.bio && (
                    <p className="max-w-md mt-2 text-gray-600 dark:text-gray-400">
                      {profileData.bio}
                    </p>
                  )}
                </div>
                <div className="flex items-center mt-4 space-x-3 sm:mt-0">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center px-4 py-2 space-x-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-6 space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'achievements'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Activity
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
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
                      className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="text-gray-900 dark:text-white">{profileData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                          <p className="text-gray-900 dark:text-white">{profileData.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                          <p className="text-gray-900 dark:text-white">{profileData.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Birth Date</p>
                          <p className="text-gray-900 dark:text-white">{formatDate(profileData.birthDate)}</p>
                        </div>
                      </div>
                      {profileData.website && (
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                            <a href={profileData.website} className="text-blue-600 dark:text-blue-400 hover:underline">
                              {profileData.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {user?.role === 'staff' && (
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Specialization</p>
                            <p className="text-gray-900 dark:text-white">{profileData.specialization}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Statistics</h3>
              {renderStats()}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Achievements</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 border border-yellow-200 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-800">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                          Earned on {formatDate(achievement.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start p-4 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex-shrink-0">
                      <activity.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        {getTimeAgo(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ProfilePage;
