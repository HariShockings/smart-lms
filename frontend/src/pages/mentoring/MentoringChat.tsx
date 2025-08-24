import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Send,
  User,
  AlertCircle,
  Star,
  FileText,
  Image as ImageIcon,
  Paperclip,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const mentoringAPI = api.mentoring;

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
  mentor_rating: number | null;
  mentee_rating: number | null;
  notes: string | null;
}

interface Message {
  id: number;
  mentorship_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  message_type: string;
  file_url: string | null;
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
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isRating, setIsRating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Validate message object
  const isValidMessage = (msg: any): msg is Message => {
    if (!msg || typeof msg !== 'object') {
      return false;
    }

    const requiredFields = [
      'id', 'mentorship_id', 'sender_id', 'message', 'is_read', 
      'created_at', 'message_type', 'first_name', 'last_name'
    ];
    const missingFields = requiredFields.filter(field => !(field in msg));
    
    if (missingFields.length > 0) {
      return false;
    }

    // Normalize is_read to boolean (handle 0/1 from database)
    const normalizedIsRead = typeof msg.is_read === 'number' ? Boolean(msg.is_read) : msg.is_read;

    // Ensure types are reasonable
    const isValid =
      typeof msg.id === 'number' &&
      typeof msg.mentorship_id === 'number' &&
      typeof msg.sender_id === 'number' &&
      typeof msg.message === 'string' &&
      typeof normalizedIsRead === 'boolean' &&
      (typeof msg.created_at === 'string' || msg.created_at instanceof Date) &&
      typeof msg.message_type === 'string' &&
      (msg.file_url === null || typeof msg.file_url === 'string') &&
      (msg.read_at === null || typeof msg.read_at === 'string') &&
      typeof msg.first_name === 'string' &&
      typeof msg.last_name === 'string' &&
      (msg.profile_picture === null || typeof msg.profile_picture === 'string');

    if (isValid) {
      msg.is_read = normalizedIsRead;
      if (msg.created_at instanceof Date) {
        msg.created_at = msg.created_at.toISOString();
      }
    }

    return isValid;
  };

  // Fetch mentorship and messages data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Invalid mentorship ID');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await mentoringAPI.getMentorship(id);
        setMentorship(response.data.mentorship);
        const fetchedMessages = response.data.messages || [];
        const validMessages = fetchedMessages.filter(isValidMessage);
        setMessages(validMessages);
      } catch (error: any) {
        setError(error.message || error.response?.data?.error || 'Failed to fetch mentorship data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Setup polling to check for new messages every 10 seconds
    const intervalId = setInterval(() => {
      if (id && !isLoading && !isSending && !isCompleting) {
        fetchData();
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [id, isSending, isCompleting]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !id) {
      setError('Please enter a message');
      return;
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      const response = await mentoringAPI.sendMessage(id, {
        message: newMessage.trim(),
        message_type: 'text'
      });
      
      const newMessageData = response;
      if (!newMessageData) {
        throw new Error('No message data received from server');
      }
      
      if (!isValidMessage(newMessageData)) {
        throw new Error('Invalid message data received from server: missing or invalid fields');
      }
      
      setMessages(prevMessages => [...prevMessages, newMessageData]);
      setNewMessage('');
    } catch (error: any) {
      setError(error.message || error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !id) {
      setError('Please select a rating');
      return;
    }

    setIsRating(true);
    try {
      await mentoringAPI.rateMentorship(id, { rating, feedback });
      setShowRatingModal(false);
      setRating(0);
      setFeedback('');
      
      // Refresh mentorship data to show updated rating
      const response = await mentoringAPI.getMentorship(id);
      setMentorship(response.data.mentorship);
    } catch (error: any) {
      setError(error.message || error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setIsRating(false);
    }
  };

  const handleCompleteMentorship = async () => {
    if (!id || !mentorship) {
      setError('Invalid mentorship ID');
      return;
    }

    setIsCompleting(true);
    setError(null);

    try {
      // Update mentorship status to 'completed'
      await mentoringAPI.updateMentorshipStatus(id, { status: 'completed' });
      
      // Refresh mentorship data to reflect the new status
      const response = await mentoringAPI.getMentorship(id);
      setMentorship(response.data.mentorship);
    } catch (error: any) {
      setError(error.message || error.response?.data?.error || 'Failed to mark mentorship as completed');
    } finally {
      setIsCompleting(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (rating == null || isNaN(rating)) return <span className="text-muted">No rating</span>;
    
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`me-1 ${star <= Math.round(rating) ? 'text-warning fill-current' : 'text-muted'}`}
            fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
          />
        ))}
        <span className="ms-2 small text-muted">({rating.toFixed(1)})</span>
      </div>
    );
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!mentorship) {
    return (
      <div className="alert alert-danger" role="alert">
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
            
            <div className="d-flex align-items-center gap-3">
              {mentorship.status === 'active' ? (
                <span className="badge bg-success">Active</span>
              ) : mentorship.status === 'paused' ? (
                <span className="badge bg-warning">Paused</span>
              ) : (
                <span className="badge bg-secondary">Completed</span>
              )}
              
              <button
                onClick={() => setShowRatingModal(true)}
                className="btn btn-outline-warning btn-sm d-flex align-items-center"
              >
                <Star size={14} className="me-1" />
                Rate
              </button>

              {mentorship.status !== 'completed' && (
                <button
                  onClick={handleCompleteMentorship}
                  className="btn btn-outline-success btn-sm d-flex align-items-center"
                  disabled={isCompleting}
                >
                  <CheckCircle size={14} className="me-1" />
                  {isCompleting ? 'Completing...' : 'Complete Mentorship'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          <div className="chat-messages p-4" style={{ height: '500px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div className="text-center py-5 my-5">
                <div className="mb-3">
                  <FileText size={48} className="text-muted" />
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
                {messages.map((message, index) => {
                  if (!isValidMessage(message)) {
                    return null;
                  }
                  
                  const isCurrentUser = message.sender_id === user?.id;
                  
                  return (
                    <div 
                      key={message.id || `message-${index}`} 
                      className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      {!isCurrentUser && (
                        <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                          {message.profile_picture ? (
                            <img 
                              src={message.profile_picture} 
                              alt={`${message.first_name} ${message.last_name}`}
                              className="img-fluid rounded-circle"
                            />
                          ) : (
                            `${message.first_name?.charAt(0) || ''}${message.last_name?.charAt(0) || ''}`
                          )}
                        </div>
                      )}
                      
                      <div className={`message-content ${isCurrentUser ? 'bg-primary text-white' : 'bg-light'} rounded p-2 px-3 mw-75`}>
                        <div>{message.message}</div>
                        {message.file_url && (
                          <div className="mt-1">
                            {message.message_type === 'image' ? (
                              <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                                <ImageIcon size={16} className="me-1" />
                                View Image
                              </a>
                            ) : (
                              <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                                <Paperclip size={16} className="me-1" />
                                View Attachment
                              </a>
                            )}
                          </div>
                        )}
                        <div className={`text-${isCurrentUser ? 'white-50' : 'muted'} d-flex align-items-center justify-content-end small mt-1`} style={{ fontSize: '0.7rem' }}>
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
                            `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`
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
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
      
      {/* Mentoring Guidelines */}
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

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rate Your Mentoring Experience</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRatingModal(false)}
                ></button>
              </div>
              <form onSubmit={handleRating}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="btn btn-outline-warning p-2"
                          onClick={() => setRating(star)}
                        >
                          <Star
                            size={24}
                            className={star <= rating ? 'text-warning fill-current' : 'text-muted'}
                            fill={star <= rating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                    <small className="text-muted">Click on a star to rate</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Feedback (Optional)</label>
                    <textarea 
                      className="form-control" 
                      rows={3}
                      value={feedback} 
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Share your thoughts about the mentoring experience..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowRatingModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isRating || rating === 0}
                  >
                    {isRating ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentoringChat;