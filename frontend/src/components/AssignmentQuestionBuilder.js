/**
 * Assignment Question Builder Component
 * Interactive question builder for staff/admin to create assignment questions
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  Circle,
  Type,
  List,
  FileText
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AssignmentQuestionBuilder = ({ assignmentId, questions = [], onQuestionsUpdate }) => {
  const [localQuestions, setLocalQuestions] = useState(questions);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'text',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    order_index: localQuestions.length + 1
  });

  const questionTypes = [
    { value: 'text', label: 'Text Answer', icon: Type },
    { value: 'essay', label: 'Essay', icon: FileText },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: List },
    { value: 'true_false', label: 'True/False', icon: CheckCircle }
  ];

  const handleAddQuestion = async () => {
    try {
      // Validate question
      if (!newQuestion.question_text.trim()) {
        toast.error('Question text is required');
        return;
      }

      if (newQuestion.question_type === 'multiple_choice') {
        const validOptions = newQuestion.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          toast.error('Multiple choice questions need at least 2 options');
          return;
        }
        if (!newQuestion.correct_answer) {
          toast.error('Please select the correct answer');
          return;
        }
      }

      const questionData = {
        ...newQuestion,
        options: newQuestion.question_type === 'multiple_choice' ? 
          newQuestion.options.filter(opt => opt.trim()) : null
      };

      const response = await apiService.post(`/api/assignments/${assignmentId}/questions`, questionData);
      
      if (response.data.success) {
        const updatedQuestions = [...localQuestions, response.data.question];
        setLocalQuestions(updatedQuestions);
        onQuestionsUpdate && onQuestionsUpdate(updatedQuestions);
        
        // Reset form
        setNewQuestion({
          question_text: '',
          question_type: 'text',
          options: ['', '', '', ''],
          correct_answer: '',
          points: 1,
          order_index: updatedQuestions.length + 1
        });
        setShowAddQuestion(false);
        toast.success('Question added successfully!');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await apiService.delete(`/api/assignments/questions/${questionId}`);
      const updatedQuestions = localQuestions.filter(q => q.id !== questionId);
      setLocalQuestions(updatedQuestions);
      onQuestionsUpdate && onQuestionsUpdate(updatedQuestions);
      toast.success('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const renderQuestionForm = (question, isNew = false) => {
    const currentQuestion = isNew ? newQuestion : question;
    const setCurrentQuestion = isNew ? setNewQuestion : 
      (updates) => setEditingQuestion({ ...editingQuestion, ...updates });

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {questionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setCurrentQuestion({ 
                    ...currentQuestion, 
                    question_type: type.value,
                    options: type.value === 'multiple_choice' ? ['', '', '', ''] : [],
                    correct_answer: type.value === 'true_false' ? 'true' : ''
                  })}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    currentQuestion.question_type === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Text *
          </label>
          <textarea
            value={currentQuestion.question_text}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your question here..."
          />
        </div>

        {/* Multiple Choice Options */}
        {currentQuestion.question_type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer Options
            </label>
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct_${isNew ? 'new' : question.id}`}
                    checked={currentQuestion.correct_answer === option}
                    onChange={() => setCurrentQuestion({ ...currentQuestion, correct_answer: option })}
                    className="text-blue-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...currentQuestion.options];
                      newOptions[index] = e.target.value;
                      setCurrentQuestion({ ...currentQuestion, options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* True/False Options */}
        {currentQuestion.question_type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correct Answer
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf_${isNew ? 'new' : question.id}`}
                  value="true"
                  checked={currentQuestion.correct_answer === 'true'}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
                  className="text-blue-600"
                />
                <span className="ml-2">True</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf_${isNew ? 'new' : question.id}`}
                  value="false"
                  checked={currentQuestion.correct_answer === 'false'}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
                  className="text-blue-600"
                />
                <span className="ml-2">False</span>
              </label>
            </div>
          </div>
        )}

        {/* Points */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Points
            </label>
            <input
              type="number"
              value={currentQuestion.points}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => {
              if (isNew) {
                setShowAddQuestion(false);
                setNewQuestion({
                  question_text: '',
                  question_type: 'text',
                  options: ['', '', '', ''],
                  correct_answer: '',
                  points: 1,
                  order_index: localQuestions.length + 1
                });
              } else {
                setEditingQuestion(null);
              }
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="button"
            onClick={isNew ? handleAddQuestion : () => {/* Handle update */}}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isNew ? 'Add Question' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Assignment Questions ({localQuestions.length})
        </h3>
        <button
          onClick={() => setShowAddQuestion(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </button>
      </div>

      {/* Existing Questions */}
      <div className="space-y-4">
        {localQuestions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {editingQuestion?.id === question.id ? (
              renderQuestionForm(editingQuestion, false)
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Question {index + 1}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 rounded">
                        {question.question_type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {question.points} point{question.points !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white mb-2">{question.question_text}</p>
                    
                    {question.question_type === 'multiple_choice' && question.options && (
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <Circle className={`w-4 h-4 ${option === question.correct_answer ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={option === question.correct_answer ? 'text-green-600 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.question_type === 'true_false' && (
                      <p className="text-green-600 font-medium">
                        Correct Answer: {question.correct_answer === 'true' ? 'True' : 'False'}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Question Form */}
      {showAddQuestion && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Add New Question</h4>
          {renderQuestionForm(newQuestion, true)}
        </div>
      )}

      {localQuestions.length === 0 && !showAddQuestion && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No questions added yet. Click "Add Question" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AssignmentQuestionBuilder;