import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  User, 
  ChevronDown,
  ChevronUp,
  Send,
  Paperclip,
  Star,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Filter
} from 'lucide-react';

const HelpSupportPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [supportTickets, setSupportTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    attachment: null
  });

  const faqCategories = [
    { id: 'all', name: 'All Categories', count: 25 },
    { id: 'account', name: 'Account & Login', count: 8 },
    { id: 'courses', name: 'Courses & Learning', count: 10 },
    { id: 'technical', name: 'Technical Issues', count: 5 },
    { id: 'billing', name: 'Billing & Payments', count: 2 }
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I reset my password?',
      answer: 'To reset your password, click on the "Forgot Password" link on the login page. Enter your email address and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
      category: 'account',
      helpful: 45,
      notHelpful: 3,
      lastUpdated: '2024-01-20'
    },
    {
      id: 2,
      question: 'How do I enroll in a course?',
      answer: 'To enroll in a course, browse our course catalog and click on the course you\'re interested in. On the course page, click the "Enroll" button. If it\'s a paid course, you\'ll be directed to the payment page. Once payment is complete, you\'ll have immediate access to the course content.',
      category: 'courses',
      helpful: 67,
      notHelpful: 2,
      lastUpdated: '2024-01-18'
    },
    {
      id: 3,
      question: 'Can I download course materials?',
      answer: 'Yes, most course materials including PDFs, documents, and some videos can be downloaded for offline viewing. Look for the download button next to each resource. Please note that downloaded materials are for personal use only.',
      category: 'courses',
      helpful: 34,
      notHelpful: 1,
      lastUpdated: '2024-01-15'
    },
    {
      id: 4,
      question: 'How do I contact my instructor?',
      answer: 'You can contact your instructor through the course discussion forum, direct messaging system, or during their office hours. Check the course page for instructor contact information and availability.',
      category: 'courses',
      helpful: 28,
      notHelpful: 0,
      lastUpdated: '2024-01-22'
    },
    {
      id: 5,
      question: 'What should I do if videos won\'t play?',
      answer: 'If videos won\'t play, try these steps: 1) Check your internet connection, 2) Clear your browser cache and cookies, 3) Try a different browser, 4) Disable browser extensions, 5) Update your browser to the latest version. If issues persist, contact support.',
      category: 'technical',
      helpful: 52,
      notHelpful: 8,
      lastUpdated: '2024-01-19'
    },
    {
      id: 6,
      question: 'How do I update my profile information?',
      answer: 'To update your profile, click on your avatar in the top right corner and select "Profile". From there, you can edit your personal information, change your password, and update your preferences.',
      category: 'account',
      helpful: 31,
      notHelpful: 1,
      lastUpdated: '2024-01-17'
    },
    {
      id: 7,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All transactions are secure and encrypted.',
      category: 'billing',
      helpful: 23,
      notHelpful: 0,
      lastUpdated: '2024-01-21'
    },
    {
      id: 8,
      question: 'How do I get a refund?',
      answer: 'We offer a 30-day money-back guarantee for all courses. To request a refund, contact our support team with your order details. Refunds are processed within 5-7 business days.',
      category: 'billing',
      helpful: 19,
      notHelpful: 2,
      lastUpdated: '2024-01-16'
    }
  ];

  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with AI Tutor',
      description: 'Learn the basics of using our AI tutoring system',
      type: 'video',
      duration: '5 mins',
      thumbnail: '',
      category: 'beginner'
    },
    {
      id: 2,
      title: 'Course Navigation Guide',
      description: 'How to navigate through course content effectively',
      type: 'article',
      duration: '3 mins',
      thumbnail: '',
      category: 'beginner'
    },
    {
      id: 3,
      title: 'Using Study Sessions',
      description: 'Maximize your learning with focused study sessions',
      type: 'video',
      duration: '8 mins',
      thumbnail: '',
      category: 'intermediate'
    },
    {
      id: 4,
      title: 'Assignment Submission Guide',
      description: 'Step-by-step guide to submitting assignments',
      type: 'article',
      duration: '4 mins',
      thumbnail: '',
      category: 'beginner'
    }
  ];

  const contactOptions = [
    {
      id: 1,
      type: 'email',
      title: 'Email Support',
      description: 'Get help via email. We typically respond within 24 hours.',
      contact: 'support@aitutor.com',
      responseTime: '24 hours',
      availability: '24/7'
    },
    {
      id: 2,
      type: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time.',
      contact: 'Available in app',
      responseTime: '5 minutes',
      availability: 'Mon-Fri 9AM-6PM'
    },
    {
      id: 3,
      type: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with a support representative.',
      contact: '+1 (555) 123-4567',
      responseTime: 'Immediate',
      availability: 'Mon-Fri 9AM-5PM'
    }
  ];

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const fetchSupportTickets = async () => {
    try {
      // Simulate API call
      setSupportTickets([
        {
          id: 1,
          subject: 'Cannot access course materials',
          category: 'technical',
          priority: 'high',
          status: 'open',
          createdAt: '2024-01-25T10:30:00Z',
          updatedAt: '2024-01-25T14:15:00Z',
          responses: 2
        },
        {
          id: 2,
          subject: 'Question about refund policy',
          category: 'billing',
          priority: 'medium',
          status: 'resolved',
          createdAt: '2024-01-20T09:15:00Z',
          updatedAt: '2024-01-21T11:30:00Z',
          responses: 3
        }
      ]);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const ticket = {
        id: Date.now(),
        ...newTicket,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: 0
      };
      
      setSupportTickets([ticket, ...supportTickets]);
      setNewTicket({
        subject: '',
        category: '',
        priority: 'medium',
        description: '',
        attachment: null
      });
      setShowTicketModal(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleFAQFeedback = (faqId, helpful) => {
    // Handle FAQ feedback
    console.log('FAQ feedback:', faqId, helpful);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'urgent': return 'text-red-700 dark:text-red-300';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <HelpCircle className="h-8 w-8 mr-3" />
            Help & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find answers to common questions and get help when you need it
          </p>
        </div>
        <button
          onClick={() => setShowTicketModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('tutorials')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tutorials'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Tutorials
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Tickets ({supportTickets.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search FAQ..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {faqCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </h3>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {faq.answer}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Was this helpful?
                            </span>
                            <button
                              onClick={() => handleFAQFeedback(faq.id, true)}
                              className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>{faq.helpful}</span>
                            </button>
                            <button
                              onClick={() => handleFAQFeedback(faq.id, false)}
                              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
                            >
                              <ThumbsDown className="h-4 w-4" />
                              <span>{faq.notHelpful}</span>
                            </button>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Updated {formatDate(faq.lastUpdated)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tutorials Tab */}
          {activeTab === 'tutorials' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tutorials.map((tutorial) => (
                  <div key={tutorial.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {tutorial.type === 'video' ? (
                          <Video className="h-8 w-8 text-blue-600" />
                        ) : (
                          <FileText className="h-8 w-8 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          {tutorial.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {tutorial.duration}
                            </span>
                            <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 rounded-full">
                              {tutorial.category}
                            </span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                            <span className="text-sm">View</span>
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactOptions.map((option) => (
                  <div key={option.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      {option.type === 'email' && <Mail className="h-6 w-6 text-blue-600 mr-3" />}
                      {option.type === 'chat' && <MessageSquare className="h-6 w-6 text-green-600 mr-3" />}
                      {option.type === 'phone' && <Phone className="h-6 w-6 text-purple-600 mr-3" />}
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {option.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {option.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Contact:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.contact}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Response:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.responseTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Available:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.availability}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {supportTickets.length > 0 ? (
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {ticket.subject}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority} priority
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Created {formatDate(ticket.createdAt)}</span>
                            <span>Updated {getTimeAgo(ticket.updatedAt)}</span>
                            <span>{ticket.responses} responses</span>
                          </div>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No support tickets yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    When you create a support ticket, it will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Support Ticket
            </h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="account">Account & Login</option>
                  <option value="courses">Courses & Learning</option>
                  <option value="technical">Technical Issues</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewTicket({...newTicket, attachment: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Create Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupportPage;
