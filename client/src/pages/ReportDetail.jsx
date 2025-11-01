import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FeedbackChat from '../components/FeedbackChat';
import { reportAPI, getImageUrl } from '../utils/api';
import axios from 'axios';
import { ArrowLeft, MapPin, Calendar, User, Sparkles, AlertCircle, MessageCircle, Star, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    experience: 'good',
    resolutionTime: '',
    wouldRecommend: true,
    isPublic: true
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchReport();
    checkCanReview();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getById(id);
      const reportData = response.data.data.report;
      console.log('Report data:', reportData);
      console.log('Images:', reportData.images);
      setReport(reportData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${API_URL}/api/reviews/report/${id}/can-review`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data.canReview) {
        setCanReview(true);
      } else if (response.data.data.review) {
        setExistingReview(response.data.data.review);
      }
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('token');

      console.log('📝 Submitting review:', {
        reportId: id,
        rating: reviewData.rating,
        experience: reviewData.experience,
        isPublic: reviewData.isPublic,
        wouldRecommend: reviewData.wouldRecommend
      });

      const response = await axios.post(
        `${API_URL}/api/reviews/${id}`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Review submitted successfully:', response.data);

      setShowReviewModal(false);
      setCanReview(false);
      alert('Thank you for your review! Your feedback helps us improve our services.');
      checkCanReview();
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDepartmentName = (department) => {
    if (!department) return 'Not Assigned';
    
    const departmentMap = {
      'road_service': 'Road Service Department',
      'hospital_emergency': 'Hospital Emergency Department',
      'water_management': 'Water Management Department',
      'electrical_service': 'Electrical Service Department',
      'general': 'General Department',
      'Road Service Department': 'Road Service Department',
      'Hospital Emergency Department': 'Hospital Emergency Department',
      'Water Management Department': 'Water Management Department',
      'Electrical Service Department': 'Electrical Service Department',
      'General Department': 'General Department'
    };
    
    return departmentMap[department] || department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="card text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Report Not Found</h2>
            <p className="text-gray-300 mb-6">{error || 'The report you are looking for does not exist.'}</p>
            <Link to="/my-reports" className="btn-primary inline-block">
              Back to My Reports
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-300 hover:text-gray-100 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="card">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{getCategoryIcon(report.category)}</span>
              <div>
                <h1 className="text-3xl font-bold text-white">{report.title}</h1>
                <p className="text-gray-200 capitalize">Category: {report.category}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(report.status)}`}>
              {report.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>

          {/* Status Timeline */}
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${report.status === 'open' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-200">Open</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${report.status === 'in-progress' ? 'bg-yellow-500' : report.status === 'resolved' || report.status === 'closed' ? 'bg-gray-300' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-200">In Progress</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${report.status === 'resolved' || report.status === 'closed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-200">Resolved</span>
              </div>
            </div>
          </div>

          {/* Review Alert - Show when report is resolved and user can review */}
          {report.status === 'resolved' && canReview && !existingReview && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-green-900 mb-2">
                    🎉 Your Issue Has Been Resolved!
                  </h3>
                  <p className="text-green-800 mb-4">
                    We're glad we could help! Please take a moment to share your experience and help us improve our services.
                  </p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center"
                  >
                    <Star className="h-5 w-5 mr-2" />
                    Share Your Experience
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Review Display */}
          {existingReview && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Your Review</h3>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < existingReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-700">{existingReview.comment}</p>
              <p className="text-sm text-gray-500 mt-2">
                Posted on {new Date(existingReview.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="mb-6 bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">{report.description}</p>
          </div>

          {/* Images */}
          {report.images && report.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.images.map((image, index) => {
                  const imageUrl = getImageUrl(image.url);
                  console.log(`Image ${index + 1}:`, { 
                    original: image.url, 
                    constructed: imageUrl 
                  });
                  return (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Report image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(imageUrl, '_blank')}
                        onError={(e) => {
                          console.error(`Failed to load image ${index + 1}:`, {
                            url: imageUrl,
                            originalPath: image.url
                          });
                          // Replace with placeholder
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="105" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not found%3C/text%3E%3C/svg%3E';
                          e.target.style.border = '2px solid #ef4444';
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Classification */}
          {report.ai_metadata && (
            <div className="bg-purple-900/30 border border-purple-600/50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <Sparkles className="h-5 w-5 text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">AI Classification</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Suggested Category</p>
                  <p className="font-semibold text-purple-300 capitalize">
                    {report.ai_metadata.suggestedCategory}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Suggested Priority</p>
                  <p className="font-semibold text-purple-300 capitalize">
                    {report.ai_metadata.suggestedPriority}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Confidence</p>
                  <p className="font-semibold text-purple-300">
                    {(report.ai_metadata.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Department</p>
                  <p className="font-semibold text-purple-300">
                    {formatDepartmentName(report.assignedDepartment)}
                  </p>
                </div>
              </div>
              {report.ai_metadata.reasoning && (
                <p className="text-sm text-gray-200 mt-3">
                  <strong>Reasoning:</strong> {report.ai_metadata.reasoning}
                </p>
              )}
            </div>
          )}

          {/* Location */}
          {report.location && report.location.address && (
            <div className="mb-6 bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Location</h3>
              </div>
              <p className="text-gray-100">{report.location.address}</p>
              {report.location.coordinates && (
                <p className="text-sm text-gray-300 mt-1">
                  Coordinates: {report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}
                </p>
              )}
            </div>
          )}

          {/* Admin Notes */}
          {report.adminNotes && (
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">Admin Notes</h3>
              <p className="text-gray-100">{report.adminNotes}</p>
            </div>
          )}

          {/* Feedback Section */}
          <div className="border-t pt-6 mb-6">
            <button
              onClick={() => setChatOpen(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Open Feedback Chat</span>
              {report.feedbackCount > 0 && (
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {report.feedbackCount}
                </span>
              )}
            </button>
            <p className="text-sm text-gray-400 text-center mt-2">
              Communicate directly with the assigned department admin
            </p>
          </div>

          {/* Metadata */}
          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-300">
              <Calendar className="h-4 w-4 mr-2" />
              <div>
                <p className="font-medium">Reported</p>
                <p>{new Date(report.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-300">
              <User className="h-4 w-4 mr-2" />
              <div>
                <p className="font-medium">Reporter</p>
                <p>{report.reporter?.name || 'Anonymous'}</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-300 mb-1">Priority</p>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(report.priority)}`}>
                {report.priority.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Chat Modal */}
      <FeedbackChat
        reportId={id}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold gradient-text">Share Your Experience</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= reviewData.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-4 text-lg font-semibold text-white">
                      {reviewData.rating} / 5
                    </span>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Your Experience *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['excellent', 'good', 'average', 'poor'].map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, experience: exp })}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors text-center ${
                          reviewData.experience === exp
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {exp.charAt(0).toUpperCase() + exp.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Your Feedback *
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500"
                    rows="4"
                    placeholder="Tell us about your experience with our service..."
                    required
                  />
                </div>

                {/* Resolution Time */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    How long did it take to resolve? (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewData.resolutionTime}
                    onChange={(e) => setReviewData({ ...reviewData, resolutionTime: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., 2 days, 1 week"
                  />
                </div>

                {/* Would Recommend */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="wouldRecommend"
                    checked={reviewData.wouldRecommend}
                    onChange={(e) => setReviewData({ ...reviewData, wouldRecommend: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="wouldRecommend" className="ml-2 text-sm text-gray-200 font-medium">
                    I would recommend this service to others
                  </label>
                </div>

                {/* Is Public */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={reviewData.isPublic}
                    onChange={(e) => setReviewData({ ...reviewData, isPublic: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-200 font-medium">
                    Make my review public (help other citizens)
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-6 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || !reviewData.comment}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
