import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  ChevronLeft, 
  Plus,
  Bot,
  User,
  AlertCircle,
  BookOpen,
  Clock,
  Trash2,
  Menu
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ChatbotPage.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Conversation {
  id: number;
  user_id: number;
  course_id: number | null;
  session_id: string;
  started_at: string;
  ended_at: string | null;
  course_title?: string;
  last_message?: Message;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_type: 'user' | 'bot';
  message: string;
  created_at: string;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: string | null }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger m-4" role="alert">
          <AlertCircle size={18} className="me-2" />
          An error occurred: {this.state.error}. Please refresh or try again.
        </div>
      );
    }
    return this.props.children;
  }
}

const ChatbotPage: React.FC = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768);
      if (window.innerWidth >= 768) setIsMobileSidebarOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.chatbot.getConversations();
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to fetch conversations');
      }
    };
    
    fetchConversations();
  }, []);

  // Fetch conversation if ID is provided
  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.chatbot.getConversation(conversationId);
        setActiveConversation(response.data.conversation);
        setMessages(response.data.messages);
      } catch (error: any) {
        console.error('Error fetching conversation:', error);
        setError(error.message || 'Failed to fetch conversation');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversation();
  }, [conversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartNewConversation = async (courseId: number | null = null) => {
    setIsStarting(true);
    setError(null);
    
    try {
      const response = await api.chatbot.startConversation(courseId?.toString());
      const newConversation = response.data.conversation;
      const initialMessages = response.data.messages;
      
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setMessages(initialMessages);
      
      navigate(`/chatbot/${newConversation.id}`);
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      setError(error.message || 'Failed to start new conversation');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeConversation || !newMessage.trim()) {
      return;
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      // Add user message locally for immediate feedback
      const tempUserMessage: Message = {
        id: Date.now(),
        conversation_id: activeConversation.id,
        sender_type: 'user',
        message: newMessage,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMessage]);
      setNewMessage('');
      
      setIsTyping(true);
      
      // Send to backend
      const apiResponse = await api.chatbot.sendMessage(activeConversation.id.toString(), newMessage);
      
      // Update with full messages from backend (includes user and bot response)
      setMessages(prev => [...prev.filter(msg => msg.sender_type !== 'user' || msg.id !== tempUserMessage.id), ...apiResponse.messages]);
      setIsTyping(false);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await api.chatbot.deleteConversation(conversationId.toString());
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
        navigate('/chatbot');
      }
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      setError(error.message || 'Failed to delete conversation');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-lg" style={{ borderRadius: '15px', zIndex: 1 }}>
          <div className="row g-0 h-100">
            {/* Sidebar */}
            <div
              className={`col-4 border-end bg-light ${showSidebar || isMobileSidebarOpen ? '' : 'd-none'}`}
              style={{
                position: showSidebar ? 'relative' : 'fixed',
                top: 0,
                left: 0,
                height: '80vh',
                overflowY: 'auto',
                zIndex: 1050,
                transition: 'width 0.3s ease',
              }}
            >
              <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-primary">Conversations</h5>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleStartNewConversation()}
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <>
                        <Plus size={16} className="me-1" />
                        New
                      </>
                    )}
                  </button>
                  {!showSidebar && (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-3" style={{ height: 'calc(100% - 70px)', overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                  <div className="text-center py-5">
                    <MessageSquare size={32} className="text-muted mb-2" />
                    <p className="text-muted small mb-3">No conversations yet</p>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleStartNewConversation()}
                      disabled={isStarting}
                    >
                      Start a conversation
                    </button>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {conversations.map(conversation => (
                      <div
                        key={conversation.id}
                        className={`list-group-item list-group-item-action py-3 ${
                          activeConversation?.id === conversation.id ? 'bg-primary-subtle' : ''
                        }`}
                        style={{ borderRadius: '10px', marginBottom: '8px' }}
                      >
                        <div className="d-flex align-items-center">
                          <Link
                            to={`/chatbot/${conversation.id}`}
                            className="flex-grow-1 text-decoration-none"
                            onClick={() => setIsMobileSidebarOpen(false)}
                          >
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0 me-3">
                                <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                                  <Bot className="text-primary" size={20} />
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1 fw-semibold">
                                  {conversation.course_title
                                    ? conversation.course_title.length > 35
                                      ? conversation.course_title.substring(0, 35) + "..."
                                      : conversation.course_title
                                    : "General Assistant"}
                                </h6>
                                <div className="d-flex align-items-center text-muted small">
                                  <Clock size={12} className="me-1" />
                                  {formatDate(conversation.started_at)}
                                </div>
                                {conversation.last_message && (
                                  <p className="text-muted small mb-0 mt-1">
                                    {conversation.last_message.message.length > 35
                                      ? `${conversation.last_message.message.substring(0, 35)}...`
                                      : conversation.last_message.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm ms-2"
                            onClick={() => handleDeleteConversation(conversation.id)}
                            disabled={isDeleting}
                            title="Delete conversation"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-8 d-flex flex-column" style={{ height: '80vh', overflowY: 'auto' }}>
              {activeConversation ? (
                <>
                  <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {!showSidebar && (
                        <button
                          className="btn btn-outline-secondary btn-sm me-2"
                          onClick={() => setIsMobileSidebarOpen(true)}
                        >
                          <Menu size={16} />
                        </button>
                      )}
                      <div className="flex-shrink-0 me-2">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                          <Bot className="text-primary" size={20} />
                        </div>
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">
                          {activeConversation.course_title
                            ? `${activeConversation.course_title} Assistant`
                            : 'Smart LMS Assistant'}
                        </h5>
                        <div className="text-muted small">
                          {formatDate(activeConversation.started_at)}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartNewConversation()}
                      disabled={isStarting}
                    >
                      {isStarting ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <>
                          <Plus size={16} className="me-1" />
                          New Chat
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 bg-light flex-grow-1" style={{ overflowY: 'auto' }}>
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`d-flex mb-3 ${
                          message.sender_type === 'user' ? 'justify-content-end' : 'justify-content-start'
                        }`}
                      >
                        {message.sender_type === 'bot' && (
                          <div className="flex-shrink-0 me-2">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                              <Bot className="text-primary" size={16} />
                            </div>
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-3 shadow-sm ${
                            message.sender_type === 'user' ? 'bg-primary text-white' : 'bg-white border'
                          }`}
                          style={{ maxWidth: '70%', wordBreak: 'break-word' }}
                        >
                          <div className="mb-1">{message.message}</div>
                          <div
                            className={`small text-${
                              message.sender_type === 'user' ? 'white-50' : 'muted'
                            } d-flex align-items-center justify-content-end`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            <Clock size={10} className="me-1" />
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        {message.sender_type === 'user' && (
                          <div className="flex-shrink-0 ms-2">
                            <div className="rounded-circle bg-primary text-white p-2">
                              <User size={16} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="d-flex mb-3 justify-content-start">
                        <div className="flex-shrink-0 me-2">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                            <Bot className="text-primary" size={16} />
                          </div>
                        </div>
                        <div className="p-3 rounded-3 shadow-sm bg-white border" style={{ maxWidth: '70%' }}>
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef}></div>
                  </div>
                  {error && (
                    <div className="alert alert-danger mx-4 mt-2" role="alert">
                      <AlertCircle size={18} className="me-2" />
                      {error}
                    </div>
                  )}
                  <div className="p-3 border-top bg-white">
                    <form onSubmit={handleSendMessage} className="input-group">
                      <input
                        type="text"
                        className="form-control rounded-start"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        disabled={isSending || isDeleting}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary rounded-end"
                        disabled={isSending || !newMessage.trim() || isDeleting}
                      >
                        {isSending ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <Send size={16} />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column justify-content-center align-items-center h-100 p-4 text-center bg-light">
                  <Bot size={64} className="text-primary mb-3" />
                  <h4 className="mb-2 fw-bold text-primary">Smart LMS Assistant</h4>
                  <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                    Start a conversation with our AI assistant to get help with your courses, assignments, or any questions about the platform.
                  </p>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => handleStartNewConversation()}
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Starting...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={20} className="me-2" />
                        Start New Conversation
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {!activeConversation && (
          <div className="row mt-4 g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <div className="d-flex mb-3 align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                        <BookOpen className="text-primary" size={24} />
                      </div>
                    </div>
                    <div>
                      <h5 className="card-title fw-bold mb-1">Course Help</h5>
                      <p className="card-text text-muted small">
                        Get assistance with specific course material, assignments, and quizzes.
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <Link to="/courses" className="btn btn-outline-primary btn-sm">
                      View Courses
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <div className="d-flex mb-3 align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="rounded-circle bg-success bg-opacity-10 p-3">
                        <Bot className="text-success" size={24} />
                      </div>
                    </div>
                    <div>
                      <h5 className="card-title fw-bold mb-1">AI Assistant</h5>
                      <p className="card-text text-muted small">
                        Our chatbot can answer general questions about the platform and provide study tips.
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => handleStartNewConversation()}
                    >
                      Chat Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <div className="d-flex mb-3 align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                        <Users className="text-warning" size={24} />
                      </div>
                    </div>
                    <div>
                      <h5 className="card-title fw-bold mb-1">Peer Support</h5>
                      <p className="card-text text-muted small">
                        Need more personalized help? Check your mentoring connections.
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <Link to="/mentoring" className="btn btn-outline-warning btn-sm">
                      View Mentoring
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Add the missing Users component
const Users: React.FC<{ size: number; className: string }> = ({ size, className }) => {
  return <span className={className} style={{ width: size, height: size, display: 'inline-block' }}>👥</span>;
};

export default ChatbotPage;