import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, Medal, Target, Calendar, TrendingUp, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
    fetchStats();
  }, []);

  const fetchAchievements = async () => {
    try {
      // Simulate API call - replace with actual API
      setTimeout(() => {
        setAchievements([
          {
            id: 1,
            title: 'First Steps',
            description: 'Complete your first AI tutoring session',
            icon: 'star',
            category: 'learning',
            earned: true,
            earnedDate: '2025-07-01',
            progress: 100,
            maxProgress: 1,
            rarity: 'common'
          },
          {
            id: 2,
            title: 'Quick Learner',
            description: 'Complete 5 lessons in one day',
            icon: 'trophy',
            category: 'speed',
            earned: true,
            earnedDate: '2025-07-05',
            progress: 100,
            maxProgress: 5,
            rarity: 'uncommon'
          },
          {
            id: 3,
            title: 'Perfect Score',
            description: 'Get 100% on an assignment',
            icon: 'medal',
            category: 'excellence',
            earned: true,
            earnedDate: '2025-07-10',
            progress: 100,
            maxProgress: 1,
            rarity: 'rare'
          },
          {
            id: 4,
            title: 'Study Streak',
            description: 'Study for 7 consecutive days',
            icon: 'target',
            category: 'consistency',
            earned: false,
            earnedDate: null,
            progress: 4,
            maxProgress: 7,
            rarity: 'uncommon'
          },
          {
            id: 5,
            title: 'Math Master',
            description: 'Complete 50 math problems correctly',
            icon: 'award',
            category: 'subject',
            earned: false,
            earnedDate: null,
            progress: 32,
            maxProgress: 50,
            rarity: 'rare'
          },
          {
            id: 6,
            title: 'Social Learner',
            description: 'Join 3 study groups',
            icon: 'users',
            category: 'social',
            earned: false,
            earnedDate: null,
            progress: 1,
            maxProgress: 3,
            rarity: 'common'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to load achievements');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setStats({
          totalEarned: 3,
          totalAvailable: 6,
          pointsEarned: 750,
          currentStreak: 4,
          rank: 'Bronze Scholar',
          nextRank: 'Silver Scholar',
          pointsToNextRank: 250
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'star':
        return <Star className="h-8 w-8" />;
      case 'trophy':
        return <Trophy className="h-8 w-8" />;
      case 'medal':
        return <Medal className="h-8 w-8" />;
      case 'target':
        return <Target className="h-8 w-8" />;
      case 'award':
        return <Award className="h-8 w-8" />;
      case 'users':
        return <Users className="h-8 w-8" />;
      default:
        return <Award className="h-8 w-8" />;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'uncommon':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'rare':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'epic':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'legendary':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const inProgressAchievements = achievements.filter(a => !a.earned);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Achievements</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your learning progress and unlock new badges
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Achievements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalEarned}/{stats.totalAvailable}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Points</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pointsEarned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Medal className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rank</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.rank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress to Next Rank */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Progress to {stats.nextRank}
        </h2>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((stats.pointsEarned - (stats.pointsEarned - stats.pointsToNextRank)) / stats.pointsToNextRank) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {stats.pointsToNextRank} more points needed to reach {stats.nextRank}
        </p>
      </div>

      {/* Earned Achievements */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Earned Achievements</h2>
        {earnedAchievements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No achievements earned yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Complete lessons and assignments to unlock your first achievement!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 ${getRarityColor(achievement.rarity)} hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                    {getIcon(achievement.icon)}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(achievement.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {achievement.description}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-full"></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Completed!
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In Progress Achievements */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">In Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inProgressAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <div className="text-gray-400">
                    {getIcon(achievement.icon)}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {achievement.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {achievement.description}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {achievement.progress}/{achievement.maxProgress} ({Math.round((achievement.progress / achievement.maxProgress) * 100)}%)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAchievements;
