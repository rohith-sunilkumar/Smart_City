import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { AlertCircle, Send, Crown, Clock, User, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const MayorAlert = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'mayor') {
      navigate('/mayor/login');
    } else {
      fetchAlerts();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/api/mayor-alert`, { headers });
      setAlerts(response.data.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async (e) => {
    e.preventDefault();
    
    if (!alertTitle.trim() || !alertMessage.trim()) {
      alert('Please fill in both title and message');
      return;
    }

    try {
      setSending(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(
        `${API_URL}/api/mayor-alert`,
        { 
          title: alertTitle.trim(),
          message: alertMessage.trim()
        },
        { headers }
      );
      
      console.log('Alert sent successfully:', response.data);
      setAlertTitle('');
      setAlertMessage('');
      fetchAlerts(); // Refresh the alerts list
      alert('Alert sent successfully to all users and admins!');
    } catch (error) {
      console.error('Error sending alert:', error);
      alert(`Failed to send alert: ${error.response?.data?.message || error.message}`);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Crown className="h-8 w-8 text-violet-400 mr-3" />
            <h1 className="text-3xl font-bold gradient-text">Mayor Alert System</h1>
          </div>
          <p className="text-gray-300">Send important announcements to all users and admins</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Alert Form */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-100">Send New Alert</h2>
              </div>
              
              <form onSubmit={sendAlert} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Alert Title
                  </label>
                  <input
                    type="text"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="Enter alert title..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-violet-500/30 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Alert Message
                  </label>
                  <textarea
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="Enter your important message..."
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-violet-500/30 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {alertMessage.length}/500 characters
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={sending || !alertTitle.trim() || !alertMessage.trim()}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Alert to All Users</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <MessageSquare className="h-6 w-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-100">Recent Alerts</h2>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {alerts.length > 0 ? (
                  alerts.map((alert, index) => (
                    <div key={alert._id || index} className="bg-gradient-to-r from-red-600/10 to-orange-600/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-100 text-sm">
                          {alert.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(alert.createdAt)}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <User className="h-3 w-3 mr-1" />
                        <span>Sent by Mayor</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No alerts sent yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-400 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2">Important Notice</h3>
              <p className="text-gray-300 text-sm">
                Alerts sent through this system will be delivered to all users and admins as notifications. 
                Use this feature responsibly for important announcements only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MayorAlert;
