import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { reportAPI, getImageUrl } from '../utils/api';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  TrendingUp,
  MapPin,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      high: 'text-red-600 bg-red-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50'
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

  const getStatusIcon = (status) => {
    const icons = {
      open: <AlertCircle className="h-5 w-5 text-blue-600" />,
      'in-progress': <Clock className="h-5 w-5 text-yellow-600" />,
      resolved: <CheckCircle className="h-5 w-5 text-green-600" />,
      closed: <CheckCircle className="h-5 w-5 text-gray-600" />
    };
    return icons[status] || icons.open;
  };

  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      report.title.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      report.category.toLowerCase().includes(searchLower)
    );
  });

  const getStats = () => {
    return {
      total: reports.length,
      open: reports.filter(r => r.status === 'open').length,
      inProgress: reports.filter(r => r.status === 'in-progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      closed: reports.filter(r => r.status === 'closed').length
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">My Dashboard</h1>
            <p className="text-gray-300">Track and manage your reported issues</p>
          </div>
          <Link to="/report" className="btn-primary mt-4 md:mt-0 inline-flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Report New Issue</span>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.total}</p>
            <p className="text-sm opacity-90">Total Reports</p>
          </div>

          <div className="card border-l-4 border-blue-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-6 w-6 text-blue-400" />
            </div>
            <p className="text-2xl font-bold gradient-text mb-1">{stats.open}</p>
            <p className="text-sm text-gray-300">Open</p>
          </div>

          <div className="card border-l-4 border-yellow-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold gradient-text mb-1">{stats.inProgress}</p>
            <p className="text-sm text-gray-300">In Progress</p>
          </div>

          <div className="card border-l-4 border-green-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-2xl font-bold gradient-text mb-1">{stats.resolved}</p>
            <p className="text-sm text-gray-300">Resolved</p>
          </div>

          <div className="card border-l-4 border-gray-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-2xl font-bold gradient-text mb-1">{stats.closed}</p>
            <p className="text-sm text-gray-300">Closed</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your reports..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 overflow-x-auto">
              {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filter === status
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-slate-700 text-gray-200 hover:bg-slate-600'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
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
            <p className="text-gray-300 mb-6">
              {searchTerm || filter !== 'all'
                ? "Try adjusting your search or filter"
                : "You haven't submitted any reports yet"}
            </p>
            <Link to="/report" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Submit Your First Report</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div 
                key={report._id} 
                className="group relative card hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.98) 100%)'
                }}
              >
                {/* Gradient Border Top */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  report.status === 'open' ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600' : 
                  report.status === 'in-progress' ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500' : 
                  report.status === 'resolved' ? 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500' : 
                  'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
                }`}></div>

                {/* Glow Effect on Hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl ${
                  report.status === 'open' ? 'bg-blue-500' : 
                  report.status === 'in-progress' ? 'bg-yellow-500' : 
                  report.status === 'resolved' ? 'bg-green-500' : 
                  'bg-gray-500'
                }`}></div>
                
                <div className="relative p-6">
                  {/* Header: Category Icon, Name & Status Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                        {getCategoryIcon(report.category)}
                      </div>
                      <span className="text-sm font-semibold text-gray-300 capitalize tracking-wide">
                        {report.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      {getStatusIcon(report.status)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    {report.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 min-h-[4.5rem] leading-relaxed">
                    {report.description}
                  </p>

                  {/* Image Preview with Enhanced Styling */}
                  {report.images && report.images.length > 0 && (
                    <div className="mb-4 relative group/image overflow-hidden rounded-xl">
                      <img
                        src={getImageUrl(report.images[0].url)}
                        alt="Report"
                        className="w-full h-48 object-cover shadow-lg transform group-hover/image:scale-105 transition-transform duration-300"
                      />
                      {report.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                          +{report.images.length - 1} more
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Badge with Gradient */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                      report.status === 'open' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 
                      report.status === 'in-progress' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : 
                      report.status === 'resolved' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 
                      'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                    }`}>
                      {report.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Meta Information with Icons */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-sm">
                        <div className="bg-gray-800/50 p-2 rounded-lg mr-2">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span>{new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <span className={`font-bold capitalize px-3 py-1.5 rounded-lg text-xs shadow-sm ${
                        report.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        report.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {report.priority}
                      </span>
                    </div>
                    
                    {report.location?.address && (
                      <div className="flex items-start text-gray-400 text-sm">
                        <div className="bg-gray-800/50 p-2 rounded-lg mr-2 flex-shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="line-clamp-1 pt-1">{report.location.address}</span>
                      </div>
                    )}

                    {report.assignedDepartment && (
                      <div className="flex items-center text-gray-400 text-sm bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/50">
                        <span className="font-semibold text-purple-400 mr-2">📋 Department:</span>
                        <span className="text-gray-300 capitalize">{report.assignedDepartment.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Admin Notes with Enhanced Styling */}
                  {report.adminNotes && (
                    <div className="mb-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-4 w-4 text-amber-400 mr-2" />
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">Admin Note</p>
                      </div>
                      <p className="text-sm text-amber-100 line-clamp-2 leading-relaxed">{report.adminNotes}</p>
                    </div>
                  )}

                  {/* View Details Button with Gradient */}
                  <Link
                    to={`/reports/${report._id}`}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group/button"
                  >
                    <Eye className="h-5 w-5 group-hover/button:scale-110 transition-transform" />
                    <span>View Full Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for No Search Results */}
        {!loading && reports.length > 0 && filteredReports.length === 0 && (
          <div className="card p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">No matching reports</h3>
            <p className="text-gray-300 mb-4">
              We couldn't find any reports matching "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="btn-secondary"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
