import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { 
  BookOpen, 
  Play, 
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle,
  ArrowLeft,
  Clock,
  FileText,
  Video,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Brain,
  MessageSquare,
  Download,
  BookMarked,
  Award,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Sample lessons data - in real app, this would come from API
  const sampleLessons = [
    {
      id: 1,
      title: 'Introduction to the Course',
      type: 'video',
      duration: '15:30',
      description: 'Welcome to the course! In this lesson, we\'ll cover what you can expect to learn.',
      content: 'This is the introduction lesson content. Here you would typically have video content, reading materials, and interactive elements.',
      completed: false
    },
    {
      id: 2,
      title: 'Core Concepts and Fundamentals',
      type: 'video',
      duration: '25:45',
      description: 'Deep dive into the fundamental concepts that form the foundation of this subject.',
      content: 'This lesson covers the core concepts and fundamentals. Interactive content and examples would be provided here.',
      completed: false
    },
    {
      id: 3,
      title: 'Practical Applications',
      type: 'text',
      duration: '20:00',
      description: 'Learn how to apply the concepts in real-world scenarios.',
      content: 'This lesson focuses on practical applications. Students would work through exercises and examples.',
      completed: false
    },
    {
      id: 4,
      title: 'Advanced Techniques',
      type: 'video',
      duration: '30:15',
      description: 'Master advanced techniques and best practices.',
      content: 'Advanced techniques and methodologies are covered in this comprehensive lesson.',
      completed: false
    },
    {
      id: 5,
      title: 'Final Project and Assessment',
      type: 'assignment',
      duration: '45:00',
      description: 'Put everything together in a comprehensive final project.',
      content: 'This is your final project where you\'ll demonstrate mastery of all concepts learned.',
      completed: false
    }
  ];

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        const { data } = await apiService.courses.getCourse(id);
        setCourse(data.course || data);
        const lessonsResp = await apiService.lessons.list(id);
        setLessons(lessonsResp.data.lessons || []);
        // Load resources for current assignment context if any (first assignment sample)
        if (lessonsResp.data.lessons?.length) {
          try { const r = await apiService.assignments.resources(lessonsResp.data.lessons[0].assignment_id); setResources(r.data.resources || []);} catch(_){}
        }
      } catch (e) {
        console.error('Error loading course', e);
        navigate('/student/courses');
      } finally { setLoading(false);} 
    };

    if (id) {
      loadCourse();
    }
  }, [id, navigate, API_BASE_URL]);

  const handleLessonComplete = (lessonId) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    toast.success('Lesson completed! 🎉');
  };

  const handleNextLesson = () => {
    if (currentLesson < sampleLessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handlePrevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handleGetAIHelp = () => {
    const lesson = sampleLessons[currentLesson];
    navigate(`/student/ai-tutor?course=${id}&lesson=${lesson.id}&subject=${encodeURIComponent(course?.subject)}`);
  };

  const getCurrentLesson = () => sampleLessons[currentLesson];

  const getCompletionPercentage = () => {
    return Math.round((completedLessons.size / sampleLessons.length) * 100);
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'assignment':
        return <BookMarked className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course not found</h2>
        <Link 
          to="/student/courses" 
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Return to My Courses
        </Link>
      </div>
    );
  }

  const lesson = getCurrentLesson();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/courses/${id}`)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Course Details
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getCompletionPercentage()}% Complete
              </span>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Lesson {currentLesson + 1} of {sampleLessons.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {lesson.duration}
              </span>
            </div>
            <button
              onClick={handleGetAIHelp}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Brain className="h-4 w-4 mr-2" />
              Get AI Help
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Lesson navigation derived from lessons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dynamic Lesson List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Lessons</h2>
            {lessons.length===0 && <div className="text-sm text-gray-500">No lessons yet.</div>}
            <ul className="space-y-2">
              {lessons.map((l,i)=>(
                <li key={l.id} className={`p-3 rounded border ${i===currentLesson?'border-blue-500 bg-blue-50 dark:bg-blue-900/20':'border-gray-200 dark:border-gray-700'} cursor-pointer`} onClick={()=>setCurrentLesson(i)}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{l.title}</span>
                    <span className="text-xs text-gray-500">{l.duration_minutes||0}m</span>
                  </div>
                </li>))}
            </ul>
          </div>
          {/* Current Lesson Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{lessons[currentLesson]?.title || 'Select a lesson'}</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">{lessons[currentLesson]?.content || 'Choose a lesson from the left.'}</p>
          </div>
          {/* Learning Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Resources</h3>
              <button onClick={async()=>{ if (lessons[currentLesson]?.assignment_id){ const r= await apiService.assignments.resources(lessons[currentLesson].assignment_id); setResources(r.data.resources||[]);} }} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Refresh</button>
            </div>
            {resources.length===0 ? <div className="text-sm text-gray-500">No resources available.</div> : (
              <ul className="space-y-2">
                {resources.map(r=> (
                  <li key={r.id||r.title} className="p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{r.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{r.type} • {r.difficulty||'N/A'}</div>
                    {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs underline">Open</a>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Right: Existing player / controls retained below */}
        <div className="lg:col-span-1">
          {/* Course Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress</h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {getCompletionPercentage()}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Complete</div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {completedLessons.size} of {sampleLessons.length} lessons completed
            </div>
          </div>

          {/* Lesson List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lessons</h3>
            <div className="space-y-2">
              {sampleLessons.map((lessonItem, index) => (
                <button
                  key={lessonItem.id}
                  onClick={() => setCurrentLesson(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentLesson
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {completedLessons.has(lessonItem.id) ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 dark:border-gray-500 rounded-full flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {lessonItem.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          {getLessonIcon(lessonItem.type)}
                          <span className="ml-1">{lessonItem.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;
