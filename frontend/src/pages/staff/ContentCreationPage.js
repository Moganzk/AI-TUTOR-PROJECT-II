import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Share2, 
  Upload, 
  Download,
  FileText,
  Video,
  Image,
  Headphones,
  Link,
  BookOpen,
  Target,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Save,
  RefreshCw,
  Settings,
  Layers,
  Zap,
  Brain,
  PenTool,
  Type,
  PlayCircle,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Forward,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const ContentCreationPage = () => {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    content: true,
    settings: true
  });

  const [newContent, setNewContent] = useState({
    title: '',
    type: 'lesson',
    category: 'mathematics',
    description: '',
    content: '',
    difficulty: 'beginner',
    duration: 30,
    tags: [],
    prerequisites: [],
    learningObjectives: [],
    visibility: 'public',
    allowComments: true,
    allowRating: true,
    media: []
  });

  const contentTypes = [
    { id: 'lesson', name: 'Lesson', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'video', name: 'Video', icon: Video, color: 'bg-red-500' },
    { id: 'audio', name: 'Audio', icon: Headphones, color: 'bg-green-500' },
    { id: 'document', name: 'Document', icon: FileText, color: 'bg-purple-500' },
    { id: 'quiz', name: 'Quiz', icon: Target, color: 'bg-orange-500' },
    { id: 'assignment', name: 'Assignment', icon: PenTool, color: 'bg-pink-500' },
    { id: 'interactive', name: 'Interactive', icon: Zap, color: 'bg-cyan-500' },
    { id: 'presentation', name: 'Presentation', icon: Layers, color: 'bg-indigo-500' }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'biology', name: 'Biology' },
    { id: 'history', name: 'History' },
    { id: 'literature', name: 'Literature' },
    { id: 'computer_science', name: 'Computer Science' },
    { id: 'economics', name: 'Economics' },
    { id: 'psychology', name: 'Psychology' }
  ];

  const filters = [
    { id: 'all', name: 'All Content' },
    { id: 'published', name: 'Published' },
    { id: 'draft', name: 'Draft' },
    { id: 'pending', name: 'Pending Review' },
    { id: 'archived', name: 'Archived' }
  ];

  const difficultyLevels = [
    { id: 'beginner', name: 'Beginner', color: 'bg-green-100 text-green-800' },
    { id: 'intermediate', name: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'advanced', name: 'Advanced', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setContent([
          {
            id: 1,
            title: 'Introduction to Calculus',
            type: 'lesson',
            category: 'mathematics',
            description: 'A comprehensive introduction to calculus concepts including limits, derivatives, and integrals.',
            content: 'This lesson covers the fundamental concepts of calculus...',
            difficulty: 'intermediate',
            duration: 45,
            tags: ['calculus', 'mathematics', 'derivatives', 'integrals'],
            prerequisites: ['Algebra', 'Trigonometry'],
            learningObjectives: [
              'Understand the concept of limits',
              'Calculate basic derivatives',
              'Solve simple integration problems'
            ],
            visibility: 'public',
            status: 'published',
            allowComments: true,
            allowRating: true,
            createdAt: '2024-01-20T10:00:00Z',
            updatedAt: '2024-01-22T14:30:00Z',
            author: 'Dr. Sarah Johnson',
            views: 1247,
            likes: 89,
            rating: 4.7,
            comments: 23,
            downloads: 156,
            media: [
              { type: 'image', url: '/api/placeholder/300/200', title: 'Calculus Graph' },
              { type: 'video', url: '/api/placeholder/video', title: 'Derivative Examples' }
            ],
            enrolledStudents: 45,
            completionRate: 78
          },
          {
            id: 2,
            title: 'Physics Lab: Momentum Conservation',
            type: 'video',
            category: 'physics',
            description: 'Hands-on laboratory experiment demonstrating conservation of momentum.',
            content: 'In this lab session, students will...',
            difficulty: 'advanced',
            duration: 90,
            tags: ['physics', 'lab', 'momentum', 'conservation'],
            prerequisites: ['Basic Physics', 'Algebra'],
            learningObjectives: [
              'Understand momentum conservation',
              'Conduct physics experiments',
              'Analyze experimental data'
            ],
            visibility: 'public',
            status: 'published',
            allowComments: true,
            allowRating: true,
            createdAt: '2024-01-18T14:00:00Z',
            updatedAt: '2024-01-19T09:15:00Z',
            author: 'Prof. Michael Chen',
            views: 892,
            likes: 67,
            rating: 4.5,
            comments: 18,
            downloads: 89,
            media: [
              { type: 'video', url: '/api/placeholder/video', title: 'Lab Demonstration' },
              { type: 'document', url: '/api/placeholder/document', title: 'Lab Instructions' }
            ],
            enrolledStudents: 32,
            completionRate: 85
          },
          {
            id: 3,
            title: 'Chemistry Basics Quiz',
            type: 'quiz',
            category: 'chemistry',
            description: 'Test your knowledge of basic chemistry concepts.',
            content: 'This quiz contains 20 multiple-choice questions...',
            difficulty: 'beginner',
            duration: 30,
            tags: ['chemistry', 'quiz', 'basics', 'assessment'],
            prerequisites: ['Basic Science'],
            learningObjectives: [
              'Identify chemical elements',
              'Understand chemical reactions',
              'Apply basic chemistry principles'
            ],
            visibility: 'public',
            status: 'draft',
            allowComments: false,
            allowRating: true,
            createdAt: '2024-01-25T11:30:00Z',
            updatedAt: '2024-01-25T11:30:00Z',
            author: 'Dr. Emily Rodriguez',
            views: 0,
            likes: 0,
            rating: 0,
            comments: 0,
            downloads: 0,
            media: [],
            enrolledStudents: 0,
            completionRate: 0
          },
          {
            id: 4,
            title: 'World War II Historical Analysis',
            type: 'document',
            category: 'history',
            description: 'Comprehensive analysis of World War II causes, events, and consequences.',
            content: 'This document provides detailed analysis...',
            difficulty: 'intermediate',
            duration: 60,
            tags: ['history', 'world war', 'analysis', 'document'],
            prerequisites: ['Modern History'],
            learningObjectives: [
              'Analyze historical causes',
              'Understand global impact',
              'Evaluate historical evidence'
            ],
            visibility: 'public',
            status: 'pending',
            allowComments: true,
            allowRating: true,
            createdAt: '2024-01-23T16:45:00Z',
            updatedAt: '2024-01-24T10:20:00Z',
            author: 'Prof. David Williams',
            views: 234,
            likes: 12,
            rating: 4.2,
            comments: 5,
            downloads: 28,
            media: [
              { type: 'image', url: '/api/placeholder/400/300', title: 'Historical Map' },
              { type: 'document', url: '/api/placeholder/document', title: 'Timeline' }
            ],
            enrolledStudents: 18,
            completionRate: 65
          },
          {
            id: 5,
            title: 'Interactive Coding Exercise',
            type: 'interactive',
            category: 'computer_science',
            description: 'Hands-on coding practice with Python basics.',
            content: 'Interactive coding environment for learning Python...',
            difficulty: 'beginner',
            duration: 45,
            tags: ['programming', 'python', 'coding', 'interactive'],
            prerequisites: ['Basic Computer Skills'],
            learningObjectives: [
              'Write basic Python code',
              'Understand programming concepts',
              'Debug simple programs'
            ],
            visibility: 'public',
            status: 'published',
            allowComments: true,
            allowRating: true,
            createdAt: '2024-01-21T13:20:00Z',
            updatedAt: '2024-01-22T08:10:00Z',
            author: 'Dr. Alex Thompson',
            views: 1567,
            likes: 134,
            rating: 4.8,
            comments: 45,
            downloads: 89,
            media: [
              { type: 'interactive', url: '/api/placeholder/interactive', title: 'Code Editor' }
            ],
            enrolledStudents: 78,
            completionRate: 92
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    try {
      const content = {
        id: Date.now(),
        ...newContent,
        author: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        views: 0,
        likes: 0,
        rating: 0,
        comments: 0,
        downloads: 0,
        enrolledStudents: 0,
        completionRate: 0
      };
      
      setContent([content, ...content]);
      setNewContent({
        title: '',
        type: 'lesson',
        category: 'mathematics',
        description: '',
        content: '',
        difficulty: 'beginner',
        duration: 30,
        tags: [],
        prerequisites: [],
        learningObjectives: [],
        visibility: 'public',
        allowComments: true,
        allowRating: true,
        media: []
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const handleDeleteContent = (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      setContent(content.filter(c => c.id !== contentId));
    }
  };

  const handleDuplicateContent = (contentItem) => {
    const duplicated = {
      ...contentItem,
      id: Date.now(),
      title: `${contentItem.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      rating: 0,
      comments: 0,
      downloads: 0,
      enrolledStudents: 0,
      completionRate: 0
    };
    setContent([duplicated, ...content]);
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const sortedContent = [...filteredContent].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'created':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'views':
        aValue = a.views;
        bValue = b.views;
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = contentTypes.find(t => t.id === type);
    return typeConfig ? typeConfig.icon : FileText;
  };

  const getTypeColor = (type) => {
    const typeConfig = contentTypes.find(t => t.id === type);
    return typeConfig ? typeConfig.color : 'bg-gray-500';
  };

  const getDifficultyColor = (difficulty) => {
    const difficultyConfig = difficultyLevels.find(d => d.id === difficulty);
    return difficultyConfig ? difficultyConfig.color : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <PenTool className="h-8 w-8 mr-3" />
            Content Creation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage educational content for your courses
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Content</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search content..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {filters.map(filter => (
                  <option key={filter.id} value={filter.id}>{filter.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="created">Created Date</option>
                <option value="title">Title</option>
                <option value="views">Views</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {sortedContent.map(item => {
          const IconComponent = getTypeIcon(item.type);
          
          if (viewMode === 'grid') {
            return (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex-shrink-0 p-3 rounded-full ${getTypeColor(item.type)}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(item.duration)}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {item.enrolledStudents}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {item.views}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedContent(item);
                        setShowPreviewModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateContent(item)}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContent(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`flex-shrink-0 p-2 rounded-full ${getTypeColor(item.type)}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(item.duration)}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {item.enrolledStudents} students
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {item.views} views
                        </span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}
                        </span>
                        <span className="text-gray-400">
                          Created {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedContent(item);
                        setShowPreviewModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateContent(item)}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContent(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Create Content Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Content
            </h3>
            <form onSubmit={handleCreateContent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent({...newContent, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {contentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newContent.category}
                    onChange={(e) => setNewContent({...newContent, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newContent.difficulty}
                    onChange={(e) => setNewContent({...newContent, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {difficultyLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newContent.duration}
                    onChange={(e) => setNewContent({...newContent, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Visibility
                  </label>
                  <select
                    value={newContent.visibility}
                    onChange={(e) => setNewContent({...newContent, visibility: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newContent.description}
                  onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  value={newContent.content}
                  onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="6"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newContent.allowComments}
                    onChange={(e) => setNewContent({...newContent, allowComments: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Allow Comments</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newContent.allowRating}
                    onChange={(e) => setNewContent({...newContent, allowRating: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Allow Rating</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedContent.title}
              </h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedContent.status)}`}>
                  {selectedContent.status}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getDifficultyColor(selectedContent.difficulty)}`}>
                  {selectedContent.difficulty}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedContent.category.replace('_', ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {selectedContent.description}
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Content
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    {selectedContent.content}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDuration(selectedContent.duration)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedContent.views}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedContent.rating > 0 ? selectedContent.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedContent.enrolledStudents}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedContent.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedContent.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedContent.length === 0 && (
        <div className="text-center py-12">
          <PenTool className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No content found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first piece of content to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentCreationPage;
