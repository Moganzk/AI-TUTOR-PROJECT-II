import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Video,
  Image,
  Link,
  Upload,
  Download,
  Eye,
  Save,
  Copy,
  Folder,
  Search,
  Filter,
  Calendar,
  Clock,
  Star,
  Share2,
  Archive
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ContentCreation = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  // Data will be loaded from API
  const contentItems = [
    {
      id: 1,
      title: 'Introduction to Python Variables',
      type: 'lesson',
      category: 'Python Programming',
      description: 'Learn about variable declaration, types, and naming conventions in Python.',
      status: 'published',
      createdDate: '2024-01-15',
      lastModified: '2024-01-15',
      views: 245,
      rating: 4.8,
      duration: '15 min',
      difficulty: 'beginner',
      tags: ['python', 'variables', 'basics'],
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Calculus Integration Techniques',
      type: 'video',
      category: 'Advanced Mathematics',
      description: 'Advanced integration methods including substitution and integration by parts.',
      status: 'draft',
      createdDate: '2024-01-14',
      lastModified: '2024-01-14',
      views: 0,
      rating: 0,
      duration: '45 min',
      difficulty: 'advanced',
      tags: ['calculus', 'integration', 'mathematics'],
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'HTML Forms Assignment',
      type: 'assignment',
      category: 'Web Development',
      description: 'Create interactive forms with validation using HTML5 and CSS.',
      status: 'published',
      createdDate: '2024-01-13',
      lastModified: '2024-01-13',
      views: 89,
      rating: 4.5,
      duration: '2 hours',
      difficulty: 'intermediate',
      tags: ['html', 'forms', 'validation'],
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 4,
      title: 'Database Normalization Quiz',
      type: 'quiz',
      category: 'Database Systems',
      description: 'Test your understanding of database normalization forms and principles.',
      status: 'published',
      createdDate: '2024-01-12',
      lastModified: '2024-01-12',
      views: 156,
      rating: 4.7,
      duration: '30 min',
      difficulty: 'intermediate',
      tags: ['database', 'normalization', 'sql'],
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 5,
      title: 'React Hooks Reference',
      type: 'resource',
      category: 'Web Development',
      description: 'Comprehensive guide to React hooks with examples and best practices.',
      status: 'published',
      createdDate: '2024-01-11',
      lastModified: '2024-01-11',
      views: 312,
      rating: 4.9,
      duration: '10 min',
      difficulty: 'intermediate',
      tags: ['react', 'hooks', 'javascript'],
      thumbnail: '/api/placeholder/300/200'
    }
  ];

  const contentTypes = [
    { id: 'all', name: 'All Types', icon: FileText },
    { id: 'lesson', name: 'Lessons', icon: FileText },
    { id: 'video', name: 'Videos', icon: Video },
    { id: 'assignment', name: 'Assignments', icon: Edit },
    { id: 'quiz', name: 'Quizzes', icon: FileText },
    { id: 'resource', name: 'Resources', icon: Link }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'python', name: 'Python Programming' },
    { id: 'mathematics', name: 'Advanced Mathematics' },
    { id: 'web-development', name: 'Web Development' },
    { id: 'database', name: 'Database Systems' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 dark:text-green-400';
      case 'intermediate':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'advanced':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lesson':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-600" />;
      case 'assignment':
        return <Edit className="h-5 w-5 text-green-600" />;
      case 'quiz':
        return <FileText className="h-5 w-5 text-yellow-600" />;
      case 'resource':
        return <Link className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           item.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleCreateContent = (type) => {
    setSelectedContent(null);
    setShowCreateModal(true);
  };

  const handleEditContent = (contentId) => {
    const content = contentItems.find(item => item.id === contentId);
    setSelectedContent(content);
    setShowCreateModal(true);
  };

  const handleViewContent = (contentId) => {
    const content = contentItems.find(item => item.id === contentId);
    setSelectedContent(content);
  };

  const handleDeleteContent = (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      toast.success('Content deleted successfully');
    }
  };

  const handleDuplicateContent = (contentId) => {
    toast.success('Content duplicated successfully');
  };

  const handlePublishContent = (contentId) => {
    toast.success('Content published successfully');
  };

  const handleArchiveContent = (contentId) => {
    toast.success('Content archived successfully');
  };

  const contentStats = {
    total: contentItems.length,
    published: contentItems.filter(item => item.status === 'published').length,
    drafts: contentItems.filter(item => item.status === 'draft').length,
    totalViews: contentItems.reduce((acc, item) => acc + item.views, 0),
    avgRating: contentItems.filter(item => item.rating > 0).reduce((acc, item) => acc + item.rating, 0) / contentItems.filter(item => item.rating > 0).length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Content Creation
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Create and manage your educational content
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleCreateContent('lesson')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Content</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Content</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {contentStats.total}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {contentStats.published}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {contentStats.drafts}
              </p>
            </div>
            <Edit className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {contentStats.totalViews.toLocaleString()}
              </p>
            </div>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {contentStats.avgRating.toFixed(1)}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {contentTypes.slice(1).map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleCreateContent(type.id)}
                className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Icon className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  New {type.name.slice(0, -1)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {contentTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((content) => (
          <div key={content.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div 
              className="aspect-w-16 aspect-h-9 cursor-pointer"
              onClick={() => handleViewContent(content.id)}
            >
              <img
                src={content.thumbnail}
                alt={content.title}
                className="w-full h-48 object-cover hover:opacity-75 transition-opacity"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(content.type)}
                  <h3 
                    className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600"
                    onClick={() => handleViewContent(content.id)}
                  >
                    {content.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {content.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{content.createdDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{content.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                  {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                </span>
                <span className={`text-sm font-medium ${getDifficultyColor(content.difficulty)}`}>
                  {content.difficulty.charAt(0).toUpperCase() + content.difficulty.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{content.views}</span>
                  </div>
                  {content.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{content.rating}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {content.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditContent(content.id)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateContent(content.id)}
                    className="text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toast.success('Content shared')}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContent(content.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                {content.status === 'draft' && (
                  <button
                    onClick={() => handlePublishContent(content.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Content Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 mx-4 bg-white rounded-lg dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              {selectedContent ? 'Edit Content' : 'Create New Content'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    defaultValue="lesson"
                  >
                    <option value="lesson">Lesson</option>
                    <option value="video">Video</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter content title"
                    defaultValue={selectedContent?.title || ''}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select category</option>
                    <option value="Python Programming">Python Programming</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Advanced Mathematics">Advanced Mathematics</option>
                    <option value="Database Systems">Database Systems</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Difficulty Level
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 15 min, 1 hour"
                    defaultValue={selectedContent?.duration || ''}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter content description"
                    defaultValue={selectedContent?.description || ''}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., python, variables, basics"
                    defaultValue={selectedContent?.tags?.join(', ') || ''}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                    defaultValue={selectedContent?.thumbnail || ''}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content Body
                  </label>
                  <textarea
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter the main content here..."
                    defaultValue={selectedContent?.content || ''}
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      defaultChecked={selectedContent?.status === 'published'}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Publish immediately
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedContent(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success(selectedContent ? 'Content updated successfully!' : 'Content created successfully!');
                  setShowCreateModal(false);
                  setSelectedContent(null);
                }}
                className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>{selectedContent ? 'Update' : 'Create'} Content</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Preview Modal */}
      {selectedContent && !showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 mx-4 bg-white rounded-lg dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {selectedContent.title}
              </h2>
              <button
                onClick={() => setSelectedContent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="mb-4">
                  <img
                    src={selectedContent.thumbnail}
                    alt={selectedContent.title}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/600/300';
                    }}
                  />
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  <p>{selectedContent.description}</p>
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4>Content Body</h4>
                    <p>{selectedContent.content || 'No content body available'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Type:</span> {selectedContent.type}</p>
                    <p><span className="font-medium">Category:</span> {selectedContent.category}</p>
                    <p><span className="font-medium">Difficulty:</span> {selectedContent.difficulty}</p>
                    <p><span className="font-medium">Duration:</span> {selectedContent.duration}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        selectedContent.status === 'published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {selectedContent.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Views:</span> {selectedContent.views}</p>
                    <p><span className="font-medium">Rating:</span> {selectedContent.rating}/5</p>
                    <p><span className="font-medium">Created:</span> {selectedContent.createdDate}</p>
                    <p><span className="font-medium">Modified:</span> {selectedContent.lastModified}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowCreateModal(true);
                    }}
                    className="flex items-center justify-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Content</span>
                  </button>
                  
                  {selectedContent.status === 'draft' && (
                    <button
                      onClick={() => {
                        toast.success('Content published successfully!');
                        setSelectedContent(null);
                      }}
                      className="flex items-center justify-center px-4 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Publish</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this content?')) {
                        toast.success('Content deleted successfully!');
                        setSelectedContent(null);
                      }
                    }}
                    className="flex items-center justify-center px-4 py-2 space-x-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCreation;
