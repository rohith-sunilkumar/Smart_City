import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

let openai = null;

// Initialize OpenAI only if API key is provided
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ OpenAI initialized');
} else {
  console.log('⚠️  OpenAI API key not configured - using fallback classification');
}

const categoryToDepartment = {
  'Road Service Department': 'road_service',
  'Hospital Emergency Department': 'hospital_emergency',
  'Water Management Department': 'water_management',
  'Electrical Service Department': 'electrical_service',
  'General Department': 'general'
};

// Enhanced keyword detection for accurate categorization
const categoryKeywords = {
  'Road Service Department': {
    keywords: [
      'pothole', 'potholes', 'road', 'street', 'highway', 'pavement', 'asphalt',
      'crack', 'cracks', 'damaged road', 'road damage', 'traffic', 'intersection',
      'road construction', 'road repair', 'road maintenance', 'street repair',
      'broken road', 'uneven road', 'road surface', 'road condition', 'road hazard',
      'speed bump', 'manhole', 'road marking', 'divider', 'curb', 'sidewalk crack'
    ],
    priority: {
      high: ['large pothole', 'deep pothole', 'dangerous', 'accident', 'major damage', 'collapsed'],
      medium: ['pothole', 'crack', 'damaged', 'needs repair'],
      low: ['small crack', 'minor', 'cosmetic']
    }
  },
  'Water Management Department': {
    keywords: [
      'water', 'leak', 'leakage', 'pipe', 'drainage', 'drain', 'sewage', 'sewer',
      'flooding', 'flood', 'water supply', 'water blockage', 'blocked drain',
      'water overflow', 'burst pipe', 'broken pipe', 'water main', 'water line',
      'water pressure', 'no water', 'dirty water', 'contaminated water',
      'water pooling', 'standing water', 'water damage', 'wet', 'moisture'
    ],
    priority: {
      high: ['burst', 'flooding', 'major leak', 'no water', 'contaminated'],
      medium: ['leak', 'drainage', 'blockage', 'overflow'],
      low: ['minor leak', 'slow drain', 'small puddle']
    }
  },
  'Electrical Service Department': {
    keywords: [
      'electricity', 'electrical', 'power', 'light', 'streetlight', 'street light',
      'lamp', 'power outage', 'no power', 'blackout', 'transformer', 'wire',
      'cable', 'electric pole', 'power line', 'voltage', 'short circuit',
      'broken light', 'light not working', 'dark street', 'no lighting',
      'exposed wire', 'hanging wire', 'sparking', 'electric shock'
    ],
    priority: {
      high: ['exposed wire', 'sparking', 'shock', 'major outage', 'transformer'],
      medium: ['streetlight', 'power outage', 'no light', 'broken light'],
      low: ['dim light', 'flickering', 'single light']
    }
  },
  'Hospital Emergency Department': {
    keywords: [
      // Hospital keywords
      'hospital', 'clinic', 'medical', 'health', 'healthcare', 'doctor',
      'nurse', 'patient', 'treatment', 'medicine', 'pharmacy', 'dispensary',
      'medical facility', 'health center', 'medical center', 'hospital service',
      'hospital staff', 'medical staff', 'hospital equipment', 'medical equipment',
      'hospital bed', 'ward', 'icu', 'operation theater', 'ot', 'surgery',
      'medical emergency', 'health emergency', 'medical care', 'health service',
      'hospital infrastructure', 'hospital building', 'hospital maintenance',
      // Emergency keywords
      'emergency', 'urgent', 'accident', 'injury', 'injured',
      'ambulance', 'fire', 'danger', 'dangerous', 'life threatening',
      'critical', 'immediate', 'help', 'rescue', 'trapped', 'collapse',
      'explosion', 'gas leak', 'chemical', 'hazard', 'toxic'
    ],
    priority: {
      high: ['medical emergency', 'health emergency', 'icu', 'critical care', 'surgery', 'emergency', 'urgent', 'life threatening', 'critical', 'immediate'],
      medium: ['hospital', 'medical', 'health', 'treatment', 'patient care', 'accident', 'injury', 'danger'],
      low: ['hospital maintenance', 'hospital building', 'infrastructure']
    }
  },
  'General Department': {
    keywords: [],
    priority: {
      high: [],
      medium: [],
      low: []
    }
  }
};

// Intelligent rule-based classification
const ruleBasedClassify = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  let scores = {
    'Road Service Department': 0,
    'Water Management Department': 0,
    'Electrical Service Department': 0,
    'Hospital Emergency Department': 0,
    'General Department': 0
  };
  
  let detectedPriority = 'medium';
  
  // Score each category based on keyword matches
  for (const [category, data] of Object.entries(categoryKeywords)) {
    for (const keyword of data.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        scores[category] += 1;
        
        // Check priority keywords
        for (const [priority, priorityKeywords] of Object.entries(data.priority)) {
          for (const pk of priorityKeywords) {
            if (text.includes(pk.toLowerCase())) {
              detectedPriority = priority;
              scores[category] += 2; // Bonus for priority match
            }
          }
        }
      }
    }
  }
  
  // Find category with highest score
  let maxScore = 0;
  let detectedCategory = 'General Department';
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category;
    }
  }
  
  // Calculate confidence based on score
  const confidence = maxScore > 0 ? Math.min(0.95, 0.6 + (maxScore * 0.1)) : 0.5;
  
  return {
    category: detectedCategory,
    priority: detectedPriority,
    confidence: confidence,
    matchCount: maxScore
  };
};

// Enhanced image analysis with GPT-4 Vision
export const analyzeImages = async (imagePaths) => {
  if (!openai || !imagePaths || imagePaths.length === 0) {
    return null;
  }

  try {
    console.log('🖼️  Analyzing images with GPT-4 Vision...');
    
    // Read and encode images to base64
    const imageContents = [];
    for (const imagePath of imagePaths.slice(0, 3)) { // Analyze up to 3 images
      try {
        const fullPath = path.join(process.cwd(), 'uploads', path.basename(imagePath));
        if (fs.existsSync(fullPath)) {
          const imageBuffer = fs.readFileSync(fullPath);
          const base64Image = imageBuffer.toString('base64');
          const ext = path.extname(imagePath).toLowerCase();
          const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
          imageContents.push({
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
              detail: 'high'
            }
          });
        }
      } catch (err) {
        console.error('Error reading image:', err.message);
      }
    }

    if (imageContents.length === 0) {
      return null;
    }

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze these civic infrastructure images and identify:
1. What department should handle this? (Road Service, Water Management, Electrical Service, Hospital Emergency, or General)
2. Severity level (high/medium/low)
3. Specific details about the problem
4. Any safety hazards visible

Respond with JSON:
{
  "issue_type": "Road Service Department/Water Management Department/Electrical Service Department/Hospital Emergency Department/General Department",
  "severity": "high/medium/low",
  "details": "specific description",
  "hazards": ["list of hazards"],
  "confidence": 0.95
}`
          },
          ...imageContents
        ]
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: messages,
      max_tokens: 500,
      temperature: 0.2
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    console.log('✅ Image Analysis:', analysis);
    return analysis;
  } catch (error) {
    console.error('Image Analysis Error:', error.message);
    return null;
  }
};

// Helper function to map category to department
const mapCategoryToDepartment = (category) => {
  const mapping = {
    'Road Service Department': { category: 'Road Service Department', dept: 'road_service' },
    'Water Management Department': { category: 'Water Management Department', dept: 'water_management' },
    'Electrical Service Department': { category: 'Electrical Service Department', dept: 'electrical_service' },
    'Hospital Emergency Department': { category: 'Hospital Emergency Department', dept: 'hospital_emergency' },
    'General Department': { category: 'General Department', dept: 'general' }
  };
  return mapping[category] || { category: 'General Department', dept: 'general' };
};

// Enhanced classification with image analysis
export const classifyComplaint = async (title, description, imagePaths = []) => {
  // Always run rule-based classification first for validation
  const ruleBasedResult = ruleBasedClassify(title, description);
  console.log('📋 Rule-based classification:', ruleBasedResult);
  
  // If OpenAI is not configured, use rule-based classification
  if (!openai) {
    console.log('⚠️  Using rule-based classification (OpenAI not configured)');
    const mapped = mapCategoryToDepartment(ruleBasedResult.category);
    
    return {
      category: mapped.category,
      priority: ruleBasedResult.priority,
      department: mapped.dept,
      confidence: ruleBasedResult.confidence,
      reasoning: `Rule-based classification: ${ruleBasedResult.matchCount} keyword matches found`
    };
  }

  try {
    // Analyze images if provided
    let imageAnalysis = null;
    if (imagePaths && imagePaths.length > 0) {
      imageAnalysis = await analyzeImages(imagePaths);
    }

    // Build enhanced prompt with image analysis and rule-based hints
    let prompt = `You are an AI assistant for a Smart City Citizen Portal. Analyze the following civic complaint and classify it with HIGH ACCURACY.

Title: ${title}
Description: ${description}

RULE-BASED ANALYSIS:
- Detected Category: ${ruleBasedResult.category}
- Detected Priority: ${ruleBasedResult.priority}
- Keyword Matches: ${ruleBasedResult.matchCount}
- Confidence: ${ruleBasedResult.confidence}`;

    if (imageAnalysis) {
      prompt += `

IMAGE ANALYSIS RESULTS:
- Issue Type from Images: ${imageAnalysis.issue_type}
- Severity from Images: ${imageAnalysis.severity}
- Visual Details: ${imageAnalysis.details}
- Hazards Detected: ${imageAnalysis.hazards?.join(', ') || 'None'}
- Image Confidence: ${imageAnalysis.confidence}

IMPORTANT: Use the image analysis to improve classification accuracy. Images provide visual evidence that should be weighted heavily in your decision.`;
    }
    
    prompt += `

CLASSIFICATION PRIORITY:
1. If images are available, prioritize visual evidence (highest weight)
2. Consider rule-based keyword detection results
3. Analyze text description context
4. Cross-validate all three sources for maximum accuracy`;

    prompt += `

Classify this complaint into:
1. Category: Choose ONE from the following departments:
   - Road Service Department: potholes, road damage, traffic issues, road construction, road maintenance
   - Hospital Emergency Department: medical emergencies, accidents, hospital services, healthcare facilities, urgent situations
   - Water Management Department: water supply, drainage, sewage issues, water blockage, leakage
   - Electrical Service Department: power outage, electrical issues, streetlight problems, transformer issues
   - General Department: anything that doesn't fit above categories

2. Priority: Choose ONE from [high, medium, low]
   - high: immediate danger, health hazard, major infrastructure failure
   - medium: significant inconvenience, needs attention soon
   - low: minor issues, cosmetic problems

3. Provide a brief reasoning (1-2 sentences)

Respond ONLY with valid JSON in this exact format:
{
  "category": "category_name",
  "priority": "priority_level",
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert civic complaint classification system with 99%+ accuracy. 
You analyze text descriptions AND visual evidence from images to make precise classifications.
Always prioritize image analysis when available as it provides concrete visual evidence.
Be decisive and confident in your classifications.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Validate and normalize the response
    const validCategories = [
      'Road Service Department',
      'Hospital Emergency Department',
      'Water Management Department',
      'Electrical Service Department',
      'General Department'
    ];
    const validPriorities = ['high', 'medium', 'low'];
    
    const category = validCategories.includes(result.category) ? result.category : 'General Department';
    const priority = validPriorities.includes(result.priority) ? result.priority : 'medium';
    
    // Multi-source confidence boosting
    let finalConfidence = result.confidence || 0.8;
    let agreementCount = 0;
    
    // Check if rule-based agrees with AI
    if (ruleBasedResult.category === category && ruleBasedResult.matchCount > 0) {
      agreementCount++;
      finalConfidence += 0.05;
    }
    
    // Check if image analysis agrees with AI
    if (imageAnalysis) {
      const imageCategory = imageAnalysis.issue_type;
      if (imageCategory === category) {
        agreementCount++;
        finalConfidence = Math.min(0.99, (finalConfidence + imageAnalysis.confidence) / 2 + 0.10);
      }
    }
    
    // If all three sources agree, maximum confidence
    if (agreementCount === 2 && imageAnalysis) {
      finalConfidence = Math.min(0.99, finalConfidence + 0.05);
    }
    
    // Safety check: If rule-based has very high confidence but AI disagrees, use rule-based
    let finalCategory = category;
    let finalPriority = priority;
    
    if (ruleBasedResult.matchCount >= 3 && ruleBasedResult.category !== category) {
      console.log(`⚠️  Rule-based override: ${ruleBasedResult.category} (${ruleBasedResult.matchCount} matches) vs AI: ${category}`);
      finalCategory = ruleBasedResult.category;
      finalConfidence = Math.max(finalConfidence, ruleBasedResult.confidence);
    }

    return {
      category: finalCategory,
      priority: finalPriority,
      department: categoryToDepartment[finalCategory],
      confidence: Math.min(0.99, finalConfidence),
      reasoning: result.reasoning || 'AI classification based on complaint content',
      ruleBasedMatch: {
        category: ruleBasedResult.category,
        matches: ruleBasedResult.matchCount,
        agreed: ruleBasedResult.category === finalCategory
      },
      imageAnalysis: imageAnalysis ? {
        detected: imageAnalysis.issue_type,
        details: imageAnalysis.details,
        hazards: imageAnalysis.hazards,
        visualConfidence: imageAnalysis.confidence,
        agreed: imageAnalysis.issue_type === finalCategory
      } : null
    };
  } catch (error) {
    console.error('AI Classification Error:', error.message);
    console.log('⚠️  Falling back to rule-based classification');
    
    const mapped = mapCategoryToDepartment(ruleBasedResult.category);
    
    return {
      category: mapped.category,
      priority: ruleBasedResult.priority,
      department: mapped.dept,
      confidence: ruleBasedResult.confidence,
      reasoning: `Rule-based fallback classification: ${ruleBasedResult.matchCount} keyword matches found`,
      ruleBasedMatch: {
        category: mapped.category,
        matches: ruleBasedResult.matchCount,
        agreed: true
      }
    };
  }
};

export const generateResponseSuggestion = async (report) => {
  try {
    const prompt = `Generate a brief, professional response template for this civic complaint:

Category: ${report.category}
Title: ${report.title}
Description: ${report.description}

Generate a short acknowledgment message (2-3 sentences) that:
1. Thanks the citizen for reporting
2. Acknowledges the issue
3. Mentions next steps

Keep it professional and empathetic.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful civic service representative."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Response Generation Error:', error.message);
    return `Thank you for reporting this ${report.category} issue. Our team has been notified and will investigate shortly. We appreciate your contribution to making our city better.`;
  }
};
