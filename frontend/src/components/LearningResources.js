/**
 * Learning Resources Component
 * Displays hardcoded learning resources organized by subject and topic
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Monitor, 
  Clock, 
  Star,
  Filter,
  Search,
  ExternalLink,
  Download,
  Play
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const LearningResources = ({ assignmentId = null, subject = 'all' }) => {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(subject);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchResources();
  }, [selectedSubject, selectedTopic, selectedType, assignmentId]);

  const fetchSubjects = async () => {
    try {
      const response = await apiService.get('/api/learning-resources/subjects');
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      let endpoint = '/api/learning-resources';
      let params = {
        subject: selectedSubject,
        topic: selectedTopic,
        type: selectedType
      };

      // If assignmentId is provided, get assignment-specific resources
      if (assignmentId) {
        endpoint = `/api/assignments/${assignmentId}/resources`;
        params = {};
      }

      const response = await apiService.get(endpoint, { params });
      setResources(response.data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load learning resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'interactive':
        return <Monitor className="w-5 h-5 text-green-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const handleResourceClick = (resource) => {
    // Open resource in new tab/window
    if (resource.url.startsWith('http')) {
      window.open(resource.url, '_blank');
    } else {
      // For local resources, you might want to handle differently
      toast.info('Resource would open: ' + resource.title);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resourceTypes = [
    { id: 'all', label: 'All Types', icon: BookOpen },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'pdf', label: 'PDFs', icon: FileText },
    { id: 'interactive', label: 'Interactive', icon: Monitor }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {assignmentId ? 'Assignment Resources' : 'Learning Resources'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {assignmentId 
              ? 'Resources to help you complete this assignment'
              : 'Curated learning materials organized by subject and topic'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      {!assignmentId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Topics</option>
                {selectedSubject !== 'all' && subjects.find(s => s.id === selectedSubject)?.topics.map(topic => (
                  <option key={topic} value={topic}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {resourceTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleResourceClick(resource)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getResourceIcon(resource.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.subject.charAt(0).toUpperCase() + resource.subject.slice(1).replace('_', ' ')} • {resource.topic.charAt(0).toUpperCase() + resource.topic.slice(1)}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                {resource.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{resource.duration}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(resource.difficulty)}`}>
                  {resource.difficulty}
                </span>
              </div>

              {/* Topics */}
              <div className="flex flex-wrap gap-1">
                {resource.topics.slice(0, 3).map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 rounded"
                  >
                    {topic}
                  </span>
                ))}
                {resource.topics.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                    +{resource.topics.length - 3} more
                  </span>
                )}
              </div>

              {/* Assignment-specific info */}
              {resource.recommended_for_assignment && (
                <div className="mt-4 flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <Star className="w-4 h-4" />
                  <span>Recommended for this assignment</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No resources found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm 
              ? 'Try adjusting your search terms or filters'
              : 'No resources available for the selected criteria'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningResources;