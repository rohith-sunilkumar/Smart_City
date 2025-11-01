import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { AlertCircle, Lightbulb, Trash2, Shield, MapPin, Sparkles } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      icon: <AlertCircle className="h-8 w-8" />,
      title: 'Report Issues',
      description: 'Easily report civic problems like potholes, broken streetlights, and more'
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'AI-Powered',
      description: 'Automatic categorization and priority assignment using advanced AI'
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: 'Location Tracking',
      description: 'Pin exact locations on the map for accurate issue reporting'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Track Progress',
      description: 'Monitor the status of your reports from submission to resolution'
    }
  ];

  const categories = [
    { icon: <AlertCircle className="h-6 w-6" />, name: 'Road Issues', color: 'bg-red-100 text-red-600' },
    { icon: <Lightbulb className="h-6 w-6" />, name: 'Lighting', color: 'bg-yellow-100 text-yellow-600' },
    { icon: <Trash2 className="h-6 w-6" />, name: 'Waste Management', color: 'bg-green-100 text-green-600' },
    { icon: <Shield className="h-6 w-6" />, name: 'Safety', color: 'bg-blue-100 text-blue-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Make Your City Better
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Report civic issues instantly and track their resolution. Powered by AI to ensure your complaints reach the right department.
          </p>
          
          <div className="flex justify-center space-x-4">
            {isAuthenticated ? (
              isAdmin ? (
                <Link to="/admin/dashboard" className="btn-primary text-lg px-8 py-3">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/report" className="btn-primary text-lg px-8 py-3">
                    Report an Issue
                  </Link>
                  <Link to="/my-reports" className="btn-secondary text-lg px-8 py-3">
                    My Reports
                  </Link>
                </>
              )
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                  Get Started
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center text-primary-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Report Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className={`${category.color} rounded-lg p-6 text-center hover:scale-105 transition-transform`}>
                <div className="flex justify-center mb-3">
                  {category.icon}
                </div>
                <p className="font-semibold">{category.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 card">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Report the Issue</h3>
              <p className="text-gray-600">Fill out a simple form with details and photos</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Classification</h3>
              <p className="text-gray-600">Our AI automatically categorizes and prioritizes your report</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your report status until resolution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Smart City Citizen Portal. Building better cities together.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
