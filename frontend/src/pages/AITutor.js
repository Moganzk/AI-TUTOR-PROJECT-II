import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  MessageSquare,
  Lightbulb,
  Calculator,
  FileText,
  Clock,
  Star,
  RefreshCw,
  Copy,
  Download,
  Settings,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Smile,
  PaperClip,
  Image,
  MoreHorizontal,
  Trash2,
  Edit,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AITutor = ({ studentContext: initialStudentContext = null }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('general');
  const [chatHistory, setChatHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [studentContext, setStudentContext] = useState(initialStudentContext);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Quick actions for common tasks
  const quickActions = [
    { icon: Calculator, label: 'Math Help', subject: 'math', prompt: 'Help me with a math problem' },
    { icon: BookOpen, label: 'Study Tips', subject: 'general', prompt: 'Give me some effective study tips' },
    { icon: Lightbulb, label: 'Explain Concept', subject: 'general', prompt: 'Explain a concept to me' },
    { icon: FileText, label: 'Essay Help', subject: 'english', prompt: 'Help me improve my essay writing' },
    { icon: Clock, label: 'Time Management', subject: 'general', prompt: 'Help me manage my study time better' },
    { icon: Star, label: 'Motivation', subject: 'general', prompt: 'I need some study motivation' }
  ];

  const subjects = [
    { id: 'general', name: 'General', icon: MessageSquare },
    { id: 'math', name: 'Mathematics', icon: Calculator },
    { id: 'science', name: 'Science', icon: BookOpen },
    { id: 'english', name: 'English', icon: FileText },
    { id: 'history', name: 'History', icon: Clock }
  ];

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      let greetingText = `Hello ${user?.name || 'there'}! I'm your AI tutor powered by advanced language models. I'm here to help you learn and understand various subjects including mathematics, science, English, history, and more.`;
      
      if (studentContext?.progress) {
        greetingText += `\n\nI can see you're currently at ${studentContext.progress.overall_progress}% completion rate. Great progress! `;
        if (studentContext.progress.struggling_subjects?.length > 0) {
          greetingText += `I notice you might need some extra help with ${studentContext.progress.struggling_subjects.join(', ')}. I'm here to help!`;
        }
      }

      greetingText += `\n\nWhat would you like to explore today? You can:
• Ask me to explain a concept
• Help with homework or assignments
• Get study tips and strategies
• Practice problem-solving
• Discuss any academic topic

Feel free to ask me anything!`;

      const greeting = {
        id: 1,
        type: 'ai',
        content: greetingText,
        timestamp: new Date(),
        subject: 'general'
      };
      setMessages([greeting]);
    }
  }, [user?.name, messages.length, studentContext]);

  // Listen for student context updates
  useEffect(() => {
    const handleStudentContextUpdate = (event) => {
      if (event.detail?.context) {
        setStudentContext(event.detail.context);
      }
    };

    window.addEventListener('student-context-loaded', handleStudentContextUpdate);

    return () => {
      window.removeEventListener('student-context-loaded', handleStudentContextUpdate);
    };
  }, []);

  // Event listeners for quick start and session loading
  useEffect(() => {
    const handleQuickStart = (event) => {
      const { prompt, quickStartType } = event.detail;
      handleSendMessage(prompt, quickStartType);
    };

    const handleLoadSession = async (event) => {
      const { sessionId: newSessionId } = event.detail;
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/api/tutor/sessions/${newSessionId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          const sessionMessages = response.data.messages.map((msg, index) => ({
            id: Date.now() + index,
            type: msg.role === 'user' ? 'user' : 'ai',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            subject: selectedSubject
          }));
          setMessages(sessionMessages);
          setSessionId(newSessionId);
          toast.success('Previous conversation loaded');
        }
      } catch (error) {
        console.error('Error loading session:', error);
        toast.error('Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('ai-tutor-quick-start', handleQuickStart);
    window.addEventListener('ai-tutor-load-session', handleLoadSession);

    return () => {
      window.removeEventListener('ai-tutor-quick-start', handleQuickStart);
      window.removeEventListener('ai-tutor-load-session', handleLoadSession);
    };
  }, [selectedSubject]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to AI backend
  const sendToAI = async (message, quickStartType = null) => {
    try {
      const token = localStorage.getItem('token');
  const response = await axios.post(`${API_BASE_URL}/api/tutor/chat`, {
        message: message,
        session_id: sessionId,
        subject: selectedSubject,
        quick_start_type: quickStartType
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Update session ID if it's a new session
        if (response.data.session_id && !sessionId) {
          setSessionId(response.data.session_id);
        }
        return response.data.response;
      } else {
        throw new Error(response.data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error(error.response?.data?.error || 'Failed to connect to AI service');
    }
  };

  const handleSendMessage = async (messageText = inputMessage, quickStartType = null) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
      subject: selectedSubject
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get AI response from backend with quick start context
      const aiResponse = await sendToAI(messageText, quickStartType);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        subject: selectedSubject
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to get AI response');
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.",
        timestamp: new Date(),
        subject: selectedSubject,
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setSelectedSubject(action.subject);
    handleSendMessage(action.prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast.success('Message deleted');
  };

  const handleNewChat = () => {
    setChatHistory(prev => [...prev, { id: Date.now(), messages: [...messages] }]);
    setMessages([]);
    toast.success('New chat started');
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('Listening...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  };

  const handleSpeakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Speech synthesis not supported in this browser');
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Tutor
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your personal learning assistant
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Subject Selector */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleNewChat}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="New Chat"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'ai' 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {message.type === 'ai' ? (
                  <Bot className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>

              {/* Message Content */}
              <div className={`relative group ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.isError 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              } rounded-lg p-4 shadow-sm max-w-full`}>
                
                {/* AI Response with better formatting */}
                {message.type === 'ai' ? (
                  <div className="space-y-3">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-2 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                    
                    {/* AI Response Footer */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-1">
                        <Bot className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          AI Tutor
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                )}
                
                {/* User message timestamp */}
                {message.type === 'user' && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-blue-100">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                )}
                
                {/* Message Actions - positioned differently for user vs AI */}
                <div className={`absolute ${
                  message.type === 'user' ? 'left-2 top-2' : 'right-2 top-2'
                } flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <button
                    onClick={() => handleCopyMessage(message.content)}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      message.type === 'user' ? 'text-blue-100 hover:text-blue-200' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Copy"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  
                  {message.type === 'ai' && (
                    <button
                      onClick={() => handleSpeakMessage(message.content)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
                      title="Speak"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      message.type === 'user' ? 'text-blue-100 hover:text-red-200' : 'text-gray-400 hover:text-red-600'
                    }`}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Input Actions */}
            <div className="absolute right-2 top-2 flex items-center space-x-1">
              <button
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send Message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Tutor Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Speed
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                  <option value="slow">Slow</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Learning Level
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Voice Responses
                </span>
                <button className="relative inline-flex h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-700">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1 mt-1" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show Timestamps
                </span>
                <button className="relative inline-flex h-6 w-11 rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6 mt-1" />
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  toast.success('Settings saved!');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITutor;
