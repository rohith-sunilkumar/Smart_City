import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getImageUrl } from '../utils/api';
import { 
  Crown, Users, CheckCircle, Clock, XCircle, 
  Shield, AlertCircle, Trash2, UserCheck, FileText, Filter, Edit, Eye, MessageCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const MayorDashboard = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportsStats, setReportsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'pending'); // 'pending', 'all', or 'reports'
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingReport, setEditingReport] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingCardAdmin, setViewingCardAdmin] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'mayor') {
      navigate('/mayor/login');
    } else {
      fetchData();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, adminsRes, reportsStatsRes] = await Promise.all([
        axios.get(`${API_URL}/api/mayor/stats`, { headers }),
        axios.get(`${API_URL}/api/mayor/all-admins`, { headers }),
        axios.get(`${API_URL}/api/mayor/reports-stats`, { headers })
      ]);

      setStats(statsRes.data.data);
      setAdmins(adminsRes.data.data.admins);
      setReportsStats(reportsStatsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (deptFilter) params.department = deptFilter;
      
      const response = await axios.get(`${API_URL}/api/mayor/all-reports`, { 
        headers,
        params
      });
      
      setReports(response.data.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, statusFilter, deptFilter]);


  const handleApprove = async (adminId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${API_URL}/api/mayor/approve-admin/${adminId}`, {}, { headers });
      
      setSuccessMessage('Admin approved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (error) {
      console.error('Error approving admin:', error);
      setError('Failed to approve admin');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemove = async (adminId) => {
    if (!window.confirm('Are you sure you want to remove this admin? This action cannot be undone.')) {
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/api/mayor/remove-admin/${adminId}`, { headers });
      
      setSuccessMessage('Admin removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (error) {
      console.error('Error removing admin:', error);
      setError('Failed to remove admin');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewReport = (report) => {
    // Navigate to the report detail page with collection info
    // Pass collection name as state so ReportDetail can fetch from correct collection
    navigate(`/reports/${report._id}`, { 
      state: { 
        collectionName: report.collectionName,
        department: report.department 
      } 
    });
  };

  const handleEditReport = (report) => {
    setEditingReport({
      ...report,
      status: report.status || 'open',
      adminNotes: report.adminNotes || '',
      priority: report.priority || 'normal'
    });
    setShowEditModal(true);
  };

  const handleUpdateReport = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const updateData = {
        status: editingReport.status,
        adminNotes: editingReport.adminNotes,
        priority: editingReport.priority
      };
      
      await axios.patch(
        `${API_URL}/api/mayor/update-report/${editingReport.collectionName}/${editingReport._id}`,
        updateData,
        { headers }
      );
      
      setSuccessMessage('Report updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowEditModal(false);
      setEditingReport(null);
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Failed to update report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteReport = async (report) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        `${API_URL}/api/mayor/delete-report/${report.collectionName}/${report._id}`,
        { headers }
      );
      
      setSuccessMessage('Report deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchReports();
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getDepartmentBadgeColor = (dept) => {
    const colors = {
      road_service: 'bg-blue-100 text-blue-800',
      water_management: 'bg-cyan-100 text-cyan-800',
      electrical_service: 'bg-yellow-100 text-yellow-800',
      hospital_emergency: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[dept] || 'bg-gray-100 text-gray-800';
  };

  const getDepartmentName = (dept) => {
    const names = {
      road_service: 'Road Service',
      water_management: 'Water Management',
      electrical_service: 'Electrical Service',
      hospital_emergency: 'Hospital Emergency',
      general: 'General'
    };
    return names[dept] || dept;
  };

  const filteredAdmins = activeTab === 'pending' 
    ? admins.filter(admin => !admin.isApproved)
    : admins;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-violet-400 mr-3" />
              <h1 className="text-3xl font-bold gradient-text">Mayor Dashboard</h1>
            </div>
            <Link
              to="/mayor-alert"
              className="btn-primary flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
            >
              <AlertCircle className="h-5 w-5" />
              <span>Mayor Alert</span>
            </Link>
          </div>
          <p className="text-gray-300">Manage admin accounts and monitor system activity</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Admins</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalAdmins || 0}</p>
              </div>
              <Shield className="h-12 w-12 text-blue-200" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending Approvals</p>
                <p className="text-3xl font-bold mt-1">{stats?.pendingAdmins || 0}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-200" />
            </div>
          </div>
          
          <div 
            className="card bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => setActiveTab('reports')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Reports</p>
                <p className="text-3xl font-bold mt-1">{reportsStats?.overall?.total || 0}</p>
                <button className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                  View All →
                </button>
              </div>
              <FileText className="h-12 w-12 text-green-200" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Citizens</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalCitizens || 0}</p>
              </div>
              <Users className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'border-b-2 border-violet-600 text-violet-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Admin Signup Requests ({stats?.pendingAdmins || 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'border-b-2 border-violet-600 text-violet-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                All Admins ({stats?.totalAdmins || 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'border-b-2 border-violet-600 text-violet-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                User Reports ({reportsStats?.overall?.total || 0})
              </div>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {activeTab === 'reports' ? (
          /* Reports View */
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold gradient-text mb-2">
                📋 User Reports - All Departments
              </h2>
              <p className="text-sm text-gray-300 mb-4">
                View and monitor all reports submitted by citizens and admins across all departments. You have complete visibility of all issues in the city.
              </p>
              
              {/* Filters */}
              <div className="flex gap-4 items-center bg-gradient-to-r from-violet-900/20 to-purple-900/20 border border-violet-500/30 p-4 rounded-xl backdrop-blur-sm">
                <Filter className="h-5 w-5 text-violet-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Departments</option>
                  <option value="road_service">Road Service</option>
                  <option value="water_management">Water Management</option>
                  <option value="electrical_service">Electrical Service</option>
                  <option value="hospital_emergency">Hospital Emergency</option>
                  <option value="general">General</option>
                </select>
                {(statusFilter || deptFilter) && (
                  <button
                    onClick={() => { setStatusFilter(''); setDeptFilter(''); }}
                    className="px-4 py-2 text-sm bg-red-600/20 text-red-300 hover:bg-red-600/30 rounded-lg transition-all duration-300 border border-red-500/30"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Reports Stats */}
              {reportsStats && (
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 p-5 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                    <p className="text-sm text-blue-300 font-semibold mb-2">Total Reports</p>
                    <p className="text-3xl font-bold text-blue-100">{reportsStats.overall.total}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border border-yellow-500/30 p-5 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                    <p className="text-sm text-yellow-300 font-semibold mb-2">Open</p>
                    <p className="text-3xl font-bold text-yellow-100">{reportsStats.overall.open}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 p-5 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                    <p className="text-sm text-purple-300 font-semibold mb-2">In Progress</p>
                    <p className="text-3xl font-bold text-purple-100">{reportsStats.overall.inProgress}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 p-5 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                    <p className="text-sm text-green-300 font-semibold mb-2">Resolved</p>
                    <p className="text-3xl font-bold text-green-100">{reportsStats.overall.resolved}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reports Table */}
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-300">No reports found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border-b-2 border-violet-500/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-violet-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {reports.map((report) => (
                      <tr key={report._id} className="hover:bg-violet-900/10 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-100">{report.title}</p>
                          <p className="text-sm text-gray-400 mt-1">{report.description?.substring(0, 60)}...</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDepartmentBadgeColor(report.department)}`}>
                            {getDepartmentName(report.department)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                            report.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.priority === 'high' ? 'bg-red-100 text-red-800' :
                            report.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.priority || 'normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                              title="View Report"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditReport(report)}
                              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                              title="Edit Report"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report)}
                              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                              title="Delete Report"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Admin List */
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold gradient-text mb-2">
                {activeTab === 'pending' ? '⏳ Admin Signup Requests' : '👥 All Administrators'}
              </h2>
              <p className="text-sm text-gray-300">
                {activeTab === 'pending' 
                  ? 'Review and approve admin accounts registered through the signup page. These admins cannot login until you approve them.'
                  : 'Manage all admin accounts in the system. You can remove any admin at any time.'}
              </p>
            </div>

          {filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-300">
                {activeTab === 'pending' 
                  ? 'No pending admin requests' 
                  : 'No administrators found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border-b-2 border-violet-500/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                      Dept. Card
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-violet-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-violet-900/10 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-100">{admin.name}</p>
                          <p className="text-sm text-gray-400">{admin.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDepartmentBadgeColor(admin.department)}`}>
                          {getDepartmentName(admin.department)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {admin.departmentCardImage ? (
                          <button
                            onClick={() => {
                              setViewingCardAdmin(admin);
                              setShowCardModal(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-900/30 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-900/50 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Card
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 italic">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {admin.isApproved ? (
                          <span className="inline-flex items-center px-3 py-1.5 bg-green-900/30 border border-green-500/30 text-green-300 rounded-full">
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            <span className="text-sm font-semibold">Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 bg-yellow-900/30 border border-yellow-500/30 text-yellow-300 rounded-full">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span className="text-sm font-semibold">Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!admin.isApproved && (
                            <button
                              onClick={() => handleApprove(admin._id)}
                              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleRemove(admin._id)}
                            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Edit Report Modal */}
      {showEditModal && editingReport && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={() => { setShowEditModal(false); setEditingReport(null); }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Edit Report</h3>
                  <button
                    onClick={() => { setShowEditModal(false); setEditingReport(null); }}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Report Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Report Title</label>
                    <p className="text-gray-900 font-medium">{editingReport.title}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <p className="text-gray-600 text-sm">{editingReport.description}</p>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDepartmentBadgeColor(editingReport.department)}`}>
                      {getDepartmentName(editingReport.department)}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={editingReport.status}
                      onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="open" className="text-gray-900">Open</option>
                      <option value="in-progress" className="text-gray-900">In Progress</option>
                      <option value="resolved" className="text-gray-900">Resolved</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select
                      value={editingReport.priority}
                      onChange={(e) => setEditingReport({ ...editingReport, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="low" className="text-gray-900">Low</option>
                      <option value="normal" className="text-gray-900">Normal</option>
                      <option value="medium" className="text-gray-900">Medium</option>
                      <option value="high" className="text-gray-900">High</option>
                    </select>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mayor Notes</label>
                    <textarea
                      value={editingReport.adminNotes}
                      onChange={(e) => setEditingReport({ ...editingReport, adminNotes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      rows="4"
                      placeholder="Add notes about this report..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => { setShowEditModal(false); setEditingReport(null); }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateReport}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Department Card Image Modal */}
      {showCardModal && viewingCardAdmin && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4"
          onClick={() => { setShowCardModal(false); setViewingCardAdmin(null); }}
        >
          <div 
            className="bg-slate-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-violet-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-violet-400">Department Card Verification</h3>
                  <p className="text-gray-300 mt-1">
                    <span className="font-semibold">{viewingCardAdmin.name}</span> - {getDepartmentName(viewingCardAdmin.department)}
                  </p>
                </div>
                <button
                  onClick={() => { setShowCardModal(false); setViewingCardAdmin(null); }}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <XCircle className="h-8 w-8" />
                </button>
              </div>

              {/* Admin Info */}
              <div className="bg-slate-800/50 border border-violet-500/30 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-gray-200 font-medium">{viewingCardAdmin.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-gray-200 font-medium">{viewingCardAdmin.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Department</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDepartmentBadgeColor(viewingCardAdmin.department)}`}>
                      {getDepartmentName(viewingCardAdmin.department)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Registration Date</p>
                    <p className="text-gray-200 font-medium">{new Date(viewingCardAdmin.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Department Card Image */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-violet-300 mb-3">Department ID Card</label>
                <div className="bg-slate-800 rounded-lg p-2 border-2 border-violet-500/30">
                  <img
                    src={getImageUrl(viewingCardAdmin.departmentCardImage)}
                    alt="Department Card"
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  ℹ️ Verify that the department card matches the admin's information and department selection
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
                <button
                  onClick={() => { setShowCardModal(false); setViewingCardAdmin(null); }}
                  className="px-6 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
                {!viewingCardAdmin.isApproved && (
                  <button
                    onClick={() => {
                      handleApprove(viewingCardAdmin._id);
                      setShowCardModal(false);
                      setViewingCardAdmin(null);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold shadow-lg"
                  >
                    <UserCheck className="inline h-5 w-5 mr-2" />
                    Approve Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MayorDashboard;
