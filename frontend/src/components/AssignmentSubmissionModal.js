/**
 * Assignment Submission Modal Component
 * Handles quick assignment submissions with file uploads
 */

import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  File, 
  Send, 
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AssignmentSubmissionModal = ({ assignment, isOpen, onClose, onSubmissionComplete }) => {
  const [submissionText, setSubmissionText] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate file types if assignment specifies allowed types
    if (assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0) {
      const invalidFiles = selectedFiles.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return !assignment.allowedFileTypes.includes(extension);
      });
      
      if (invalidFiles.length > 0) {
        toast.error(`Invalid file types. Allowed: ${assignment.allowedFileTypes.join(', ')}`);
        return;
      }
    }
    
    // Validate file size
    const maxSize = (assignment.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error(`Files too large. Maximum size: ${assignment.maxFileSize || 10}MB`);
      return;
    }
    
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && files.length === 0) {
      toast.error('Please provide either text content or upload files');
      return;
    }

    if (!window.confirm('Are you sure you want to submit this assignment? You cannot change it after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      let fileUrls = [];
      
      // Upload files if any
      if (files.length > 0) {
        setUploading(true);
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });
        
        try {
          const uploadResponse = await apiService.uploadFile(
            `/api/assignments/${assignment.id}/upload`, 
            formData,
            (progress) => {
              // Handle upload progress if needed
              console.log(`Upload progress: ${progress}%`);
            }
          );
          
          if (uploadResponse.data.success) {
            fileUrls = uploadResponse.data.fileUrls || [];
          }
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          toast.error('Failed to upload files');
          return;
        } finally {
          setUploading(false);
        }
      }

      // Submit assignment
      const submissionData = {
        content: submissionText,
        file_urls: fileUrls,
        attempt_number: 1
      };

      const response = await apiService.post(`/api/assignments/${assignment.id}/submit`, submissionData);
      
      if (response.data.success) {
        toast.success('Assignment submitted successfully!');
        onSubmissionComplete && onSubmissionComplete(response.data.submission);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Submit Assignment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Assignment Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              {assignment.title}
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {assignment.description}
            </p>
            <div className="flex items-center justify-between mt-3 text-sm text-blue-700 dark:text-blue-400">
              <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
              <span>{assignment.maxPoints} points</span>
            </div>
          </div>

          {/* Text Submission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Submission Text
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your assignment submission here..."
            />
          </div>

          {/* File Upload */}
          {assignment.requiresFileUpload !== false && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                File Attachments
                {assignment.requiresFileUpload && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Click to upload files or drag and drop
                </p>
                {assignment.allowedFileTypes && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    Allowed types: {assignment.allowedFileTypes.join(', ')}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Maximum size: {assignment.maxFileSize || 10}MB per file
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept={assignment.allowedFileTypes ? assignment.allowedFileTypes.map(type => `.${type}`).join(',') : undefined}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Choose Files
                </label>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Files ({files.length})
                  </h4>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <File className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submission Requirements */}
          {assignment.requiresFileUpload && files.length === 0 && (
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">This assignment requires file upload</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Make sure to review your submission before submitting.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading || (assignment.requiresFileUpload && files.length === 0)}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
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
      </div>
    </div>
  );
};

export default AssignmentSubmissionModal;