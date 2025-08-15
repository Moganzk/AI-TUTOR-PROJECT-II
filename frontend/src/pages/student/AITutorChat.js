import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiService from '../../services/api';
import AITutor from '../AITutor';
import { toast } from 'react-hot-toast';
import { BookOpen, Clock, Target, TrendingUp, ArrowLeft } from 'lucide-react';

const AITutorChat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [studentProgress, setStudentProgress] = useState(null);
  const [recentTopics, setRecentTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseContext, setCourseContext] = useState(null);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Extract URL parameters
  const searchParams = new URLSearchParams(location.search);
  const courseId = searchParams.get('course');
  const lessonId = searchParams.get('lesson');
  const subject = searchParams.get('subject');

  useEffect(() => {
    if (user) {
      fetchStudentContext();
      
      // Load course context if courseId is provided
      if (courseId) {
        loadCourseContext();
      }
    }
    
    // Set up auto-refresh for student context every 60 seconds (less frequent to avoid disrupting chat)
    const interval = setInterval(() => {
      if (user) {
        fetchStudentContext();
        if (courseId) {
          loadCourseContext();
        }
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [user, courseId]);

  // Load course context for contextual AI help
  const loadCourseContext = async () => {
    try {
      const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/api/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.course) {
        setCourseContext(response.data.course);
      }
    } catch (error) {
      console.error('Error loading course context:', error);
    }
  };

  // Fetch student-specific context for personalized AI interactions
  const fetchStudentContext = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get student's recent chat topics, progress, and context
      const [chatResponse, progressResponse, contextResponse] = await Promise.allSettled([
  axios.get(`${API_BASE_URL}/api/chat/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
  axios.get(`${API_BASE_URL}/api/student/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
  axios.get(`${API_BASE_URL}/api/student/context`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Process chat history for recent topics
      if (chatResponse.status === 'fulfilled' && chatResponse.value.data.success) {
        const sessions = chatResponse.value.data.sessions || [];
        const topics = sessions.slice(0, 5).map(session => ({
          id: session.id,
          topic: session.last_message_preview || 'General Discussion',
          timestamp: session.updated_at
        }));
        setRecentTopics(topics);
      }

      // Process progress data
      if (progressResponse.status === 'fulfilled' && progressResponse.value.data.success) {
        setStudentProgress(progressResponse.value.data.progress);
      }

      // Process context data for AI personalization
      if (contextResponse.status === 'fulfilled' && contextResponse.value.data.success) {
        const context = contextResponse.value.data.context;
        // Dispatch event to AITutor component with student context
        window.dispatchEvent(new CustomEvent('student-context-loaded', { 
          detail: { context } 
        }));
      }

    } catch (error) {
      console.error('Error fetching student context:', error);
      // Continue with default experience
    } finally {
      setLoading(false);
    }
  };

  const quickStartPrompts = [
    {
      icon: BookOpen,
      title: "Help with Homework",
      prompt: "I need help with my current assignment. Can you guide me through it step by step?",
      color: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
      icon: Target,
      title: "Study Plan",
      prompt: "Can you help me create a study plan for my upcoming exams?",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      icon: TrendingUp,
      title: "Improve Grades",
      prompt: "I want to improve my grades. What study strategies do you recommend?",
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      icon: Clock,
      title: "Time Management",
      prompt: "I'm struggling with time management. How can I balance my studies better?",
      color: "bg-orange-50 text-orange-600 border-orange-200"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Course Context Banner */}
      {courseContext && (
        <div className="mb-6">
          <button
            onClick={() => {
              if (lessonId) {
                navigate(`/courses/${courseId}/learn`);
              } else {
                navigate(`/courses/${courseId}`);
              }
            }}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to {lessonId ? 'Course Learning' : 'Course Details'}
          </button>
          
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">AI Help for: {courseContext.title}</h2>
            <p className="text-purple-100 mb-2">
              {subject && `Subject: ${subject}`}
              {lessonId && ` • Lesson ${lessonId}`}
            </p>
            <p className="text-purple-100">
              I'm here to help you with specific questions about this course content. 
              Ask me anything about the concepts, examples, or assignments!
            </p>
          </div>
        </div>
      )}

      {/* Student Context Header */}
      <div className="p-6 mb-6 text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
        <h1 className="mb-2 text-2xl font-bold">
          Welcome to your AI Tutor, {user?.name}! 🤖
        </h1>
        <p className="text-blue-100">
          I'm here to help you learn, understand concepts, and achieve your academic goals.
          {studentProgress && ` You're currently at ${studentProgress.overall_progress}% completion rate!`}
        </p>
      </div>

      {/* Quick Start Section */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Start Options
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStartPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => {
                // This will be passed to the AITutor component
                const event = new CustomEvent('ai-tutor-quick-start', { 
                  detail: { prompt: prompt.prompt } 
                });
                window.dispatchEvent(event);
              }}
              className={`p-4 border-2 rounded-lg hover:shadow-md transition-all duration-200 ${prompt.color}`}
            >
              <prompt.icon className="w-6 h-6 mx-auto mb-2" />
              <h3 className="text-sm font-medium">{prompt.title}</h3>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Topics */}
      {recentTopics.length > 0 && (
        <div className="p-6 mb-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Recent Conversations
          </h2>
          <div className="space-y-2">
            {recentTopics.map((topic) => (
              <div 
                key={topic.id} 
                className="p-3 transition-colors rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => {
                  // Load previous conversation
                  const event = new CustomEvent('ai-tutor-load-session', { 
                    detail: { sessionId: topic.id } 
                  });
                  window.dispatchEvent(event);
                }}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {topic.topic}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(topic.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main AI Tutor Component */}
      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <AITutor studentContext={{ progress: studentProgress, recentTopics }} />
      </div>
    </div>
  );
};

export default AITutorChat;
