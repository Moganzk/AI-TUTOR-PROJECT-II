import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, Plus, Edit, Trash2, Search, Download, Upload,
  Users, GraduationCap, CheckCircle, XCircle, BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from '../../services/api'; // Assuming you've created an axios instance

const SubjectManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/subjects');
        setSubjects(response.data.subjects || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch subjects');
        toast.error(err.response?.data?.error || 'Failed to fetch subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject => {
    return subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           subject.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle form submission (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = {
      name: e.target.name.value.trim(),
      description: e.target.description.value.trim()
    };

    try {
      if (selectedSubject) {
        // Update existing subject
        const response = await axios.put(`/subjects/${selectedSubject.id}`, formData);
        setSubjects(subjects.map(sub => 
          sub.id === selectedSubject.id ? response.data.subject : sub
        ));
        toast.success('Subject updated successfully');
      } else {
        // Create new subject
        const response = await axios.post('/subjects', formData);
        setSubjects([...subjects, response.data.subject]);
        toast.success('Subject created successfully');
      }
      setShowCreateModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 
        (selectedSubject ? 'Failed to update subject' : 'Failed to create subject'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete subject
  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await axios.delete(`/subjects/${subjectId}`);
      setSubjects(subjects.filter(sub => sub.id !== subjectId));
      toast.success('Subject deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete subject');
      if (err.response?.status === 400) {
        toast.error(err.response.data.error); // Show specific error about associated courses
      }
    }
  };

  // Calculate statistics
  const subjectStats = {
    total: subjects.length,
    totalCourses: subjects.reduce((acc, s) => acc + (s.courses_count || 0), 0),
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-lg">Loading subjects...</div>
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-600 bg-red-100 rounded-lg">
      Error: {error}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Subject Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage academic subjects and their associated courses
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setSelectedSubject(null);
                  setShowCreateModal(true);
                }}
                className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                <span>Add Subject</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {subjectStats.total}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {subjectStats.totalCourses}
              </p>
            </div>
            <GraduationCap className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search subjects by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Subjects List */}
      {filteredSubjects.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow dark:bg-gray-800">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No subjects found
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Create a new subject to get started'}
          </p>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Subject
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {subject.name}
                    </h3>
                    {subject.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {subject.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center mb-4 space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  <span>{subject.courses_count || 0} courses</span>
                </div>

                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedSubject(subject);
                        setShowCreateModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl overflow-y-auto bg-white rounded-lg dark:bg-gray-800 max-h-[90vh]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedSubject ? 'Edit Subject' : 'Create New Subject'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isSubmitting}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject Name *
                    </label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={selectedSubject?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={selectedSubject?.description || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-end pt-4 space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Processing...'
                      ) : selectedSubject ? (
                        'Update Subject'
                      ) : (
                        'Create Subject'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;