import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, FileText, Users, Home, MessageCircle, Lock, Menu, X, Bell, UserCheck, AlertCircle, Star, ThumbsDown, CheckCircle, PlusCircle, AlertTriangle } from 'lucide-react';
import logo from '../assets/logo.svg';
import { notificationAPI } from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState({
    total: 0,
    items: []
  });
  const [showAlertModal, setShowAlertModal] = React.useState(false);
  const [activeAlert, setActiveAlert] = React.useState(null);

  // Fetch notifications for all user types
  React.useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
    setMobileMenuOpen(false);
  };

  // Helper functions for notification styling
  const getIconComponent = (iconName) => {
    const icons = {
      Bell,
      FileText,
      CheckCircle,
      PlusCircle,
      AlertTriangle,
      UserCheck,
      AlertCircle,
      Star,
      ThumbsDown
    };
    return icons[iconName] || Bell;
  };

  const getIconBgClass = (type) => {
    const classes = {
      info: 'bg-blue-500/20',
      success: 'bg-green-500/20',
      warning: 'bg-yellow-500/20',
      error: 'bg-red-500/20'
    };
    return classes[type] || 'bg-gray-500/20';
  };

  const getIconColorClass = (type) => {
    const classes = {
      info: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400'
    };
    return classes[type] || 'text-gray-400';
  };

  const getCountBgClass = (type) => {
    const classes = {
      info: 'bg-blue-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white'
    };
    return classes[type] || 'bg-gray-500 text-white';
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900/95 via-violet-900/95 to-slate-900/95 backdrop-blur-lg shadow-2xl border-b border-violet-500/20 sticky top-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <img src={logo} alt="Smart City Portal Logo" className="h-8 w-8 sm:h-10 sm:w-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-lg sm:text-xl font-bold gradient-text">Smart City Portal</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gray-300 hover:text-violet-400 transition-colors p-2"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'mayor' ? (
                  <>
                    <Link
                      to="/mayor/dashboard"
                      className="flex items-center space-x-1 text-gray-300 hover:text-violet-400 transition-all duration-300 hover:scale-110 transform"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/report"
                      className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      Report Issue
                    </Link>
                    <Link
                      to="/admin/reports"
                      className="flex items-center space-x-1 text-gray-300 hover:text-violet-400 transition-all duration-300 hover:scale-110 transform"
                    >
                      <FileText className="h-5 w-5" />
                      <span>All Reports</span>
                    </Link>
                  </>
                ) : isAdmin ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center space-x-1 text-gray-300 hover:text-violet-400 transition-all duration-300 hover:scale-110 transform"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Analytics</span>
                    </Link>
                    <Link
                      to="/admin/reports"
                      className="flex items-center space-x-1 text-gray-300 hover:text-violet-400 transition-all duration-300 hover:scale-110 transform"
                    >
                      <Users className="h-5 w-5" />
                      <span>All Reports</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-1 text-gray-300 hover:text-violet-400 transition-all duration-300 hover:scale-110 transform"
                    >
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/report"
                      className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      Report Issue
                    </Link>
                    <Link
                      to="/my-reports"
                      className="flex items-center space-x-1 text-gray-300 hover:text-violet-400 transition-all duration-300 hover:scale-110 transform"
                    >
                      <FileText className="h-5 w-5" />
                      <span>My Reports</span>
                    </Link>
                  </>
                )}
                
                <Link
                  to="/chat"
                  className="flex items-center space-x-1 text-gray-300 hover:text-violet-400 transition-all duration-300 hover:scale-110 transform"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat</span>
                </Link>

                {/* Notification Bell for All Users */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-gray-300 hover:text-violet-400 transition-all duration-300 hover:scale-110 transform p-2"
                  >
                    <Bell className="h-6 w-6" />
                    {notifications.total > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {notifications.total}
                      </span>
                    )}
                  </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-violet-500/30 overflow-hidden animate-slide-down z-50">
                        <div className="p-4 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-violet-500/30">
                          <h3 className="font-semibold text-gray-100 flex items-center space-x-2">
                            <Bell className="h-5 w-5 text-violet-400" />
                            <span>Notifications</span>
                          </h3>
                        </div>

                        <div className="p-2 max-h-96 overflow-y-auto">
                          {notifications.items.length > 0 ? (
                            notifications.items.map((notification, index) => {
                              const IconComponent = getIconComponent(notification.icon);
                              return (
                                <button
                                  key={notification.id || index}
                                  onClick={() => {
                                    if (notification.title === 'Mayor Alert' && notification.details) {
                                      setActiveAlert(notification.details);
                                      setShowAlertModal(true);
                                      return;
                                    }
                                    setShowNotifications(false);
                                    navigate(notification.link);
                                  }}
                                  className="w-full text-left flex items-start space-x-3 p-3 hover:bg-violet-600/20 rounded-lg transition-all group"
                                >
                                  <div className={`p-2 rounded-lg ${getIconBgClass(notification.type)}`}>
                                    <IconComponent className={`h-5 w-5 ${getIconColorClass(notification.type)}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-200 group-hover:text-violet-300">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {notification.message}
                                    </p>
                                    {notification.timestamp && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.timestamp).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                  {notification.count > 0 && (
                                    <span className={`text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center ${getCountBgClass(notification.type)}`}>
                                      {notification.count}
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-8 text-center">
                              <Bell className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                              <p className="text-gray-400 text-sm">No new notifications</p>
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-slate-800/50 border-t border-violet-500/30">
                          <Link
                            to={user?.role === 'mayor' ? '/mayor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                            onClick={() => setShowNotifications(false)}
                            className="text-xs text-violet-400 hover:text-violet-300 font-medium block text-center"
                          >
                            View Dashboard →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="relative pl-4 border-l border-violet-500/30">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-violet-400 transition-all duration-300 group"
                  >
                    <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-full p-2">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                    <svg className={`h-4 w-4 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-violet-500/30 overflow-hidden animate-slide-down">
                      {/* User Info */}
                      <div className="p-4 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-violet-500/30">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-full p-3">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-100">{user?.name}</p>
                            <p className="text-sm text-gray-400">{user?.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center space-x-2">
                          <span className="px-3 py-1 bg-violet-600/30 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/30">
                            {user?.role === 'admin' ? '👑 Admin' : user?.role === 'mayor' ? '🏛️ Mayor' : '👤 Citizen'}
                          </span>
                          {user?.department && (
                            <span className="px-3 py-1 bg-blue-600/30 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
                              {user.department.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <Link
                          to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all duration-300 group"
                        >
                          <Home className="h-5 w-5 text-violet-400 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        
                        {!isAdmin && user?.role !== 'mayor' && (
                          <Link
                            to="/my-reports"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all duration-300 group"
                          >
                            <FileText className="h-5 w-5 text-violet-400 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">My Reports</span>
                          </Link>
                        )}

                        {user?.role === 'mayor' && (
                          <>
                            <Link
                              to="/mayor/dashboard?tab=reports"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all duration-300 group"
                            >
                              <FileText className="h-5 w-5 text-violet-400 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">User Reports</span>
                            </Link>
                            <Link
                              to="/admin/reports"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all duration-300 group"
                            >
                              <FileText className="h-5 w-5 text-violet-400 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">View All Reports</span>
                            </Link>
                          </>
                        )}

                        <Link
                          to="/chat"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all duration-300 group"
                        >
                          <MessageCircle className="h-5 w-5 text-violet-400 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Messages</span>
                        </Link>

                        <Link
                          to="/change-password"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all duration-300 group"
                        >
                          <Lock className="h-5 w-5 text-violet-400 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Change Password</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-600/20 rounded-lg transition-all duration-300 group"
                        >
                          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-violet-400 transition-all duration-300 hover:scale-110 transform font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-violet-500/20 animate-slide-down">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="px-3 py-3 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-full p-2">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-100 text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-violet-600/30 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/30">
                        {user?.role === 'admin' ? '👑 Admin' : user?.role === 'mayor' ? '🏛️ Mayor' : '👤 Citizen'}
                      </span>
                    </div>
                  </div>

                  {/* Notifications in Mobile */}
                  {notifications.total > 0 && (
                    <div className="px-3 py-2 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg mb-2 border border-red-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bell className="h-5 w-5 text-red-400" />
                        <span className="text-sm font-semibold text-gray-200">Notifications</span>
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                          {notifications.total}
                        </span>
                      </div>
                      
                      {notifications.items.slice(0, 3).map((notification, idx) => (
                        <Link
                          key={notification.id || idx}
                          to={notification.link}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between text-xs text-gray-300 hover:text-violet-300 py-1"
                        >
                          <span className="truncate">• {notification.title}</span>
                          <span className="text-violet-400 ml-2">→</span>
                        </Link>
                      ))}
                      
                      {notifications.items.length > 3 && (
                        <div className="text-xs text-gray-400 text-center mt-1">
                          +{notifications.items.length - 3} more notifications
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Links */}
                  {user?.role === 'mayor' ? (
                    <>
                      <Link
                        to="/mayor/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/report"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold"
                      >
                        <FileText className="h-5 w-5" />
                        <span>Report Issue</span>
                      </Link>
                      <Link
                        to="/admin/reports"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all"
                      >
                        <FileText className="h-5 w-5" />
                        <span>All Reports</span>
                      </Link>
                    </>
                  ) : isAdmin ? (
                    <>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Analytics</span>
                      </Link>
                      <Link
                        to="/admin/reports"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all"
                      >
                        <Users className="h-5 w-5" />
                        <span>All Reports</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all"
                      >
                        <Home className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/report"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold"
                      >
                        <FileText className="h-5 w-5" />
                        <span>Report Issue</span>
                      </Link>
                      <Link
                        to="/my-reports"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all"
                      >
                        <FileText className="h-5 w-5" />
                        <span>My Reports</span>
                      </Link>
                    </>
                  )}
                  
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Chat</span>
                  </Link>

                  <Link
                    to="/change-password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all"
                  >
                    <Lock className="h-5 w-5" />
                    <span>Change Password</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-300 hover:bg-violet-600/20 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {showAlertModal && activeAlert && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowAlertModal(false)}>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-violet-500/20 bg-gradient-to-r from-red-600/20 to-orange-600/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-bold text-gray-100">{activeAlert.title || 'Mayor Alert'}</h3>
                  </div>
                  <button onClick={() => setShowAlertModal(false)} className="text-gray-400 hover:text-gray-200">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-200 whitespace-pre-wrap">
                  {activeAlert.body}
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 border-t border-violet-500/20 text-right">
                <button onClick={() => setShowAlertModal(false)} className="btn-primary px-4 py-2">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
 
// Inline lightweight modal for Mayor Alert content
// Rendered conditionally inside Navbar component return above
