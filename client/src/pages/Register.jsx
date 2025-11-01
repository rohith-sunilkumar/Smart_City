import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Mail, Lock, User, AlertCircle, CheckCircle, Shield, Users, Building2, Upload, X, Image } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'citizen',
    department: '',
    departmentCardImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setFormData({
        ...formData,
        departmentCardImage: file
      });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      departmentCardImage: null
    });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Validate department for admin
    if (formData.role === 'admin' && !formData.department) {
      setError('Please select a department for admin account');
      setLoading(false);
      return;
    }

    // Validate department card image for admin
    if (formData.role === 'admin' && !formData.departmentCardImage) {
      setError('Please upload your department card image for verification');
      setLoading(false);
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    submitData.append('phone', formData.phone);
    submitData.append('role', formData.role);
    if (formData.role === 'admin') {
      submitData.append('department', formData.department);
      submitData.append('departmentCardImage', formData.departmentCardImage);
    }

    const result = await register(submitData, formData.role === 'admin');
    
    if (result.success) {
      if (result.needsApproval || formData.role === 'admin') {
        // Admin registered - show success message and don't navigate
        setSuccess('🎉 Admin account created successfully! Your account is pending approval from the mayor. You will be notified once approved and can then login.');
        setLoading(false);
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          role: 'citizen',
          department: '',
          departmentCardImage: null
        });
        setImagePreview(null);
      } else {
        // Citizen registered - auto-login and navigate
        navigate('/');
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <div className="card animate-slide-up">
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">Create Account</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-300 text-green-800 px-5 py-4 rounded-lg mb-6 shadow-md">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                <div className="flex-1">
                  <p className="font-bold text-lg mb-2">✅ Registration Successful!</p>
                  <p className="text-sm mb-3">{success}</p>
                  <div className="bg-slate-800 border border-green-500/30 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-200 mb-2">📋 Next Steps:</p>
                    <ol className="text-xs text-gray-300 space-y-1 ml-4 list-decimal">
                      <li>Wait for the mayor to approve your account</li>
                      <li>Once approved, you'll be able to login</li>
                      <li>You'll have access to your department's reports</li>
                    </ol>
                  </div>
                  <div className="flex gap-3">
                    <Link 
                      to="/login" 
                      className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Go to Login Page
                    </Link>
                    <button
                      onClick={() => setSuccess('')}
                      className="inline-block px-4 py-2 bg-slate-700 border border-green-500/30 text-green-400 text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Register Another Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Register as
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'citizen' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'citizen'
                      ? 'border-violet-500 bg-violet-900/30'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Users className={`h-8 w-8 mx-auto mb-2 ${
                    formData.role === 'citizen' ? 'text-violet-400' : 'text-gray-400'
                  }`} />
                  <p className={`font-semibold ${
                    formData.role === 'citizen' ? 'text-violet-400' : 'text-gray-200'
                  }`}>
                    Citizen
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Report issues</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin', department: '' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'admin'
                      ? 'border-violet-500 bg-violet-900/30'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Shield className={`h-8 w-8 mx-auto mb-2 ${
                    formData.role === 'admin' ? 'text-violet-400' : 'text-gray-400'
                  }`} />
                  <p className={`font-semibold ${
                    formData.role === 'admin' ? 'text-violet-400' : 'text-gray-200'
                  }`}>
                    Admin
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Manage reports</p>
                </button>
              </div>
            </div>

            {/* Department Selection for Admin */}
            {formData.role === 'admin' && (
              <>
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-200">
                      <p className="font-semibold mb-1">Admin Registration Notice</p>
                      <p>Your admin account will require approval from the mayor before you can login. You'll receive access once approved.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="road_service">Road Service Department</option>
                      <option value="hospital_emergency">Hospital Emergency Department</option>
                      <option value="water_management">Water Management Department</option>
                      <option value="electrical_service">Electrical Service Department</option>
                      <option value="general">General Department</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    You will only see reports assigned to your department
                  </p>
                </div>

                {/* Department Card Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department Card Image <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    {!imagePreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-violet-500/50 rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-10 w-10 text-violet-400 mb-3" />
                          <p className="mb-2 text-sm text-gray-300">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-400">PNG, JPG, JPEG (MAX. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Department Card Preview"
                          className="w-full h-48 object-cover rounded-lg border-2 border-violet-500/50"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Upload a clear photo of your department ID card for verification by the mayor
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          )}

          {!success && (
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                Login
              </Link>
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
