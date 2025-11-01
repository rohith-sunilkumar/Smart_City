import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, Loader2, MessageCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const FeedbackChat = ({ reportId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket, connected } = useSocket();
  const { user, token } = useAuth();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load feedback messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('Loading feedback for report:', reportId);
      console.log('API URL:', `${API_URL}/api/feedback/${reportId}`);
      console.log('Token exists:', !!token);
      
      const response = await axios.get(`${API_URL}/api/feedback/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Feedback response:', response.data);
      setMessages(response.data.data.feedbacks || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && reportId) {
      loadMessages();
    }
  }, [isOpen, reportId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket || !connected || !reportId) return;

    console.log('Setting up socket listeners for report:', reportId);

    // Join report room
    socket.emit('join_report', reportId);

    // Listen for successful join
    socket.on('joined_report', (data) => {
      console.log('Successfully joined report room:', data);
    });

    // Listen for socket errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message || 'Socket connection error');
    });

    // Listen for new feedback
    socket.on('new_feedback', (data) => {
      console.log('New feedback received:', data);
      if (data.reportId === reportId) {
        setMessages((prev) => [...prev, data.feedback]);
      }
    });

    // Listen for typing indicators
    socket.on('user_typing', (data) => {
      if (data.reportId === reportId && data.userId !== user._id) {
        setTyping(data.userName);
      }
    });

    socket.on('user_stop_typing', (data) => {
      if (data.reportId === reportId) {
        setTyping(null);
      }
    });

    // Mark feedback as read when chat is open
    socket.emit('mark_feedback_read', { reportId });

    return () => {
      socket.emit('leave_report', reportId);
      socket.off('joined_report');
      socket.off('error');
      socket.off('new_feedback');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, connected, reportId, user]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !connected) return;

    socket.emit('typing', { reportId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { reportId });
    }, 1000);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) {
      console.log('No message or attachments to send');
      return;
    }

    try {
      setSending(true);
      console.log('Sending message...', { reportId, hasSocket: !!socket, connected, hasAttachments: attachments.length > 0 });

      // Always use REST API for reliability (Socket.IO for real-time updates only)
      console.log('Sending via REST API (Socket connected:', connected, ')');
      const formData = new FormData();
      formData.append('message', newMessage.trim());
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      console.log('Posting to:', `${API_URL}/api/feedback/${reportId}`);
      const response = await axios.post(`${API_URL}/api/feedback/${reportId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Response:', response.data);
      if (response.data.success) {
        setNewMessage('');
        setAttachments([]);
        socket?.emit('stop_typing', { reportId });
        
        // Reload messages to show the new one
        await loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Failed to send message. Please try again.';
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  // Handle file attachment
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 3) {
      alert('Maximum 3 attachments allowed');
      return;
    }
    setAttachments([...attachments, ...files]);
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Feedback & Discussion</h2>
            {connected && (
              <span className="ml-2 px-2 py-1 bg-green-500 text-xs rounded-full">
                Live
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="hover:bg-blue-800 p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.sender._id === user._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-3.5 shadow-md ${
                      isOwnMessage
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-bold ${
                        isOwnMessage ? 'text-white' : 'text-gray-800'
                      }`}>
                        {msg.sender.name}
                      </span>
                      {msg.senderRole === 'admin' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          isOwnMessage ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          Admin
                        </span>
                      )}
                      {msg.senderRole === 'mayor' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          isOwnMessage ? 'bg-purple-800 text-white' : 'bg-purple-100 text-purple-800'
                        }`}>
                          Mayor
                        </span>
                      )}
                    </div>
                    <p className={`text-sm break-words leading-relaxed ${
                      isOwnMessage ? 'text-white' : 'text-gray-900'
                    }`}>
                      {msg.message}
                    </p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs underline block font-medium ${
                              isOwnMessage ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'
                            }`}
                          >
                            📎 Attachment {idx + 1}
                          </a>
                        ))}
                      </div>
                    )}
                    <span className={`text-xs mt-1.5 block font-medium ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-3 max-w-[70%] shadow-sm">
                <p className="text-sm text-gray-700 font-medium italic">{typing} is typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm"
                >
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="hover:bg-blue-100 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </label>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              disabled={sending}
              autoComplete="off"
              spellCheck="true"
            />
            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && attachments.length === 0)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackChat;
