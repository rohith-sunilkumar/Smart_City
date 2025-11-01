import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { reportAPI, statsAPI } from '../utils/api';
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Filter,
  Eye,
  Edit,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [view, setView] = useState('table'); // 'table' or 'stats'

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, statsRes] = await Promise.all([
        reportAPI.getAll(filters),
        statsAPI.getDashboard()
      ]);
      setReports(reportsRes.data.data.reports);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await reportAPI.update(reportId, { status: newStatus });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Prepare chart data
  const categoryData = stats ? Object.entries(stats.reportsByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

  const statusData = stats ? Object.entries(stats.reportsByStatus).map(([name, value]) => ({
    name: name.replace('-', ' ').charAt(0).toUpperCase() + name.replace('-', ' ').slice(1),
    value
  })) : [];

  const trendData = stats?.reportsTrend || [];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8 animate-slide-down flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-gray-300 mt-1">Manage and monitor civic issue reports</p>
          </div>
          {user?.role === 'mayor' && (
            <Link
              to="/mayor-alert"
              className="btn-primary flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
            >
              <AlertCircle className="h-5 w-5" />
              <span>Mayor Alert</span>
            </Link>
          )}
        </div>

        {/* View Toggle */}
        <div className="card p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setView('stats')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 ${
              view === 'stats'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700/50'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setView('table')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 ${
              view === 'table'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700/50'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Reports</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {view === 'stats' && stats && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Total Reports</p>
                        <p className="text-3xl font-bold gradient-text">{stats.overview.totalReports}</p>
                      </div>
                      <FileText className="h-12 w-12 text-primary-600" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Recent (7 days)</p>
                        <p className="text-3xl font-bold gradient-text">{stats.overview.recentReports}</p>
                      </div>
                      <Clock className="h-12 w-12 text-blue-600" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Avg Resolution</p>
                        <p className="text-3xl font-bold gradient-text">{stats.overview.avgResolutionTime}h</p>
                      </div>
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Open Reports</p>
                        <p className="text-3xl font-bold gradient-text">{stats.reportsByStatus.open || 0}</p>
                      </div>
                      <LayoutDashboard className="h-12 w-12 text-yellow-600" />
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Distribution */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Reports by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status Distribution */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Reports by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trend Chart */}
                {trendData.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Trend (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Department Workload */}
                {stats.departmentWorkload && Object.keys(stats.departmentWorkload).length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Workload (Active Reports)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Object.entries(stats.departmentWorkload).map(([dept, count]) => (
                        <div key={dept} className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-primary-600">{count}</p>
                          <p className="text-sm text-gray-600 capitalize">{dept}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {view === 'table' && (
              <>
                {/* Filters */}
                <div className="card mb-6">
                  <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 text-violet-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-100">Filters</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="input-field"
                      >
                        <option value="">All</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="input-field"
                      >
                        <option value="">All</option>
                        <option value="road">Road</option>
                        <option value="lighting">Lighting</option>
                        <option value="waste">Waste</option>
                        <option value="safety">Safety</option>
                        <option value="water">Water</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                      <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        className="input-field"
                      >
                        <option value="">All</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => setFilters({ status: '', category: '', priority: '' })}
                        className="btn-secondary w-full"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reports Table */}
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Report
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Reporter
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {reports.map((report) => (
                          <tr key={report._id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-100">{report.title}</div>
                              <div className="text-sm text-gray-400 line-clamp-1">{report.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-300 capitalize">{report.category}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-semibold capitalize ${getPriorityColor(report.priority)}`}>
                                {report.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={report.status}
                                onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                                className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(report.status)}`}
                              >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {report.reporter?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/reports/${report._id}`}
                                className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {reports.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No reports found matching the filters</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
