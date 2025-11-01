import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Mail, Lock, AlertCircle, Crown } from 'lucide-react';

const MayorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as mayor, otherwise logout
  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'mayor') {
        navigate('/mayor/dashboard');
      } else {
        // Not a mayor, logout
        logout();
      }
    }
  }, [isAuthenticated, user, navigate, logout]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      if (result.user.role === 'mayor') {
        navigate('/mayor/dashboard');
      } else {
        // Not a mayor - logout and show error
        logout();
        setError('Access denied. Only mayor credentials are allowed on this portal.');
        setLoading(false);
      }
    } else {
      setError(result.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold gradient-text">Mayor Portal</h2>
            <p className="text-gray-300 mt-2">Administrative Access</p>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="mayor@city.gov"
                  required
                />
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Access Mayor Portal'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors duration-300">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-300">
              ← Back to Regular Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MayorLogin;
