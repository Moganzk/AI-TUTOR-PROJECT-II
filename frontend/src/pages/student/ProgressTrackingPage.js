import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Clock, 
  Target, 
  Award, 
  Star, 
  BookOpen, 
  Calendar,
  Filter,
  Download,
  Share2,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Activity,
  Brain,
  Zap,
  Trophy,
  Flame,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  RotateCcw,
  Forward,
  Maximize2,
  Minimize2,
  PlayCircle,
  PauseCircle,
  Calendar as CalendarIcon,
  Map,
  Layers,
  Grid,
  List,
  LineChart,
  BarChart,
  PieChart as PieChartIcon
} from 'lucide-react';

const ProgressTrackingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [selectedView, setSelectedView] = useState('charts');
  const [showSettings, setShowSettings] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    subjects: true,
    goals: true,
    habits: true,
    achievements: true
  });

  const [progressData, setProgressData] = useState({});
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [goalProgress, setGoalProgress] = useState([]);
  const [studyHabits, setStudyHabits] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [streakData, setStreakData] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  const timeRanges = [
    { id: '7d', name: '7 Days', period: 'week' },
    { id: '30d', name: '30 Days', period: 'month' },
    { id: '90d', name: '90 Days', period: 'quarter' },
    { id: '1y', name: '1 Year', period: 'year' },
    { id: 'all', name: 'All Time', period: 'lifetime' }
  ];

  const metricTypes = [
    { id: 'overall', name: 'Overall Progress', icon: TrendingUp },
    { id: 'study_time', name: 'Study Time', icon: Clock },
    { id: 'performance', name: 'Performance', icon: Target },
    { id: 'consistency', name: 'Consistency', icon: Activity },
    { id: 'engagement', name: 'Engagement', icon: Brain }
  ];

  const viewTypes = [
    { id: 'charts', name: 'Charts', icon: BarChart3 },
    { id: 'timeline', name: 'Timeline', icon: Calendar },
    { id: 'heatmap', name: 'Heatmap', icon: Grid },
    { id: 'insights', name: 'Insights', icon: Brain }
  ];

  useEffect(() => {
    fetchProgressData();
  }, [selectedTimeRange, selectedMetric]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        setProgressData({
          totalStudyHours: 156.5,
          averageSessionLength: 52,
          completionRate: 87,
          currentStreak: 12,
          longestStreak: 28,
          totalSessions: 89,
          averageGrade: 88.5,
          improvementRate: 15.2,
          focusScore: 82,
          consistencyScore: 78,
          engagementScore: 91,
          productivityScore: 85,
          weeklyGrowth: 8.3,
          monthlyGrowth: 12.7,
          subjectsStudied: 8,
          goalsMet: 34,
          totalGoals: 42,
          achievementsUnlocked: 15
        });

        setSubjectProgress([
          {
            id: 1,
            name: 'Mathematics',
            progress: 78,
            studyHours: 45.5,
            averageGrade: 85,
            sessions: 23,
            trend: 'up',
            trendValue: 12.5,
            color: '#3b82f6',
            recentActivity: 'Completed calculus assignment',
            nextMilestone: 'Midterm exam',
            strengths: ['Algebra', 'Geometry'],
            weaknesses: ['Trigonometry'],
            timeToComplete: '2 weeks',
            difficulty: 'medium'
          },
          {
            id: 2,
            name: 'Physics',
            progress: 65,
            studyHours: 38.2,
            averageGrade: 82,
            sessions: 19,
            trend: 'up',
            trendValue: 8.7,
            color: '#10b981',
            recentActivity: 'Studied thermodynamics',
            nextMilestone: 'Lab report due',
            strengths: ['Mechanics', 'Waves'],
            weaknesses: ['Quantum physics'],
            timeToComplete: '3 weeks',
            difficulty: 'hard'
          },
          {
            id: 3,
            name: 'Chemistry',
            progress: 82,
            studyHours: 41.8,
            averageGrade: 91,
            sessions: 21,
            trend: 'up',
            trendValue: 15.3,
            color: '#f59e0b',
            recentActivity: 'Aced organic chemistry test',
            nextMilestone: 'Final project',
            strengths: ['Organic chemistry', 'Reactions'],
            weaknesses: ['Physical chemistry'],
            timeToComplete: '1 week',
            difficulty: 'medium'
          },
          {
            id: 4,
            name: 'Biology',
            progress: 54,
            studyHours: 28.1,
            averageGrade: 78,
            sessions: 15,
            trend: 'down',
            trendValue: -3.2,
            color: '#ef4444',
            recentActivity: 'Struggling with genetics',
            nextMilestone: 'Chapter review',
            strengths: ['Cell biology'],
            weaknesses: ['Genetics', 'Evolution'],
            timeToComplete: '4 weeks',
            difficulty: 'hard'
          },
          {
            id: 5,
            name: 'History',
            progress: 91,
            studyHours: 32.7,
            averageGrade: 94,
            sessions: 18,
            trend: 'up',
            trendValue: 6.8,
            color: '#8b5cf6',
            recentActivity: 'Completed research paper',
            nextMilestone: 'Course complete',
            strengths: ['World wars', 'Ancient history'],
            weaknesses: ['Modern history'],
            timeToComplete: '3 days',
            difficulty: 'easy'
          }
        ]);

        setGoalProgress([
          {
            id: 1,
            title: 'Master Calculus Fundamentals',
            description: 'Complete all calculus topics with 80%+ grades',
            progress: 75,
            targetDate: '2024-02-15',
            priority: 'high',
            status: 'in_progress',
            type: 'academic',
            milestones: [
              { id: 1, title: 'Limits and Continuity', completed: true, completedDate: '2024-01-10' },
              { id: 2, title: 'Derivatives', completed: true, completedDate: '2024-01-18' },
              { id: 3, title: 'Integration', completed: false, targetDate: '2024-02-05' },
              { id: 4, title: 'Applications', completed: false, targetDate: '2024-02-15' }
            ],
            category: 'Mathematics',
            effort: 'high',
            reward: 'Certificate of Achievement'
          },
          {
            id: 2,
            title: 'Study 2 Hours Daily',
            description: 'Maintain consistent 2-hour daily study schedule',
            progress: 68,
            targetDate: '2024-03-01',
            priority: 'medium',
            status: 'in_progress',
            type: 'habit',
            milestones: [
              { id: 1, title: 'Week 1', completed: true, completedDate: '2024-01-07' },
              { id: 2, title: 'Week 2', completed: true, completedDate: '2024-01-14' },
              { id: 3, title: 'Week 3', completed: true, completedDate: '2024-01-21' },
              { id: 4, title: 'Week 4', completed: false, targetDate: '2024-01-28' }
            ],
            category: 'Study Habits',
            effort: 'medium',
            reward: 'Streak Badge'
          },
          {
            id: 3,
            title: 'Complete Physics Lab Reports',
            description: 'Submit all 5 lab reports on time with quality',
            progress: 60,
            targetDate: '2024-02-28',
            priority: 'high',
            status: 'in_progress',
            type: 'academic',
            milestones: [
              { id: 1, title: 'Lab 1: Mechanics', completed: true, completedDate: '2024-01-12' },
              { id: 2, title: 'Lab 2: Thermodynamics', completed: true, completedDate: '2024-01-19' },
              { id: 3, title: 'Lab 3: Electricity', completed: true, completedDate: '2024-01-26' },
              { id: 4, title: 'Lab 4: Optics', completed: false, targetDate: '2024-02-10' },
              { id: 5, title: 'Lab 5: Modern Physics', completed: false, targetDate: '2024-02-28' }
            ],
            category: 'Physics',
            effort: 'high',
            reward: 'Extra Credit Points'
          },
          {
            id: 4,
            title: 'Improve Focus Score',
            description: 'Achieve 90%+ focus score in study sessions',
            progress: 82,
            targetDate: '2024-01-31',
            priority: 'medium',
            status: 'in_progress',
            type: 'skill',
            milestones: [
              { id: 1, title: 'Establish distraction-free environment', completed: true, completedDate: '2024-01-05' },
              { id: 2, title: 'Use Pomodoro technique', completed: true, completedDate: '2024-01-10' },
              { id: 3, title: 'Practice mindfulness', completed: true, completedDate: '2024-01-15' },
              { id: 4, title: 'Maintain 90%+ for 1 week', completed: false, targetDate: '2024-01-31' }
            ],
            category: 'Study Skills',
            effort: 'low',
            reward: 'Focus Master Badge'
          }
        ]);

        setStudyHabits([
          {
            id: 1,
            name: 'Morning Study Sessions',
            description: 'Study for 1 hour every morning',
            frequency: 'daily',
            currentStreak: 12,
            longestStreak: 28,
            completionRate: 85,
            weeklyTarget: 7,
            weeklyCompleted: 6,
            trend: 'up',
            trendValue: 15.2,
            color: '#3b82f6',
            category: 'Time Management',
            difficulty: 'medium',
            benefits: ['Better focus', 'Consistent routine'],
            nextSession: '2024-01-26T08:00:00Z'
          },
          {
            id: 2,
            name: 'Active Note Taking',
            description: 'Use Cornell method for all lectures',
            frequency: 'per_lecture',
            currentStreak: 8,
            longestStreak: 15,
            completionRate: 72,
            weeklyTarget: 5,
            weeklyCompleted: 4,
            trend: 'up',
            trendValue: 8.7,
            color: '#10b981',
            category: 'Study Techniques',
            difficulty: 'easy',
            benefits: ['Better retention', 'Organized notes'],
            nextSession: '2024-01-26T10:00:00Z'
          },
          {
            id: 3,
            name: 'Review Before Sleep',
            description: 'Review key concepts before bedtime',
            frequency: 'daily',
            currentStreak: 5,
            longestStreak: 18,
            completionRate: 68,
            weeklyTarget: 7,
            weeklyCompleted: 5,
            trend: 'stable',
            trendValue: 2.1,
            color: '#f59e0b',
            category: 'Memory',
            difficulty: 'easy',
            benefits: ['Better memory consolidation'],
            nextSession: '2024-01-26T22:00:00Z'
          },
          {
            id: 4,
            name: 'Practice Problems',
            description: 'Solve 5 practice problems daily',
            frequency: 'daily',
            currentStreak: 3,
            longestStreak: 12,
            completionRate: 54,
            weeklyTarget: 35,
            weeklyCompleted: 18,
            trend: 'down',
            trendValue: -12.5,
            color: '#ef4444',
            category: 'Problem Solving',
            difficulty: 'hard',
            benefits: ['Skill reinforcement', 'Pattern recognition'],
            nextSession: '2024-01-26T16:00:00Z'
          }
        ]);

        setAchievements([
          {
            id: 1,
            title: 'Study Streak Master',
            description: 'Maintained 7-day study streak',
            type: 'streak',
            category: 'Consistency',
            icon: '🔥',
            color: '#ef4444',
            unlockedAt: '2024-01-20T10:00:00Z',
            rarity: 'common',
            points: 50,
            progress: 100,
            requirements: '7 consecutive days of study',
            level: 1,
            nextLevel: 'Study for 14 consecutive days'
          },
          {
            id: 2,
            title: 'Perfect Week',
            description: 'Completed all planned study sessions in a week',
            type: 'completion',
            category: 'Achievement',
            icon: '⭐',
            color: '#f59e0b',
            unlockedAt: '2024-01-15T18:00:00Z',
            rarity: 'uncommon',
            points: 100,
            progress: 100,
            requirements: '100% completion rate for one week',
            level: 1,
            nextLevel: 'Perfect month'
          },
          {
            id: 3,
            title: 'Mathematics Mastery',
            description: 'Achieved 90%+ average in Mathematics',
            type: 'academic',
            category: 'Subject Excellence',
            icon: '📐',
            color: '#3b82f6',
            unlockedAt: '2024-01-18T14:30:00Z',
            rarity: 'rare',
            points: 200,
            progress: 100,
            requirements: '90%+ average grade in Mathematics',
            level: 2,
            nextLevel: '95%+ average grade'
          },
          {
            id: 4,
            title: 'Night Owl',
            description: 'Completed 10 late-night study sessions',
            type: 'habit',
            category: 'Study Patterns',
            icon: '🦉',
            color: '#8b5cf6',
            unlockedAt: '2024-01-12T23:45:00Z',
            rarity: 'common',
            points: 75,
            progress: 100,
            requirements: '10 study sessions after 10 PM',
            level: 1,
            nextLevel: '25 late-night sessions'
          },
          {
            id: 5,
            title: 'Focus Champion',
            description: 'Maintained 95%+ focus score for 5 sessions',
            type: 'skill',
            category: 'Concentration',
            icon: '🎯',
            color: '#10b981',
            unlockedAt: '2024-01-22T16:20:00Z',
            rarity: 'epic',
            points: 500,
            progress: 100,
            requirements: '95%+ focus score for 5 consecutive sessions',
            level: 3,
            nextLevel: '98%+ focus score'
          },
          {
            id: 6,
            title: 'Early Bird',
            description: 'Started 15 study sessions before 8 AM',
            type: 'habit',
            category: 'Time Management',
            icon: '🌅',
            color: '#06b6d4',
            unlockedAt: '2024-01-08T07:30:00Z',
            rarity: 'uncommon',
            points: 150,
            progress: 100,
            requirements: '15 study sessions before 8 AM',
            level: 1,
            nextLevel: '30 early morning sessions'
          }
        ]);

        setActivityFeed([
          {
            id: 1,
            type: 'achievement',
            title: 'Unlocked Focus Champion',
            description: 'Achieved 95%+ focus score for 5 consecutive sessions',
            timestamp: '2024-01-22T16:20:00Z',
            icon: '🎯',
            color: '#10b981'
          },
          {
            id: 2,
            type: 'goal_progress',
            title: 'Made progress on Calculus goal',
            description: 'Completed derivatives milestone - 75% complete',
            timestamp: '2024-01-21T14:30:00Z',
            icon: '📈',
            color: '#3b82f6'
          },
          {
            id: 3,
            type: 'study_session',
            title: 'Completed Physics study session',
            description: '90 minutes of focused study on thermodynamics',
            timestamp: '2024-01-21T11:00:00Z',
            icon: '📚',
            color: '#8b5cf6'
          },
          {
            id: 4,
            type: 'streak',
            title: 'Extended study streak',
            description: '12 consecutive days of study - keep it up!',
            timestamp: '2024-01-20T20:00:00Z',
            icon: '🔥',
            color: '#ef4444'
          },
          {
            id: 5,
            type: 'grade',
            title: 'Received grade for Chemistry test',
            description: 'Scored 94% - excellent work!',
            timestamp: '2024-01-19T09:15:00Z',
            icon: '🎓',
            color: '#f59e0b'
          }
        ]);

        setStreakData({
          current: 12,
          longest: 28,
          thisWeek: 7,
          thisMonth: 24,
          weeklyData: [1, 1, 1, 1, 1, 1, 1], // Last 7 days
          monthlyData: Array.from({length: 30}, (_, i) => Math.random() > 0.3 ? 1 : 0)
        });

        setPerformanceMetrics({
          studyEfficiency: 85,
          retentionRate: 78,
          speedImprovement: 23,
          accuracyRate: 91,
          timeManagement: 72,
          problemSolving: 86
        });

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getGoalStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'epic': return 'bg-gradient-to-r from-purple-600 to-blue-600';
      case 'rare': return 'bg-gradient-to-r from-blue-600 to-cyan-600';
      case 'uncommon': return 'bg-gradient-to-r from-green-600 to-teal-600';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const calculateDaysRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffInDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

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
            <TrendingUp className="h-8 w-8 mr-3" />
            Progress Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your learning journey and track your achievements
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setSelectedTimeRange(range.id)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedTimeRange === range.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Study Hours</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {progressData.totalStudyHours}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                {progressData.weeklyGrowth}% this week
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {progressData.currentStreak} days
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Best: {progressData.longestStreak} days
              </p>
            </div>
            <Flame className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Grade</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {progressData.averageGrade}%
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                {progressData.improvementRate}% improvement
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
                {progressData.focusScore}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Productivity: {progressData.productivityScore}%
              </p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('overview')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Progress Overview
            </h2>
            {expandedSections.overview ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {expandedSections.overview && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Study Efficiency</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceMetrics.studyEfficiency}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${performanceMetrics.studyEfficiency}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Retention Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceMetrics.retentionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${performanceMetrics.retentionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Skill Development</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Problem Solving</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceMetrics.problemSolving}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${performanceMetrics.problemSolving}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Time Management</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceMetrics.timeManagement}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${performanceMetrics.timeManagement}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</h3>
                <div className="space-y-3">
                  {activityFeed.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-sm">{activity.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subject Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('subjects')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subject Progress
            </h2>
            {expandedSections.subjects ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {expandedSections.subjects && (
          <div className="p-6">
            <div className="space-y-4">
              {subjectProgress.map((subject) => (
                <div key={subject.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {subject.name}
                      </h3>
                      <span className={`text-sm font-medium ${subject.difficulty === 'hard' ? 'text-red-600' : subject.difficulty === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {subject.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(subject.trend)}
                      <span className={`text-sm font-medium ${subject.trend === 'up' ? 'text-green-600' : subject.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {subject.trend === 'up' ? '+' : ''}{subject.trendValue}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{subject.progress}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Study Hours</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{subject.studyHours}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Grade</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{subject.averageGrade}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{subject.sessions}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(subject.progress)}`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Strengths:</p>
                      <div className="flex flex-wrap gap-1">
                        {subject.strengths.map((strength, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-xs">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Areas for Improvement:</p>
                      <div className="flex flex-wrap gap-1">
                        {subject.weaknesses.map((weakness, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-full text-xs">
                            {weakness}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Recent: {subject.recentActivity}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Next: {subject.nextMilestone} ({subject.timeToComplete})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Goals Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('goals')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Goals Progress
            </h2>
            {expandedSections.goals ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {expandedSections.goals && (
          <div className="p-6">
            <div className="space-y-4">
              {goalProgress.map((goal) => (
                <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {goal.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGoalStatusColor(goal.status)}`}>
                          {goal.status.replace('_', ' ')}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {goal.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Due: {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {calculateDaysRemaining(goal.targetDate)} days left
                        </span>
                        <span className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {goal.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {goal.progress}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Milestones:</h4>
                    {goal.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center space-x-3">
                        {milestone.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                        )}
                        <span className={`text-sm ${milestone.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                          {milestone.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {milestone.completed 
                            ? `Completed ${new Date(milestone.completedDate).toLocaleDateString()}`
                            : `Due ${new Date(milestone.targetDate).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Effort: {goal.effort} • Reward: {goal.reward}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Study Habits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('habits')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Study Habits
            </h2>
            {expandedSections.habits ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {expandedSections.habits && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyHabits.map((habit) => (
                <div key={habit.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        {habit.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {habit.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Flame className="h-4 w-4 mr-1" />
                          {habit.currentStreak} day streak
                        </span>
                        <span className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1" />
                          Best: {habit.longestStreak}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {habit.completionRate}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {habit.weeklyCompleted}/{habit.weeklyTarget} this week
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(habit.completionRate)}`}
                      style={{ width: `${habit.completionRate}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(habit.trend)}
                      <span className={`font-medium ${habit.trend === 'up' ? 'text-green-600' : habit.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {habit.trend === 'up' ? '+' : ''}{habit.trendValue}%
                      </span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {habit.category}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Next: {new Date(habit.nextSession).toLocaleString()}
                      </span>
                      <span className={`font-medium ${habit.difficulty === 'hard' ? 'text-red-600' : habit.difficulty === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {habit.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('achievements')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Achievements
            </h2>
            {expandedSections.achievements ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {expandedSections.achievements && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-12 h-12 ${getRarityColor(achievement.rarity)} rounded-full flex items-center justify-center text-white text-xl`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {achievement.title}
                        </h3>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          Lv.{achievement.level}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{achievement.category}</span>
                        <span>{achievement.points} pts</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Unlocked {formatTimeAgo(achievement.unlockedAt)}
                      </div>
                      {achievement.nextLevel && (
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                          Next: {achievement.nextLevel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activityFeed.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">{activity.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTrackingPage;
