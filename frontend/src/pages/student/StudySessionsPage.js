import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Target, 
  BookOpen, 
  Brain, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Timer,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Award,
  Star,
  Filter,
  Search,
  Eye,
  RotateCcw,
  Zap,
  Focus,
  Coffee,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Settings,
  Save,
  AlertCircle
} from 'lucide-react';

const StudySessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [studyStats, setStudyStats] = useState({});
  const [pomodoroSettings, setPomodoroSettings] = useState({
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    autoStartBreaks: false
  });

  const [newSession, setNewSession] = useState({
    title: '',
    subject: '',
    type: 'study',
    duration: 25,
    goals: [],
    notes: '',
    difficulty: 'medium',
    priority: 'medium'
  });

  const sessionTypes = [
    { id: 'study', name: 'Study Session', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'review', name: 'Review', icon: RotateCcw, color: 'bg-green-500' },
    { id: 'practice', name: 'Practice', icon: Target, color: 'bg-purple-500' },
    { id: 'reading', name: 'Reading', icon: BookOpen, color: 'bg-orange-500' },
    { id: 'assignment', name: 'Assignment', icon: Edit, color: 'bg-red-500' },
    { id: 'pomodoro', name: 'Pomodoro', icon: Timer, color: 'bg-pink-500' }
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 
    'Literature', 'Computer Science', 'Economics', 'Psychology', 'Philosophy'
  ];

  useEffect(() => {
    fetchStudySessions();
    fetchStudyStats();
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && activeSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeSession]);

  const fetchStudySessions = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setSessions([
          {
            id: 1,
            title: 'Calculus Review',
            subject: 'Mathematics',
            type: 'review',
            duration: 45,
            actualDuration: 42,
            goals: ['Review integration techniques', 'Practice substitution method'],
            notes: 'Focused on challenging problems from chapter 7',
            difficulty: 'hard',
            priority: 'high',
            status: 'completed',
            completedAt: '2024-01-25T14:30:00Z',
            createdAt: '2024-01-25T13:00:00Z',
            rating: 4,
            productivity: 85,
            distractions: 2,
            breaksCount: 1
          },
          {
            id: 2,
            title: 'Physics Problem Set',
            subject: 'Physics',
            type: 'practice',
            duration: 60,
            actualDuration: 0,
            goals: ['Complete thermodynamics problems', 'Review formulas'],
            notes: '',
            difficulty: 'medium',
            priority: 'medium',
            status: 'scheduled',
            scheduledAt: '2024-01-26T10:00:00Z',
            createdAt: '2024-01-25T16:00:00Z',
            rating: 0,
            productivity: 0,
            distractions: 0,
            breaksCount: 0
          },
          {
            id: 3,
            title: 'Chemistry Lab Report',
            subject: 'Chemistry',
            type: 'assignment',
            duration: 90,
            actualDuration: 87,
            goals: ['Write methodology section', 'Analyze results', 'Create graphs'],
            notes: 'Great progress on data analysis. Need to improve conclusion.',
            difficulty: 'hard',
            priority: 'urgent',
            status: 'completed',
            completedAt: '2024-01-24T20:15:00Z',
            createdAt: '2024-01-24T18:00:00Z',
            rating: 5,
            productivity: 92,
            distractions: 1,
            breaksCount: 2
          },
          {
            id: 4,
            title: 'History Reading',
            subject: 'History',
            type: 'reading',
            duration: 30,
            actualDuration: 18,
            goals: ['Read chapter 12', 'Take notes on key events'],
            notes: 'Interesting chapter on industrial revolution impacts',
            difficulty: 'easy',
            priority: 'low',
            status: 'paused',
            pausedAt: '2024-01-25T11:18:00Z',
            createdAt: '2024-01-25T11:00:00Z',
            rating: 3,
            productivity: 70,
            distractions: 3,
            breaksCount: 0
          },
          {
            id: 5,
            title: 'Programming Practice',
            subject: 'Computer Science',
            type: 'practice',
            duration: 120,
            actualDuration: 0,
            goals: ['Implement binary search tree', 'Write test cases', 'Debug algorithms'],
            notes: '',
            difficulty: 'hard',
            priority: 'high',
            status: 'active',
            startedAt: '2024-01-25T15:00:00Z',
            createdAt: '2024-01-25T14:45:00Z',
            rating: 0,
            productivity: 0,
            distractions: 0,
            breaksCount: 0
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      setLoading(false);
    }
  };

  const fetchStudyStats = async () => {
    try {
      // Simulate API call
      setStudyStats({
        totalHours: 156,
        sessionsCompleted: 47,
        averageProductivity: 82,
        currentStreak: 7,
        longestStreak: 21,
        favoriteSubject: 'Mathematics',
        averageSessionLength: 52,
        totalBreaks: 23,
        focusScore: 85
      });
    } catch (error) {
      console.error('Error fetching study stats:', error);
    }
  };

  const handleStartSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSession(session);
      setSessionTimer(0);
      setIsTimerRunning(true);
      
      // Update session status
      setSessions(sessions.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'active', startedAt: new Date().toISOString() }
          : s
      ));
    }
  };

  const handlePauseSession = () => {
    setIsTimerRunning(false);
    if (activeSession) {
      setSessions(sessions.map(s => 
        s.id === activeSession.id 
          ? { ...s, status: 'paused', pausedAt: new Date().toISOString() }
          : s
      ));
    }
  };

  const handleResumeSession = () => {
    setIsTimerRunning(true);
    if (activeSession) {
      setSessions(sessions.map(s => 
        s.id === activeSession.id 
          ? { ...s, status: 'active' }
          : s
      ));
    }
  };

  const handleStopSession = () => {
    if (activeSession) {
      const actualDuration = Math.floor(sessionTimer / 60);
      setSessions(sessions.map(s => 
        s.id === activeSession.id 
          ? { 
              ...s, 
              status: 'completed', 
              actualDuration,
              completedAt: new Date().toISOString()
            }
          : s
      ));
      
      setActiveSession(null);
      setSessionTimer(0);
      setIsTimerRunning(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const session = {
        id: Date.now(),
        ...newSession,
        actualDuration: 0,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        rating: 0,
        productivity: 0,
        distractions: 0,
        breaksCount: 0
      };
      
      setSessions([session, ...sessions]);
      setNewSession({
        title: '',
        subject: '',
        type: 'study',
        duration: 25,
        goals: [],
        notes: '',
        difficulty: 'medium',
        priority: 'medium'
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleDeleteSession = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      setSessions(sessions.filter(s => s.id !== sessionId));
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || session.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'urgent': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSessionTypeIcon = (type) => {
    const sessionType = sessionTypes.find(t => t.id === type);
    return sessionType ? sessionType.icon : BookOpen;
  };

  const getSessionTypeColor = (type) => {
    const sessionType = sessionTypes.find(t => t.id === type);
    return sessionType ? sessionType.color : 'bg-gray-500';
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

  const filters = [
    { id: 'all', name: 'All Sessions', count: sessions.length },
    { id: 'active', name: 'Active', count: sessions.filter(s => s.status === 'active').length },
    { id: 'scheduled', name: 'Scheduled', count: sessions.filter(s => s.status === 'scheduled').length },
    { id: 'completed', name: 'Completed', count: sessions.filter(s => s.status === 'completed').length },
    { id: 'paused', name: 'Paused', count: sessions.filter(s => s.status === 'paused').length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Brain className="h-8 w-8 mr-3" />
            Study Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your focused study time and track your progress
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Active Session Timer */}
      {activeSession && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">{activeSession.title}</h3>
              <p className="text-blue-100 mb-1">{activeSession.subject}</p>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold">{formatTime(sessionTimer)}</span>
                <span className="text-blue-100">
                  Target: {formatDuration(activeSession.duration)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isTimerRunning ? (
                <button
                  onClick={handlePauseSession}
                  className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <Pause className="h-6 w-6" />
                </button>
              ) : (
                <button
                  onClick={handleResumeSession}
                  className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <Play className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={handleStopSession}
                className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
              >
                <Square className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Study Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {studyStats.totalHours}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {studyStats.sessionsCompleted}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {studyStats.currentStreak}
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Focus Score</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {studyStats.focusScore}%
              </p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Filters */}
          <div className="flex space-x-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                  selectedFilter === filter.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {filter.name} ({filter.count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sessions..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const IconComponent = getSessionTypeIcon(session.type);
          return (
            <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`flex-shrink-0 p-3 rounded-full ${getSessionTypeColor(session.type)}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {session.title}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(session.priority)}`}>
                        {session.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {session.subject}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(session.duration)}
                      </span>
                      {session.actualDuration > 0 && (
                        <span className="flex items-center">
                          <Timer className="h-4 w-4 mr-1" />
                          Actual: {formatDuration(session.actualDuration)}
                        </span>
                      )}
                      {session.rating > 0 && (
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {session.rating}/5
                        </span>
                      )}
                    </div>
                    
                    {session.goals.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Goals:</p>
                        <ul className="text-sm text-gray-700 dark:text-gray-300">
                          {session.goals.map((goal, index) => (
                            <li key={index} className="flex items-center">
                              <Target className="h-3 w-3 mr-2 text-blue-500" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {session.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                          {session.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Created {getTimeAgo(session.createdAt)}</span>
                      {session.completedAt && (
                        <span>Completed {getTimeAgo(session.completedAt)}</span>
                      )}
                      {session.productivity > 0 && (
                        <span className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {session.productivity}% productive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {session.status === 'scheduled' && (
                    <button
                      onClick={() => handleStartSession(session.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </button>
                  )}
                  {session.status === 'paused' && (
                    <button
                      onClick={() => handleStartSession(session.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Resume</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Study Session
            </h3>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <select
                  value={newSession.subject}
                  onChange={(e) => setNewSession({...newSession, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Type
                </label>
                <select
                  value={newSession.type}
                  onChange={(e) => setNewSession({...newSession, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {sessionTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  min="5"
                  max="480"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={newSession.difficulty}
                  onChange={(e) => setNewSession({...newSession, difficulty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={newSession.priority}
                  onChange={(e) => setNewSession({...newSession, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No study sessions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first study session to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StudySessionsPage;
