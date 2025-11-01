import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FeedbackChat from '../components/FeedbackChat';
import { reportAPI, getImageUrl } from '../utils/api';
import {
  FileText,
  Filter,
  Eye,
  Edit,
  Save,
  X,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  MessageCircle,
  Upload
} from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({
    status: '',
    priority: '',
    category: '',
    adminNotes: '',
    assignedDepartment: ''
  });
  const [expandedReport, setExpandedReport] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const openChat = (reportId) => {
    setSelectedReportId(reportId);
    setChatOpen(true);
  };

  useEffect(() => {
    fetchReports();
  }, [filters.status, filters.category, filters.priority]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;
      
      // Fetch only reports for the admin's department
      const response = await reportAPI.getAll(params);
      setReports(response.data.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const startEditing = (report) => {
    setEditingReport(report._id);
    setEditForm({
      status: report.status,
      priority: report.priority,
      category: report.category,
      adminNotes: report.adminNotes || '',
      assignedDepartment: report.assignedDepartment || 'general'
    });
  };

  const cancelEditing = () => {
    setEditingReport(null);
    setEditForm({
      status: '',
      priority: '',
      category: '',
      adminNotes: '',
      assignedDepartment: ''
    });
  };

  const handleDelete = async (reportId) => {
    try {
      setDeleteLoading(true);
      await reportAPI.delete(reportId);
      await fetchReports();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting report:', error);
      alert(error.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdate = async (reportId) => {
    try {
      setUpdateLoading(true);
      await reportAPI.update(reportId, editForm);
      await fetchReports();
      setEditingReport(null);
      setEditForm({
        status: '',
        priority: '',
        category: '',
        adminNotes: '',
        assignedDepartment: ''
      });
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 border-blue-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      closed: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-300',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-300',
      low: 'text-green-600 bg-green-50 border-green-300'
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      road: '🚧',
      lighting: '💡',
      waste: '🗑️',
      safety: '🛡️',
      water: '💧',
      other: '📋'
    };
    return icons[category] || icons.other;
  };

  const filteredReports = reports.filter(report => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      report.title.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      report.reporter?.name.toLowerCase().includes(searchLower)
    );
  });

  const getStatusStats = () => {
    const stats = {
      total: reports.length,
      open: reports.filter(r => r.status === 'open').length,
      inProgress: reports.filter(r => r.status === 'in-progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      closed: reports.filter(r => r.status === 'closed').length
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">All Citizen Reports</h1>
          <p className="text-gray-300">Manage and update status of all reported issues</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="card border-l-4 border-violet-500">
            <p className="text-sm text-gray-400">Total Reports</p>
            <p className="text-2xl font-bold text-gray-100">{stats.total}</p>
          </div>
          <div className="card border-l-4 border-blue-400">
            <p className="text-sm text-gray-400">Open</p>
            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
          </div>
          <div className="card border-l-4 border-yellow-400">
            <p className="text-sm text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="card border-l-4 border-green-400">
            <p className="text-sm text-gray-400">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="card border-l-4 border-gray-500">
            <p className="text-sm text-gray-400">Closed</p>
            <p className="text-2xl font-bold text-gray-400">{stats.closed}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-violet-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-100">Search & Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by title, description, or reporter..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                <option value="road">Road</option>
                <option value="lighting">Lighting</option>
                <option value="waste">Waste</option>
                <option value="safety">Safety</option>
                <option value="water">Water</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="input-field"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.status || filters.category || filters.priority || filters.search) && (
            <div className="mt-4">
              <button
                onClick={() => setFilters({ status: '', category: '', priority: '', search: '' })}
                className="btn-secondary"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">No reports found</h3>
            <p className="text-gray-400">
              {filters.search || filters.status || filters.category || filters.priority
                ? 'Try adjusting your filters'
                : 'No reports have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report._id} className="card overflow-hidden hover:shadow-violet-500/20 transition-shadow">
                {/* Report Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl">{getCategoryIcon(report.category)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100">{report.title}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-300 flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {report.reporter?.name || 'Unknown'}
                            </span>
                            <span className="text-sm text-gray-300 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                        className="text-gray-400 hover:text-gray-200"
                      >
                        {expandedReport === report._id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                      {report.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(report.priority)}`}>
                      {report.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                      {report.category.toUpperCase()}
                    </span>
                    {report.department && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 border border-violet-300">
                        {report.department.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p className="text-gray-300 mb-4 line-clamp-2">{report.description}</p>

                  {/* Image Thumbnails */}
                  {report.images && report.images.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-300">
                          {report.images.length} {report.images.length === 1 ? 'Image' : 'Images'} Attached
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {report.images.slice(0, 4).map((image, idx) => (
                          <div key={idx} className="relative flex-shrink-0">
                            <img
                              src={getImageUrl(image.url)}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-primary-500 cursor-pointer transition-all"
                              onClick={() => setExpandedReport(report._id)}
                            />
                          </div>
                        ))}
                        {report.images.length > 4 && (
                          <div 
                            className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all"
                            onClick={() => setExpandedReport(report._id)}
                          >
                            <span className="text-sm font-semibold text-gray-600">
                              +{report.images.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    {editingReport === report._id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(report._id)}
                          disabled={updateLoading}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>{updateLoading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={updateLoading}
                          className="btn-secondary flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openChat(report._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 relative"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Chat</span>
                          {report.feedbackCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {report.feedbackCount}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => startEditing(report)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit Status</span>
                        </button>
                        <Link
                          to={`/reports/${report._id}`}
                          className="btn-secondary flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(report)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedReport === report._id && (
                  <div className="border-t border-slate-700 bg-slate-800/50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Description */}
                      <div>
                        <h4 className="font-semibold text-gray-100 mb-2">Full Description</h4>
                        <p className="text-gray-300 text-sm">{report.description}</p>
                      </div>

                      {/* Location */}
                      {report.location?.address && (
                        <div>
                          <h4 className="font-semibold text-gray-100 mb-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            Location
                          </h4>
                          <p className="text-gray-300 text-sm">{report.location.address}</p>
                        </div>
                      )}

                      {/* Reporter Details */}
                      <div>
                        <h4 className="font-semibold text-gray-100 mb-2">Reporter Information</h4>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-300"><span className="font-medium">Name:</span> {report.reporter?.name}</p>
                          <p className="text-gray-300"><span className="font-medium">Email:</span> {report.reporter?.email}</p>
                          {report.reporter?.phone && (
                            <p className="text-gray-300"><span className="font-medium">Phone:</span> {report.reporter.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* AI Metadata */}
                      {report.ai_metadata && (
                        <div>
                          <h4 className="font-semibold text-gray-100 mb-2">AI Classification</h4>
                          <div className="text-sm space-y-1">
                            <p className="text-gray-300"><span className="font-medium">Confidence:</span> {(report.ai_metadata.confidence * 100).toFixed(0)}%</p>
                            {report.ai_metadata.reasoning && (
                              <p className="text-gray-300"><span className="font-medium">Reasoning:</span> {report.ai_metadata.reasoning}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {report.adminNotes && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-100 mb-2">Admin Notes</h4>
                          <p className="text-gray-900 text-sm bg-yellow-200 p-3 rounded border border-yellow-300">{report.adminNotes}</p>
                        </div>
                      )}

                      {/* Images */}
                      {report.images && report.images.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-100 mb-2 flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            Attached Images ({report.images.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {report.images.map((image, idx) => (
                              <a
                                key={idx}
                                href={getImageUrl(image.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative"
                              >
                                <img
                                  src={getImageUrl(image.url)}
                                  alt={`Report ${idx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-primary-500 transition-all"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </a>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Click on any image to view full size</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit Form */}
                {editingReport === report._id && (
                  <div className="card p-6 animate-fade-in mt-4">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center space-x-2">
                        <Edit className="h-5 w-5 text-violet-400" />
                        <h4 className="text-xl font-bold gradient-text">Update Report Details</h4>
                      </div>
                      <span className="px-3 py-1 text-xs rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300">
                        {`ID: ${(report._id || '').slice(-6)}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="input-field"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-2 00">Priority</label>
                        <select
                          value={editForm.priority}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                          className="input-field"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="input-field"
                        >
                          <option value="road">Road</option>
                          <option value="lighting">Lighting</option>
                          <option value="waste">Waste</option>
                          <option value="safety">Safety</option>
                          <option value="water">Water</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">Assigned Department</label>
                        <select
                          value={editForm.assignedDepartment}
                          onChange={(e) => setEditForm({ ...editForm, assignedDepartment: e.target.value })}
                          className="input-field"
                        >
                          <option value="roads">Roads</option>
                          <option value="electricity">Electricity</option>
                          <option value="sanitation">Sanitation</option>
                          <option value="police">Police</option>
                          <option value="water">Water</option>
                          <option value="general">General</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">Admin Notes</label>
                        <textarea
                          value={editForm.adminNotes}
                          onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                          rows="4"
                          placeholder="Add helpful notes for citizens and internal staff..."
                          className="input-field"
                        />
                        <p className="text-xs text-gray-400">Notes are visible to relevant staff and may be shared with the reporter.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full animate-fade-in">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-100 text-center mb-2">
              Delete Report?
            </h3>
            
            <p className="text-gray-300 text-center mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-gray-100 mb-1">
                {deleteConfirm.title}
              </p>
              <p className="text-xs text-gray-300">
                Reported by: {deleteConfirm.reporter?.name}
              </p>
              <p className="text-xs text-gray-300">
                Category: {deleteConfirm.category}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5 mr-2" />
                    Delete Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Chat Modal */}
      <FeedbackChat
        reportId={selectedReportId}
        isOpen={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setSelectedReportId(null);
        }}
      />
    </div>
  );
};

export default AdminReports;
