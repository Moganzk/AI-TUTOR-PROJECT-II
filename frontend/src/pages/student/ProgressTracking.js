import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  BookOpen,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  Star,
  Trophy,
  Zap,
  Brain,
  Timer,
  TrendingDown
} from 'lucide-react';

const ProgressTracking = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Data will be loaded from API
  const subjects = [
    { id: 'all', name: 'All Subjects', color: '#6B7280' },
    { id: 'python', name: 'Python Programming', color: '#3B82F6' },
    { id: 'math', name: 'Advanced Mathematics', color: '#10B981' },
    { id: 'web', name: 'Web Development', color: '#8B5CF6' },
    { id: 'db', name: 'Database Systems', color: '#F59E0B' }
  ];

  const progressData = {
    overall: {
      completion: 68,
      averageGrade: 87,
      studyHours: 42,
      achievements: 15
    },
    subjects: [
      {
        id: 'python',
        name: 'Python Programming',
        progress: 85,
        grade: 92,
        timeSpent: 15,
        assignments: { completed: 8, total: 10 },
        quizzes: { completed: 6, total: 8 },
        trend: 'up'
      },
      {
        id: 'math',
        name: 'Advanced Mathematics',
        progress: 72,
        grade: 88,
        timeSpent: 12,
        assignments: { completed: 5, total: 8 },
        quizzes: { completed: 4, total: 6 },
        trend: 'up'
      },
      {
        id: 'web',
        name: 'Web Development',
        progress: 60,
        grade: 85,
        timeSpent: 10,
        assignments: { completed: 3, total: 6 },
        quizzes: { completed: 2, total: 4 },
        trend: 'stable'
      },
      {
        id: 'db',
        name: 'Database Systems',
        progress: 55,
        grade: 82,
        timeSpent: 8,
        assignments: { completed: 2, total: 5 },
        quizzes: { completed: 3, total: 5 },
        trend: 'down'
      }
    ],
    weeklyProgress: [
      { week: 'Week 1', hours: 8, grade: 85 },
      { week: 'Week 2', hours: 12, grade: 88 },
      { week: 'Week 3', hours: 15, grade: 90 },
      { week: 'Week 4', hours: 10, grade: 87 },
      { week: 'Week 5', hours: 14, grade: 92 },
      { week: 'Week 6', hours: 16, grade: 89 }
    ],
    achievements: [
      { id: 1, title: 'First Assignment', description: 'Completed your first assignment', icon: 'trophy', date: '2024-01-10' },
      { id: 2, title: 'Study Streak', description: '7 days of consistent study', icon: 'zap', date: '2024-01-15' },
      { id: 3, title: 'Quiz Master', description: 'Scored 90%+ on 5 quizzes', icon: 'star', date: '2024-01-18' },
      { id: 4, title: 'Code Warrior', description: 'Completed 10 programming exercises', icon: 'brain', date: '2024-01-20' }
    ]
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAchievementIcon = (iconType) => {
    switch (iconType) {
      case 'trophy':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'zap':
        return <Zap className="h-6 w-6 text-blue-500" />;
      case 'star':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'brain':
        return <Brain className="h-6 w-6 text-green-500" />;
      default:
        return <Award className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Progress Tracking
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor your learning progress and achievements across all subjects
        </p>
      </div>

      {/* Overall Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overall Progress
              </span>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {progressData.overall.completion}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(progressData.overall.completion)}`}
                style={{ width: `${progressData.overall.completion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Grade
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {progressData.overall.averageGrade}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Study Hours
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {progressData.overall.studyHours}h
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Achievements
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {progressData.overall.achievements}
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subject Progress
          </h2>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {progressData.subjects.map((subject) => (
            <div key={subject.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {subject.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{subject.timeSpent}h studied</span>
                      <span>•</span>
                      <span>Grade: {subject.grade}%</span>
                      {getTrendIcon(subject.trend)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {subject.progress}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Complete
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(subject.progress)}`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Assignments: {subject.assignments.completed}/{subject.assignments.total}
                  </span>
                  <span>
                    Quizzes: {subject.quizzes.completed}/{subject.quizzes.total}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weekly Progress
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedPeriod === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedPeriod === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Study Hours
            </h3>
            <div className="space-y-2">
              {progressData.weeklyProgress.map((week, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {week.week}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(week.hours / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {week.hours}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Average Grades
            </h3>
            <div className="space-y-2">
              {progressData.weeklyProgress.map((week, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {week.week}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${week.grade}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {week.grade}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Achievements
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progressData.achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {getAchievementIcon(achievement.icon)}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {achievement.description}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  {achievement.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking;
