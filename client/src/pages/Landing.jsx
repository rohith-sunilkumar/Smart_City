import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ReviewsSection from '../components/ReviewsSection';
import AIChatWidget from '../components/AIChatWidget';
import heroIllustration from '../assets/hero-illustration.svg';
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
  HeadphonesIcon
} from 'lucide-react';

const LandingNew = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  // Redirect mayors to their dashboard
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'mayor') {
      navigate('/mayor/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const services = [
    {
      icon: <AlertCircle className="h-10 w-10" />,
      title: 'Road Maintenance',
      description: 'Report potholes, cracks, and road damage to municipal authorities'
    },
    {
      icon: <Lightbulb className="h-10 w-10" />,
      title: 'Street Lighting',
      description: 'Report broken street lights to the electricity department'
    },
    {
      icon: <Trash2 className="h-10 w-10" />,
      title: 'Waste Management',
      description: 'Report garbage collection issues to sanitation department'
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: 'Public Safety',
      description: 'Report safety concerns to local law enforcement'
    },
    {
      icon: <MapPin className="h-10 w-10" />,
      title: 'Location Tracking',
      description: 'GPS-enabled precise location marking for government response'
    },
    {
      icon: <Sparkles className="h-10 w-10" />,
      title: 'AI Classification',
      description: 'Automatic routing to the correct government department'
    },
    {
      icon: <Clock className="h-10 w-10" />,
      title: 'Real-time Updates',
      description: 'Track government response from submission to resolution'
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: 'Community Driven',
      description: 'Join citizens working with local government for better cities'
    }
  ];

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Fast Government Response',
      description: 'Reports processed and assigned to departments within 24 hours'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Accurate Department Routing',
      description: 'AI ensures reports reach the correct municipal department'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality Government Service',
      description: 'Dedicated municipal teams working to resolve civic issues'
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8" />,
      title: '24/7 Citizen Support',
      description: 'Round-the-clock assistance for urgent civic matters'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Reports Resolved' },
    { number: '5K+', label: 'Active Users' },
    { number: '95%', label: 'Satisfaction Rate' },
    { number: '48hrs', label: 'Avg Response Time' }
  ];

  const faqs = [
    {
      question: 'How do I report an issue?',
      answer: 'Simply sign up, click "Report Issue", fill in the details with photos and location, and submit. Our AI will categorize it automatically.'
    },
    {
      question: 'How long does it take to resolve?',
      answer: 'Resolution time varies by issue type and severity. Most issues are addressed within 48-72 hours. You can track progress in real-time.'
    },
    {
      question: 'Is the service free?',
      answer: 'Yes! Our platform is completely free for all citizens. We believe in making civic engagement accessible to everyone.'
    },
    {
      question: 'Can I track my report status?',
      answer: 'Absolutely! You can view all your reports and their current status in your personal dashboard. You\'ll also see admin notes and updates.'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section - Beautiful Gradient */}
      <section className="relative bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 text-white overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTggMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bS04IDBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                🏙️ Smart City Initiative
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Need improvement<br />
                <span className="text-cyan-300">in your city?</span><br />
                <span className="text-white">We can help!</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Report civic issues instantly and track their resolution. Powered by AI to ensure your complaints reach the right government department.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                {isAuthenticated ? (
                  isAdmin ? (
                    <Link to="/admin/reports" className="bg-cyan-400 hover:bg-cyan-500 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  ) : (
                    <>
                      <Link to="/report" className="bg-cyan-400 hover:bg-cyan-500 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center">
                        Report an Issue
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                      <Link to="/dashboard" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all border border-white/20">
                        My Dashboard
                      </Link>
                    </>
                  )
                ) : (
                  <>
                    <Link to="/register" className="bg-cyan-400 hover:bg-cyan-500 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center">
                      Report an Issue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link to="/login" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all border border-white/20">
                      Login
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-cyan-300">{stat.number}</div>
                    <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="aspect-square rounded-2xl flex items-center justify-center overflow-hidden bg-white">
                    <img src={heroIllustration} alt="Team collaboration and growth" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Services Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-down">
            <h2 className="text-4xl font-bold mb-4">
              Our <span className="gradient-text">City Services</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive platform for reporting and tracking all types of civic issues. Connect directly with government departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="card animate-slide-up hover:scale-105 group" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-xl w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">{service.title}</h3>
                <p className="text-gray-300">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/register" className="inline-flex items-center bg-cyan-400 hover:bg-cyan-500 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl">
              Start Reporting Issues
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ / Features Section - Dark Blue */}
      <section className="py-20 bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left - Features */}
            <div>
              <h2 className="text-4xl font-bold mb-6">
                FAQ: Citizen<br />
                <span className="text-cyan-300">Service Guarantee</span>
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Everything you need to know about reporting civic issues to your local government
              </p>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="bg-cyan-400 text-gray-900 rounded-lg p-3 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                      <p className="text-blue-100 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - FAQs */}
            <div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6">Common Questions</h3>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-white/20 pb-6 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-lg mb-2 flex items-center">
                        <CheckCircle className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0" />
                        {faq.question}
                      </h4>
                      <p className="text-blue-100 text-sm leading-relaxed pl-7">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-slate-800 to-violet-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-down">
            <h2 className="text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-gray-300">
              Simple 3-step process to report and track civic issues
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Report the Issue</h3>
              <p className="text-gray-300 leading-relaxed">
                Fill out a simple form with details, photos, and location. Takes less than 2 minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">AI Classification</h3>
              <p className="text-gray-300 leading-relaxed">
                Our AI automatically categorizes, prioritizes, and routes your report to the right department.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Track & Resolve</h3>
              <p className="text-gray-300 leading-relaxed">
                Monitor your report status in real-time from submission to resolution with admin updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Stats Section */}
      <section className="py-20 bg-gradient-to-b from-violet-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-down">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by <span className="gradient-text">thousands</span>
            </h2>
            <p className="text-xl text-gray-300">
              Join our community of active citizens making cities better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center animate-bounce-in hover:scale-105">
              <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <div className="text-4xl font-bold gradient-text mb-2">4.8/5</div>
              <p className="text-gray-300">Average Rating</p>
              <div className="flex justify-center mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            <div className="card text-center animate-bounce-in hover:scale-105" style={{animationDelay: '0.1s'}}>
              <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <div className="text-4xl font-bold gradient-text mb-2">95%</div>
              <p className="text-gray-300">Resolution Rate</p>
              <p className="text-sm text-gray-400 mt-4">Issues resolved successfully</p>
            </div>

            <div className="card text-center animate-bounce-in hover:scale-105" style={{animationDelay: '0.2s'}}>
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <div className="text-4xl font-bold gradient-text mb-2">5,000+</div>
              <p className="text-gray-300">Active Users</p>
              <p className="text-sm text-gray-400 mt-4">Citizens using our platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark Blue */}
      <section className="py-20 bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTggMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bS04IDBjMC0yLjIxLTEuNzkgNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to improve<br />
              <span className="text-cyan-300">your city?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of citizens making their communities better. Report civic issues to your local government today!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="bg-cyan-400 hover:bg-cyan-500 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center">
                Register as Citizen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/login" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-10 py-5 rounded-lg font-bold text-lg transition-all border-2 border-white/20">
                Login to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Footer - Cyan/Blue */}
      <footer className="bg-[#0891b2] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <MapPinned className="h-6 w-6 mr-2" />
                Smart City Portal
              </h3>
              <p className="text-cyan-100 text-sm">
                Connecting citizens with local government for better communities through technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="text-cyan-100 hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/login" className="text-cyan-100 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/report" className="text-cyan-100 hover:text-white transition-colors">Report Issue</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">City Services</h4>
              <ul className="space-y-2 text-sm text-cyan-100">
                <li>Road Maintenance</li>
                <li>Street Lighting</li>
                <li>Waste Management</li>
                <li>Public Safety</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-cyan-100">
                  <Phone className="h-4 w-4 mr-2" />
                  +1 234 567 8900
                </li>
                <li className="flex items-center text-cyan-100">
                  <Mail className="h-4 w-4 mr-2" />
                  support@smartcity.com
                </li>
                <li className="flex items-center text-cyan-100">
                  <MapPin className="h-4 w-4 mr-2" />
                  City Hall, Main Street
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-cyan-400/30 pt-8 text-center">
            <p className="text-cyan-100 text-sm">
              &copy; 2025 Smart City Citizen Portal. All rights reserved. Empowering citizens, serving communities.
            </p>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
};

export default LandingNew;
