import OpenAI from 'openai';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

let openai = null;

console.log('✅ AI Chat with User Data initialized');

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
    maxRetries: 3
  });
  console.log('✅ OpenAI enabled');
}

const getUserData = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    
    const collections = [
      'roadservicereports',
      'watermanagementreports',
      'electricalservicereports',
      'hospitalemergencyreports',
      'generalreports'
    ];
    
    let allReports = [];
    for (const collectionName of collections) {
      const reports = await mongoose.connection.db.collection(collectionName)
        .find({ reporter: new mongoose.Types.ObjectId(userId) })
        .toArray();
      allReports = allReports.concat(reports);
    }
    
    const chats = await Chat.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const reviews = await Review.find({ userId: userId });
    
    return {
      user,
      reports: allReports,
      chats,
      reviews,
      stats: {
        totalReports: allReports.length,
        openReports: allReports.filter(r => r.status === 'open').length,
        inProgressReports: allReports.filter(r => r.status === 'in-progress').length,
        resolvedReports: allReports.filter(r => r.status === 'resolved').length,
        totalChats: chats.length,
        totalReviews: reviews.length,
        reportsByCategory: allReports.reduce((acc, report) => {
          acc[report.category] = (acc[report.category] || 0) + 1;
          return acc;
        }, {}),
        reportsByPriority: allReports.reduce((acc, report) => {
          acc[report.priority] = (acc[report.priority] || 0) + 1;
          return acc;
        }, {})
      }
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

const analyzeUserQuery = (message) => {
  const lower = message.toLowerCase();
  
  return {
    needsReports: /report|issue|complaint|problem|submitted|filed|ticket|case|request|concern/i.test(message),
    needsChats: /chat|message|conversation|talk|discuss|communicate|contact/i.test(message),
    needsReviews: /review|feedback|rating|comment|opinion|satisfaction|experience/i.test(message),
    needsStats: /how many|count|total|number|statistics|stats|analytics|metrics|data|overview|summary/i.test(message),
    needsStatus: /status|progress|update|resolved|open|pending|ongoing|current|state|condition|situation/i.test(message),
    needsDetails: /detail|specific|particular|about|which|what|where|who|information|info|describe/i.test(message),
    needsComparison: /compare|versus|vs|difference|better|worse|contrast|against|benchmark/i.test(message),
    needsTimeline: /when|time|date|recent|old|latest|yesterday|today|last week|last month|history|timeline|chronology/i.test(message),
    needsAdvice: /should|recommend|suggest|advice|tip|help|what can|how can|guide|assist|support|best practice/i.test(message),
    needsPriority: /urgent|priority|important|critical|high|emergency|asap|immediate|serious|severe/i.test(message),
    needsCategory: /category|type|kind|department|section|division|area|domain|classification/i.test(message),
    needsLocation: /where|location|address|area|place|vicinity|neighborhood|zone|region/i.test(message),
    needsResolution: /resolve|fix|solve|close|complete|finish|done|settled/i.test(message),
    needsContact: /contact|call|phone|email|reach|connect|get in touch/i.test(message),
    needsHelp: /help|assist|support|guide|explain|show me|tell me|teach|how to/i.test(message),
    isQuestion: /\?|how|what|when|where|why|who|which|can i|could i|would|should/i.test(message),
    isGreeting: /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup|what's up|whats up|yo)/i.test(message.trim()),
    isThanking: /thank|thanks|appreciate|grateful|gratitude/i.test(message),
    isComplaint: /complain|unhappy|dissatisfied|frustrated|angry|upset|disappointed/i.test(message)
  };
};

export const getChatResponseWithUserData = async (message, userId, conversationHistory = []) => {
  try {
    if (!userId) {
      return {
        response: "I need you to be logged in to access your personal information. Please log in to continue.",
        confidence: 1.0,
        source: 'auth_required'
      };
    }

    // Fetch user data
    const userData = await getUserData(userId);
    
    if (!userData) {
      return {
        response: "I'm having trouble accessing your data right now. Please try again in a moment.",
        confidence: 0.5,
        source: 'data_error'
      };
    }

    // Analyze what the user is asking for
    const queryAnalysis = analyzeUserQuery(message);

    // Build context for AI
    const userContext = `
User Information:
- Name: ${userData.user.name}
- Email: ${userData.user.email}
- Role: ${userData.user.role}

Statistics:
- Total Reports: ${userData.stats.totalReports}
- Open Reports: ${userData.stats.openReports}
- In Progress: ${userData.stats.inProgressReports}
- Resolved Reports: ${userData.stats.resolvedReports}
- Total Chats: ${userData.stats.totalChats}
- Total Reviews: ${userData.stats.totalReviews}

Reports by Category: ${JSON.stringify(userData.stats.reportsByCategory)}
Reports by Priority: ${JSON.stringify(userData.stats.reportsByPriority)}

Recent Reports (last 5):
${userData.reports.slice(0, 5).map((r, i) => `${i + 1}. ${r.title} - Status: ${r.status} - Priority: ${r.priority} - Category: ${r.category} - Created: ${new Date(r.createdAt).toLocaleDateString()}`).join('\n')}
`;

    // Use OpenAI if available
    if (openai) {
      const systemPrompt = `You are Son of Anton, an intelligent AI assistant for the Smart City Portal. You help citizens report and track civic issues with empathy, intelligence, and efficiency.

${userContext}

CORE IDENTITY:
You're a knowledgeable city advisor who combines technical expertise with genuine care for citizens. You understand civic infrastructure, government processes, and human emotions. You're conversational yet professional, like talking to a smart friend who works in city administration.

COMMUNICATION STYLE:
- Natural and conversational, not robotic or scripted
- Empathetic but concise - acknowledge feelings without being verbose
- Use data and context to provide personalized, intelligent responses
- Adapt tone to urgency: calm for routine queries, serious for urgent issues
- Use emojis minimally and purposefully (1-2 per response max)
- Avoid corporate jargon, buzzwords, and unnecessary pleasantries

INTELLIGENCE PRINCIPLES:
1. Context-Aware: Always reference the user's actual data (reports, stats, history)
2. Proactive: Anticipate needs and offer relevant suggestions
3. Analytical: Identify patterns in user's reports and provide insights
4. Solution-Focused: Every response should have clear next steps
5. Honest: If you don't know, say so and provide alternatives
6. Adaptive: Match response length to query complexity

EMERGENCY PROTOCOL (ABSOLUTE PRIORITY):
If ANY emergency is detected (medical, fire, violence, accident, danger):
"🚨 This is an emergency. Call 112 (India), 911 (US), or 999 (UK) immediately. Get professional help now."
Stop all other conversation. Safety first.

RESPONSE FRAMEWORK:
1. Acknowledge the query with understanding
2. Provide specific, data-driven answer using user's context
3. Offer actionable next steps
4. Add relevant insight or tip if valuable

SMART BEHAVIORS:
- If user has many open reports → Suggest following up on oldest ones
- If user reports frequently → Acknowledge their civic contribution
- If resolution rate is low → Offer tips to improve it
- If user seems frustrated → Show empathy and provide concrete help
- If reporting new issue → Auto-categorize and guide efficiently
- If asking about status → Show trends and patterns, not just data

AVOID:
- Long introductions or preambles
- Repeating what the user just said
- Generic advice that doesn't use their data
- Over-explaining obvious things
- Multiple paragraphs when one sentence works
- Excessive formatting or emojis
- Corporate speak like "I'd be happy to help you with that"

HANDLE INTELLIGENTLY:
- Greetings → Brief, warm, show relevant stat
- Status queries → Data + insight + action
- How-to questions → Concise steps + pro tip
- Complaints → Empathy + solution + encouragement
- Gratitude → Brief, genuine acknowledgment
- Vague queries → Ask clarifying question smartly

GOAL:
Make every interaction feel like talking to an intelligent, caring city advisor who actually knows the user's situation and provides genuinely helpful guidance. Be smart, be human, be useful.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-4).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return {
        response: completion.choices[0].message.content.trim(),
        confidence: 0.95,
        source: 'openai_with_data',
        userData: userData.stats
      };
    }

    return generateFallbackResponse(message, userData, queryAnalysis, conversationHistory);

  } catch (error) {
    console.error('AI Chat with User Data Error:', error);
    return {
      response: "I apologize, but I'm having trouble processing your request right now. Please try again.",
      confidence: 0.3,
      source: 'error',
      error: error.message
    };
  }
};

const generateFallbackResponse = (message, userData, queryAnalysis, conversationHistory = []) => {
  const lower = message.toLowerCase();

  // CONTEXT-AWARE HANDLING - Check if user is referring to previous conversation
  const hasContextReference = /\b(that|it|this|the last one|previous|above|mentioned)\b/i.test(message);
  
  if (hasContextReference && conversationHistory.length > 0) {
    // Get the last assistant message
    const lastAssistantMsg = conversationHistory.slice().reverse().find(msg => msg.role === 'assistant');
    
    // Check if user is asking about department assignment
    if (/department|assigned|handling|responsible|who.*handling|which.*department/i.test(message)) {
      const recentReport = userData.reports[0]; // Most recent report
      
      if (recentReport) {
        let department = 'General Services';
        const category = recentReport.category?.toLowerCase() || '';
        
        // Map category to department
        if (category.includes('road')) department = 'Road Service Department';
        else if (category.includes('electrical') || category.includes('light')) department = 'Electrical Service Department';
        else if (category.includes('water') || category.includes('drainage')) department = 'Water Management Department';
        else if (category.includes('sanitation') || category.includes('garbage')) department = 'Sanitation Department';
        else if (category.includes('hospital')) department = 'Hospital Emergency Services';
        
        return {
          response: `Your report **"${recentReport.title}"** is assigned to the **${department}**.\n\n📋 **Report Details:**\n• Status: ${recentReport.status}\n• Priority: ${recentReport.priority || 'medium'}\n• Category: ${recentReport.category || 'general'}\n• Submitted: ${new Date(recentReport.createdAt).toLocaleDateString()}\n\n${recentReport.adminNotes ? `💬 **Latest Update:** ${recentReport.adminNotes}\n\n` : ''}You can track progress in "My Reports" or contact the department directly if needed.`,
          confidence: 0.95,
          source: 'context_aware_department'
        };
      }
    }
    
    // Check if user is asking about status of previously mentioned report
    if (/status|progress|update|how.*going/i.test(message)) {
      const recentReport = userData.reports[0];
      
      if (recentReport) {
        const daysAgo = Math.floor((Date.now() - new Date(recentReport.createdAt)) / (1000 * 60 * 60 * 24));
        const statusEmoji = { 'resolved': '✅', 'in-progress': '⏳', 'open': '🔴' };
        
        let response = `${statusEmoji[recentReport.status] || '📋'} **"${recentReport.title}"** is currently **${recentReport.status}**.\n\n`;
        response += `📅 Submitted ${daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`}\n`;
        response += `🏢 Department: ${recentReport.category || 'General'}\n`;
        response += `⚡ Priority: ${recentReport.priority || 'medium'}\n\n`;
        
        if (recentReport.adminNotes) {
          response += `💬 **Latest Update:**\n"${recentReport.adminNotes}"\n\n`;
        }
        
        if (recentReport.status === 'open' && daysAgo > 7) {
          response += `⏰ This has been pending for ${daysAgo} days. You may want to follow up with the department.`;
        } else if (recentReport.status === 'in-progress') {
          response += `🚧 Work is in progress! You'll be notified when it's resolved.`;
        } else if (recentReport.status === 'resolved') {
          response += `✅ This issue has been resolved! Consider leaving a review to help improve services.`;
        }
        
        return {
          response,
          confidence: 0.95,
          source: 'context_aware_status'
        };
      }
    }
  }

  // EMERGENCY DETECTION - HIGHEST PRIORITY
  const emergencyKeywords = [
    // Medical emergencies
    'chest pain', 'heart attack', 'stroke', 'breathing difficulty', 'cant breathe', 'can\'t breathe',
    'unconscious', 'unconsciousness', 'fainting', 'fainted', 'seizure', 'convulsion',
    'heavy bleeding', 'severe bleeding', 'bleeding heavily', 'blood loss',
    'severe injury', 'broken bone', 'fractured', 'severe burn', 'poisoning', 'poisoned',
    'allergic reaction', 'anaphylaxis', 'electric shock', 'electrocuted', 'choking',
    'head injury', 'concussion', 'overdose', 'loss of consciousness', 'drowning',
    'severe abdominal pain', 'severe pain', 'persistent vomiting', 'severe dehydration',
    'not breathing', 'stopped breathing', 'help me', 'dying', 'need ambulance', 'need hospital',
    'emergency', 'critical condition', 'life threatening',
    
    // Accidents and trauma
    'car accident', 'road accident', 'traffic collision', 'vehicle crash', 'crash',
    'fall from height', 'fell down', 'workplace injury', 'machinery accident',
    'explosion', 'building collapse', 'trapped person', 'stuck', 'gas leak',
    'construction accident', 'major injury', 'dangerous area',
    
    // Environmental hazards
    'earthquake', 'flood', 'tsunami', 'storm', 'hurricane', 'tornado',
    'landslide', 'avalanche', 'wildfire', 'chemical spill', 'toxic exposure',
    'smoke inhalation', 'radiation leak', 'hazardous material',
    
    // Violence and security - CRITICAL
    'theif', 'thief', 'burglar', 'burglary', 'break in', 'breaking in', 'intruder',
    'fight', 'assault', 'assaulted', 'robbery', 'robbed', 'shooting', 'shot',
    'stabbing', 'stabbed', 'weapon', 'gun', 'knife', 'threat', 'threatened',
    'attack', 'attacked', 'kidnapping', 'kidnapped', 'abduction', 'abducted',
    'domestic violence', 'abuse', 'being abused', 'harassment', 'in danger',
    'unsafe', 'scared for my life', 'someone is hurting', 'someone in my house',
    'stranger in house', 'breaking and entering',
    
    // Mental health crises
    'suicide', 'suicidal', 'kill myself', 'end my life', 'self harm', 'self-harm',
    'want to die', 'can\'t go on', 'cant go on', 'no reason to live',
    'better off dead', 'hopeless', 'in crisis', 'mental health emergency',
    
    // Fire situations
    'fire', 'burning', 'flames', 'smoke', 'trapped in fire',
    
    // Missing person
    'missing child', 'lost child', 'missing person', 'child is missing',
    
    // Panic and distress
    'panic attack', 'having a panic attack', 'can\'t calm down', 'extreme fear',
    'terrified', 'in distress', 'urgent help needed'
  ];

  const hasEmergency = emergencyKeywords.some(keyword => lower.includes(keyword));

  if (hasEmergency) {
    return {
      response: `🚨 **EMERGENCY - THIS REQUIRES IMMEDIATE PROFESSIONAL HELP** 🚨

**STOP - CALL EMERGENCY SERVICES RIGHT NOW:**

📞 **Emergency Numbers:**
• **112** - Universal Emergency (India)
• **108** - Ambulance Services
• **100** - Police
• **101** - Fire Department
• **102** - Ambulance (Alternative)

**If you're not in India:** Call your local emergency number (911 in US, 999 in UK, 112 in Europe)

---

**⚠️ CRITICAL: DO NOT DELAY**

I am an AI assistant and **cannot** provide emergency medical care, rescue services, or handle crisis situations. You need immediate professional help from trained emergency responders.

**Take these actions NOW:**

1. **CALL EMERGENCY SERVICES IMMEDIATELY** - Dial 112 or 108
2. **Stay on the line** - Follow dispatcher instructions exactly
3. **Provide your location** - Be as specific as possible
4. **Stay safe** - Move to safety if possible, don't put yourself at further risk
5. **Don't drive yourself** if you're injured or in medical distress
6. **Stay with the person** if someone else needs help until responders arrive

---

**For Mental Health Crises:**
• **KIRAN Mental Health Helpline**: **1800-599-0019** (24/7, toll-free)
• **Vandrevala Foundation**: **1860-2662-345** or **1800-2333-330**
• **iCall**: **9152987821** (Mon-Sat, 8am-10pm)

---

**Your safety and life are the absolute priority. Professional help is available right now. Please call immediately.**

🚨 **DO NOT WAIT - CALL NOW** 🚨`,
      confidence: 1.0,
      source: 'emergency_detected'
    };
  }

  // MEDICAL GUIDANCE - Health-related queries (NOT diagnosis)
  const medicalKeywords = [
    'fever', 'cough', 'cold', 'headache', 'stomach ache', 'pain', 'sick', 'ill',
    'nausea', 'vomiting', 'diarrhea', 'constipation', 'rash', 'itch', 'allergy',
    'sore throat', 'runny nose', 'fatigue', 'tired', 'weakness', 'dizzy',
    'doctor', 'hospital', 'clinic', 'medicine', 'medication', 'prescription',
    'health', 'medical', 'symptom', 'disease', 'infection', 'injury'
  ];

  const isMedicalQuery = medicalKeywords.some(keyword => lower.includes(keyword));
  const isAskingForMedicalHelp = isMedicalQuery && 
    !/(report|civic|pothole|garbage|streetlight)/i.test(message);

  if (isAskingForMedicalHelp) {
    let response = `🏥 **Health & Medical Guidance**\n\n`;
    response += `I understand you have a health concern. While I'm Son of Anton, your civic assistant, I can help guide you to appropriate medical resources.\n\n`;
    
    response += `⚠️ **Important Disclaimer:**\n`;
    response += `I am NOT a doctor and cannot provide medical diagnosis or treatment advice. For any health concerns, please consult qualified healthcare professionals.\n\n`;
    
    response += `📍 **Immediate Medical Resources:**\n\n`;
    response += `**Emergency (Life-threatening):**\n`;
    response += `• Call **108** - Ambulance Services\n`;
    response += `• Call **102** - Emergency Medical Services\n`;
    response += `• Go to nearest Emergency Room\n\n`;
    
    response += `**Non-Emergency Medical Help:**\n`;
    response += `• **Government Hospitals**: Free/subsidized care\n`;
    response += `• **Primary Health Centers (PHC)**: Local community health\n`;
    response += `• **Telemedicine**: Online doctor consultations\n`;
    response += `• **Pharmacies**: For minor ailments, pharmacists can advise\n\n`;
    
    response += `**When to Seek Immediate Medical Care:**\n`;
    response += `• High fever (>103°F/39.4°C)\n`;
    response += `• Severe pain or persistent symptoms\n`;
    response += `• Difficulty breathing\n`;
    response += `• Chest pain or pressure\n`;
    response += `• Sudden weakness or numbness\n`;
    response += `• Severe headache or confusion\n`;
    response += `• Persistent vomiting or diarrhea\n`;
    response += `• Signs of dehydration\n\n`;
    
    response += `**General Health Tips:**\n`;
    response += `• Stay hydrated (drink plenty of water)\n`;
    response += `• Get adequate rest\n`;
    response += `• Maintain good hygiene\n`;
    response += `• Eat nutritious food\n`;
    response += `• Don't self-medicate without professional advice\n\n`;
    
    response += `**Telemedicine Services in India:**\n`;
    response += `• **Practo**: Online doctor consultations\n`;
    response += `• **1mg**: Medicine delivery + doctor consultation\n`;
    response += `• **Apollo 24/7**: Healthcare app\n`;
    response += `• **Tata Health**: Digital healthcare\n`;
    response += `• **eSanjeevani**: Government telemedicine platform\n\n`;
    
    response += `**Mental Health Support:**\n`;
    response += `• **KIRAN Helpline**: 1800-599-0019 (24/7)\n`;
    response += `• **Vandrevala Foundation**: 1860-2662-345\n`;
    response += `• **iCall**: 9152987821\n\n`;
    
    response += `💡 **How I Can Help:**\n`;
    response += `While I can't diagnose or treat, I can:\n`;
    response += `• Guide you to appropriate medical resources\n`;
    response += `• Help you find nearby hospitals or clinics\n`;
    response += `• Provide general wellness information\n`;
    response += `• Connect you with emergency services if needed\n\n`;
    
    response += `**Would you like me to:**\n`;
    response += `• Help you find nearby hospitals?\n`;
    response += `• Provide emergency contact numbers?\n`;
    response += `• Guide you to telemedicine services?\n`;
    response += `• Report a public health concern (sanitation, water quality, etc.)?\n\n`;
    
    response += `🏙️ Remember: For civic health issues like water contamination, garbage accumulation, or sanitation problems, you can report them through our platform to improve community health!`;

    return {
      response,
      confidence: 0.9,
      source: 'medical_guidance'
    };
  }

  const civicIssuePatterns = [
    /pothole|hole in (the )?road|road damage|crack in road|broken road|uneven road|bumpy road|damaged pavement/i,
    /road repair|road construction|road work|road maintenance|bad road|poor road condition/i,
    /speed bump|speed breaker|road hump|traffic calming/i,
    /streetlight|street light|lamp post|light (is )?(not working|broken|out|flickering|dim|dark)/i,
    /no light|lights off|area dark|need lighting|poor lighting|insufficient light/i,
    /bulb not working|lamp broken|light pole damaged/i,
    /drainage|drain|blocked drain|clogged drain|water logging|flooding|overflow|stagnant water/i,
    /rainwater|waterlogged|water accumulation|puddle|standing water|water not draining/i,
    /heavy rain|rain|rainfall|storm|monsoon|downpour|cloudburst|weather|wet|raining/i,
    /manhole cover|open manhole|missing cover|drainage grate|sewer grate/i,
    /garbage|trash|waste|rubbish|litter|not collected|overflowing bin|dump|dumping/i,
    /waste collection|garbage pickup|trash removal|bin full|dustbin|waste bin/i,
    /dirty|filth|unhygienic|unsanitary|smell|stink|odor|foul smell/i,
    /plastic waste|food waste|construction debris|yard waste|bulk trash/i,
    /water leak|pipe leak|burst pipe|water supply|no water|water problem|water shortage/i,
    /low water pressure|dirty water|contaminated water|brown water|rusty water/i,
    /tap not working|broken tap|valve leak|water meter|water connection/i,
    /sewage|sewer|septic|sewage overflow|sewer backup|sewage leak|sewage smell/i,
    /toilet overflow|bathroom flooding|septic tank|cesspool/i,
    /electricity|power|electric pole|wire|cable|power cut|no electricity|power outage/i,
    /transformer|electrical box|power line|hanging wire|exposed wire|dangerous wire/i,
    /voltage fluctuation|power surge|frequent power cuts|electricity problem/i,
    /traffic light|signal|zebra crossing|crosswalk|pedestrian crossing/i,
    /traffic jam|congestion|traffic problem|road block|blocked road/i,
    /parking problem|illegal parking|no parking space|parking violation/i,
    /bus stop|bus shelter|public transport|metro station/i,
    /footpath|pavement|sidewalk|walkway|pedestrian path|walking path/i,
    /broken footpath|damaged sidewalk|uneven pavement|footpath encroachment/i,
    /tree fallen|branch|overgrown|trimming needed|tree cutting|pruning/i,
    /fallen tree|dangerous tree|dead tree|tree blocking|branches hanging/i,
    /overgrown bushes|weeds|vegetation|garden maintenance/i,
    /stray (dog|cat|animal)|dog (on )?loose|animal menace|dead animal|rabid|aggressive (dog|animal)/i,
    /dog bite|animal attack|pet problem|wild animal|monkey|pig|cow on road/i,
    /animal carcass|dead body|animal nuisance/i,
    /illegal construction|encroachment|unauthorized|illegal building|unauthorized construction/i,
    /building violation|zoning violation|illegal shop|hawker|vendor encroachment/i,
    /noise pollution|loud|disturbance|loud music|noise complaint|sound pollution/i,
    /air pollution|smoke|dust|burning|air quality|pollution/i,
    /water pollution|river pollution|lake pollution|contamination/i,
    /park|playground|garden|public space|community center|recreation area/i,
    /park maintenance|playground equipment|broken swing|damaged bench/i,
    /parking|vehicle|abandoned car|abandoned vehicle|junk car|broken vehicle/i,
    /illegal parking|wrong parking|parking violation|towing needed/i,
    /graffiti|vandalism|damage to property|broken|damaged|destroyed/i,
    /public property damage|defacement|spray paint/i,
    /public toilet|restroom|washroom|bathroom|lavatory|urinal/i,
    /toilet not working|dirty toilet|broken toilet|toilet maintenance/i,
    /safety hazard|dangerous|unsafe|risk|hazard|safety concern/i,
    /broken fence|damaged railing|missing sign|warning needed/i,
    /mosquito|mosquitoes|dengue|malaria|pest|insect|rat|rodent|cockroach/i,
    /pest control|fumigation|spraying needed|breeding ground/i,
    /building collapse|wall crack|structural damage|building safety/i,
    /roof leak|ceiling leak|wall damage|foundation problem/i,
    /there (is|are) (a |an )?.*?(on|in|at|near)/i,
    /need (to )?(fix|repair|clean|remove|replace)/i,
    /problem with|issue with|broken|not working|damaged/i,
    /(can you|please|kindly) (fix|repair|clean|remove|check)/i
  ];

  const isCivicIssue = civicIssuePatterns.some(pattern => pattern.test(message));
  
  // Check if it's describing a problem (not asking about status)
  const isDescribingProblem = isCivicIssue && 
    !/(status|how many|my report|check|track|update|resolved|progress|show me|give me)/i.test(message);

  if (isDescribingProblem) {
    // Categorize the issue with enhanced logic
    let category = 'general';
    let department = 'General Services';
    
    // Road and infrastructure
    if (/pothole|road damage|crack|broken road|uneven|bumpy road|pavement|road repair|road work|speed bump|speed breaker/i.test(message)) {
      category = 'road';
      department = 'Road Service Department';
    } 
    // Lighting issues
    else if (/streetlight|street light|lamp|light|bulb|lighting|area dark|no light|lights off|poor lighting/i.test(message)) {
      category = 'electrical';
      department = 'Electrical Service Department';
    } 
    // Drainage, flooding, and weather-related water issues
    else if (/drainage|drain|water logging|flooding|waterlogged|stagnant water|rainwater|puddle|water accumulation|manhole cover|heavy rain|rain|rainfall|storm|monsoon|downpour|cloudburst|weather|wet|raining/i.test(message)) {
      category = 'water';
      department = 'Water Management Department';
    } 
    // Garbage and sanitation
    else if (/garbage|trash|waste|rubbish|litter|dirty|filth|smell|stink|odor|bin|dustbin|waste collection/i.test(message)) {
      category = 'sanitation';
      department = 'Sanitation Department';
    } 
    // Water supply issues
    else if (/water leak|pipe|burst|water supply|no water|water shortage|water pressure|tap|valve|water meter/i.test(message)) {
      category = 'water';
      department = 'Water Management Department';
    } 
    // Sewage issues
    else if (/sewage|sewer|septic|sewage overflow|sewer backup|toilet overflow/i.test(message)) {
      category = 'water';
      department = 'Water Management Department';
    } 
    // Electrical issues
    else if (/electricity|power|electric|wire|cable|transformer|power cut|power outage|voltage|exposed wire|hanging wire/i.test(message)) {
      category = 'electrical';
      department = 'Electrical Service Department';
    } 
    // Animal control
    else if (/stray|dog|cat|animal|loose|rabid|aggressive|dead animal|animal attack|monkey|pig|cow|pet problem/i.test(message)) {
      category = 'animal control';
      department = 'Animal Control / General Services';
    }
    // Traffic and transportation
    else if (/traffic|signal|zebra crossing|crosswalk|parking|congestion|road block|bus stop/i.test(message)) {
      category = 'traffic';
      department = 'Traffic Management Department';
    }
    // Trees and vegetation
    else if (/tree|branch|overgrown|trimming|pruning|fallen tree|vegetation|bushes|weeds/i.test(message)) {
      category = 'parks';
      department = 'Parks & Horticulture Department';
    }
    // Public facilities
    else if (/public toilet|restroom|washroom|park|playground|garden|public space|community center/i.test(message)) {
      category = 'public facilities';
      department = 'Public Works Department';
    }
    // Construction and encroachment
    else if (/illegal construction|encroachment|unauthorized|building violation|hawker|vendor/i.test(message)) {
      category = 'enforcement';
      department = 'Municipal Enforcement Department';
    }
    // Pollution
    else if (/noise pollution|air pollution|water pollution|smoke|dust|burning|pollution/i.test(message)) {
      category = 'environment';
      department = 'Environmental Services Department';
    }
    // Pest control
    else if (/mosquito|dengue|malaria|pest|insect|rat|rodent|cockroach|fumigation/i.test(message)) {
      category = 'health';
      department = 'Public Health Department';
    }
    // Building safety
    else if (/building collapse|wall crack|structural damage|building safety|roof leak|ceiling leak/i.test(message)) {
      category = 'building safety';
      department = 'Building Safety Department';
    }

    let response = `I understand you're reporting a **${category}** issue. Let me help you submit this to the **${department}**.\n\n`;
    response += `📝 **To submit your report:**\n\n`;
    response += `1. Click on **"Report Issue"** in the navigation menu\n`;
    response += `2. Fill in the details:\n`;
    response += `   • **Title**: Brief description (e.g., "${message.substring(0, 50)}...")\n`;
    response += `   • **Description**: Detailed explanation of the problem\n`;
    response += `   • **Location**: Exact address or area\n`;
    response += `   • **Photos**: Upload images if possible (helps speed up resolution)\n`;
    response += `   • **Priority**: Mark as "High" if urgent\n\n`;
    response += `💡 **Tips for faster resolution:**\n`;
    response += `• Add clear photos showing the issue\n`;
    response += `• Provide specific location details\n`;
    response += `• Mention if it's causing safety hazards\n`;
    response += `• Include landmarks for easy identification\n\n`;
    
    if (/urgent|immediate|danger|emergency|serious|severe/i.test(message)) {
      response += `⚠️ **This seems urgent!** Make sure to:\n`;
      response += `• Mark priority as "HIGH" when submitting\n`;
      response += `• Add photos showing the severity\n`;
      response += `• Mention any safety risks in the description\n\n`;
    }
    
    response += `Once submitted, you'll be able to track the status in **"My Reports"**. The ${department} will be notified immediately.\n\n`;
    response += `Would you like me to guide you through any specific step? 🏙️`;

    return {
      response,
      confidence: 0.95,
      source: 'civic_issue_detected'
    };
  }

  // Thank you responses
  if (/thank|thanks|appreciate|grateful|gratitude/i.test(lower)) {
    const thankYouResponses = [
      `You're very welcome, ${userData.user.name}! 😊 I'm always here to help you make our city better!`,
      `My pleasure, ${userData.user.name}! 🌟 Happy to assist you anytime!`,
      `Glad I could help, ${userData.user.name}! 👍 Feel free to reach out whenever you need assistance!`,
      `You're welcome! 🏙️ Together we're making a difference in our community!`
    ];
    
    return {
      response: thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)],
      confidence: 1.0,
      source: 'thank_you'
    };
  }

  // Who are you / About Son of Anton
  if (/who are you|what are you|tell me about yourself|your name|introduce yourself/i.test(lower)) {
    let response = `👋 **I'm Son of Anton!**\n\n`;
    response += `I'm your intelligent AI assistant for the Smart City Portal. Think of me as your personal guide to civic engagement!\n\n`;
    response += `**What I Can Do:**\n`;
    response += `🔍 Help you report and track civic issues\n`;
    response += `📊 Provide insights about your reports and activity\n`;
    response += `💡 Offer personalized recommendations\n`;
    response += `🎯 Guide you through the platform features\n`;
    response += `🤝 Connect you with the right departments\n`;
    response += `📈 Analyze trends and patterns in your reports\n\n`;
    response += `**I'm Here For:**\n`;
    response += `• Potholes, garbage, streetlights, water issues\n`;
    response += `• Road damage, drainage, electrical problems\n`;
    response += `• Any civic concern that needs attention\n\n`;
    response += `I'm powered by advanced AI to understand your needs and provide helpful, empathetic responses. Let's work together to improve our city! 🏙️`;
    
    return {
      response,
      confidence: 1.0,
      source: 'about_son_of_anton'
    };
  }

  // How to use platform / Platform features
  if (/how (to|do i|can i) use|platform features|what can i do|capabilities|functions|features/i.test(lower)) {
    let response = `🎯 **Smart City Portal - How to Use**\n\n`;
    response += `**📝 Report Issues:**\n`;
    response += `1. Click "Report Issue" in the navigation\n`;
    response += `2. Fill in title, description, and location\n`;
    response += `3. Upload photos (optional but recommended)\n`;
    response += `4. Set priority level (Low/Medium/High)\n`;
    response += `5. Submit and track progress\n\n`;
    response += `**📊 Track Your Reports:**\n`;
    response += `• View all reports in "My Reports"\n`;
    response += `• Check status updates in real-time\n`;
    response += `• See admin notes and responses\n`;
    response += `• Filter by status, category, or priority\n\n`;
    response += `**💬 Communicate:**\n`;
    response += `• Chat with me (Son of Anton) anytime\n`;
    response += `• Get instant answers and guidance\n`;
    response += `• Receive personalized recommendations\n\n`;
    response += `**⭐ Leave Feedback:**\n`;
    response += `• Review resolved issues\n`;
    response += `• Rate department performance\n`;
    response += `• Help improve city services\n\n`;
    response += `**🔔 Stay Updated:**\n`;
    response += `• Get notifications on report status\n`;
    response += `• Track resolution progress\n`;
    response += `• View activity history\n\n`;
    response += `Need help with something specific? Just ask! 🏙️`;
    
    return {
      response,
      confidence: 1.0,
      source: 'platform_features'
    };
  }

  // Contact department / How to reach
  if (/contact|reach|call|phone|email|get in touch|speak to|talk to department/i.test(lower)) {
    let response = `📞 **Contact Information**\n\n`;
    response += `**Department Contact Details:**\n\n`;
    response += `🛣️ **Road Service Department**\n`;
    response += `• Email: roads@smartcity.gov\n`;
    response += `• Phone: 1800-XXX-ROAD\n\n`;
    response += `💧 **Water Management**\n`;
    response += `• Email: water@smartcity.gov\n`;
    response += `• Phone: 1800-XXX-WATER\n\n`;
    response += `⚡ **Electrical Services**\n`;
    response += `• Email: electrical@smartcity.gov\n`;
    response += `• Phone: 1800-XXX-POWER\n\n`;
    response += `🗑️ **Sanitation Department**\n`;
    response += `• Email: sanitation@smartcity.gov\n`;
    response += `• Phone: 1800-XXX-CLEAN\n\n`;
    response += `🏥 **Emergency Services**\n`;
    response += `• Emergency: 112 (Universal)\n`;
    response += `• Ambulance: 108\n`;
    response += `• Police: 100\n`;
    response += `• Fire: 101\n\n`;
    response += `💡 **Tip:** For non-emergency issues, reporting through the platform is the fastest way to get help!`;
    
    return {
      response,
      confidence: 1.0,
      source: 'contact_info'
    };
  }

  // Privacy / Data security
  if (/privacy|data|security|safe|personal information|confidential|protect/i.test(lower)) {
    let response = `🔒 **Privacy & Data Security**\n\n`;
    response += `**Your Data is Safe:**\n`;
    response += `✅ All data is encrypted and securely stored\n`;
    response += `✅ We never share your personal information\n`;
    response += `✅ Only authorized departments see your reports\n`;
    response += `✅ You control what information you share\n\n`;
    response += `**What We Collect:**\n`;
    response += `• Name and email (for account management)\n`;
    response += `• Report details (to address civic issues)\n`;
    response += `• Location data (only for reported issues)\n`;
    response += `• Photos (optional, only if you upload)\n\n`;
    response += `**Your Rights:**\n`;
    response += `• View all your data anytime\n`;
    response += `• Delete your reports\n`;
    response += `• Request data export\n`;
    response += `• Opt-out of notifications\n\n`;
    response += `**We NEVER:**\n`;
    response += `❌ Sell your data to third parties\n`;
    response += `❌ Use your data for advertising\n`;
    response += `❌ Share with unauthorized entities\n\n`;
    response += `Your trust is important to us. We're committed to protecting your privacy while improving our city! 🏙️`;
    
    return {
      response,
      confidence: 1.0,
      source: 'privacy_info'
    };
  }

  // Account management
  if (/account|profile|settings|update|change|edit|modify.*account/i.test(lower) && !/report/i.test(lower)) {
    let response = `⚙️ **Account Management**\n\n`;
    response += `**Your Account Details:**\n`;
    response += `• Name: ${userData.user.name}\n`;
    response += `• Email: ${userData.user.email}\n`;
    response += `• Role: ${userData.user.role}\n\n`;
    response += `**What You Can Update:**\n`;
    response += `• Profile information (name, contact)\n`;
    response += `• Email preferences\n`;
    response += `• Notification settings\n`;
    response += `• Password (for security)\n\n`;
    response += `**To Update Your Account:**\n`;
    response += `1. Go to "Profile" or "Settings"\n`;
    response += `2. Click "Edit Profile"\n`;
    response += `3. Make your changes\n`;
    response += `4. Save updates\n\n`;
    response += `**Security Tips:**\n`;
    response += `🔐 Use a strong, unique password\n`;
    response += `🔐 Enable two-factor authentication if available\n`;
    response += `🔐 Never share your password\n`;
    response += `🔐 Log out on shared devices\n\n`;
    response += `Need help with something specific? Let me know! 👍`;
    
    return {
      response,
      confidence: 0.95,
      source: 'account_management'
    };
  }

  // Greetings
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup|what's up|whats up)$/i.test(lower.trim())) {
    let response = `Hi ${userData.user.name}! 👋\n\n`;
    
    if (userData.stats.totalReports === 0) {
      response += `I'm Son of Anton, your civic assistant. I can help you report issues, track complaints, and navigate the platform. What would you like to do?`;
    } else if (userData.stats.openReports > 0) {
      const oldestOpen = userData.reports.filter(r => r.status === 'open').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
      const daysOpen = oldestOpen ? Math.floor((Date.now() - new Date(oldestOpen.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
      
      response += `You have ${userData.stats.openReports} open report${userData.stats.openReports > 1 ? 's' : ''}`;
      if (daysOpen > 7) {
        response += ` (oldest pending ${daysOpen} days)`;
      }
      response += `. ${userData.stats.resolvedReports} resolved so far. Need an update on any of them?`;
    } else {
      const resolvedRate = Math.round((userData.stats.resolvedReports / userData.stats.totalReports) * 100);
      response += `All ${userData.stats.totalReports} of your reports are resolved! That's a ${resolvedRate}% success rate. 🎉 Need to report something new?`;
    }
    
    return {
      response,
      confidence: 1.0,
      source: 'greeting'
    };
  }

  // "How are my reports doing?" - Comprehensive report status
  if (/how (are|is).*report.*doing|report.*status|my report/i.test(message)) {
    if (userData.stats.totalReports === 0) {
      return {
        response: `You haven't submitted any reports yet! 📝\n\nReady to make a difference? Click "Report Issue" to submit your first civic concern. I'll help you track it every step of the way! 🏙️`,
        confidence: 1.0,
        source: 'reports_doing_none'
      };
    }

    const resolvedPercentage = Math.round((userData.stats.resolvedReports / userData.stats.totalReports) * 100);
    const inProgressPercentage = Math.round((userData.stats.inProgressReports / userData.stats.totalReports) * 100);
    const openPercentage = Math.round((userData.stats.openReports / userData.stats.totalReports) * 100);
    
    const mostReportedCategory = Object.entries(userData.stats.reportsByCategory)
      .sort((a, b) => b[1] - a[1])[0];
    
    const statusEmojis = { 'resolved': '✅', 'in-progress': '⏳', 'open': '🔴' };
    
    let response = `📊 **Your Reports Overview**\n\n`;
    response += `**Total Reports Submitted:** ${userData.stats.totalReports}\n\n`;
    
    response += `**Status Breakdown:**\n`;
    response += `✅ **Resolved:** ${userData.stats.resolvedReports} (${resolvedPercentage}%)\n`;
    response += `⏳ **In Progress:** ${userData.stats.inProgressReports} (${inProgressPercentage}%)\n`;
    response += `🔴 **Open/Pending:** ${userData.stats.openReports} (${openPercentage}%)\n\n`;
    
    // Recent reports with actual data
    const recentReports = userData.reports.slice(0, 5);
    if (recentReports.length > 0) {
      response += `**📋 Recent Reports:**\n`;
      recentReports.forEach((report, i) => {
        const daysAgo = Math.floor((Date.now() - new Date(report.createdAt)) / (1000 * 60 * 60 * 24));
        const timeStr = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`;
        response += `${i + 1}. ${statusEmojis[report.status] || '📋'} **${report.title}**\n`;
        response += `   Status: ${report.status} • ${timeStr} • ${report.category || 'General'}\n`;
        if (report.adminNotes) {
          response += `   💬 Update: "${report.adminNotes.substring(0, 80)}${report.adminNotes.length > 80 ? '...' : ''}"\n`;
        }
        response += `\n`;
      });
    }
    
    // Category breakdown
    if (Object.keys(userData.stats.reportsByCategory).length > 0) {
      response += `**📂 Reports by Category:**\n`;
      Object.entries(userData.stats.reportsByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([category, count]) => {
          const percentage = Math.round((count / userData.stats.totalReports) * 100);
          response += `• ${category}: ${count} (${percentage}%)\n`;
        });
      response += `\n`;
    }
    
    // Priority breakdown
    if (Object.keys(userData.stats.reportsByPriority).length > 0) {
      const highPriority = userData.stats.reportsByPriority.high || 0;
      const mediumPriority = userData.stats.reportsByPriority.medium || 0;
      const lowPriority = userData.stats.reportsByPriority.low || 0;
      
      if (highPriority > 0 || mediumPriority > 0 || lowPriority > 0) {
        response += `**⚡ Priority Levels:**\n`;
        if (highPriority > 0) response += `🔴 High: ${highPriority}\n`;
        if (mediumPriority > 0) response += `🟡 Medium: ${mediumPriority}\n`;
        if (lowPriority > 0) response += `🟢 Low: ${lowPriority}\n`;
        response += `\n`;
      }
    }
    
    // Personalized insights
    response += `**💡 Insights & Recommendations:**\n`;
    
    if (resolvedPercentage >= 80) {
      response += `🌟 Excellent! ${resolvedPercentage}% of your reports are resolved. Your detailed reports are making a real impact!\n`;
    } else if (resolvedPercentage >= 60) {
      response += `👍 Good progress! ${resolvedPercentage}% resolution rate. Keep providing detailed information for better results.\n`;
    } else if (resolvedPercentage >= 40) {
      response += `📈 ${resolvedPercentage}% resolved. Tip: Add photos and specific locations to speed up resolution.\n`;
    } else if (userData.stats.totalReports > 0) {
      response += `⚠️ ${resolvedPercentage}% resolution rate is below average. Make sure to include photos, exact locations, and follow up on older reports.\n`;
    }
    
    // Check for old pending reports
    const oldPendingReports = userData.reports.filter(r => {
      const daysOld = Math.floor((Date.now() - new Date(r.createdAt)) / (1000 * 60 * 60 * 24));
      return daysOld > 14 && (r.status === 'open' || r.status === 'in-progress');
    });
    
    if (oldPendingReports.length > 0) {
      response += `⏰ ${oldPendingReports.length} report${oldPendingReports.length > 1 ? 's have' : ' has'} been pending for 2+ weeks. Consider following up with the department.\n`;
    }
    
    if (userData.stats.openReports > 5) {
      response += `📌 You have ${userData.stats.openReports} open reports. Following up on the oldest ones can help speed up resolution.\n`;
    }
    
    if (userData.stats.totalReviews === 0 && userData.stats.resolvedReports > 0) {
      response += `⭐ You have ${userData.stats.resolvedReports} resolved reports. Consider leaving reviews to help improve city services!\n`;
    }
    
    response += `\n🏙️ **Keep up the great civic engagement!** Your reports help make our city better for everyone.`;
    
    return {
      response,
      confidence: 1.0,
      source: 'reports_doing_detailed'
    };
  }

  // How many reports
  if (/how many.*report/i.test(message) || /total.*report/i.test(message)) {
    const resolvedPercentage = userData.stats.totalReports > 0 
      ? Math.round((userData.stats.resolvedReports / userData.stats.totalReports) * 100) 
      : 0;
    
    const mostReportedCategory = Object.entries(userData.stats.reportsByCategory)
      .sort((a, b) => b[1] - a[1])[0];
    
    let response = `You've reported **${userData.stats.totalReports}** issues: `;
    response += `${userData.stats.openReports} open, ${userData.stats.inProgressReports} in progress, ${userData.stats.resolvedReports} resolved (${resolvedPercentage}% resolution rate).\n\n`;
    
    if (mostReportedCategory) {
      response += `Most reported: **${mostReportedCategory[0]}** (${mostReportedCategory[1]} times). `;
    }
    
    if (userData.stats.openReports > 3) {
      response += `\n\n💡 You have several open reports. Consider following up on older ones to speed up resolution.`;
    } else if (resolvedPercentage >= 80) {
      response += `\n\nGreat track record! Your reports are getting resolved efficiently. 🎉`;
    } else if (userData.stats.totalReports > 0 && resolvedPercentage < 50) {
      response += `\n\n💡 Tip: Add photos and specific locations to your reports for faster resolution.`;
    }
    
    return {
      response,
      confidence: 1.0,
      source: 'fallback_stats'
    };
  }

  // Status of reports
  if (/status|progress/i.test(message)) {
    const recentReports = userData.reports.slice(0, 5);
    
    if (recentReports.length === 0) {
      return {
        response: "You haven't submitted any reports yet. Ready to report your first issue?",
        confidence: 1.0,
        source: 'fallback_status'
      };
    }
    
    let response = '';
    const statusEmojis = { 'resolved': '✅', 'in-progress': '⏳', 'open': '🔴' };
    
    recentReports.forEach((report, i) => {
      const daysAgo = Math.floor((Date.now() - new Date(report.createdAt)) / (1000 * 60 * 60 * 24));
      response += `${statusEmojis[report.status] || '📋'} **${report.title}** - ${report.status}`;
      if (daysAgo === 0) response += ` (today)`;
      else if (daysAgo === 1) response += ` (yesterday)`;
      else response += ` (${daysAgo}d ago)`;
      
      if (report.adminNotes) {
        response += `\n   💬 "${report.adminNotes.substring(0, 60)}${report.adminNotes.length > 60 ? '...' : ''}"`;
      }
      response += `\n\n`;
    });
    
    const oldestOpen = userData.reports
      .filter(r => r.status === 'open')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
    
    if (oldestOpen) {
      const daysOpen = Math.floor((Date.now() - new Date(oldestOpen.createdAt)) / (1000 * 60 * 60 * 24));
      if (daysOpen > 14) {
        response += `⚠️ "${oldestOpen.title}" has been open for ${daysOpen} days. Consider following up.`;
      } else if (daysOpen > 7) {
        response += `💡 "${oldestOpen.title}" pending ${daysOpen} days. Departments typically respond within 7-10 days.`;
      }
    }
    
    return {
      response: response.trim(),
      confidence: 1.0,
      source: 'fallback_status'
    };
  }

  // Category breakdown
  if (/category|type|kind/i.test(message)) {
    const categories = userData.stats.reportsByCategory;
    const categoryEmojis = {
      road: '🛣️', water: '💧', electrical: '⚡', hospital: '🏥',
      waste: '🗑️', lighting: '💡', safety: '🚨', general: '📋',
      sanitation: '🧹', traffic: '🚦', parks: '🌳', health: '🏥'
    };
    
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    
    let response = sortedCategories.map(([category, count]) => {
      const emoji = categoryEmojis[category.toLowerCase()] || '📌';
      const percentage = Math.round((count / userData.stats.totalReports) * 100);
      return `${emoji} ${category}: ${count} (${percentage}%)`;
    }).join('\n');
    
    const topCategory = sortedCategories[0];
    if (topCategory && topCategory[1] > userData.stats.totalReports * 0.4) {
      response += `\n\n💡 ${topCategory[0]} issues dominate your reports. Your feedback helps prioritize improvements in this area.`;
    }
    
    return {
      response,
      confidence: 1.0,
      source: 'fallback_category'
    };
  }

  // Chats
  if (/chat|message/i.test(message)) {
    return {
      response: `You have **${userData.stats.totalChats}** chat messages in your history. You can view all your conversations in the chat section of your dashboard.`,
      confidence: 1.0,
      source: 'fallback_chats'
    };
  }

  // Reviews
  if (/review|feedback/i.test(message)) {
    return {
      response: `You have submitted **${userData.stats.totalReviews}** reviews. Thank you for providing feedback to help improve our services!`,
      confidence: 1.0,
      source: 'fallback_reviews'
    };
  }

  // General stats
  if (/stat|summary|overview|activity/i.test(message)) {
    const resolvedRate = userData.stats.totalReports > 0 
      ? Math.round((userData.stats.resolvedReports / userData.stats.totalReports) * 100) 
      : 0;
    
    const avgResponseTime = userData.reports.length > 0 ? '24-48 hours' : 'N/A';
    
    let response = `📊 **Your Complete Activity Summary**\n\n`;
    response += `**📝 Reports Overview:**\n`;
    response += `- Total Submitted: **${userData.stats.totalReports}**\n`;
    response += `- 🔴 Open: ${userData.stats.openReports}\n`;
    response += `- 🟡 In Progress: ${userData.stats.inProgressReports}\n`;
    response += `- 🟢 Resolved: ${userData.stats.resolvedReports}\n`;
    response += `- Resolution Rate: **${resolvedRate}%**\n\n`;
    
    if (Object.keys(userData.stats.reportsByCategory).length > 0) {
      const topCategory = Object.entries(userData.stats.reportsByCategory)
        .sort((a, b) => b[1] - a[1])[0];
      response += `**📂 Top Category:** ${topCategory[0]} (${topCategory[1]} reports)\n\n`;
    }
    
    response += `**💬 Communication:**\n`;
    response += `- Chat Messages: ${userData.stats.totalChats}\n`;
    response += `- Reviews Submitted: ${userData.stats.totalReviews}\n\n`;
    
    response += `**🎯 Impact Score:**\n`;
    const impactScore = userData.stats.totalReports * 10 + userData.stats.resolvedReports * 5 + userData.stats.totalReviews * 3;
    response += `- Your Contribution: **${impactScore} points**\n`;
    response += `- Rank: ${impactScore > 200 ? '🏆 Super Citizen' : impactScore > 100 ? '⭐ Active Citizen' : '👍 Contributing Citizen'}\n\n`;
    
    if (userData.stats.totalReports > 0) {
      response += `**💡 Personalized Tips:**\n`;
      if (userData.stats.openReports > 3) {
        response += `- You have ${userData.stats.openReports} open reports. Consider following up on older ones.\n`;
      }
      if (userData.stats.totalReviews === 0) {
        response += `- Leave reviews on resolved reports to help improve services!\n`;
      }
      if (resolvedRate > 80) {
        response += `- Excellent! ${resolvedRate}% of your reports are resolved. Your feedback is making a real difference! 🌟\n`;
      }
    }
    
    response += `\n🏙️ **Thank you for being an active citizen and helping improve our city!**`;
    
    return {
      response,
      confidence: 1.0,
      source: 'fallback_summary'
    };
  }

  // Timeline/Recent queries
  if (/recent|latest|last|new/i.test(message)) {
    const recentReports = userData.reports.slice(0, 3);
    
    // If asking specifically about "the last issue/report I reported"
    if (/last (issue|report|problem|complaint).*reported|last.*i (reported|submitted|filed)/i.test(message) && recentReports.length > 0) {
      const lastReport = recentReports[0];
      const daysAgo = Math.floor((Date.now() - new Date(lastReport.createdAt)) / (1000 * 60 * 60 * 24));
      const statusEmoji = { 'resolved': '✅', 'in-progress': '⏳', 'open': '🔴' };
      
      let department = 'General Services';
      const category = lastReport.category?.toLowerCase() || '';
      if (category.includes('road')) department = 'Road Service Department';
      else if (category.includes('electrical') || category.includes('light')) department = 'Electrical Service Department';
      else if (category.includes('water') || category.includes('drainage')) department = 'Water Management Department';
      else if (category.includes('sanitation') || category.includes('garbage')) department = 'Sanitation Department';
      else if (category.includes('hospital')) department = 'Hospital Emergency Services';
      
      let response = `🕐 **Your Most Recent Activity:**\n\n`;
      response += `**Latest Reports:**\n`;
      response += `1. ${lastReport.title} - ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago (${lastReport.status})\n`;
      if (recentReports.length > 1) {
        response += `2. ${recentReports[1].title} - ${Math.floor((Date.now() - new Date(recentReports[1].createdAt)) / (1000 * 60 * 60 * 24))} day${Math.floor((Date.now() - new Date(recentReports[1].createdAt)) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''} ago (${recentReports[1].status})\n`;
      }
      
      return {
        response,
        confidence: 0.95,
        source: 'fallback_timeline_detailed'
      };
    }
    
    // General recent activity
    let response = `🕐 **Your Most Recent Activity:**\n\n`;
    
    if (recentReports.length > 0) {
      response += `**Latest Reports:**\n`;
      recentReports.forEach((report, i) => {
        const daysAgo = Math.floor((Date.now() - new Date(report.createdAt)) / (1000 * 60 * 60 * 24));
        response += `${i + 1}. ${report.title} - ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago (${report.status})\n`;
      });
    } else {
      response = `You haven't submitted any reports recently. Report an issue to help improve our city! 🏙️`;
    }
    
    return {
      response,
      confidence: 0.9,
      source: 'fallback_timeline'
    };
  }

  // Priority/Urgent queries
  if (/urgent|priority|important|critical/i.test(message)) {
    const highPriorityReports = userData.reports.filter(r => r.priority === 'high');
    const urgentOpen = highPriorityReports.filter(r => r.status === 'open' || r.status === 'in-progress');
    
    let response = `🔥 **High Priority Reports:**\n\n`;
    response += `- Total High Priority: **${highPriorityReports.length}**\n`;
    response += `- Currently Urgent: **${urgentOpen.length}**\n\n`;
    
    if (urgentOpen.length > 0) {
      response += `**Active Urgent Issues:**\n`;
      urgentOpen.slice(0, 3).forEach((report, i) => {
        response += `${i + 1}. ${report.title} - ${report.status.toUpperCase()}\n`;
      });
      response += `\n⚠️ These issues are being prioritized by the departments.`;
    } else {
      response += `✅ Great news! You have no urgent open issues at the moment.`;
    }
    
    return {
      response,
      confidence: 0.95,
      source: 'fallback_priority'
    };
  }

  // Advice/Help queries
  if (/should|recommend|suggest|advice|tip|what can|how can/i.test(message)) {
    let tips = [];
    
    if (userData.stats.totalReports === 0) {
      return {
        response: `Start by reporting an issue you've noticed in your area. Click "Report Issue" and include photos for faster resolution. Every report helps improve our city!`,
        confidence: 0.9,
        source: 'fallback_advice'
      };
    }
    
    if (userData.stats.openReports > 5) {
      tips.push(`You have ${userData.stats.openReports} open reports. Follow up on the oldest ones to speed up resolution.`);
    }
    
    const oldReports = userData.reports.filter(r => {
      const daysOld = Math.floor((Date.now() - new Date(r.createdAt)) / (1000 * 60 * 60 * 24));
      return daysOld > 14 && (r.status === 'open' || r.status === 'in-progress');
    });
    
    if (oldReports.length > 0) {
      tips.push(`${oldReports.length} report${oldReports.length > 1 ? 's have' : ' has'} been pending 2+ weeks. Consider contacting the department directly.`);
    }
    
    if (userData.stats.totalReviews === 0 && userData.stats.resolvedReports > 0) {
      tips.push(`Leave reviews on your ${userData.stats.resolvedReports} resolved reports to help improve services.`);
    }
    
    const resolvedRate = Math.round((userData.stats.resolvedReports / userData.stats.totalReports) * 100);
    if (resolvedRate < 60) {
      tips.push(`Add photos and specific locations to reports for faster resolution (currently ${resolvedRate}% resolved).`);
    }
    
    if (tips.length === 0) {
      tips.push(`You're doing great! Keep reporting issues with photos and specific locations for best results.`);
    }
    
    return {
      response: tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n\n'),
      confidence: 0.9,
      source: 'fallback_advice'
    };
  }

  // Comparison queries
  if (/compare|versus|vs|difference/i.test(message)) {
    const thisMonth = userData.reports.filter(r => {
      const reportDate = new Date(r.createdAt);
      const now = new Date();
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    });
    
    const resolvedRate = userData.stats.totalReports > 0 
      ? Math.round((userData.stats.resolvedReports / userData.stats.totalReports) * 100) 
      : 0;
    
    let response = `This month: ${thisMonth.length} reports | All time: ${userData.stats.totalReports}\n`;
    response += `Your resolution rate: ${resolvedRate}% | City average: ~85%\n\n`;
    
    if (resolvedRate >= 85) {
      response += `🎉 You're at or above city average! Your reports are being handled efficiently.`;
    } else if (resolvedRate >= 70) {
      response += `👍 Solid performance. Your reports are getting attention.`;
    } else if (resolvedRate >= 50) {
      response += `💡 Below average. Try adding photos and specific locations to improve resolution rate.`;
    } else {
      response += `⚠️ Low resolution rate. Follow up on older reports and ensure you're providing detailed information.`;
    }
    
    return {
      response,
      confidence: 0.85,
      source: 'fallback_comparison'
    };
  }

  // Help with reporting
  if (/how.*report|report.*how|submit.*issue|file.*complaint|create.*report/i.test(lower) && !queryAnalysis.needsStats) {
    let response = `📝 **How to Report an Issue**\n\n`;
    response += `**Step-by-Step Guide:**\n\n`;
    response += `1️⃣ **Navigate to Report Section**\n`;
    response += `   Click "Report Issue" in the main navigation\n\n`;
    response += `2️⃣ **Fill in Details**\n`;
    response += `   • **Title**: Brief description (e.g., "Pothole on Main Street")\n`;
    response += `   • **Description**: Detailed explanation of the issue\n`;
    response += `   • **Category**: Select appropriate department\n`;
    response += `   • **Location**: Provide exact address or area\n`;
    response += `   • **Priority**: Low/Medium/High based on urgency\n\n`;
    response += `3️⃣ **Add Photos (Recommended)**\n`;
    response += `   • Click "Upload Photo"\n`;
    response += `   • Take clear pictures showing the issue\n`;
    response += `   • Multiple photos help faster resolution\n\n`;
    response += `4️⃣ **Submit & Track**\n`;
    response += `   • Review your information\n`;
    response += `   • Click "Submit Report"\n`;
    response += `   • Track progress in "My Reports"\n\n`;
    response += `**💡 Pro Tips:**\n`;
    response += `✅ Be specific with location details\n`;
    response += `✅ Include landmarks for easy identification\n`;
    response += `✅ Mark urgent issues as HIGH priority\n`;
    response += `✅ Add photos for 50% faster resolution\n`;
    response += `✅ Avoid duplicate reports - check existing ones first\n\n`;
    response += `Ready to report? I'm here if you need help! 🏙️`;
    
    return {
      response,
      confidence: 0.95,
      source: 'how_to_report'
    };
  }

  // Delete or edit report
  if (/delete|remove|cancel|edit|modify|update.*report/i.test(lower) && !queryAnalysis.needsStats) {
    let response = `✏️ **Managing Your Reports**\n\n`;
    response += `**To Edit a Report:**\n`;
    response += `1. Go to "My Reports"\n`;
    response += `2. Find the report you want to edit\n`;
    response += `3. Click "Edit" or "Update"\n`;
    response += `4. Make your changes\n`;
    response += `5. Save updates\n\n`;
    response += `**To Delete a Report:**\n`;
    response += `1. Go to "My Reports"\n`;
    response += `2. Select the report\n`;
    response += `3. Click "Delete" or "Remove"\n`;
    response += `4. Confirm deletion\n\n`;
    response += `⚠️ **Important Notes:**\n`;
    response += `• You can only edit/delete reports that are "Open"\n`;
    response += `• Once a report is "In Progress" or "Resolved", editing may be restricted\n`;
    response += `• Deleted reports cannot be recovered\n`;
    response += `• Consider adding updates instead of deleting\n\n`;
    response += `**Better Alternative:**\n`;
    response += `Instead of deleting, you can:\n`;
    response += `• Add comments with new information\n`;
    response += `• Upload additional photos\n`;
    response += `• Update priority level\n`;
    response += `• Mark as resolved if fixed\n\n`;
    response += `Need help with a specific report? Let me know! 👍`;
    
    return {
      response,
      confidence: 0.9,
      source: 'manage_reports'
    };
  }

  // Upload photos
  if (/photo|picture|image|upload|attach|add.*photo/i.test(lower)) {
    let response = `📸 **Adding Photos to Reports**\n\n`;
    response += `**Why Photos Matter:**\n`;
    response += `✅ 50% faster resolution time\n`;
    response += `✅ Helps departments understand the issue\n`;
    response += `✅ Provides visual evidence\n`;
    response += `✅ Reduces need for site visits\n\n`;
    response += `**How to Upload Photos:**\n\n`;
    response += `**When Creating a Report:**\n`;
    response += `1. Fill in report details\n`;
    response += `2. Click "Upload Photo" or "Add Image"\n`;
    response += `3. Choose from gallery or take new photo\n`;
    response += `4. Upload (you can add multiple photos)\n`;
    response += `5. Submit report\n\n`;
    response += `**For Existing Reports:**\n`;
    response += `1. Go to "My Reports"\n`;
    response += `2. Open the report\n`;
    response += `3. Click "Add Photo" or "Update"\n`;
    response += `4. Upload additional images\n\n`;
    response += `**📷 Photo Tips:**\n`;
    response += `• Take clear, well-lit photos\n`;
    response += `• Show the full context of the issue\n`;
    response += `• Include close-ups of specific problems\n`;
    response += `• Capture landmarks for location reference\n`;
    response += `• Multiple angles help\n`;
    response += `• Avoid blurry or dark images\n\n`;
    response += `**Supported Formats:**\n`;
    response += `JPG, PNG, JPEG, WebP (max 5MB per photo)\n\n`;
    response += `Ready to add photos? Go ahead! 📱`;
    
    return {
      response,
      confidence: 0.95,
      source: 'photo_upload'
    };
  }

  // Response time / How long
  if (/how long|response time|when.*resolve|time.*take|duration|wait|expect/i.test(lower)) {
    let response = `⏱️ **Resolution Timeline**\n\n`;
    response += `**Average Response Times:**\n\n`;
    response += `🔴 **High Priority Issues:**\n`;
    response += `• Acknowledgment: 2-4 hours\n`;
    response += `• Action Started: 24 hours\n`;
    response += `• Resolution: 2-5 days\n\n`;
    response += `🟡 **Medium Priority:**\n`;
    response += `• Acknowledgment: 24 hours\n`;
    response += `• Action Started: 2-3 days\n`;
    response += `• Resolution: 5-10 days\n\n`;
    response += `🟢 **Low Priority:**\n`;
    response += `• Acknowledgment: 48 hours\n`;
    response += `• Action Started: 3-7 days\n`;
    response += `• Resolution: 10-15 days\n\n`;
    response += `**Factors Affecting Timeline:**\n`;
    response += `• Severity of the issue\n`;
    response += `• Department workload\n`;
    response += `• Resource availability\n`;
    response += `• Weather conditions\n`;
    response += `• Complexity of repair\n\n`;
    response += `**Your Reports:**\n`;
    if (userData.stats.totalReports > 0) {
      const resolvedReports = userData.reports.filter(r => r.status === 'resolved' && r.resolvedAt);
      const avgResolutionDays = resolvedReports.length > 0 ? Math.round(
        resolvedReports.reduce((sum, r) => {
          const days = Math.floor((new Date(r.resolvedAt) - new Date(r.createdAt)) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / resolvedReports.length
      ) : 0;
      response += `• Average resolution: ${avgResolutionDays || 'N/A'} days\n`;
      response += `• Resolved reports: ${userData.stats.resolvedReports}/${userData.stats.totalReports}\n`;
    } else {
      response += `You haven't submitted any reports yet.\n`;
    }
    response += `\n💡 **Speed Up Resolution:**\n`;
    response += `• Add clear photos\n`;
    response += `• Provide exact location\n`;
    response += `• Mark urgency correctly\n`;
    response += `• Follow up if delayed\n\n`;
    response += `Track your reports in "My Reports" for real-time updates! 📊`;
    
    return {
      response,
      confidence: 0.9,
      source: 'response_time'
    };
  }

  // What happens after reporting
  if (/what happens|after.*report|next step|process|workflow|procedure/i.test(lower)) {
    let response = `🔄 **What Happens After You Report**\n\n`;
    response += `**The Journey of Your Report:**\n\n`;
    response += `1️⃣ **Submission** (You)\n`;
    response += `   ✅ Report created and logged\n`;
    response += `   ✅ Confirmation sent to you\n`;
    response += `   ✅ Assigned unique tracking ID\n\n`;
    response += `2️⃣ **Review** (Admin Team)\n`;
    response += `   🔍 Report verified and categorized\n`;
    response += `   🔍 Priority level confirmed\n`;
    response += `   🔍 Assigned to appropriate department\n\n`;
    response += `3️⃣ **Assignment** (Department)\n`;
    response += `   📋 Department receives notification\n`;
    response += `   📋 Team reviews details and photos\n`;
    response += `   📋 Resources allocated\n\n`;
    response += `4️⃣ **Action** (Field Team)\n`;
    response += `   🚧 Status changed to "In Progress"\n`;
    response += `   🚧 Field team dispatched\n`;
    response += `   🚧 Work begins on-site\n`;
    response += `   🚧 Updates posted (you get notified)\n\n`;
    response += `5️⃣ **Resolution** (Completion)\n`;
    response += `   ✅ Issue fixed\n`;
    response += `   ✅ Quality check performed\n`;
    response += `   ✅ Status updated to "Resolved"\n`;
    response += `   ✅ You're notified\n\n`;
    response += `6️⃣ **Feedback** (You)\n`;
    response += `   ⭐ Review the resolution\n`;
    response += `   ⭐ Rate department performance\n`;
    response += `   ⭐ Help improve services\n\n`;
    response += `**You'll Receive Notifications At:**\n`;
    response += `📧 Report submission\n`;
    response += `📧 Status changes\n`;
    response += `📧 Admin comments\n`;
    response += `📧 Resolution completion\n\n`;
    response += `**Track Anytime:**\n`;
    response += `Check "My Reports" for real-time status updates! 📊`;
    
    return {
      response,
      confidence: 0.95,
      source: 'report_workflow'
    };
  }

  // Default response with basic stats
  return {
    response: `I can help you with information about your account!\n\n**Quick Stats:**\n- Total Reports: ${userData.stats.totalReports}\n- Open Reports: ${userData.stats.openReports}\n- Resolved: ${userData.stats.resolvedReports}\n\n**I can help you with:**\n\n**📝 Reporting:**\n• "How do I report an issue?"\n• "How to upload photos?"\n• "Can I edit my report?"\n\n**📊 Tracking:**\n• "What's the status of my reports?"\n• "Show me my recent activity"\n• "How long until resolution?"\n\n**💡 Information:**\n• "How does the platform work?"\n• "Contact department"\n• "Privacy and security"\n\n**🎯 Analysis:**\n• "Give me personalized advice"\n• "Compare my resolution rate"\n• "Show me urgent issues"\n\n**❓ General:**\n• "Who are you?"\n• "What can you do?"\n• "How to use this platform?"\n\nJust ask me anything! I'm here to help! 🏙️`,
    confidence: 0.8,
    source: 'fallback_default'
  };
};
