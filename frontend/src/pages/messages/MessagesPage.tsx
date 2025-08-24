import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, MoreVertical, User, Users, FileText, Image, Paperclip, AlertCircle } from 'lucide-react';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'file' | 'image';
  attachments?: string | null;
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isGroup: boolean;
  avatar?: string | null;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture?: string | null;
  role: 'student' | 'teacher' | 'admin';
}

const API_BASE_URL = 'http://localhost:5000'; // Backend base URL

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations from backend
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await messagesAPI.getConversations();
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch conversations');
        }
        const conversationsData = response.data;
        const transformedConversations: Conversation[] = conversationsData.map((conv: any) => ({
          id: conv.other_user_id.toString(),
          participants: [user.id, conv.other_user_id.toString()],
          participantNames: [`${conv.first_name} ${conv.last_name}`],
          lastMessage: conv.last_message || 'No messages yet',
          lastMessageTime: conv.last_message_time ? new Date(conv.last_message_time).toLocaleString() : 'Never',
          unreadCount: conv.unread_count || 0,
          isGroup: false,
          avatar: conv.profile_picture,
        }));
        setConversations(transformedConversations);
      } catch (error: any) {
        console.error('Failed to fetch conversations:', error);
        setError(error.message || 'Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    const intervalId = setInterval(fetchConversations, 30000);
    return () => clearInterval(intervalId);
  }, [user.id]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const otherUserId = selectedConversation.participants.find(id => id !== user.id);
          if (!otherUserId) {
            throw new Error('No recipient selected');
          }
          const response = await messagesAPI.getConversation(otherUserId);
          if (!response.success) {
            throw new Error(response.error || 'Failed to fetch messages');
          }
          const messagesData = response.data;
          const transformedMessages: Message[] = messagesData.map((msg: any) => ({
            id: msg.id.toString(),
            senderId: msg.sender_id.toString(),
            senderName: `${msg.sender_first_name} ${msg.sender_last_name}`,
            senderAvatar: msg.sender_avatar,
            content: msg.content,
            timestamp: msg.timestamp,
            isRead: msg.is_read,
            type: msg.type,
            attachments: msg.attachments,
          }));
          setMessages(transformedMessages);
          scrollToBottom();
        } catch (error: any) {
          console.error('Failed to fetch messages:', error);
          setError(error.message || 'Failed to load messages');
        }
      };

      fetchMessages();

      const intervalId = setInterval(fetchMessages, 10000);
      return () => clearInterval(intervalId);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, user.id]);

  // Search users for new conversation
  useEffect(() => {
    if (showNewConversation && searchQuery) {
      const searchUsers = async () => {
        try {
          const response = await messagesAPI.searchUsers({ query: searchQuery });
          if (!response.success) {
            throw new Error(response.error || 'Failed to search users');
          }
          setUserSearchResults(response.data);
        } catch (error: any) {
          console.error('Failed to search users:', error);
          setError(error.message || 'Failed to search users');
        }
      };
      const debounce = setTimeout(searchUsers, 300);
      return () => clearTimeout(debounce);
    } else {
      setUserSearchResults([]);
    }
  }, [searchQuery, showNewConversation]);

  const handleSendMessage = async () => {
    if (!selectedConversation || (!newMessage.trim() && !selectedFile)) return;

    try {
      const receiverId = selectedConversation.participants.find(id => id !== user.id);
      if (!receiverId) {
        throw new Error('No recipient selected');
      }

      const formData = new FormData();
      formData.append('receiver_id', receiverId);
      if (newMessage.trim()) {
        formData.append('content', newMessage.trim());
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await messagesAPI.sendMessage(formData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }
      const newMessageData = response.data;
      const transformedMessage: Message = {
        id: newMessageData.id.toString(),
        senderId: user.id.toString(),
        senderName: `${user.first_name} ${user.last_name}`,
        senderAvatar: user.profile_picture,
        content: newMessageData.content,
        timestamp: newMessageData.timestamp,
        isRead: newMessageData.is_read,
        type: newMessageData.type,
        attachments: newMessageData.attachments,
      };

      setMessages((prev) => [...prev, transformedMessage]);
      setNewMessage('');
      setSelectedFile(null);

      setConversations((prev) => {
        const existingConv = prev.find(conv => conv.id === receiverId);
        if (existingConv) {
          return prev.map(conv =>
            conv.id === receiverId
              ? { ...conv, lastMessage: newMessageData.content, lastMessageTime: 'Just now', unreadCount: 0 }
              : conv
          );
        } else {
          return [
            ...prev,
            {
              id: receiverId,
              participants: [user.id, receiverId],
              participantNames: selectedConversation.participantNames,
              lastMessage: newMessageData.content,
              lastMessageTime: 'Just now',
              unreadCount: 0,
              isGroup: false,
              avatar: selectedConversation.avatar,
            },
          ];
        }
      });
      scrollToBottom();
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartConversation = (selectedUser: User) => {
    const existingConv = conversations.find(conv => conv.id === selectedUser.id);
    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      const newConv: Conversation = {
        id: selectedUser.id,
        participants: [user.id, selectedUser.id],
        participantNames: [`${selectedUser.first_name} ${selectedUser.last_name}`],
        lastMessage: 'No messages yet',
        lastMessageTime: 'Never',
        unreadCount: 0,
        isGroup: false,
        avatar: selectedUser.profile_picture,
      };
      setConversations(prev => [...prev, newConv]);
      setSelectedConversation(newConv);
    }
    setShowNewConversation(false);
    setSearchQuery('');
    setUserSearchResults([]);
  };

  const handleCancelNewConversation = () => {
    setShowNewConversation(false);
    setSearchQuery('');
    setUserSearchResults([]);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Handle image load error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load image:', e.currentTarget.src);
    setError('Failed to load image');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3 mb-2 text-dark">Messages</h1>
        <p className="text-muted">Stay connected with your teachers</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="row g-0 h-100" style={{ minHeight: '600px' }}>
          {/* Conversations List */}
          <div className="col-lg-4 border-end">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Conversations</h5>
                {!showNewConversation ? (
                  <button
                    onClick={() => setShowNewConversation(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <MessageSquare size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleCancelNewConversation}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Back to Conversations
                  </button>
                )}
              </div>
              <div className="input-group mt-3">
                <span className="input-group-text">
                  <Search size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  placeholder={showNewConversation ? 'Search users...' : 'Search conversations...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="overflow-auto" style={{ maxHeight: '500px' }}>
              {showNewConversation ? (
                userSearchResults.length > 0 ? (
                  userSearchResults.map((searchedUser) => (
                    <div
                      key={searchedUser.id}
                      onClick={() => handleStartConversation(searchedUser)}
                      className="p-3 border-bottom cursor-pointer hover-bg-light"
                    >
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                          <User size={20} className="text-primary" />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-dark text-truncate">
                            {searchedUser.first_name} {searchedUser.last_name}
                          </h6>
                          <p className="small text-muted mb-0">{searchedUser.username}</p>
                          <p className="small text-muted">{searchedUser.role}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-muted">No users found</div>
                )
              ) : (
                conversations
                  .filter((conversation) =>
                    conversation.participantNames.some((name) =>
                      name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  )
                  .map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 border-bottom cursor-pointer ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-primary bg-opacity-10 border-start border-primary border-4'
                          : 'hover-bg-light'
                      }`}
                    >
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                          {conversation.isGroup ? (
                            <Users size={20} className="text-primary" />
                          ) : (
                            <User size={20} className="text-primary" />
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-1 text-dark text-truncate">
                              {conversation.participantNames.join(', ')}
                            </h6>
                            {conversation.unreadCount > 0 && (
                              <span className="badge bg-primary text-white">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="small text-muted mb-0 text-truncate">
                            {conversation.lastMessage.length > 35
                              ? conversation.lastMessage.substring(0, 35) + "..."
                              : conversation.lastMessage}
                          </p>
                          <p className="small text-muted">{conversation.lastMessageTime}</p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="col-lg-8 d-flex flex-column">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="card-header bg-white border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                        {selectedConversation.isGroup ? (
                          <Users size={20} className="text-primary" />
                        ) : (
                          <User size={20} className="text-primary" />
                        )}
                      </div>
                      <div>
                        <h6 className="mb-1 text-dark">{selectedConversation.participantNames.join(', ')}</h6>
                        <p className="small text-muted mb-0">
                          {selectedConversation.isGroup ? 'Group Chat' : 'Direct Message'}
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm p-1">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 overflow-auto p-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-5 my-5">
                      <FileText size={48} className="text-muted" />
                      <h5 className="mb-2">No messages yet</h5>
                      <p className="text-muted">Start the conversation by sending a message</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`d-flex ${message.senderId === user.id ? 'justify-content-end' : 'justify-content-start'} mb-3`}
                        >
                          {message.senderId !== user.id && (
                            <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              {message.senderAvatar ? (
                                <img
                                  src={`${API_BASE_URL}${message.senderAvatar}`}
                                  alt={message.senderName}
                                  className="img-fluid rounded-circle"
                                  onError={handleImageError}
                                />
                              ) : (
                                message.senderName.split(' ').map(n => n.charAt(0)).join('')
                              )}
                            </div>
                          )}
                          <div
                            className={`p-3 rounded ${message.senderId === user.id ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                            style={{ maxWidth: '75%' }}
                          >
                            {message.type === 'image' && message.attachments ? (
                              <img
                                src={`${API_BASE_URL}${message.attachments}`}
                                alt="Attachment"
                                className="img-fluid rounded mb-2"
                                style={{ maxWidth: '200px' }}
                                onError={handleImageError}
                              />
                            ) : message.type === 'file' && message.attachments ? (
                              <div className="mb-2">
                                <a
                                  href={`${API_BASE_URL}${message.attachments}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                >
                                  <FileText size={16} className="me-1" />
                                  Download File
                                </a>
                              </div>
                            ) : null}
                            {message.content && message.content !== 'File attachment' && (
                              <p className="small mb-0">{message.content}</p>
                            )}
                            <p className={`small ${message.senderId === user.id ? 'text-white-50' : 'text-muted'} mt-1 text-end`} style={{ fontSize: '0.7rem' }}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                          {message.senderId === user.id && (
                            <div className="avatar bg-primary text-white d-flex align-items-center justify-content-center ms-2" style={{ width: '32px', height: '32px' }}>
                              {user.profile_picture ? (
                                <img
                                  src={`${API_BASE_URL}${user.profile_picture}`}
                                  alt={`${user.first_name} ${user.last_name}`}
                                  className="img-fluid rounded-circle"
                                  onError={handleImageError}
                                />
                              ) : (
                                `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef}></div>
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="card-footer bg-white border-top py-3">
                  <div className="input-group">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip size={16} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/jpeg,image/png,image/gif,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="form-control"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && !selectedFile}
                      className="btn btn-primary btn-sm"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-muted small">
                      Selected: {selectedFile.name}
                      <button
                        className="btn btn-link text-danger p-0 ms-2"
                        onClick={() => setSelectedFile(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
                <MessageSquare size={64} className="text-muted mb-3" />
                <h5 className="mb-2 text-dark">Select a conversation</h5>
                <p className="text-muted">Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;