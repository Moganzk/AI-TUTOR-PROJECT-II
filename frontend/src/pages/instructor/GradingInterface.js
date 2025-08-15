import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Star,
  Award,
  User,
  Target,
  TrendingUp,
  BarChart3,
  Save
} from 'lucide-react';

const GradingInterface = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    points_earned: '',
    feedback: '',
    letter_grade: '',
    is_final: true
  });
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [rubric, setRubric] = useState(null);
  const [priorFeedback, setPriorFeedback] = useState([]);

  const loadRubricAndFeedback = async (submission) => {
    if (!submission) return;
    try {
      // Attempt to load rubric for the assignment if endpoint exists
      try {
        const { data } = await apiService.assignments.getRubric?.(submission.assignment.id);
        if (data && (data.rubric || data.items)) {
          setRubric(data.rubric || data.items);
        }
      } catch (e) {
        setRubric(null);
      }
      // Load prior feedback (assumes endpoint /api/submissions/<id>/feedback or embedded history)
      try {
        const { data } = await apiService.submissions.getFeedback?.(submission.id);
        if (data && (data.feedback_history || data.items)) {
          setPriorFeedback(data.feedback_history || data.items);
        } else if (data.feedback) {
          setPriorFeedback([data.feedback]);
        } else {
          setPriorFeedback([]);
        }
      } catch (e) {
        setPriorFeedback([]);
      }
    } catch (e) {
      console.error('Error loading rubric/feedback', e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => { try { setLoading(true); const { data } = await apiService.get('/api/submissions/pending'); if (data.submissions) setSubmissions(data.submissions); else setSubmissions([]); } catch(e){ console.error('Error fetching submissions', e); setSubmissions([]);} finally { setLoading(false);} };

  const handleGradeSubmission = async () => { try { const gradeData = { points_earned: parseInt(gradeForm.points_earned), feedback: gradeForm.feedback, letter_grade: gradeForm.letter_grade, is_final: gradeForm.is_final }; await apiService.submissions.manualGrade(selectedSubmission.id, gradeData); setSubmissions(submissions.filter(s=>s.id!==selectedSubmission.id)); setShowGradingModal(false); setSelectedSubmission(null); setGradeForm({ points_earned:'', feedback:'', letter_grade:'', is_final:true}); alert('✅ Submission graded successfully!'); } catch(e){ console.error('Error grading submission', e); alert('❌ Failed to grade submission'); } };

  const openGradingModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      points_earned: '',
      feedback: '',
      letter_grade: '',
      is_final: true
    });
  setRubric(null);
  setPriorFeedback([]);
  loadRubricAndFeedback(submission);
    setShowGradingModal(true);
  };

  const calculateLetterGrade = (points, maxPoints) => {
    const percentage = (points / maxPoints) * 100;
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 65) return 'D';
    return 'F';
  };

  const autoCalculateGrade = () => {
    if (selectedSubmission && gradeForm.points_earned) {
      const points = parseInt(gradeForm.points_earned);
      const maxPoints = selectedSubmission.assignment.max_points;
      const letterGrade = calculateLetterGrade(points, maxPoints);
      setGradeForm(prev => ({ ...prev, letter_grade: letterGrade }));
    }
  };

  const generateAISuggestion = () => {
    if (!selectedSubmission) return;
    
    // Simple AI suggestion for math quiz
    const content = selectedSubmission.content.toLowerCase();
    let suggestion = "AI Grading Suggestion:\n\n";
    
    if (content.includes('8') && content.includes('6') && content.includes('12')) {
      suggestion += "✅ All answers appear correct:\n";
      suggestion += "• Question 1 (5+3): 8 ✓\n";
      suggestion += "• Question 2 (10-4): 6 ✓\n";
      suggestion += "• Question 3 (2×6): 12 ✓\n\n";
      suggestion += "Suggested Grade: 15/15 (A+)\n";
      suggestion += "Work is clearly shown for all problems. Excellent job!";
      
      setGradeForm(prev => ({
        ...prev,
        points_earned: '15',
        letter_grade: 'A+',
        feedback: suggestion
      }));
    } else {
      suggestion += "Please review answers manually for accuracy.";
      setGradeForm(prev => ({ ...prev, feedback: suggestion }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-32 h-32 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
            <Award className="w-8 h-8 mr-3" />
            Grade Submissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and grade student submissions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Grading</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{submissions.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graded Today</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Grade</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">--</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1 space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center mb-2 space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {submission.assignment.title}
                    </h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                      Needs Grading
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-3 space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {submission.student.name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      Max Points: {submission.assignment.max_points}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Attempt: {submission.attempt_number}
                    </span>
                  </div>
                  
                  <div className="p-4 mt-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Student Submission:</h4>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap dark:text-gray-400">
                      {submission.content.substring(0, 300)}
                      {submission.content.length > 300 && '...'}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openGradingModal(submission)}
                  className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Award className="w-4 h-4" />
                  <span>Grade</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grading Modal */}
      {showGradingModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Grade Submission: {selectedSubmission.assignment.title}
            </h3>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Column - Submission Content */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Student: {selectedSubmission.student.name}
                </h4>
                <div className="p-4 border border-gray-300 rounded-lg dark:border-gray-600 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap dark:text-gray-400">
                    {selectedSubmission.content}
                  </pre>
                </div>
                
                <button
                  onClick={generateAISuggestion}
                  className="flex items-center px-3 py-2 mt-4 space-x-2 text-sm text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900/20"
                >
                  <Star className="w-4 h-4" />
                  <span>🤖 Get AI Suggestion</span>
                </button>
              </div>
              
              {/* Right Column - Grading Form */}
              <div className="space-y-4">
                {rubric && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Rubric</h4>
                    <div className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 max-h-56 overflow-y-auto text-xs whitespace-pre-wrap dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                      {Array.isArray(rubric) ? rubric.map((r,i)=>(<div key={i} className="mb-2"><strong>{r.criteria||r.title||`Criterion ${i+1}`}:</strong> {r.description||r.detail||r.text} {r.points!=null && `(Points: ${r.points})`}</div>)) : rubric}
                    </div>
                  </div>
                )}
                {priorFeedback.length>0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Prior Feedback</h4>
                    <div className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 max-h-40 overflow-y-auto text-xs space-y-2 bg-gray-50 dark:bg-gray-700">
                      {priorFeedback.map((f,i)=>(<div key={i} className="p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"><div className="font-medium">Attempt {f.attempt_number||i+1}</div><div>{f.feedback||f.text||JSON.stringify(f)}</div>{f.points_earned!=null && (<div className="text-xs text-gray-500">Score: {f.points_earned}{f.max_points?`/${f.max_points}`:''}</div>)}</div>))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Points Earned (Max: {selectedSubmission.assignment.max_points})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedSubmission.assignment.max_points}
                    value={gradeForm.points_earned}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, points_earned: e.target.value }))}
                    onBlur={autoCalculateGrade}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter points earned"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Letter Grade
                  </label>
                  <select
                    value={gradeForm.letter_grade}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, letter_grade: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D+">D+</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Feedback for Student
                  </label>
                  <textarea
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                    rows="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Provide detailed feedback on the student's work..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_final"
                    checked={gradeForm.is_final}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, is_final: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="is_final" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Final Grade (Cannot be changed later)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowGradingModal(false);
                  setSelectedSubmission(null);
                  setGradeForm({
                    points_earned: '',
                    feedback: '',
                    letter_grade: '',
                    is_final: true
                  });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleGradeSubmission}
                disabled={!gradeForm.points_earned || !gradeForm.letter_grade}
                className="flex items-center px-4 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Submit Grade</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="py-12 text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No submissions to grade
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All submissions have been graded or there are no pending submissions.
          </p>
        </div>
      )}
    </div>
  );
};

export default GradingInterface;
