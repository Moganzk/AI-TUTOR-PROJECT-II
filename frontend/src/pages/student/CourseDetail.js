import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star, 
  Award, 
  CheckCircle, 
  ArrowLeft, 
  Download,
  Calendar,
  User,
  BarChart3,
  Target,
  BookMarked,
  Brain,
  MessageSquare,
  FileText,
  AlertCircle,
  CheckSquare,
  XSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', lesson_order: 1, duration_minutes: 0 });
  const [gradebookPreview, setGradebookPreview] = useState(null);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const loadCourseDetails = async () => {
      setLoading(true);
      try {
        const { data: courseResp } = await apiService.courses.getCourse(id);
        setCourse(courseResp.course || courseResp);
        const { data: enrollmentResp } = await apiService.student.courses();
        if (enrollmentResp.courses || enrollmentResp.enrollments) {
          const list = enrollmentResp.courses || enrollmentResp.enrollments;
          const enrollment = list.find(e => e.course_id === id);
          setEnrollmentData(enrollment);
        }
        await loadCourseAssignments();
        await loadCourseProgress();
      } catch (e) {
        console.error('Error loading course details', e);
        navigate('/student/courses');
      } finally { setLoading(false); }
    };

    const loadCourseAssignments = async () => {
      try {
        setAssignmentsLoading(true);
        const { data } = await apiService.courses.assignments(id);
        if (data.success) {
          const transformedAssignments = (data.assignments || []).map(a => ({
            ...a,
            submission: a.submission || null,
            grade: a.grade || null,
            isOverdue: a.due_date && new Date(a.due_date) < new Date(),
            isSubmitted: a.submission && a.submission.status === 'submitted',
            isGraded: a.submission && a.submission.grade
          }));
          setAssignments(transformedAssignments);
        }
      } catch (e) { console.error(e); } finally { setAssignmentsLoading(false); }
    };

    const loadCourseProgress = async () => {
      try {
        const { data } = await apiService.courses.progress(id);
        if (data.success) setProgressData(data.progress);
      } catch (e) { console.error(e); }
    };

    const loadLessons = async () => {
      try {
        const { data } = await apiService.lessons.list(id);
        if (data.success) setLessons(data.lessons);
      } catch (e) { console.error('Failed to load lessons', e); }
    };

    const loadGradebookPreview = async () => {
      try {
        const { data } = await apiService.gradebook.get(id);
        setGradebookPreview(data);
      } catch (e) { /* ignore for students if forbidden */ }
    };

    if (id) {
      loadCourseDetails();
      loadLessons();
      loadGradebookPreview();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        loadCourseAssignments();
        loadCourseProgress();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [id, navigate, API_BASE_URL]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleStartLearning = () => {
    navigate(`/courses/${id}/learn`);
  };

  const handleGetAIHelp = () => {
    navigate(`/student/ai-tutor?course=${id}&subject=${encodeURIComponent(course?.subject)}`);
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiService.lessons.create(id, newLesson);
      if (data.success) {
        setLessons(l => [...l, data.lesson]);
        setShowLessonModal(false);
        setNewLesson({ title: '', content: '', lesson_order: lessons.length + 1, duration_minutes: 0 });
      }
    } catch (e) { console.error('Create lesson failed', e); }
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

  const progress = enrollmentData?.progress || 0;
  const completedLessons = enrollmentData?.completed_lessons || 0;
  const totalLessons = enrollmentData?.total_lessons || 10;
  const timeSpent = enrollmentData?.time_spent || '0h 0m';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/student/courses')}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to My Courses
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-24 w-24 text-white opacity-30" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-gray-200 mb-4">{course.description}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-200 mr-2" />
                  <span className="text-gray-200">{course.instructor}</span>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(course.level)}`}>
                  {course.level}
                </span>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="text-gray-200">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Progress */}
          {progressData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h2>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Assignment Progress</span>
                  <span className="text-gray-900 dark:text-white font-medium">{progressData.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${getProgressColor(progressData.progress_percentage)}`}
                    style={{ width: `${progressData.progress_percentage}%` }}
                  ></div>
                </div>
              </div>

              {progressData.grade_percentage > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Grade Average</span>
                    <span className="text-gray-900 dark:text-white font-medium">{progressData.grade_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getProgressColor(progressData.grade_percentage)}`}
                      style={{ width: `${progressData.grade_percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progressData.completed_assignments}/{progressData.total_assignments}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progressData.total_points_earned}/{progressData.total_points_possible}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progressData.time_spent || '0h 0m'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Time Spent</div>
                </div>
              </div>
            </div>
          )}

          {/* Course Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Course</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {course.description}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Subject:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">{course.subject}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Level:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">{course.level}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Duration:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">{course.duration}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Price:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">${course.price}</span>
              </div>
            </div>
          </div>

          {/* Course Assignments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Course Assignments</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {assignmentsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No assignments available for this course yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const isOverdue = new Date(assignment.due_date) < new Date();
                  const isSubmitted = assignment.submission && assignment.submission.status === 'submitted';
                  const isGraded = assignment.submission && assignment.submission.grade;
                  
                  return (
                    <div key={assignment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                            {isSubmitted && (
                              <CheckSquare className="h-4 w-4 text-green-500" />
                            )}
                            {isOverdue && !isSubmitted && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {assignment.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              <span>{assignment.max_points} points</span>
                            </div>
                            {isGraded && (
                              <div className="flex items-center">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                <span className="text-green-600 dark:text-green-400">
                                  {assignment.submission.grade.points_earned}/{assignment.max_points}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isGraded ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            isSubmitted ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                          </span>
                          <button
                            onClick={() => navigate(`/student/assignments?assignment=${assignment.id}`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            {isSubmitted ? 'View Submission' : 'Submit Assignment'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Course Curriculum */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Course Curriculum</h2>
              {user?.role !== 'student' && (
                <button onClick={() => setShowLessonModal(true)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Add Lesson</button>
              )}
            </div>
            <div className="space-y-3">
              {lessons.length === 0 && <div className="text-gray-500 text-sm">No lessons yet.</div>}
              {lessons.map(lesson => (
                <div key={lesson.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {lesson.is_completed ? <CheckCircle className="h-5 w-5 text-green-500 mr-3" /> : <div className="h-5 w-5 border-2 border-gray-300 dark:border-gray-500 rounded-full mr-3"></div>}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{lesson.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{lesson.duration_minutes || 0} min</div>
                  </div>
                </div>
              ))}
            </div>
            {gradebookPreview && user?.role !== 'student' && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white text-sm">Gradebook Snapshot</h3>
                <div className="text-xs text-gray-600 dark:text-gray-400">Students: {gradebookPreview.students?.length || 0}</div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Action Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="space-y-3">
              <button
                onClick={handleStartLearning}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Play className="h-5 w-5 mr-2" />
                {progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </button>
              
              <button
                onClick={handleGetAIHelp}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Brain className="h-5 w-5 mr-2" />
                Get AI Help
              </button>
              
              <Link
                to="/student/assignments"
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <BookMarked className="h-5 w-5 mr-2" />
                View Assignments
              </Link>
            </div>
          </div>

          {/* Course Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">Students</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{course.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">Certificate</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Yes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLessonModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">New Lesson</h3>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input value={newLesson.title} onChange={e=>setNewLesson({...newLesson,title:e.target.value})} required className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea value={newLesson.content} onChange={e=>setNewLesson({...newLesson,content:e.target.value})} rows={4} className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Order</label>
                  <input type="number" value={newLesson.lesson_order} onChange={e=>setNewLesson({...newLesson,lesson_order:parseInt(e.target.value)})} className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (min)</label>
                  <input type="number" value={newLesson.duration_minutes} onChange={e=>setNewLesson({...newLesson,duration_minutes:parseInt(e.target.value)})} className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Create</button>
                <button type="button" onClick={()=>setShowLessonModal(false)} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
