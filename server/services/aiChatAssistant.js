import OpenAI from 'openai';

let openai = null;

// Initialize OpenAI only if API key is provided
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ AI Chat Assistant initialized');
} else {
  console.log('⚠️  OpenAI API key not configured - AI Chat Assistant will use fallback responses');
}

// Enhanced fallback responses with more detail
const fallbackResponses = {
  'report': `📝 **How to Report an Issue:**

1. Click "Report Issue" in the navigation bar
2. Fill in the form with:
   - Title: Brief description of the problem
   - Category: Select the type of issue
   - Location: Provide exact address or landmark
   - Description: Detailed explanation
   - Photos: Add clear images (recommended)
3. Click Submit
4. You'll receive a tracking number immediately

💡 **Tips for Better Reports:**
• Be specific about the location
• Include photos showing the problem clearly
• Mention any safety hazards
• Add your contact info for updates

Your report will be automatically assigned to the right department!`,

  'status': `📊 **Checking Your Report Status:**

**Method 1: My Reports Dashboard**
1. Login to your account
2. Click "My Reports" in navigation
3. View all your submitted reports
4. Each shows current status and updates

**Status Types:**
• 🔵 Open - Report received, awaiting review
• 🟡 In Progress - Department is working on it
• 🟢 Resolved - Issue has been fixed
• ⚫ Closed - Report completed

**Getting Updates:**
• Check dashboard regularly
• Updates appear in real-time
• You can add comments to reports
• Track resolution progress

Need help with a specific report? Share your tracking number!`,

  'department': `🏢 **Our 5 Departments:**

**1. 🛣️ Road Service Department**
Handles: Potholes, road damage, cracks, traffic issues, road construction, street repairs, manholes, road markings
Response Time: High priority 24-48hrs, Medium 3-5 days

**2. 💧 Water Management Department**
Handles: Water supply issues, leaks, drainage problems, sewage, flooding, burst pipes, water blockage
Response Time: Emergencies 12-24hrs, Regular 2-7 days

**3. ⚡ Electrical Service Department**
Handles: Power outages, streetlights, electrical wiring, transformers, exposed wires, lighting issues
Response Time: Dangerous issues 6-12hrs, Regular 1-3 days

**4. 🏥 Hospital Emergency Department**
Handles: Medical emergencies, hospital services, healthcare facilities, urgent situations, ambulance services
Response Time: Emergencies immediate, Regular 24-48hrs

**5. 📋 General Department**
Handles: All other civic issues not covered above
Response Time: Varies by issue type

Which department can I help you with?`,

  'time': `⏱️ **Resolution Timelines:**

**High Priority Issues** (24-48 hours)
• Major road damage causing danger
• Burst water pipes/flooding
• Exposed electrical wires
• Medical emergencies
• Life-threatening situations

**Medium Priority Issues** (3-7 days)
• Potholes affecting traffic
• Water leaks (non-emergency)
• Streetlight outages
• Drainage blockages
• Hospital service issues

**Low Priority Issues** (1-2 weeks)
• Minor road cracks
• Cosmetic issues
• Small maintenance needs
• Non-urgent improvements

**Factors Affecting Timeline:**
• Severity of the issue
• Weather conditions
• Resource availability
• Location accessibility
• Complexity of repair

**Tracking Progress:**
• Check "My Reports" for updates
• Status changes show progress
• Departments may add comments
• You'll be notified of completion

Need faster resolution? Mark your report as high priority if it's urgent!`,

  'login': `🔐 **Login & Account Help:**

**To Login:**
1. Click "Login" in top navigation
2. Enter your email and password
3. Click "Sign In"

**Forgot Password?**
1. Click "Forgot Password" on login page
2. Enter your email
3. Check email for reset link
4. Create new password

**Create Account:**
1. Click "Register"
2. Choose role: Citizen or Admin
3. Fill in your details
4. Verify email
5. Start reporting!

**Account Types:**
• 👤 Citizen - Report issues, track reports
• 👨‍💼 Admin - Manage department reports
• 👑 Mayor - Oversee all departments

Having trouble? Let me know!`,

  'admin': `👨‍💼 **Admin Account Information:**

**How to Become Admin:**
1. Register with "Admin" role
2. Select your department
3. Upload department ID card
4. Wait for mayor approval
5. Receive email confirmation

**Admin Capabilities:**
• View reports for your department
• Update report status
• Add comments and notes
• Communicate with citizens
• Chat with other departments
• Access department analytics

**Approval Process:**
• Mayor reviews your application
• Verifies department ID card
• Approves or rejects request
• Usually takes 24-48 hours

**After Approval:**
• Login with your credentials
• Access Admin Dashboard
• Start managing reports
• Coordinate with team

Need help with admin registration? I'm here!`,

  'mayor': `👑 **Mayor Dashboard Information:**

**Mayor Responsibilities:**
• Approve admin registrations
• Monitor all departments
• View system-wide statistics
• Oversee report resolution
• Communicate with all departments
• Access complete analytics

**Key Features:**
• Admin approval system
• Department performance metrics
• City-wide issue tracking
• Inter-department coordination
• Real-time updates

**Accessing Mayor Dashboard:**
• Special login at /mayor/login
• Requires mayor credentials
• Full system oversight

The mayor ensures smooth operation of all departments!`,

  'chat': `💬 **Department Chat System:**

**For Citizens:**
• Start chat with any department
• Ask questions about your reports
• Get real-time responses
• Track conversation history

**For Admins:**
• Chat with other departments
• Coordinate on complex issues
• Message the mayor directly
• Collaborate on solutions

**For Mayor:**
• Chat with all departments
• Provide guidance and approvals
• Monitor communications
• Support coordination

**How to Start Chat:**
1. Click "Chat" in navigation
2. Select department or user
3. Type your message
4. Get instant responses

Need to chat with someone? Let me know!`,

  'features': `✨ **Portal Features:**

**For Everyone:**
• 🏠 Homepage with city info
• 📊 Public statistics
• 📝 Issue reporting
• 🔍 Search functionality
• 📱 Mobile responsive

**For Citizens:**
• 📋 My Reports dashboard
• 📊 Report tracking
• 💬 Department chat
• 🔔 Status notifications
• ⭐ Review system

**For Admins:**
• 📈 Department analytics
• 📊 Report management
• 💬 Inter-department chat
• 👥 Team coordination
• 📝 Status updates

**For Mayor:**
• 👥 Admin approval
• 📊 City-wide statistics
• 🏢 All department access
• 💬 Universal chat
• 📈 Performance metrics

**AI Assistant (Me!):**
• 24/7 availability
• Instant answers
• Context-aware help
• Multi-topic support

What feature would you like to explore?`,

  'contact': `📞 **Contact & Support:**

**Need Human Help?**
• Email: support@smartcity.gov
• Phone: 1-800-SMART-CITY
• Hours: 24/7 for emergencies

**Emergency Services:**
• Police: 911
• Fire: 911
• Ambulance: 911
• City Emergency: 311

**Department Contacts:**
• Road Service: roads@smartcity.gov
• Water Management: water@smartcity.gov
• Electrical: power@smartcity.gov
• Hospital: health@smartcity.gov

**Online Support:**
• Use this chat (I'm always here!)
• Department chat system
• Report comments section

**Office Locations:**
• City Hall: 123 Main Street
• Hours: Mon-Fri 9AM-5PM

How else can I assist you?`,

  'default': `👋 **Hello! I'm Son of Anton, your Smart City assistant!**

I can help you with:

📝 **Reporting & Tracking**
• How to report issues
• Check report status
• Update your reports

🏢 **Departments & Services**
• Which department handles what
• Contact information
• Response times

👤 **Account & Access**
• Login help
• Create account
• Admin registration

💬 **Communication**
• Department chat
• Contact support
• Get updates

⚡ **Quick Actions**
• Report urgent issues
• Track existing reports
• Chat with departments

🎯 **Popular Questions:**
• "How do I report a pothole?"
• "What's my report status?"
• "Which department handles water leaks?"
• "How long until my issue is resolved?"

**Just ask me anything!** I'm here 24/7 to help make your city better. 😊`
};

const getFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Report-related questions
  if (lowerMessage.includes('report') || lowerMessage.includes('submit') || lowerMessage.includes('file') || 
      lowerMessage.includes('how do i') || lowerMessage.includes('create') || lowerMessage.includes('pothole') ||
      lowerMessage.includes('issue') || lowerMessage.includes('problem') || lowerMessage.includes('complaint')) {
    return fallbackResponses.report;
  }
  
  // Status checking
  if (lowerMessage.includes('status') || lowerMessage.includes('track') || lowerMessage.includes('check') ||
      lowerMessage.includes('my report') || lowerMessage.includes('progress') || lowerMessage.includes('update')) {
    return fallbackResponses.status;
  }
  
  // Department information
  if (lowerMessage.includes('department') || lowerMessage.includes('who handles') || lowerMessage.includes('which department') ||
      lowerMessage.includes('road service') || lowerMessage.includes('water') || lowerMessage.includes('electrical') ||
      lowerMessage.includes('hospital') || lowerMessage.includes('emergency') || lowerMessage.includes('contact')) {
    return fallbackResponses.department;
  }
  
  // Timeline questions
  if (lowerMessage.includes('how long') || lowerMessage.includes('time') || lowerMessage.includes('when') ||
      lowerMessage.includes('timeline') || lowerMessage.includes('resolution') || lowerMessage.includes('fix') ||
      lowerMessage.includes('how soon') || lowerMessage.includes('how fast')) {
    return fallbackResponses.time;
  }
  
  // Login/account questions
  if (lowerMessage.includes('login') || lowerMessage.includes('sign in') || lowerMessage.includes('password') ||
      lowerMessage.includes('account') || lowerMessage.includes('register') || lowerMessage.includes('sign up') ||
      lowerMessage.includes('forgot') || lowerMessage.includes('reset')) {
    return fallbackResponses.login;
  }
  
  // Admin questions
  if (lowerMessage.includes('admin') || lowerMessage.includes('become admin') || lowerMessage.includes('approval') ||
      lowerMessage.includes('department card') || lowerMessage.includes('admin registration')) {
    return fallbackResponses.admin;
  }
  
  // Mayor questions
  if (lowerMessage.includes('mayor') || lowerMessage.includes('oversight') || lowerMessage.includes('city-wide')) {
    return fallbackResponses.mayor;
  }
  
  // Chat system questions
  if (lowerMessage.includes('chat') || lowerMessage.includes('message') || lowerMessage.includes('talk to') ||
      lowerMessage.includes('communicate') || lowerMessage.includes('conversation')) {
    return fallbackResponses.chat;
  }
  
  // Features questions
  if (lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('capabilities') ||
      lowerMessage.includes('functions') || lowerMessage.includes('portal')) {
    return fallbackResponses.features;
  }
  
  // Contact/support questions
  if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') ||
      lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('call')) {
    return fallbackResponses.contact;
  }
  
  return fallbackResponses.default;
};

export const getChatResponse = async (message, conversationHistory = []) => {
  // If OpenAI is not configured, use fallback responses
  if (!openai) {
    return {
      response: getFallbackResponse(message),
      confidence: 0.7,
      source: 'fallback'
    };
  }

  try {
    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are Son of Anton, a helpful AI assistant for the Smart City Citizen Portal. Your role is to help citizens with:

1. **Reporting Issues**: Guide users on how to report civic problems (potholes, water leaks, power outages, etc.)
2. **Checking Status**: Explain how to track and monitor their submitted reports
3. **Department Information**: Provide information about which department handles what:
   - Road Service Department: potholes, road damage, traffic issues, road maintenance
   - Water Management Department: water supply, drainage, sewage, leaks, flooding
   - Electrical Service Department: power outages, streetlights, electrical issues
   - Hospital Emergency Department: medical emergencies, hospital services, healthcare facilities
   - General Department: other civic issues not covered by specific departments
4. **Portal Features**: Help users navigate and use the portal effectively
5. **Resolution Times**: Provide information about typical resolution timelines
6. **Admin/Mayor Information**: Explain the approval process for admins and mayor oversight

Guidelines:
- Be friendly, helpful, and COMPREHENSIVE
- Provide detailed step-by-step instructions
- Use bullet points, numbered lists, and formatting for clarity
- Include examples when helpful
- Anticipate follow-up questions and address them
- Use emojis to make responses engaging (📝 🏢 ⏱️ etc.)
- Structure responses with headers and sections
- Provide multiple solutions when applicable
- If you don't know something specific, direct users to contact support
- Keep responses thorough but readable (aim for 150-300 words)
- Never make up information about specific reports or user data
- Always end with an offer to help further or answer follow-up questions`
      }
    ];

    // Add conversation history (last 5 messages for context)
    const recentHistory = conversationHistory.slice(-5);
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 600  // Increased for more comprehensive responses
    });

    return {
      response: completion.choices[0].message.content.trim(),
      confidence: 0.95,
      source: 'openai'
    };
  } catch (error) {
    console.error('AI Chat Assistant Error:', error.message);
    
    // Fallback to rule-based responses on error
    return {
      response: getFallbackResponse(message),
      confidence: 0.7,
      source: 'fallback_error'
    };
  }
};
