import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Key,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, changeTheme, themes } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    notifications: {
      email: {
        assignments: true,
        grades: true,
        announcements: true,
        reminders: true,
        marketing: false
      },
      push: {
        assignments: true,
        grades: true,
        announcements: false,
        reminders: true,
        sound: true
      },
      sms: {
        urgent: true,
        reminders: false,
        marketing: false
      }
    },
    privacy: {
      profileVisibility: 'private',
      showEmail: false,
      showPhone: false,
      activityTracking: true,
      analyticsOptOut: false,
      dataRetention: '1year'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30min',
      loginNotifications: true,
      suspiciousActivityAlerts: true
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'account', label: 'Account', icon: User },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ];

  const handleSettingChange = (category, subcategory, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: typeof prev[category][subcategory] === 'object' 
          ? { ...prev[category][subcategory], [key]: value }
          : value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // In real app, this would export user data
      const data = {
        profile: user,
        settings: settings,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-tutor-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // In real app, this would delete the account
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account deletion initiated. Check your email for confirmation.');
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </div>
        {description && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
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
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <nav className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="p-6 space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    General Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configure your basic application preferences
                  </p>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {themes.map((themeOption) => {
                      const Icon = getThemeIcon(themeOption.id);
                      return (
                        <button
                          key={themeOption.id}
                          onClick={() => changeTheme(themeOption.id)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            theme === themeOption.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {themeOption.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => handleSettingChange('general', null, 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange('general', null, 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Format
                  </label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => handleSettingChange('general', null, 'dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                {/* Time Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Format
                  </label>
                  <select
                    value={settings.general.timeFormat}
                    onChange={(e) => handleSettingChange('general', null, 'timeFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="p-6 space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Notification Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose how you want to be notified about important updates
                  </p>
                </div>

                {/* Email Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Notifications
                  </h3>
                  <div className="space-y-2">
                    <ToggleSwitch
                      enabled={settings.notifications.email.assignments}
                      onChange={(value) => handleSettingChange('notifications', 'email', 'assignments', value)}
                      label="Assignment updates"
                      description="New assignments, due dates, and submissions"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.email.grades}
                      onChange={(value) => handleSettingChange('notifications', 'email', 'grades', value)}
                      label="Grade notifications"
                      description="When grades are posted or updated"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.email.announcements}
                      onChange={(value) => handleSettingChange('notifications', 'email', 'announcements', value)}
                      label="Announcements"
                      description="Course and system announcements"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.email.reminders}
                      onChange={(value) => handleSettingChange('notifications', 'email', 'reminders', value)}
                      label="Reminders"
                      description="Study reminders and deadline alerts"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.email.marketing}
                      onChange={(value) => handleSettingChange('notifications', 'email', 'marketing', value)}
                      label="Marketing emails"
                      description="Product updates and feature announcements"
                    />
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Push Notifications
                  </h3>
                  <div className="space-y-2">
                    <ToggleSwitch
                      enabled={settings.notifications.push.assignments}
                      onChange={(value) => handleSettingChange('notifications', 'push', 'assignments', value)}
                      label="Assignment updates"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.push.grades}
                      onChange={(value) => handleSettingChange('notifications', 'push', 'grades', value)}
                      label="Grade notifications"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.push.announcements}
                      onChange={(value) => handleSettingChange('notifications', 'push', 'announcements', value)}
                      label="Announcements"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.push.reminders}
                      onChange={(value) => handleSettingChange('notifications', 'push', 'reminders', value)}
                      label="Reminders"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.push.sound}
                      onChange={(value) => handleSettingChange('notifications', 'push', 'sound', value)}
                      label="Sound notifications"
                      description="Play sound with push notifications"
                    />
                  </div>
                </div>

                {/* SMS Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    SMS Notifications
                  </h3>
                  <div className="space-y-2">
                    <ToggleSwitch
                      enabled={settings.notifications.sms.urgent}
                      onChange={(value) => handleSettingChange('notifications', 'sms', 'urgent', value)}
                      label="Urgent notifications"
                      description="Critical updates and deadlines"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.sms.reminders}
                      onChange={(value) => handleSettingChange('notifications', 'sms', 'reminders', value)}
                      label="Reminders"
                      description="Study reminders via SMS"
                    />
                    <ToggleSwitch
                      enabled={settings.notifications.sms.marketing}
                      onChange={(value) => handleSettingChange('notifications', 'sms', 'marketing', value)}
                      label="Marketing messages"
                      description="Promotional SMS messages"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeTab === 'privacy' && (
              <div className="p-6 space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Privacy Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Control your privacy and data sharing preferences
                  </p>
                </div>

                {/* Profile Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingChange('privacy', null, 'profileVisibility', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <ToggleSwitch
                      enabled={settings.privacy.showEmail}
                      onChange={(value) => handleSettingChange('privacy', null, 'showEmail', value)}
                      label="Show email address"
                      description="Allow others to see your email address"
                    />
                    <ToggleSwitch
                      enabled={settings.privacy.showPhone}
                      onChange={(value) => handleSettingChange('privacy', null, 'showPhone', value)}
                      label="Show phone number"
                      description="Allow others to see your phone number"
                    />
                  </div>
                </div>

                {/* Data & Analytics */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Data & Analytics
                  </h3>
                  <div className="space-y-2">
                    <ToggleSwitch
                      enabled={settings.privacy.activityTracking}
                      onChange={(value) => handleSettingChange('privacy', null, 'activityTracking', value)}
                      label="Activity tracking"
                      description="Track your activity to improve the learning experience"
                    />
                    <ToggleSwitch
                      enabled={settings.privacy.analyticsOptOut}
                      onChange={(value) => handleSettingChange('privacy', null, 'analyticsOptOut', value)}
                      label="Opt out of analytics"
                      description="Disable anonymous usage analytics"
                    />
                  </div>
                </div>

                {/* Data Retention */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Retention
                  </label>
                  <select
                    value={settings.privacy.dataRetention}
                    onChange={(e) => handleSettingChange('privacy', null, 'dataRetention', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="6months">6 Months</option>
                    <option value="1year">1 Year</option>
                    <option value="2years">2 Years</option>
                    <option value="indefinite">Indefinite</option>
                  </select>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="p-6 space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Security Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your account security and access settings
                  </p>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('security', null, 'twoFactorAuth', !settings.security.twoFactorAuth)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        settings.security.twoFactorAuth
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {settings.security.twoFactorAuth ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                </div>

                {/* Session Timeout */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Timeout
                  </label>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', null, 'sessionTimeout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="15min">15 Minutes</option>
                    <option value="30min">30 Minutes</option>
                    <option value="1hour">1 Hour</option>
                    <option value="2hours">2 Hours</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                {/* Security Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Security Notifications
                  </h3>
                  <div className="space-y-2">
                    <ToggleSwitch
                      enabled={settings.security.loginNotifications}
                      onChange={(value) => handleSettingChange('security', null, 'loginNotifications', value)}
                      label="Login notifications"
                      description="Get notified when someone logs into your account"
                    />
                    <ToggleSwitch
                      enabled={settings.security.suspiciousActivityAlerts}
                      onChange={(value) => handleSettingChange('security', null, 'suspiciousActivityAlerts', value)}
                      label="Suspicious activity alerts"
                      description="Get alerted about unusual account activity"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Account */}
            {activeTab === 'account' && (
              <div className="p-6 space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Account Management
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your account data and preferences
                  </p>
                </div>

                {/* Data Export */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        Export Your Data
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Download a copy of your account data
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </button>
                  </div>
                </div>

                {/* Account Deactivation */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        Deactivate Account
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Temporarily disable your account
                      </p>
                    </div>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                      Deactivate
                    </button>
                  </div>
                </div>

                {/* Account Deletion */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Support */}
            {activeTab === 'support' && (
              <div className="p-6 space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Support & Help
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get help and support for your account
                  </p>
                </div>

                {/* Help Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Info className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Help Center
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Browse our help articles
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Contact Support
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get help from our team
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="h-6 w-6 text-purple-600" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          User Guide
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Learn how to use the platform
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-6 w-6 text-orange-600" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Community Forum
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Connect with other users
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    System Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Version:</span>
                      <span className="text-gray-900 dark:text-white">1.0.0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                      <span className="text-gray-900 dark:text-white">2024-01-15</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Platform:</span>
                      <span className="text-gray-900 dark:text-white">Web</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            {activeTab !== 'account' && activeTab !== 'support' && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Account
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
