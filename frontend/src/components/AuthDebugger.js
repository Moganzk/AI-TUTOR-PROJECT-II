/**
 * Authentication Debugger Component
 * Helps debug authentication issues by showing token status
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { 
  User, 
  Key, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

const AuthDebugger = () => {
  const { user } = useAuth();
  const [tokenInfo, setTokenInfo] = useState({});
  const [apiTests, setApiTests] = useState({});
  const [showTokens, setShowTokens] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkTokens();
  }, []);

  const checkTokens = () => {
    const tokens = {
      token: localStorage.getItem('token'),
      aiTutorToken: localStorage.getItem('ai-tutor-token'),
      supabaseToken: localStorage.getItem('supabase.auth.token'),
      user: localStorage.getItem('user'),
      aiTutorUser: localStorage.getItem('ai-tutor-user')
    };

    let parsedUser = null;
    if (tokens.user) {
      try {
        parsedUser = JSON.parse(tokens.user);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }

    setTokenInfo({
      ...tokens,
      parsedUser,
      contextUser: user
    });
  };

  const testApiEndpoints = async () => {
    setTesting(true);
    const tests = {};

    // Test assignments endpoint
    try {
      const response = await apiService.get('/api/assignments');
      tests.assignments = {
        status: response.status,
        success: response.data?.success || false,
        count: response.data?.assignments?.length || 0,
        error: null
      };
    } catch (error) {
      tests.assignments = {
        status: error.response?.status || 0,
        success: false,
        count: 0,
        error: error.message
      };
    }

    // Test admin stats endpoint (if admin)
    if (user?.role === 'admin') {
      try {
  const response = await apiService.get('/api/admin/stats');
        tests.adminStats = {
          status: response.status,
          success: response.data?.success || false,
          data: response.data?.stats || null,
          error: null
        };
      } catch (error) {
        tests.adminStats = {
          status: error.response?.status || 0,
          success: false,
          data: null,
          error: error.message
        };
      }
    }

    // Test user profile endpoint
    try {
      const response = await apiService.get('/users/profile');
      tests.profile = {
        status: response.status,
        success: response.data?.success || false,
        data: response.data?.user || null,
        error: null
      };
    } catch (error) {
      tests.profile = {
        status: error.response?.status || 0,
        success: false,
        data: null,
        error: error.message
      };
    }

    setApiTests(tests);
    setTesting(false);
  };

  const getStatusIcon = (success, status) => {
    if (success || status === 200) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === 401) {
      return <Key className="w-5 h-5 text-yellow-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const maskToken = (token) => {
    if (!token) return 'Not found';
    if (token.length < 20) return token;
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Auth Debug
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={showTokens ? 'Hide tokens' : 'Show tokens'}
            >
              {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={checkTokens}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current User</h4>
          <div className="text-sm space-y-1">
            <div>Role: <span className="font-mono">{user?.role || 'Not logged in'}</span></div>
            <div>Email: <span className="font-mono">{user?.email || 'N/A'}</span></div>
            <div>Name: <span className="font-mono">{user?.name || 'N/A'}</span></div>
          </div>
        </div>

        {/* Token Status */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Token Status</h4>
          <div className="text-sm space-y-1">
            <div className="flex items-center">
              {tokenInfo.token ? <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> : <XCircle className="w-4 h-4 text-red-500 mr-2" />}
              <span>Main Token: {showTokens ? tokenInfo.token || 'None' : maskToken(tokenInfo.token)}</span>
            </div>
            <div className="flex items-center">
              {tokenInfo.user ? <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> : <XCircle className="w-4 h-4 text-red-500 mr-2" />}
              <span>User Data: {tokenInfo.user ? 'Present' : 'Missing'}</span>
            </div>
          </div>
        </div>

        {/* API Tests */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white">API Tests</h4>
            <button
              onClick={testApiEndpoints}
              disabled={testing}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test APIs'}
            </button>
          </div>
          
          {Object.keys(apiTests).length > 0 && (
            <div className="text-sm space-y-2">
              {apiTests.assignments && (
                <div className="flex items-center justify-between">
                  <span>Assignments:</span>
                  <div className="flex items-center">
                    {getStatusIcon(apiTests.assignments.success, apiTests.assignments.status)}
                    <span className="ml-2">{apiTests.assignments.status} ({apiTests.assignments.count} items)</span>
                  </div>
                </div>
              )}
              
              {apiTests.adminStats && (
                <div className="flex items-center justify-between">
                  <span>Admin Stats:</span>
                  <div className="flex items-center">
                    {getStatusIcon(apiTests.adminStats.success, apiTests.adminStats.status)}
                    <span className="ml-2">{apiTests.adminStats.status}</span>
                  </div>
                </div>
              )}
              
              {apiTests.profile && (
                <div className="flex items-center justify-between">
                  <span>Profile:</span>
                  <div className="flex items-center">
                    {getStatusIcon(apiTests.profile.success, apiTests.profile.status)}
                    <span className="ml-2">{apiTests.profile.status}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Fixes */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>💡 Quick fixes:</div>
          <div>• 401 errors = Login again</div>
          <div>• 404 errors = Check backend</div>
          <div>• Network errors = Check server</div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugger;