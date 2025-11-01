import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  AlertCircle,
  Lightbulb,
  Trash2,
  Shield,
  MapPin,
  Sparkles,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Phone,
  Mail,
  MapPinned,
  Star,
  Award,
  Zap,
  Target,
  HeadphonesIcon,
  Building2,
  Megaphone,
  BarChart3,
  Globe
} from 'lucide-react';

const LandingAttractive = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const services = [
    {
      icon: <AlertCircle className="h-12 w-12" />,
      title: 'Road Maintenance',
      description: 'Report potholes, cracks, and road damage to municipal authorities',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: <Lightbulb className="h-12 w-12" />,
      title: 'Street Lighting',
      description: 'Report broken street lights to the electricity department',
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: <Trash2 className="h-12 w-12" />,
      title: 'Waste Management',
      description: 'Report garbage collection issues to sanitation department',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: <Shield className="h-12 w-12" />,
      title: 'Public Safety',
      description: 'Report safety concerns to local law enforcement',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <MapPin className="h-12 w-12" />,
      title: 'Location Tracking',
      description: 'GPS-enabled precise location marking for government response',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: <Sparkles className="h-12 w-12" />,
      title: 'AI Classification',
      description: 'Automatic routing to the correct government department',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50'
    },
    {
      icon: <Clock className="h-12 w-12" />,
      title: 'Real-time Updates',
      description: 'Track government response from submission to resolution',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: 'Community Driven',
      description: 'Join citizens working with local government for better cities',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50'
    }
  ];

  const features = [
    {
      icon: <Zap className="h-10 w-10" />,
      title: 'Fast Government Response',
      description: 'Reports processed and assigned to departments within 24 hours',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: <Target className="h-10 w-10" />,
      title: 'Accurate Department Routing',
      description: 'AI ensures reports reach the correct municipal department',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: 'Quality Government Service',
      description: 'Dedicated municipal teams working to resolve civic issues',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      icon: <HeadphonesIcon className="h-10 w-10" />,
      title: '24/7 Citizen Support',
      description: 'Round-the-clock assistance for urgent civic matters',
      gradient: 'from-green-400 to-emerald-500'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Reports Resolved', icon: <CheckCircle className="h-8 w-8" />, color: 'from-green-400 to-emerald-500' },
    { number: '5K+', label: 'Active Citizens', icon: <Users className="h-8 w-8" />, color: 'from-blue-400 to-cyan-500' },
    { number: '95%', label: 'Satisfaction Rate', icon: <Star className="h-8 w-8" />, color: 'from-yellow-400 to-orange-500' },
    { number: '48hrs', label: 'Avg Response', icon: <Clock className="h-8 w-8" />, color: 'from-purple-400 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      {/* Hero Section - Modern Gradient */}
      <section className="relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent-400/20 to-primary-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white text-sm font-semibold mb-8 shadow-lg animate-pulse-slow">
              <Building2 className="h-4 w-4 mr-2" />
              Smart City Initiative 2024
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="block text-gray-900">Make Your City</span>
              <span className="block bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent animate-gradient">
                Better Together
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Report civic issues instantly and track their resolution. Powered by AI to connect you with the right government department.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {isAuthenticated ? (
                isAdmin ? (
                  <Link to="/admin/reports" className="group bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link to="/report" className="group bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center">
                      <Megaphone className="mr-2 h-5 w-5" />
                      Report an Issue
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/dashboard" className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-primary-200">
                      My Dashboard
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link to="/register" className="group bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Register as Citizen
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/login" className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-primary-200">
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-3`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">City Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive platform for reporting and tracking all types of civic issues. Connect directly with government departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className={`group ${service.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden`}>
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className={`relative inline-flex p-4 rounded-xl bg-gradient-to-br ${service.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 relative">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed relative">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/register" className="group inline-flex items-center bg-gradient-to-r from-primary-600 to-accent-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              Start Reporting Issues
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0tOCAwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTggMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Cutting-edge technology meets civic engagement for a better tomorrow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-blue-100 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple three-step process to report and track civic issues
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Report the Issue', desc: 'Fill out a simple form with details, photos, and location. Takes less than 2 minutes.', icon: <Megaphone className="h-12 w-12" />, color: 'from-blue-500 to-cyan-500' },
              { step: '2', title: 'AI Classification', desc: 'Our AI automatically categorizes, prioritizes, and routes your report to the right department.', icon: <Sparkles className="h-12 w-12" />, color: 'from-purple-500 to-pink-500' },
              { step: '3', title: 'Track Progress', desc: 'Monitor your report status in real-time from submission to resolution with admin updates.', icon: <BarChart3 className="h-12 w-12" />, color: 'from-green-500 to-emerald-500' }
            ].map((item, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-full h-1 bg-gradient-to-r from-primary-200 to-accent-200 z-0"></div>
                )}
                
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 text-center">
                  <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-6 shadow-xl`}>
                    {item.icon}
                  </div>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${item.color} text-white font-bold text-xl mb-4 shadow-lg`}>
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Thousands</span>
            </h2>
            <p className="text-xl text-gray-600">
              Join our community of active citizens making cities better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Star className="h-16 w-16" />, value: '4.8/5', label: 'Average Rating', color: 'from-yellow-400 to-orange-500', stars: 5 },
              { icon: <TrendingUp className="h-16 w-16" />, value: '95%', label: 'Resolution Rate', color: 'from-green-400 to-emerald-500' },
              { icon: <Globe className="h-16 w-16" />, value: '5,000+', label: 'Active Citizens', color: 'from-blue-400 to-cyan-500' }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 text-center">
                <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-6 shadow-xl`}>
                  {item.icon}
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{item.value}</div>
                <p className="text-gray-600 text-lg">{item.label}</p>
                {item.stars && (
                  <div className="flex justify-center mt-4 gap-1">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 text-white relative overflow-hidden animate-gradient">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Improve Your City?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of citizens making their communities better. Report civic issues to your local government today!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="group bg-white text-primary-600 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center">
              <Users className="mr-2 h-6 w-6" />
              Register Now
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              Login to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg mr-2">
                  <MapPinned className="h-6 w-6" />
                </div>
                Smart City Portal
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting citizens with local government for better communities through technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-4 w-4 mr-1" /> Register</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-4 w-4 mr-1" /> Login</Link></li>
                <li><Link to="/report" className="text-gray-400 hover:text-white transition-colors flex items-center"><ArrowRight className="h-4 w-4 mr-1" /> Report Issue</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">City Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-400" /> Road Maintenance</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-400" /> Street Lighting</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-400" /> Waste Management</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-400" /> Public Safety</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2 text-primary-400" />
                  +1 234 567 8900
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2 text-primary-400" />
                  support@smartcity.com
                </li>
                <li className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2 text-primary-400" />
                  City Hall, Main Street
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 Smart City Citizen Portal. All rights reserved. Empowering citizens, serving communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingAttractive;
