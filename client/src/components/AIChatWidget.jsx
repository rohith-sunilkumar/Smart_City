import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simple markdown renderer for bold text
const renderMarkdown = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m Son of Anton, your advanced AI assistant for the Smart City Portal. 👋\n\nI\'m here to help you understand your civic engagement, track your reports, and provide personalized insights. I think step-by-step and adapt to your needs.\n\n**I can help you with:**\n• Detailed analysis of your reports and their status\n• Personalized recommendations based on your activity\n• Understanding why certain issues take time to resolve\n• Strategic advice on how to get faster responses\n• Insights into your impact on the community\n\n**Try asking me:**\n• "How are my reports doing?" - I\'ll give you a detailed breakdown\n• "Why is my report taking so long?" - I\'ll explain and suggest next steps\n• "What should I do next?" - I\'ll provide personalized recommendations\n\nWhat would you like to know? 🏙️'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [context, setContext] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(`${API_URL}/chat/ai-assistant`, {
        message: userMessage,
        conversationHistory: messages.slice(-6), // Send last 6 messages for context
        useEnhanced: true // Use maximum power AI
      }, { headers });

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.data.response
      }]);

      // Update suggestions and context
      if (response.data.data.suggestions) {
        setSuggestions(response.data.data.suggestions);
      }
      if (response.data.data.context) {
        setContext(response.data.data.context);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again or contact support if the issue persists.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'How are my reports doing?',
    'Why is my report taking so long?',
    'What should I do next?',
    'Give me personalized advice'
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 z-50 animate-bounce"
          aria-label="Open Son of Anton Chat Assistant"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse font-bold">
            SA
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[600px] h-[750px] bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-violet-500/30 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-white" />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2 text-2xl">
                  Son of Anton
                  <span className="text-sm bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    MAX POWER
                  </span>
                </h3>
                <p className="text-base text-violet-100">Advanced AI • Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-violet-600'
                        : 'bg-gradient-to-br from-purple-500 to-violet-600'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-700 text-gray-100'
                    } overflow-hidden`}
                  >
                    <p className="text-base whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {message.content.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {renderMarkdown(line)}
                          {i < message.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-slate-700 rounded-2xl px-4 py-2">
                    <Loader className="h-5 w-5 text-violet-400 animate-spin" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700">
              <p className="text-sm text-gray-400 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-sm bg-slate-700 hover:bg-slate-600 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-slate-900 rounded-b-2xl border-t border-slate-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-800 text-gray-100 placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700 text-base"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
