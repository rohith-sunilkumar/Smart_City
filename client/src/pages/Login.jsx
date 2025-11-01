import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, logout, isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      // If mayor is somehow logged in, redirect to mayor login
      if (user?.role === 'mayor') {
        logout();
        navigate('/mayor/login');
      } else {
        navigate(isAdmin ? '/admin/dashboard' : '/');
      }
    }
  }, [isAuthenticated, isAdmin, user, navigate, logout]);

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
      // Check if user is a mayor - they should use mayor portal
      if (result.user.role === 'mayor') {
        // Immediately logout the mayor
        logout();
        setError('Access Denied: Mayors must use the Mayor Portal to login. Redirecting...');
        setLoading(false);
        setTimeout(() => {
          navigate('/mayor/login');
        }, 2000);
        return;
      }
      
      navigate(result.user.role === 'admin' ? '/admin/dashboard' : '/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <div className="card animate-slide-up">
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
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
                  placeholder="you@example.com"
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
              className="w-full btn-primary py-3"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors duration-300">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors duration-300">
              Sign up
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700 text-center">
            <Link 
              to="/mayor/login" 
              className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors duration-300"
            >
              Mayor Portal Access →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
