/**
 * Interactive Assignment Viewer Component
 * Allows students to view and complete assignments with questions
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Circle, 
  FileText, 
  Send, 
  Save, 
  AlertCircle,
  BookOpen,
  Award
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const InteractiveAssignmentViewer = ({ assignment, onSubmissionComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [additionalContent, setAdditionalContent] = useState('');

  useEffect(() => {
    fetchQuestions();
    calculateTimeRemaining();
  }, [assignment.id]);

  useEffect(() => {
    if (hasStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasStarted, timeRemaining]);

  const fetchQuestions = async () => {
    try {
      const response = await apiService.get(`/api/assignments/${assignment.id}/questions`);
      if (response.data.success) {
        const questions = response.data.questions || [];
        setQuestions(questions);
        
        // Initialize answers object
        const initialAnswers = {};
        questions.forEach(q => {
          initialAnswers[q.id] = {
            question_id: q.id,
            answer_text: '',
            selected_option: ''
          };
        });
        setAnswers(initialAnswers);
      } else {
        // If no questions endpoint available, show message
        console.warn('No questions found for this assignment');
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Don't show error for assignments without questions
      if (error.response?.status !== 404) {
        toast.error('Failed to load assignment questions');
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = () => {
    if (assignment.due_date) {
      const now = new Date();
      const dueDate = new Date(assignment.due_date);
      const diff = Math.max(0, Math.floor((dueDate - now) / 1000));
      setTimeRemaining(diff);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, field, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const validateAnswers = () => {
    const unanswered = questions.filter(q => {
      const answer = answers[q.id];
      if (q.question_type === 'multiple_choice' || q.question_type === 'true_false') {
        return !answer.selected_option;
      } else {
        return !answer.answer_text.trim();
      }
    });

    if (unanswered.length > 0) {
      toast.error(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Only validate answers if there are questions
    if (questions.length > 0 && !validateAnswers()) return;

    if (!window.confirm('Are you sure you want to submit this assignment? You cannot change your answers after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = {
        content: additionalContent,
        attempt_number: 1
      };

      // Add answers only if there are questions
      if (questions.length > 0) {
        submissionData.answers = Object.values(answers);
      }

      // Use different endpoint based on whether assignment has questions
      const endpoint = questions.length > 0 
        ? `/api/assignments/${assignment.id}/submit-with-answers`
        : `/api/assignments/${assignment.id}/submit`;

      const response = await apiService.post(endpoint, submissionData);
      
      if (response.data.success) {
        toast.success('Assignment submitted successfully!');
        onSubmissionComplete && onSubmissionComplete(response.data.submission);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    toast.warning('Time is up! Auto-submitting assignment...');
    await handleSubmit();
  };

  const handleStartAssignment = () => {
    setHasStarted(true);
    toast.success('Assignment started! Good luck!');
  };

  const renderQuestion = (question, index) => {
    const answer = answers[question.id] || {};

    return (
      <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Question {index + 1}
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded">
                {question.points} point{question.points !== 1 ? 's' : ''}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {question.question_text}
            </h3>
          </div>
        </div>

        {/* Multiple Choice */}
        {question.question_type === 'multiple_choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, optIndex) => (
              <label key={optIndex} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={answer.selected_option === option}
                  onChange={(e) => handleAnswerChange(question.id, 'selected_option', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={!hasStarted}
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* True/False */}
        {question.question_type === 'true_false' && (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="true"
                checked={answer.selected_option === 'true'}
                onChange={(e) => handleAnswerChange(question.id, 'selected_option', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
                disabled={!hasStarted}
              />
              <span className="text-gray-900 dark:text-white">True</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="false"
                checked={answer.selected_option === 'false'}
                onChange={(e) => handleAnswerChange(question.id, 'selected_option', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
                disabled={!hasStarted}
              />
              <span className="text-gray-900 dark:text-white">False</span>
            </label>
          </div>
        )}

        {/* Text/Essay */}
        {(question.question_type === 'text' || question.question_type === 'essay') && (
          <div>
            <textarea
              value={answer.answer_text}
              onChange={(e) => handleAnswerChange(question.id, 'answer_text', e.target.value)}
              rows={question.question_type === 'essay' ? 6 : 3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your answer here..."
              disabled={!hasStarted}
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assignment Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {assignment.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {assignment.description}
            </p>
            {assignment.instructions && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Instructions:</h3>
                <p className="text-blue-800 dark:text-blue-300">{assignment.instructions}</p>
              </div>
            )}
          </div>
          
          {timeRemaining !== null && (
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Clock className="w-4 h-4" />
                <span>Time Remaining</span>
              </div>
              <div className={`text-2xl font-mono font-bold ${
                timeRemaining < 3600 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Award className="w-4 h-4 mr-1" />
              {assignment.max_points || assignment.points_possible || 100} points
            </span>
            <span className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </span>
          </div>
          {assignment.due_date && (
            <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Start Assignment Button */}
      {!hasStarted && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Ready to Start?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Once you start this assignment, the timer will begin. Make sure you have enough time to complete it.
          </p>
          <button
            onClick={handleStartAssignment}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Start Assignment
          </button>
        </div>
      )}

      {/* Questions */}
      {hasStarted && (
        <>
          <div className="space-y-6">
            {questions.map((question, index) => renderQuestion(question, index))}
          </div>

          {/* Additional Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Comments (Optional)
            </h3>
            <textarea
              value={additionalContent}
              onChange={(e) => setAdditionalContent(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Add any additional comments or explanations here..."
            />
          </div>

          {/* Submit Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Review your answers before submitting. You cannot change them after submission.</p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* No Questions - Essay/Project Assignment */}
      {questions.length === 0 && hasStarted && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center mb-6">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Open-Ended Assignment
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This assignment requires a written response or file submission. Use the text area below to provide your answer.
            </p>
          </div>
          
          {/* Enhanced content area for non-question assignments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Response *
            </label>
            <textarea
              value={additionalContent}
              onChange={(e) => setAdditionalContent(e.target.value)}
              rows="12"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Provide your detailed response to this assignment here. Be thorough and address all requirements mentioned in the instructions above."
            />
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {additionalContent.length} characters
            </div>
          </div>
          
          {/* Submit Button for non-question assignments */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || !additionalContent.trim()}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveAssignmentViewer;