import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Users, MapPin, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week', 'month', 'day'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      // Simulate API call - replace with actual API
      setTimeout(() => {
        setSchedule([
          {
            id: 1,
            title: 'Mathematics - Calculus',
            type: 'class',
            startTime: '09:00',
            endTime: '10:30',
            date: '2025-07-14',
            location: 'Room 101',
            instructor: 'Dr. Smith',
            isVirtual: false
          },
          {
            id: 2,
            title: 'Physics Lab',
            type: 'lab',
            startTime: '14:00',
            endTime: '16:00',
            date: '2025-07-14',
            location: 'Lab 203',
            instructor: 'Prof. Johnson',
            isVirtual: false
          },
          {
            id: 3,
            title: 'AI Tutoring Session',
            type: 'tutoring',
            startTime: '19:00',
            endTime: '20:00',
            date: '2025-07-14',
            location: 'Virtual',
            instructor: 'AI Tutor',
            isVirtual: true
          },
          {
            id: 4,
            title: 'Study Group - Chemistry',
            type: 'study_group',
            startTime: '16:00',
            endTime: '17:30',
            date: '2025-07-15',
            location: 'Library Study Room 3',
            instructor: 'Student Led',
            isVirtual: false
          },
          {
            id: 5,
            title: 'Assignment Due: Physics Report',
            type: 'assignment',
            startTime: '23:59',
            endTime: '23:59',
            date: '2025-07-16',
            location: 'Online Submission',
            instructor: 'Prof. Johnson',
            isVirtual: true
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to load schedule');
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'class':
        return <BookOpen className="h-4 w-4" />;
      case 'lab':
        return <Users className="h-4 w-4" />;
      case 'tutoring':
        return <Video className="h-4 w-4" />;
      case 'study_group':
        return <Users className="h-4 w-4" />;
      case 'assignment':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'class':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'lab':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'tutoring':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'study_group':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'assignment':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTodaysEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return schedule.filter(event => event.date === today);
  };

  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return schedule
      .filter(event => event.date > today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Keep track of your classes, assignments, and study sessions
        </p>
      </div>

      {/* Today's Events */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Today's Schedule
          </h2>
          
          {getTodaysEvents().length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No events scheduled for today
            </p>
          ) : (
            <div className="space-y-4">
              {getTodaysEvents().map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border ${getTypeColor(event.type)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(event.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="flex items-center">
                            {event.isVirtual ? (
                              <Video className="h-3 w-3 mr-1" />
                            ) : (
                              <MapPin className="h-3 w-3 mr-1" />
                            )}
                            {event.location}
                          </span>
                        </div>
                        <p className="text-sm mt-1">Instructor: {event.instructor}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                      {event.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-600" />
            Upcoming Events
          </h2>
          
          {getUpcomingEvents().length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No upcoming events
            </p>
          ) : (
            <div className="space-y-4">
              {getUpcomingEvents().map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border ${getTypeColor(event.type)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(event.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(event.date)}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-sm">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="flex items-center">
                            {event.isVirtual ? (
                              <Video className="h-3 w-3 mr-1" />
                            ) : (
                              <MapPin className="h-3 w-3 mr-1" />
                            )}
                            {event.location}
                          </span>
                        </div>
                        <p className="text-sm mt-1">Instructor: {event.instructor}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                      {event.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => toast.success('Opening AI Tutor...')}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <Video className="h-6 w-6 text-blue-600 mb-2" />
          <h3 className="font-medium text-gray-900 dark:text-white">Schedule AI Session</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Book a tutoring session</p>
        </button>
        
        <button
          onClick={() => toast.success('Opening Study Groups...')}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <Users className="h-6 w-6 text-green-600 mb-2" />
          <h3 className="font-medium text-gray-900 dark:text-white">Join Study Group</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Find study partners</p>
        </button>
        
        <button
          onClick={() => toast.success('Opening Calendar...')}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <Calendar className="h-6 w-6 text-purple-600 mb-2" />
          <h3 className="font-medium text-gray-900 dark:text-white">Full Calendar</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">View monthly calendar</p>
        </button>
      </div>
    </div>
  );
};

export default StudentSchedule;
