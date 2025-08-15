import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Play, 
  Pause,
  Square,
  Timer,
  Target,
  TrendingUp,
  Brain,
  Coffee,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudySessions = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Data will be loaded from API
  const courses = [
    { id: 1, title: 'Python Programming', color: 'bg-blue-500' },
    { id: 2, title: 'Advanced Mathematics', color: 'bg-green-500' },
    { id: 3, title: 'Web Development', color: 'bg-purple-500' }
  ];

  const recentSessions = [
    {
      id: 1,
      course: 'Python Programming',
      duration: '1h 30m',
      date: '2024-01-15',
      topics: ['Functions', 'Classes', 'Modules'],
      productivity: 85
    },
    {
      id: 2,
      course: 'Advanced Mathematics',
      duration: '2h 15m',
      date: '2024-01-14',
      topics: ['Calculus', 'Integration'],
      productivity: 92
    }
  ];

  const startSession = () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }
    
    setCurrentSession({
      course: selectedCourse,
      startTime: new Date(),
      topics: []
    });
    setIsActive(true);
    setSessionTimer(0);
    toast.success('Study session started!');
  };

  const pauseSession = () => {
    setIsActive(false);
    toast.success('Session paused');
  };

  const resumeSession = () => {
    setIsActive(true);
    toast.success('Session resumed');
  };

  const stopSession = () => {
    setIsActive(false);
    setCurrentSession(null);
    setSessionTimer(0);
    toast.success('Session ended');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Study Sessions
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Track your study time and maintain focus with structured sessions
        </p>
      </div>

      {/* Current Session */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Session
        </h2>
        
        {!currentSession ? (
          <div className="text-center py-8">
            <Timer className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to start studying?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Select a course and begin your focused study session
            </p>
            
            <div className="max-w-md mx-auto space-y-4">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.title}>
                    {course.title}
                  </option>
                ))}
              </select>
              
              <button
                onClick={startSession}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Start Session</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {formatTime(sessionTimer)}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                Studying: {currentSession.course}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              {isActive ? (
                <button
                  onClick={pauseSession}
                  className="bg-yellow-600 text-white py-2 px-6 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
                >
                  <Pause className="h-5 w-5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeSession}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>Resume</span>
                </button>
              )}
              
              <button
                onClick={stopSession}
                className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Square className="h-5 w-5" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">2h 30m</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">18h 45m</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">12</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Focus</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">89%</p>
            </div>
            <Brain className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Sessions
        </h2>
        
        <div className="space-y-4">
          {recentSessions.map((session) => (
            <div key={session.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {session.course}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {session.duration}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {session.topics.map((topic, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {session.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {session.productivity}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Productivity
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Study Tips
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Focus Deeply
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Eliminate distractions and focus on one topic at a time for better retention.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Coffee className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Take Breaks
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Regular breaks help maintain focus and prevent mental fatigue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySessions;
