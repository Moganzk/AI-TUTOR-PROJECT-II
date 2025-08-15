import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Globe,
  Palette,
  Monitor,
  Users,
  Lock,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Info,
  Clock,
  Calendar,
  BarChart3,
  TrendingUp,
  HardDrive,
  Cpu,
  Wifi,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SystemSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    cpu: 65,
    memory: 78,
    disk: 45,
    network: 92
  });

  // System settings state
  const [settings, setSettings] = useState({
    general: {
      siteName: 'AI Tutor Platform',
      siteUrl: 'https://aitutor.com',
      adminEmail: 'admin@aitutor.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      maxFileSize: 10,
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireTwoFactor: false
    },
    security: {
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      passwordExpiry: 90,
      sessionSecurity: 'high',
      ipWhitelist: [],
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'gif'],
      enableAuditLogs: true,
      dataEncryption: true,
      sslRequired: true,
      corsEnabled: true
    },
    email: {
      provider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: true,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@aitutor.com',
      fromName: 'AI Tutor Platform',
      enableBounceHandling: true,
      maxEmailsPerHour: 1000
    },
    notifications: {
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      browserNotifications: true,
      notificationRetention: 30,
      batchNotifications: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: 'cloud',
      includeFiles: true,
      includeDatabase: true,
      compressionEnabled: true
    },
    performance: {
      cacheEnabled: true,
      cacheTimeout: 3600,
      compressionEnabled: true,
      cdnEnabled: false,
      cdnUrl: '',
      rateLimitEnabled: true,
      rateLimitRequests: 1000,
      rateLimitWindow: 60
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'backup', name: 'Backup', icon: Database },
    { id: 'performance', name: 'Performance', icon: Activity }
  ];

  const systemStats = [
    { name: 'CPU Usage', value: systemHealth.cpu, color: 'blue', icon: Cpu },
    { name: 'Memory Usage', value: systemHealth.memory, color: 'green', icon: HardDrive },
    { name: 'Disk Usage', value: systemHealth.disk, color: 'yellow', icon: HardDrive },
    { name: 'Network Status', value: systemHealth.network, color: 'purple', icon: Wifi }
  ];

  const recentActivities = [
    { id: 1, type: 'security', message: 'Security settings updated', timestamp: '2024-01-15 10:30', user: 'admin' },
    { id: 2, type: 'backup', message: 'Automated backup completed', timestamp: '2024-01-15 09:00', user: 'system' },
    { id: 3, type: 'maintenance', message: 'System maintenance scheduled', timestamp: '2024-01-15 08:45', user: 'admin' },
    { id: 4, type: 'performance', message: 'Cache settings optimized', timestamp: '2024-01-15 08:30', user: 'admin' },
    { id: 5, type: 'email', message: 'Email configuration updated', timestamp: '2024-01-15 08:15', user: 'admin' }
  ];

  useEffect(() => {
    // Simulate system health monitoring
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 3))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      toast.success('Settings reset to defaults');
    }
  };

  const handleTestEmail = () => {
    toast.success('Test email sent successfully');
  };

  const handleBackup = () => {
    setShowBackupModal(true);
  };

  const handleMaintenance = () => {
    setShowMaintenanceModal(true);
  };

  const handleSystemRestart = () => {
    if (window.confirm('Are you sure you want to restart the system? This will temporarily make the platform unavailable.')) {
      toast.success('System restart initiated');
    }
  };

  const handleExportSettings = () => {
    toast.success('Settings exported successfully');
  };

  const handleImportSettings = () => {
    toast.success('Settings imported successfully');
  };

  const getHealthColor = (value) => {
    if (value < 50) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (value) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, siteName: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, siteUrl: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Admin Email
          </label>
          <input
            type="email"
            value={settings.general.adminEmail}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, adminEmail: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, timezone: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Maintenance Mode
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Temporarily disable site access for maintenance
            </p>
          </div>
          <button
            onClick={() => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, maintenanceMode: !prev.general.maintenanceMode }
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.general.maintenanceMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Registration Enabled
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Allow new users to register
            </p>
          </div>
          <button
            onClick={() => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, registrationEnabled: !prev.general.registrationEnabled }
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.general.registrationEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.general.registrationEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lockout Duration (minutes)
          </label>
          <input
            type="number"
            value={settings.security.lockoutDuration}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, lockoutDuration: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Audit Logs
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track all system activities
            </p>
          </div>
          <button
            onClick={() => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, enableAuditLogs: !prev.security.enableAuditLogs }
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.enableAuditLogs ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.security.enableAuditLogs ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Data Encryption
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Encrypt sensitive data at rest
            </p>
          </div>
          <button
            onClick={() => setSettings(prev => ({
              ...prev,
              security: { ...prev.security, dataEncryption: !prev.security.dataEncryption }
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.dataEncryption ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.security.dataEncryption ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              email: { ...prev.email, smtpHost: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              email: { ...prev.email, smtpPort: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Email
          </label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              email: { ...prev.email, fromEmail: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Name
          </label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              email: { ...prev.email, fromName: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleTestEmail}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Mail className="h-4 w-4" />
          <span>Send Test Email</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              System Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Configure and manage system-wide settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleImportSettings}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <button
              onClick={handleExportSettings}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleSystemRestart}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Restart</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {systemStats.map((stat) => (
            <div key={stat.name} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <stat.icon className={`h-8 w-8 ${getHealthColor(stat.value)}`} />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.name}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${getHealthBgColor(stat.value)}`}
                  style={{ width: `${stat.value}%` }}
                />
              </div>
              <p className={`text-lg font-semibold ${getHealthColor(stat.value)}`}>
                {stat.value}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'email' && renderEmailSettings()}
          {activeTab === 'notifications' && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Notification settings panel would be rendered here
            </div>
          )}
          {activeTab === 'backup' && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Backup configuration panel would be rendered here
            </div>
          )}
          {activeTab === 'performance' && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Performance optimization panel would be rendered here
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg flex justify-between">
          <button
            onClick={handleResetSettings}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={handleSaveSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent System Activity
        </h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp} • {activity.user}
                  </p>
                </div>
              </div>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
