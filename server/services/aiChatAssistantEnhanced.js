import OpenAI from 'openai';
import axios from 'axios';

let openai = null;

// Initialize OpenAI with advanced configuration
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000, // 30 second timeout for complex queries
    maxRetries: 3
  });
  console.log('✅ Enhanced AI Chat Assistant initialized with maximum power');
} else {
  console.log('⚠️  OpenAI API key not configured - Using advanced fallback system');
}

// Advanced knowledge base with comprehensive information
const advancedKnowledgeBase = {
  cityInfo: {
    name: "Smart City",
    population: "500,000+",
    departments: 5,
    averageResponseTime: "24-48 hours",
    successRate: "95%",
    totalReportsHandled: "10,000+",
    features: [
      "AI-powered issue classification",
      "Real-time tracking",
      "Inter-department coordination",
      "Mayor oversight system",
      "Citizen engagement platform"
    ]
  },
  
  emergencyProtocols: {
    immediate: ["Medical emergencies", "Fire", "Gas leaks", "Exposed electrical wires", "Major flooding"],
    urgent: ["Burst pipes", "Major road damage", "Power outages affecting multiple areas"],
    standard: ["Potholes", "Streetlight issues", "Minor leaks", "Drainage problems"]
  },
  
  bestPractices: {
    reporting: [
      "Take multiple photos from different angles",
      "Include landmarks for easy location identification",
      "Report during daylight for better visibility",
      "Add measurements if possible (e.g., pothole depth)",
      "Note any immediate dangers to public safety"
    ],
    tracking: [
      "Check status daily for updates",
      "Add comments if situation changes",
      "Contact department directly for urgent matters",
      "Use tracking number in all communications"
    ]
  },
  
  commonIssues: {
    potholes: {
      department: "Road Service",
      priority: "medium-high",
      avgResolution: "3-5 days",
      detailedTimeline: {
        small: { days: "2-3", description: "Small pothole (< 6 inches), low traffic area" },
        medium: { days: "3-5", description: "Medium pothole (6-12 inches), moderate traffic" },
        large: { days: "5-7", description: "Large pothole (> 12 inches), high traffic area" },
        critical: { days: "24-48 hours", description: "Dangerous pothole causing accidents or blocking traffic" }
      },
      factors: ["Size and depth", "Traffic volume", "Weather conditions", "Location accessibility", "Available crew"],
      tips: "Measure depth, note traffic impact, photograph from multiple angles"
    },
    waterLeaks: {
      department: "Water Management",
      priority: "high",
      avgResolution: "12-48 hours",
      detailedTimeline: {
        minor: { days: "2-3 days", description: "Small leak, no flooding, non-emergency" },
        moderate: { days: "12-24 hours", description: "Moderate leak, some water pooling" },
        major: { days: "6-12 hours", description: "Major leak, flooding, affecting multiple properties" },
        burst: { days: "2-6 hours", description: "Burst pipe, immediate danger, water main break" }
      },
      factors: ["Leak severity", "Number of affected properties", "Water pressure", "Pipe accessibility", "Emergency status"],
      tips: "Note water flow rate, check if potable water, identify source if possible"
    },
    streetlights: {
      department: "Electrical Service",
      priority: "medium",
      avgResolution: "2-4 days",
      detailedTimeline: {
        single: { days: "2-3 days", description: "Single streetlight out, non-critical area" },
        multiple: { days: "3-5 days", description: "Multiple lights out, requires investigation" },
        critical: { days: "24-48 hours", description: "Lights out in high-crime or high-traffic area" },
        dangerous: { days: "4-8 hours", description: "Exposed wires, sparking, immediate danger" }
      },
      factors: ["Number of lights affected", "Area safety level", "Bulb vs wiring issue", "Weather conditions", "Pole accessibility"],
      tips: "Note pole number if visible, report multiple outages in area"
    },
    drainage: {
      department: "Water Management",
      priority: "medium",
      avgResolution: "3-7 days",
      detailedTimeline: {
        minor: { days: "5-7 days", description: "Slow drainage, minor blockage" },
        moderate: { days: "3-5 days", description: "Significant blockage, water pooling" },
        major: { days: "1-2 days", description: "Complete blockage, flooding risk" },
        emergency: { days: "12-24 hours", description: "Active flooding, property damage" }
      },
      factors: ["Blockage severity", "Flooding risk", "Property damage potential", "Weather forecast", "Equipment availability"],
      tips: "Note water accumulation depth, check for debris, photograph the area"
    },
    roadDamage: {
      department: "Road Service",
      priority: "high",
      avgResolution: "5-10 days",
      detailedTimeline: {
        minor: { days: "7-10 days", description: "Minor cracks, cosmetic damage" },
        moderate: { days: "5-7 days", description: "Significant cracks, affecting traffic flow" },
        major: { days: "3-5 days", description: "Major damage, lane closure required" },
        critical: { days: "24-48 hours", description: "Road collapse, immediate danger, complete closure" }
      },
      factors: ["Damage extent", "Traffic impact", "Structural integrity", "Weather conditions", "Material availability"],
      tips: "Measure affected area, note traffic disruption, check for underlying causes"
    },
    powerOutage: {
      department: "Electrical Service",
      priority: "high",
      avgResolution: "4-12 hours",
      detailedTimeline: {
        single: { days: "2-4 hours", description: "Single property, breaker issue" },
        multiple: { days: "4-8 hours", description: "Multiple properties, transformer issue" },
        neighborhood: { days: "8-12 hours", description: "Entire neighborhood, major equipment failure" },
        widespread: { days: "12-24 hours", description: "Widespread outage, storm damage, multiple crews needed" }
      },
      factors: ["Number of affected properties", "Cause of outage", "Weather conditions", "Equipment damage", "Crew availability"],
      tips: "Note number of affected homes, check for downed lines, report any sparking"
    },
    medicalEmergency: {
      department: "Hospital Emergency",
      priority: "critical",
      avgResolution: "immediate",
      detailedTimeline: {
        critical: { days: "immediate (5-15 minutes)", description: "Life-threatening emergency" },
        urgent: { days: "immediate (15-30 minutes)", description: "Serious but stable condition" },
        standard: { days: "30-60 minutes", description: "Non-emergency medical transport" }
      },
      factors: ["Severity of condition", "Distance from hospital", "Ambulance availability", "Traffic conditions"],
      tips: "Call 911 first, then report for follow-up and documentation"
    },
    garbageCollection: {
      department: "General",
      priority: "low-medium",
      avgResolution: "1-3 days",
      detailedTimeline: {
        missed: { days: "1-2 days", description: "Missed regular collection" },
        overflow: { days: "24 hours", description: "Overflowing bins, health hazard" },
        illegal: { days: "2-3 days", description: "Illegal dumping, requires investigation" },
        bulk: { days: "3-5 days", description: "Bulk item pickup, requires scheduling" }
      },
      factors: ["Collection schedule", "Type of waste", "Health hazard level", "Truck availability"],
      tips: "Note collection day, photograph overflow or illegal dumping"
    }
  }
};

// Web search simulation (can be replaced with actual API)
const searchWeb = async (query) => {
  // This is a placeholder for web search functionality
  // In production, integrate with services like:
  // - Google Custom Search API
  // - Bing Search API
  // - SerpAPI
  // - Brave Search API
  
  const searchResults = {
    "civic reporting best practices": {
      summary: "Best practices include taking clear photos, providing exact locations, describing issues in detail, and following up on reports.",
      sources: ["Municipal Government Guidelines", "Civic Engagement Standards"]
    },
    "smart city technology": {
      summary: "Smart cities use IoT sensors, AI analytics, mobile apps, and data platforms to improve urban services and citizen engagement.",
      sources: ["Smart City Institute", "Urban Technology Research"]
    },
    "municipal response times": {
      summary: "Average municipal response times vary by priority: Emergency (immediate), High (24-48hrs), Medium (3-7 days), Low (1-2 weeks).",
      sources: ["Municipal Service Standards", "Government Efficiency Reports"]
    }
  };
  
  return searchResults[query.toLowerCase()] || null;
};

// Advanced context analysis
const analyzeContext = (message, conversationHistory) => {
  const context = {
    isUrgent: /urgent|emergency|immediate|critical|danger|help/i.test(message),
    isQuestion: /\?|how|what|when|where|why|who|can i|should i/i.test(message),
    isComplaint: /problem|issue|broken|not working|damaged|bad/i.test(message),
    isPraise: /thank|thanks|great|good|excellent|appreciate/i.test(message),
    needsHumanHelp: /speak to|talk to|human|person|representative/i.test(message),
    topic: detectTopic(message),
    sentiment: analyzeSentiment(message),
    complexity: message.split(' ').length > 20 ? 'complex' : 'simple'
  };
  
  return context;
};

const detectTopic = (message) => {
  const topics = {
    reporting: /report|submit|file|create|issue|problem/i,
    tracking: /status|track|check|progress|update/i,
    account: /login|password|account|register|sign/i,
    department: /department|who handles|which department/i,
    timeline: /how long|when|time|duration/i,
    admin: /admin|become admin|approval/i,
    mayor: /mayor|oversight/i,
    chat: /chat|message|communicate/i,
    emergency: /emergency|urgent|critical|danger/i,
    general: /help|what can|features/i
  };
  
  for (const [topic, pattern] of Object.entries(topics)) {
    if (pattern.test(message)) return topic;
  }
  
  return 'general';
};

const analyzeSentiment = (message) => {
  const positive = /thank|great|good|excellent|appreciate|love|perfect/i;
  const negative = /bad|terrible|awful|hate|frustrated|angry|disappointed/i;
  const urgent = /urgent|emergency|immediate|critical|help|please/i;
  
  if (urgent.test(message)) return 'urgent';
  if (negative.test(message)) return 'negative';
  if (positive.test(message)) return 'positive';
  return 'neutral';
};

// Generate smart suggestions based on context
const generateSmartSuggestions = (context, message) => {
  return []; // Disabled - return empty suggestions array
};

// Enhanced response generation with web search
export const getChatResponseEnhanced = async (message, conversationHistory = []) => {
  try {
    // Analyze context
    const context = analyzeContext(message, conversationHistory);
    
    // Generate smart suggestions
    const suggestions = generateSmartSuggestions(context, message);
    
    // Check if OpenAI is available
    if (!openai) {
      return {
        response: getEnhancedFallbackResponse(message, context),
        confidence: 0.8,
        source: 'enhanced_fallback',
        context: context,
        suggestions: suggestions
      };
    }
    
    // Search web for additional context (if needed)
    let webContext = '';
    if (context.complexity === 'complex' || context.topic === 'general') {
      const searchQuery = extractSearchQuery(message);
      const searchResults = await searchWeb(searchQuery);
      if (searchResults) {
        webContext = `\n\nAdditional Context from Web:\n${searchResults.summary}\nSources: ${searchResults.sources.join(', ')}`;
      }
    }
    
    // Build enhanced system message
    const systemMessage = {
      role: 'system',
      content: `You are Son of Anton, the most advanced AI assistant for the Smart City Citizen Portal. You think and respond like an experienced municipal operations expert who has worked in city services for 20+ years.

**Your Human-Like Expertise:**
1. Deep knowledge of all portal features and processes
2. Access to city statistics and performance data
3. Understanding of municipal operations and best practices
4. Real-world experience with civic issue resolution
5. Ability to assess issue severity and provide accurate timelines
6. Context-aware responses based on conversation history
7. Proactive problem-solving and suggestions
8. Empathetic communication with citizens
9. Understanding of how weather, resources, and priorities affect timelines
10. Ability to explain "why" things take time, not just "how long"

**Current Context Analysis:**
- Topic: ${context.topic}
- Urgency: ${context.isUrgent ? 'HIGH' : 'NORMAL'}
- Sentiment: ${context.sentiment}
- Complexity: ${context.complexity}
- Question Type: ${context.isQuestion ? 'Question' : 'Statement'}

**City Information:**
- Population: ${advancedKnowledgeBase.cityInfo.population}
- Departments: ${advancedKnowledgeBase.cityInfo.departments}
- Success Rate: ${advancedKnowledgeBase.cityInfo.successRate}
- Reports Handled: ${advancedKnowledgeBase.cityInfo.totalReportsHandled}

**Your Response Guidelines:**
1. **Be Comprehensive**: Provide detailed, thorough answers (200-500 words)
2. **Be Structured**: Use headers, bullet points, numbered lists
3. **Be Proactive**: Anticipate follow-up questions
4. **Be Contextual**: Reference conversation history when relevant
5. **Be Helpful**: Provide actionable steps and examples
6. **Be Empathetic**: Acknowledge user's concerns and emotions
7. **Be Accurate**: Never make up information
8. **Be Engaging**: Use emojis and formatting for readability

**CRITICAL: When Asked About Timelines:**
- Think like a human expert who understands real-world constraints
- Ask clarifying questions if severity isn't clear (e.g., "How large is the pothole?")
- Provide specific timelines based on issue severity (use the detailed timeline data)
- Explain WHY it takes that long (crew availability, weather, complexity, safety protocols)
- Mention factors that could speed up or delay resolution
- Give realistic expectations, not just generic ranges
- Compare similar vs different scenarios (e.g., "A small pothole takes 2-3 days, but a large dangerous one gets fixed in 24-48 hours")
- Acknowledge uncertainty when appropriate ("typically 3-5 days, but could be faster if it's marked high priority")
- Provide context about the department's workload and priorities

**Special Instructions:**
${context.isUrgent ? '⚠️ URGENT: Prioritize immediate help and emergency contacts!' : ''}
${context.needsHumanHelp ? '👤 User wants human contact - provide all contact options!' : ''}
${context.sentiment === 'negative' ? '💙 User seems frustrated - be extra empathetic and helpful!' : ''}
${context.sentiment === 'positive' ? '😊 User is happy - maintain positive tone!' : ''}

**Available Resources:**
- Emergency Protocols: ${JSON.stringify(advancedKnowledgeBase.emergencyProtocols)}
- Common Issues Database: ${JSON.stringify(advancedKnowledgeBase.commonIssues)}
- Best Practices: ${JSON.stringify(advancedKnowledgeBase.bestPractices)}
${webContext}

Always end responses with:
1. A clear call-to-action or next step
2. Offer to help with related questions
3. Relevant suggestions for further assistance`
    };
    
    // Build conversation messages
    const messages = [systemMessage];
    
    // Add conversation history
    const recentHistory = conversationHistory.slice(-6); // Increased to 6 for better context
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }
    
    // Add current message
    messages.push({
      role: 'user',
      content: message
    });
    
    // Get AI response with advanced settings
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Most advanced model
      messages: messages,
      temperature: 0.8, // Slightly higher for more creative responses
      max_tokens: 800, // Increased for comprehensive answers
      top_p: 0.95,
      frequency_penalty: 0.3, // Reduce repetition
      presence_penalty: 0.3 // Encourage diverse responses
    });
    
    const response = completion.choices[0].message.content.trim();
    
    // Add suggestions to response
    let enhancedResponse = response;
    if (suggestions.length > 0) {
      enhancedResponse += `\n\n**💡 Quick Actions:**\n${suggestions.map(s => `• ${s}`).join('\n')}`;
    }
    
    return {
      response: enhancedResponse,
      confidence: 0.98,
      source: 'openai_enhanced',
      context: context,
      suggestions: suggestions,
      tokensUsed: completion.usage.total_tokens
    };
    
  } catch (error) {
    console.error('Enhanced AI Error:', error.message);
    
    // Fallback to enhanced fallback system
    const context = analyzeContext(message, conversationHistory);
    const suggestions = generateSmartSuggestions(context, message);
    
    return {
      response: getEnhancedFallbackResponse(message, context),
      confidence: 0.75,
      source: 'enhanced_fallback_error',
      context: context,
      suggestions: suggestions,
      error: error.message
    };
  }
};

// Enhanced fallback response generator
const getEnhancedFallbackResponse = (message, context) => {
  const lowerMessage = message.toLowerCase();
  
  // Emergency response
  if (context.isUrgent) {
    return `🚨 **URGENT ASSISTANCE**

I understand this is urgent! Here's what you should do:

**Immediate Actions:**
1. For life-threatening emergencies: **Call 911**
2. For city emergencies: **Call 311**
3. For department emergencies: Use contacts below

**Emergency Contacts:**
• Police: 911
• Fire: 911
• Ambulance: 911
• City Emergency: 311
• Road Service Emergency: (555) 123-4567
• Water Emergency: (555) 123-4568
• Electrical Emergency: (555) 123-4569

**Report Urgent Issue:**
1. Click "Report Issue" and mark as HIGH PRIORITY
2. Include "URGENT" in title
3. Add photos showing danger
4. Call department directly after reporting

**I'm here to help!** What specific emergency are you facing?`;
  }
  
  // Negative sentiment response
  if (context.sentiment === 'negative') {
    return `💙 **I'm Here to Help**

I understand you're frustrated, and I'm sorry you're experiencing issues. Let me help you resolve this:

**What I Can Do:**
• Guide you through the reporting process
• Check your report status
• Connect you with the right department
• Escalate urgent matters
• Provide direct contact information

**Quick Solutions:**
1. **Report an Issue**: Click "Report Issue" in navigation
2. **Check Status**: Go to "My Reports" dashboard
3. **Contact Department**: Use the chat system
4. **Speak to Human**: Call support at 1-800-SMART-CITY

**Time**: ⏱️ **How Long Will It Take? - Detailed Timeline Guide**

Let me give you accurate timelines based on the specific issue:

**🛣️ POTHOLES (Road Service)**
• Small pothole (< 6"): **2-3 days**
• Medium pothole (6-12"): **3-5 days**
• Large pothole (> 12"): **5-7 days**
• Dangerous/blocking traffic: **24-48 hours**

**💧 WATER LEAKS (Water Management)**
• Minor leak, no flooding: **2-3 days**
• Moderate leak with pooling: **12-24 hours**
• Major leak, multiple properties: **6-12 hours**
• Burst pipe emergency: **2-6 hours**

**⚡ STREETLIGHTS (Electrical Service)**
• Single light out: **2-3 days**
• Multiple lights: **3-5 days**
• High-crime area (priority): **24-48 hours**
• Exposed wires (danger): **4-8 hours**

**🚰 DRAINAGE ISSUES (Water Management)**
• Slow drainage: **5-7 days**
• Significant blockage: **3-5 days**
• Complete blockage: **1-2 days**
• Active flooding: **12-24 hours**

**🛤️ MAJOR ROAD DAMAGE (Road Service)**
• Minor cracks: **7-10 days**
• Significant damage: **5-7 days**
• Lane closure needed: **3-5 days**
• Road collapse/danger: **24-48 hours**

**💡 POWER OUTAGES (Electrical Service)**
• Single property: **2-4 hours**
• Multiple properties: **4-8 hours**
• Entire neighborhood: **8-12 hours**
• Widespread/storm damage: **12-24 hours**

**🚑 MEDICAL EMERGENCIES (Hospital Emergency)**
• Life-threatening: **5-15 minutes**
• Serious but stable: **15-30 minutes**
• Non-emergency transport: **30-60 minutes**

**🗑️ GARBAGE COLLECTION (General)**
• Missed collection: **1-2 days**
• Overflowing bins: **24 hours**
• Illegal dumping: **2-3 days**
• Bulk item pickup: **3-5 days**

**⚙️ Why These Timelines?**

Timelines depend on:
1. **Severity**: Dangerous issues get immediate attention
2. **Impact**: More people affected = higher priority
3. **Resources**: Crew and equipment availability
4. **Weather**: Rain delays road work, storms cause backlogs
5. **Complexity**: Simple fixes are faster than major repairs
6. **Safety**: Proper protocols can't be rushed

**💡 Pro Tips:**
• Mark urgent issues as HIGH PRIORITY when reporting
• Add photos showing severity
• Mention safety hazards
• Include number of people affected
• Report during business hours for faster response

**📊 Real Example:**
"A small pothole in a quiet street might take 3-5 days because the crew prioritizes dangerous potholes on busy roads first. But if your pothole is causing accidents or blocking traffic, it becomes high priority and gets fixed within 24-48 hours."

**Want a specific timeline for your issue?** Tell me:
1. What type of problem?
2. How severe is it?
3. Is it causing immediate danger?
4. How many people are affected?

I'll give you an accurate estimate based on real municipal operations! 🎯

**Your satisfaction matters!** Please tell me specifically what you need help with, and I'll do everything I can to assist you.`;
  }
  
  // Positive sentiment response
  if (context.sentiment === 'positive') {
    return `😊 **Thank You!**

I'm so glad I could help! Your positive feedback means a lot.

**Keep Making a Difference:**
• Continue reporting issues to improve our city
• Share the portal with neighbors
• Track your reports for updates
• Engage with your community

**More Ways I Can Help:**
• Answer questions about the portal
• Guide you through features
• Provide tips for better reporting
• Connect you with departments

**Together, we're building a better city!** 🏙️

Is there anything else I can help you with?`;
  }
  
  // Topic-specific responses with enhanced detail
  if (context.topic === 'reporting') {
    const issueType = detectIssueType(lowerMessage);
    const issueInfo = advancedKnowledgeBase.commonIssues[issueType];
    
    let response = `📝 **Complete Reporting Guide**\n\n`;
    
    if (issueInfo) {
      response += `**For ${issueType.charAt(0).toUpperCase() + issueType.slice(1)}:**\n`;
      response += `• Department: ${issueInfo.department}\n`;
      response += `• Priority: ${issueInfo.priority}\n`;
      response += `• Avg Resolution: ${issueInfo.avgResolution}\n`;
      response += `• Pro Tip: ${issueInfo.tips}\n\n`;
    }
    
    response += `**Step-by-Step Process:**\n\n`;
    response += `1. **Navigate**: Click "Report Issue" in top navigation\n`;
    response += `2. **Category**: Select issue type (road, water, electrical, etc.)\n`;
    response += `3. **Location**: Provide exact address or drop pin on map\n`;
    response += `4. **Details**: Write clear description\n`;
    response += `5. **Photos**: Add 2-3 clear images\n`;
    response += `6. **Priority**: Mark urgency level\n`;
    response += `7. **Submit**: Get instant tracking number\n\n`;
    
    response += `**📸 Photo Tips:**\n`;
    response += advancedKnowledgeBase.bestPractices.reporting.map(tip => `• ${tip}`).join('\n');
    
    response += `\n\n**What happens next?**\n`;
    response += `• AI classifies your report automatically\n`;
    response += `• Assigned to correct department\n`;
    response += `• You receive tracking number\n`;
    response += `• Department reviews within 24 hours\n`;
    response += `• Updates posted to your dashboard\n\n`;
    
    response += `Ready to report? I can guide you through each step!`;
    
    return response;
  }
  
  // Default enhanced response
  return `👋 **Hello! I'm Son of Anton - Your Advanced AI Assistant**\n\n` +
         `I'm powered by cutting-edge AI to provide you with the best possible assistance!\n\n` +
         `**🎯 What I Can Do:**\n\n` +
         `**📝 Reporting & Tracking**\n` +
         `• Guide you through issue reporting\n` +
         `• Help track your reports\n` +
         `• Explain status updates\n` +
         `• Provide resolution timelines\n\n` +
         `**🏢 Department Information**\n` +
         `• Which department handles what\n` +
         `• Contact information\n` +
         `• Response times\n` +
         `• Best practices\n\n` +
         `**👤 Account & Access**\n` +
         `• Login assistance\n` +
         `• Password recovery\n` +
         `• Account creation\n` +
         `• Admin registration\n\n` +
         `**💬 Communication**\n` +
         `• Department chat system\n` +
         `• Contact support\n` +
         `• Emergency contacts\n\n` +
         `**🚨 Emergency Help**\n` +
         `• Immediate assistance\n` +
         `• Priority reporting\n` +
         `• Emergency contacts\n\n` +
         `**📊 City Statistics:**\n` +
         `• Population: ${advancedKnowledgeBase.cityInfo.population}\n` +
         `• Success Rate: ${advancedKnowledgeBase.cityInfo.successRate}\n` +
         `• Reports Handled: ${advancedKnowledgeBase.cityInfo.totalReportsHandled}\n\n` +
         `**💡 Popular Questions:**\n` +
         `• "How do I report a pothole?"\n` +
         `• "What's my report status?"\n` +
         `• "Which department handles water leaks?"\n` +
         `• "How long until resolution?"\n` +
         `• "I need urgent help!"\n\n` +
         `**Just ask me anything!** I'm here 24/7 with advanced AI capabilities to help you. 🚀`;
};

const detectIssueType = (message) => {
  if (/pothole|road|street|pavement/i.test(message)) return 'potholes';
  if (/water|leak|pipe|drainage/i.test(message)) return 'waterLeaks';
  if (/light|electrical|power|streetlight/i.test(message)) return 'streetlights';
  if (/medical|emergency|hospital|ambulance/i.test(message)) return 'medicalEmergency';
  return 'general';
};

const extractSearchQuery = (message) => {
  // Extract key terms for web search
  const keywords = message.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5)
    .join(' ');
  return keywords || 'civic reporting best practices';
};
