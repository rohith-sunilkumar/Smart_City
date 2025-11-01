import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { reportAPI, getImageUrl } from '../utils/api';
import { FileText, Clock, CheckCircle, AlertCircle, Eye, Trash2 } from 'lucide-react';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await reportAPI.getAll(params);
      setReports(response.data.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      await reportAPI.delete(reportId);

      setSuccessMessage('Report deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh reports list
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to delete report');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
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

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8 animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Reports</h1>
            <p className="text-gray-300 mt-1">Track the status of your submitted issues</p>
          </div>
          <Link to="/report" className="btn-primary">
            Report New Issue
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {errorMessage}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="card p-2 mb-6 flex space-x-2 animate-slide-up">
          {['all', 'open', 'in-progress', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 capitalize transform hover:scale-105 ${
                filter === status
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700/50'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">No reports found</h3>
            <p className="text-gray-300 mb-6">
              {filter === 'all' 
                ? "You haven't submitted any reports yet."
                : `No ${filter} reports found.`}
            </p>
            <Link to="/report" className="btn-primary inline-block">
              Submit Your First Report
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                    <span className="text-sm font-medium text-white capitalize">
                      {report.category}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                    {report.status.replace('-', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 line-clamp-2">
                  {report.title}
                </h3>

                <p className="text-gray-100 text-sm mb-4 line-clamp-3">
                  {report.description}
                </p>

                {report.images && report.images.length > 0 && (
                  <div className="mb-4">
                    <img
                      src={getImageUrl(report.images[0].url)}
                      alt="Report"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-100 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                  <span className={`font-semibold capitalize ${getPriorityColor(report.priority)}`}>
                    {report.priority} Priority
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/reports/${report._id}`}
                    className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    title="Delete Report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
