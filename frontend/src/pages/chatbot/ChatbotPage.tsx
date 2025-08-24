import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MessageSquare, 
  Send, 
  ChevronLeft, 
  Plus,
  Bot,
  User,
  AlertCircle,
  BookOpen,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

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
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${apiUrl}/chatbot/conversations`);
        setConversations(response.data.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };
    
    fetchConversations();
  }, [apiUrl]);
  
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
        const response = await axios.get(`${apiUrl}/chatbot/conversations/${conversationId}`);
        setActiveConversation(response.data.data.conversation);
        setMessages(response.data.data.messages);
      } catch (error: any) {
        console.error('Error fetching conversation:', error);
        setError(error.response?.data?.error || 'Failed to fetch conversation');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversation();
  }, [apiUrl, conversationId]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleStartNewConversation = async (courseId: number | null = null) => {
    setIsStarting(true);
    setError(null);
    
    try {
      const response = await axios.post(`${apiUrl}/chatbot/start`, {
        course_id: courseId
      });
      
      const newConversation = response.data.data.conversation;
      const initialMessages = response.data.data.messages;
      
      // Update state
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setMessages(initialMessages);
      
      // Navigate to new conversation
      navigate(`/chatbot/${newConversation.id}`);
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      setError(error.response?.data?.error || 'Failed to start new conversation');
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
      const response = await axios.post(`${apiUrl}/chatbot/message`, {
        conversation_id: activeConversation.id,
        message: newMessage
      });
      
      setMessages(response.data.data.messages);
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsSending(false);
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
    <div className="container-fluid py-4 fade-in">
      <div className="card border-0 shadow-sm" style={{ minHeight: '70vh' }}>
        <div className="row g-0 h-100">
          {/* Conversation Sidebar */}
          {showSidebar && (
            <div className="col-md-4 col-lg-3 border-end">
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Conversations</h5>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleStartNewConversation()}
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <span className="spinner-border spinner-border-sm\" role="status\" aria-hidden="true"></span>
                  ) : (
                    <>
                      <Plus size={16} className="me-1" />
                      New
                    </>
                  )}
                </button>
              </div>
              
              <div className="conversations-list" style={{ height: 'calc(70vh - 62px)', overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                  <div className="text-center py-5">
                    <MessageSquare size={32} className="text-muted mb-2" />
                    <p className="text-muted small">
                      No conversations yet
                    </p>
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
                      <Link 
                        key={conversation.id}
                        to={`/chatbot/${conversation.id}`}
                        className={`list-group-item list-group-item-action border-0 py-3 ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                      >
                        <div className="d-flex">
                          <div className="d-flex align-items-center h-25 w-auto rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                            <Bot className="text-primary" size={20} />
                          </div>
                          <div className="overflow-hidden">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0 text-truncate">
                                {conversation.course_title ? conversation.course_title : 'General Assistant'}
                              </h6>
                              <small className="text-muted ms-2">
                                <Clock size={12} className="me-1" />
                                {formatDate(conversation.started_at)}
                              </small>
                            </div>
                            {conversation.last_message && (
                              <p className="text-truncate small text-muted mb-0">
                                {conversation.last_message.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Chat Area */}
          <div className={showSidebar ? 'col-md-8 col-lg-9' : 'col-12'}>
            {activeConversation ? (
              <>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    {!showSidebar && (
                      <button 
                        className="btn btn-outline-secondary btn-sm me-2"
                        onClick={() => navigate('/chatbot')}
                      >
                        <ChevronLeft size={16} />
                      </button>
                    )}
                    
                    <div className="d-flex align-items-center h-25 w-auto rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                      <Bot className="text-primary" size={20} />
                    </div>
                    
                    <div>
                      <h5 className="mb-0">
                        {activeConversation.course_title 
                          ? `${activeConversation.course_title} Assistant` 
                          : 'Smart LMS Assistant'}
                      </h5>
                      <div className="text-muted small">
                        {formatDate(activeConversation.started_at)}
                      </div>
                    </div>
                  </div>
                  
                  {!showSidebar && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartNewConversation()}
                      disabled={isStarting}
                    >
                      {isStarting ? (
                        <span className="spinner-border spinner-border-sm\" role="status\" aria-hidden="true"></span>
                      ) : (
                        <>
                          <Plus size={16} className="me-1" />
                          New Chat
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                <div className="chat-messages p-4" style={{ height: 'calc(70vh - 130px)', overflowY: 'auto' }}>
                  {messages.map(message => (
                    <div 
                      key={message.id}
                      className={`d-flex mb-3 ${message.sender_type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      {message.sender_type === 'bot' && (
                        <div className="d-flex align-items-center h-25 w-auto rounded-circle bg-primary bg-opacity-10 p-2 me-2 align-self-end">
                          <Bot className="text-primary\" size={16} />
                        </div>
                      )}
                      
                      <div 
                        className={`message-content ${message.sender_type === 'user' ? 'bg-primary text-white' : 'bg-light'} rounded p-3 ${message.sender_type === 'user' ? 'ms-5' : 'me-5'}`}
                        style={{ maxWidth: '75%' }}
                      >
                        <div>{message.message}</div>
                        <div className={`text-${message.sender_type === 'user' ? 'white-50' : 'muted'} d-flex align-items-center justify-content-end small mt-1`} style={{ fontSize: '0.7rem' }}>
                          <Clock size={10} className="me-1" />
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      {message.sender_type === 'user' && (
                        <div className="d-flex align-items-center h-25 w-auto rounded-circle bg-primary p-2 ms-2 text-white align-self-end">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef}></div>
                </div>
                
                {error && (
                  <div className="alert alert-danger mx-3" role="alert">
                    <AlertCircle size={18} className="me-2" />
                    {error}
                  </div>
                )}
                
                <div className="p-3 border-top">
                  <form onSubmit={handleSendMessage} className="d-flex">
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary ms-2"
                      disabled={isSending || !newMessage.trim()}
                    >
                      {isSending ? (
                        <span className="spinner-border spinner-border-sm\" role="status\" aria-hidden="true"></span>
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center h-100 p-4">
                <Bot size={64} className="text-primary mb-3" />
                <h4 className="mb-2">Smart LMS Assistant</h4>
                <p className="text-muted text-center mb-4">
                  Start a conversation with our AI assistant to get help with your courses, assignments, or any questions about the platform.
                </p>
                <div>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => handleStartNewConversation()}
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2\" role="status\" aria-hidden="true"></span>
                        Starting conversation...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={20} className="me-2" />
                        Start New Conversation
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!activeConversation && (
        <div className="row mt-4">
          <div className="col-md-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex mb-3">
                  <div className="d-flex align-items-center h-25 w-auto rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <BookOpen className="text-primary" size={24} />
                  </div>
                  <div>
                    <h5 className="card-title">Course Help</h5>
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
          
          <div className="col-md-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex mb-3">
                  <div className="d-flex align-items-center h-25 w-auto rounded-circle bg-success bg-opacity-10 p-3 me-3">
                    <Bot className="text-success" size={24} />
                  </div>
                  <div>
                    <h5 className="card-title">AI Assistant</h5>
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
          
          <div className="col-md-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex mb-3">
                  <div className="d-flex align-items-center h-25 w-auto rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                    <Users className="text-warning" size={24} />
                  </div>
                  <div>
                    <h5 className="card-title">Peer Support</h5>
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
  );
};

// Add the missing Users component
const Users: React.FC<{ size: number, className: string }> = ({ size, className }) => {
  return <span className={className} style={{ width: size, height: size, display: 'inline-block' }}>👥</span>;
};

export default ChatbotPage;