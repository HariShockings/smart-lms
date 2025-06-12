import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft,
  Send,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Mentorship {
  id: number;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date: string | null;
  course_id: number;
  course_title: string;
  mentor_id: number;
  mentor_first_name: string;
  mentor_last_name: string;
  mentor_profile_picture: string | null;
  mentee_id: number;
  mentee_first_name: string;
  mentee_last_name: string;
  mentee_profile_picture: string | null;
}

interface Message {
  id: number;
  mentoring_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

const MentoringChat: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Fetch mentorship and messages data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${apiUrl}/mentoring/${id}`);
        setMentorship(response.data.data.mentorship);
        setMessages(response.data.data.messages);
      } catch (error: any) {
        console.error('Error fetching mentorship data:', error);
        setError(error.response?.data?.error || 'Failed to fetch mentorship data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
    
    // Setup polling to check for new messages every 10 seconds
    const intervalId = setInterval(() => {
      if (id && !isLoading && !isSending) {
        fetchData();
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [apiUrl, id]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      const response = await axios.post(`${apiUrl}/mentoring/${id}/messages`, {
        message: newMessage
      });
      
      // Add the new message to the list
      setMessages(prevMessages => [...prevMessages, response.data.data]);
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!mentorship) {
    return (
      <div className="alert alert-danger\" role="alert">
        <AlertCircle size={18} className="me-2" />
        Mentorship not found or you are not authorized to view it
      </div>
    );
  }
  
  const isUserMentor = user?.id === mentorship.mentor_id;
  const partnerName = isUserMentor 
    ? `${mentorship.mentee_first_name} ${mentorship.mentee_last_name}`
    : `${mentorship.mentor_first_name} ${mentorship.mentor_last_name}`;
  const partnerProfilePic = isUserMentor 
    ? mentorship.mentee_profile_picture
    : mentorship.mentor_profile_picture;
  
  return (
    <div className="container-fluid py-4 h-100 fade-in">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Link to="/mentoring" className="btn btn-outline-secondary btn-sm me-3">
                <ArrowLeft size={16} />
              </Link>
              
              <div className="d-flex align-items-center">
                <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                  {partnerProfilePic ? (
                    <img 
                      src={partnerProfilePic} 
                      alt={partnerName}
                      className="img-fluid rounded-circle"
                    />
                  ) : (
                    partnerName.split(' ').map(n => n.charAt(0)).join('')
                  )}
                </div>
                <div>
                  <h5 className="mb-0">{partnerName}</h5>
                  <div className="text-muted small d-flex align-items-center">
                    {mentorship.course_title} • {isUserMentor ? 'Mentee' : 'Mentor'}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              {mentorship.status === 'active' ? (
                <span className="badge bg-success">Active</span>
              ) : mentorship.status === 'paused' ? (
                <span className="badge bg-warning">Paused</span>
              ) : (
                <span className="badge bg-secondary">Completed</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          <div className="chat-messages p-4" style={{ height: '400px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div className="text-center py-5 my-5">
                <div className="mb-3">
                  <MessageSquare size={48} className="text-muted" />
                </div>
                <h5 className="mb-2">No messages yet</h5>
                <p className="text-muted">
                  {isUserMentor 
                    ? "Send a message to your mentee to start the conversation" 
                    : "Send a message to your mentor to start the conversation"}
                </p>
              </div>
            ) : (
              <>
                {messages.map(message => {
                  const isCurrentUser = message.sender_id === user?.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      {!isCurrentUser && (
                        <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2\" style={{ width: '32px', height: '32px' }}>
                          {message.profile_picture ? (
                            <img 
                              src={message.profile_picture} 
                              alt={`${message.first_name} ${message.last_name}`}
                              className="img-fluid rounded-circle"
                            />
                          ) : (
                            `${message.first_name.charAt(0)}${message.last_name.charAt(0)}`
                          )}
                        </div>
                      )}
                      
                      <div className={`message-content ${isCurrentUser ? 'bg-primary text-white' : 'bg-light'} rounded p-2 px-3 mw-75`}>
                        <div>{message.message}</div>
                        <div className={`text-${isCurrentUser ? 'white-50' : 'muted'} d-flex align-items-center justify-content-end small mt-1`} style={{ fontSize: '0.7rem' }}>
                          <Clock size={10} className="me-1" />
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      {isCurrentUser && (
                        <div className="avatar bg-primary text-white d-flex align-items-center justify-content-center ms-2" style={{ width: '32px', height: '32px' }}>
                          {user.profile_picture ? (
                            <img 
                              src={user.profile_picture} 
                              alt={`${user.first_name} ${user.last_name}`}
                              className="img-fluid rounded-circle"
                            />
                          ) : (
                            `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef}></div>
              </>
            )}
          </div>
          
          {error && (
            <div className="alert alert-danger m-3" role="alert">
              <AlertCircle size={18} className="me-2" />
              {error}
            </div>
          )}
          
          <div className="p-3 border-top">
            {mentorship.status === 'active' ? (
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
            ) : (
              <div className="alert alert-warning mb-0">
                This mentoring relationship is no longer active. You cannot send new messages.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Mentoring Guidelines</h5>
          <div className="row">
            {isUserMentor ? (
              <>
                <div className="col-md-6 mb-3 mb-md-0">
                  <h6 className="mb-2">Mentor Best Practices</h6>
                  <ul className="small text-muted mb-0 ps-3">
                    <li>Be patient and understanding with your mentee</li>
                    <li>Share specific study strategies that worked for you</li>
                    <li>Provide constructive feedback, not just answers</li>
                    <li>Set regular check-ins to track progress</li>
                    <li>Encourage questions and create a safe learning environment</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-2">Tips for Effective Mentoring</h6>
                  <ul className="small text-muted mb-0 ps-3">
                    <li>Start by getting to know your mentee's learning style</li>
                    <li>Break down complex topics into manageable parts</li>
                    <li>Share resources that have helped you master the material</li>
                    <li>Ask open-ended questions to check understanding</li>
                    <li>Celebrate improvements and milestones together</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="col-md-6 mb-3 mb-md-0">
                  <h6 className="mb-2">Making the Most of Mentoring</h6>
                  <ul className="small text-muted mb-0 ps-3">
                    <li>Be specific about concepts you're struggling with</li>
                    <li>Come prepared with questions for your mentor</li>
                    <li>Be open to trying new study techniques</li>
                    <li>Take notes during mentoring conversations</li>
                    <li>Apply the advice you receive and report back on results</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-2">Getting Effective Help</h6>
                  <ul className="small text-muted mb-0 ps-3">
                    <li>Share your learning goals with your mentor</li>
                    <li>Don't wait until the last minute before exams or deadlines</li>
                    <li>Try to solve problems first, then discuss your approach</li>
                    <li>Ask for clarification if you don't understand something</li>
                    <li>Provide feedback on which strategies help you most</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add the missing MessageSquare component
const MessageSquare: React.FC<{ size: number, className: string }> = ({ size, className }) => {
  return <span className={className} style={{ width: size, height: size, display: 'inline-block' }}>💬</span>;
};

export default MentoringChat;