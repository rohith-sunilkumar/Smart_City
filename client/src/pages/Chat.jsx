import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { MessageCircle, Send, X, Clock, CheckCircle, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const Chat = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatDept, setNewChatDept] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchChats();
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  // Update current time every second to hide delete buttons after 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      const endpoint = (user.role === 'admin' || user.role === 'mayor')
        ? '/api/chat/department-chats'
        : '/api/chat/my-chats';
      
      const response = await axios.get(`${API_URL}${endpoint}`, { headers });
      setChats(response.data.data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chat) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/api/chat/${chat._id}`, { headers });
      setSelectedChat(response.data.data.chat);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const startNewChat = async () => {
    if (!newChatDept) {
      alert('Please select a department');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      console.log('Starting chat with department:', newChatDept);
      console.log('API URL:', `${API_URL}/api/chat/start`);
      
      const response = await axios.post(
        `${API_URL}/api/chat/start`,
        { department: newChatDept },
        { headers }
      );
      
      console.log('Chat started successfully:', response.data);
      setSelectedChat(response.data.data.chat);
      setShowNewChat(false);
      setNewChatDept('');
      fetchChats();
    } catch (error) {
      console.error('Error starting chat:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to start chat: ${error.response?.data?.message || error.message}`);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      setSending(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${API_URL}/api/chat/${selectedChat._id}/message`,
        { message: message.trim() },
        { headers }
      );
      
      setMessage('');
      await selectChat(selectedChat);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageIndex) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        `${API_URL}/api/chat/${selectedChat._id}/message/${messageIndex}`,
        { headers }
      );
      
      await selectChat(selectedChat);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const getDepartmentName = (dept) => {
    const names = {
      mayor_office: '🏛️ Mayor Office',
      road_service: 'Road Service',
      water_management: 'Water Management',
      electrical_service: 'Electrical Service',
      hospital_emergency: 'Hospital Emergency',
      general: 'General'
    };
    return names[dept] || dept;
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      mayor_office: 'bg-purple-100 text-purple-800',
      road_service: 'bg-blue-100 text-blue-800',
      water_management: 'bg-cyan-100 text-cyan-800',
      electrical_service: 'bg-yellow-100 text-yellow-800',
      hospital_emergency: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[dept] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-text">
            {(user.role === 'admin' || user.role === 'mayor') ? 'Department Chats' : 'My Chats'}
          </h1>
          {(user.role === 'citizen' || user.role === 'admin' || user.role === 'mayor') && (
            <button
              onClick={() => setShowNewChat(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>New Chat</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Chat List */}
          <div className="lg:col-span-1 card overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Conversations</h2>
            {chats.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No chats yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => selectChat(chat)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?._id === chat._id
                        ? 'bg-violet-900/50 border-2 border-violet-500'
                        : 'bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(chat.department)}`}>
                        {getDepartmentName(chat.department)}
                      </span>
                      {chat.unreadCount > 0 && user.role !== 'admin' && user.role !== 'mayor' && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-100">
                      {chat.userName}
                      {chat.userRole && chat.userRole !== 'citizen' && (
                        <span className="ml-2 text-xs text-violet-400">({chat.userRole})</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(chat.lastMessageTime).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-2 card flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-slate-700 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-100">
                        {(user.role === 'admin' || user.role === 'mayor') ? selectedChat.userName : getDepartmentName(selectedChat.department)}
                      </h2>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(selectedChat.department)}`}>
                        {getDepartmentName(selectedChat.department)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {selectedChat.messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    selectedChat.messages.map((msg, index) => {
                      const isOwn = msg.senderId === user._id;
                      // Check if message is within 2 minutes
                      const messageTime = new Date(msg.timestamp);
                      const currentTime = new Date();
                      const timeDifferenceInMinutes = (currentTime - messageTime) / (1000 * 60);
                      const canDelete = isOwn && timeDifferenceInMinutes <= 2;
                      
                      return (
                        <div
                          key={index}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'} relative`}>
                            <div
                              className={`rounded-lg px-4 py-2 relative ${
                                isOwn
                                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                                  : 'bg-slate-700 text-gray-100'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-xs font-semibold mb-1 opacity-75">
                                    {msg.senderName} ({msg.senderRole})
                                  </p>
                                  <p className="text-sm">{msg.message}</p>
                                  <p className={`text-xs mt-1 ${isOwn ? 'text-violet-100' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                                {canDelete && (
                                  <button
                                    onClick={() => deleteMessage(index)}
                                    className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold hover:scale-105 transition-all duration-200"
                                    title="Delete message (within 2 minutes)"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-field"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-24 w-24 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold gradient-text">Start New Chat</h3>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {user.role === 'admin' && (
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-200">
                      💬 Start a conversation with other departments or the mayor for coordination and support.
                    </p>
                  </div>
                )}
                {user.role === 'mayor' && (
                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-purple-200">
                      👑 Start a conversation with any department to provide guidance, approvals, or support.
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {user.role === 'admin' ? 'Select Department or Mayor' : user.role === 'mayor' ? 'Select Department' : 'Select Department'}
                  </label>
                  <select
                    value={newChatDept}
                    onChange={(e) => setNewChatDept(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Choose a department...</option>
                    {user.role !== 'mayor' && (
                      <option value="mayor_office">🏛️ Mayor Office</option>
                    )}
                    {(user.role === 'citizen' || user.role === 'mayor' || (user.role === 'admin' && user.department !== 'road_service')) && (
                      <option value="road_service">🛣️ Road Service</option>
                    )}
                    {(user.role === 'citizen' || user.role === 'mayor' || (user.role === 'admin' && user.department !== 'water_management')) && (
                      <option value="water_management">💧 Water Management</option>
                    )}
                    {(user.role === 'citizen' || user.role === 'mayor' || (user.role === 'admin' && user.department !== 'electrical_service')) && (
                      <option value="electrical_service">⚡ Electrical Service</option>
                    )}
                    {(user.role === 'citizen' || user.role === 'mayor' || (user.role === 'admin' && user.department !== 'hospital_emergency')) && (
                      <option value="hospital_emergency">🏥 Hospital Emergency</option>
                    )}
                    {(user.role === 'citizen' || user.role === 'mayor' || (user.role === 'admin' && user.department !== 'general')) && (
                      <option value="general">📋 General</option>
                    )}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowNewChat(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startNewChat}
                    disabled={!newChatDept}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
