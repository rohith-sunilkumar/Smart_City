/**
 * LOCAL VISUAL ANALYSIS SERVICE FOR SON OF ANTON
 * 
 * This service provides intelligent civic issue classification WITHOUT requiring
 * external APIs like GPT, OpenAI, or any cloud services.
 * 
 * It uses:
 * - Advanced rule-based pattern matching
 * - Keyword analysis with context awareness
 * - Multi-factor scoring system
 * - Safety-first priority detection
 */

// ============================================================================
// DEPARTMENT CATEGORIES (Exact labels as specified)
// ============================================================================

const DEPARTMENTS = {
  ROADS_INFRASTRUCTURE: 'Roads & Infrastructure',
  STREET_LIGHTING: 'Street Lighting & Electricity',
  SANITATION_WASTE: 'Sanitation & Waste',
  DRAINAGE_SEWAGE: 'Drainage & Sewage',
  WATER_SUPPLY: 'Water Supply',
  ENVIRONMENT_PARKS: 'Environment & Parks',
  CONSTRUCTION_SAFETY: 'Construction & Public Safety',
  PUBLIC_PROPERTY: 'Public Property Damage',
  ANIMAL_CONTROL: 'Animal Control',
  FIRE_EMERGENCY: 'Hospital Emergency',  // Changed to Hospital Emergency (includes accidents, fire, medical)
  TRAFFIC_MANAGEMENT: 'Traffic Management',
  OTHER: 'Other Civic Issue'
};

// ============================================================================
// PRIORITY LEVELS
// ============================================================================

const PRIORITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

// ============================================================================
// COMPREHENSIVE KEYWORD DATABASE
// ============================================================================

const KEYWORD_DATABASE = {
  [DEPARTMENTS.ROADS_INFRASTRUCTURE]: {
    primary: [
      'pothole', 'potholes', 'road damage', 'road crack', 'cracked road',
      'damaged road', 'broken road', 'uneven road', 'road surface',
      'pavement', 'asphalt', 'sidewalk', 'footpath', 'walkway',
      'manhole', 'manhole cover', 'road collapse', 'sinkhole',
      'road barrier', 'traffic barrier', 'divider', 'median',
      'curb', 'kerb', 'road edge', 'shoulder'
    ],
    secondary: [
      'street', 'highway', 'lane', 'intersection', 'crossing',
      'bridge', 'overpass', 'underpass', 'tunnel', 'flyover'
    ],
    critical: [
      'large pothole', 'deep pothole', 'major road damage',
      'road collapse', 'dangerous pothole', 'open manhole',
      'missing manhole cover', 'exposed manhole'
    ]
  },

  [DEPARTMENTS.STREET_LIGHTING]: {
    primary: [
      'streetlight', 'street light', 'lamp post', 'light pole',
      'broken light', 'light not working', 'no light', 'dark street',
      'lamp', 'lighting', 'illumination', 'street lamp',
      'exposed wire', 'hanging wire', 'electrical wire',
      'power line', 'electric pole', 'electricity pole',
      'transformer', 'electrical box', 'power box'
    ],
    secondary: [
      'flickering light', 'dim light', 'light out',
      'bulb', 'fixture', 'cable', 'wiring'
    ],
    critical: [
      'exposed electrical wire', 'hanging wire', 'exposed wire',
      'sparking', 'electric shock', 'live wire', 'short circuit',
      'fallen pole', 'damaged transformer'
    ]
  },

  [DEPARTMENTS.SANITATION_WASTE]: {
    primary: [
      'garbage', 'trash', 'waste', 'rubbish', 'litter',
      'garbage pile', 'trash heap', 'waste accumulation',
      'overflowing bin', 'overflowing dustbin', 'full bin',
      'garbage bin', 'trash can', 'dustbin', 'dumpster',
      'open dumping', 'illegal dumping', 'waste disposal',
      'dead animal', 'carcass', 'rotting', 'decomposing',
      'unhygienic', 'unsanitary', 'filth', 'dirty'
    ],
    secondary: [
      'smell', 'odor', 'stink', 'foul', 'flies', 'insects',
      'rats', 'rodents', 'pests', 'vermin'
    ],
    critical: [
      'large garbage pile', 'massive waste', 'health hazard',
      'toxic waste', 'hazardous waste', 'medical waste',
      'dead animal', 'decomposing'
    ]
  },

  [DEPARTMENTS.DRAINAGE_SEWAGE]: {
    primary: [
      'drainage', 'drain', 'blocked drain', 'clogged drain',
      'drainage block', 'drainage blockage', 'drain overflow',
      'stagnant water', 'standing water', 'water pooling',
      'flooding', 'waterlogging', 'water accumulation',
      'sewage', 'sewer', 'open sewer', 'sewage overflow',
      'sewage leak', 'manhole overflow', 'gutter'
    ],
    secondary: [
      'rainwater', 'storm drain', 'culvert', 'channel',
      'water flow', 'drainage system'
    ],
    critical: [
      'major flooding', 'sewage overflow', 'open sewer',
      'sewage on road', 'health hazard', 'contamination',
      'breeding ground', 'mosquito breeding'
    ]
  },

  [DEPARTMENTS.WATER_SUPPLY]: {
    primary: [
      'water leak', 'pipe leak', 'leaking pipe', 'burst pipe',
      'broken pipe', 'water pipe', 'pipeline',
      'water supply', 'no water', 'water shortage',
      'water contamination', 'dirty water', 'contaminated water',
      'water pressure', 'low pressure', 'water main',
      'water line', 'water connection', 'tap', 'faucet'
    ],
    secondary: [
      'water meter', 'valve', 'hydrant', 'water tank',
      'overhead tank', 'water storage'
    ],
    critical: [
      'burst pipe', 'major leak', 'water main break',
      'no water supply', 'contaminated water', 'toxic water',
      'water emergency'
    ]
  },

  [DEPARTMENTS.ENVIRONMENT_PARKS]: {
    primary: [
      'fallen tree', 'tree fall', 'tree branch', 'broken branch',
      'tree damage', 'uprooted tree', 'dead tree',
      'park', 'garden', 'playground', 'public park',
      'damaged bench', 'broken bench', 'park bench',
      'unmaintained park', 'overgrown', 'wild growth',
      'illegal burning', 'burning waste', 'smoke',
      'deforestation', 'tree cutting', 'illegal logging'
    ],
    secondary: [
      'greenery', 'plants', 'grass', 'lawn', 'landscaping',
      'flower bed', 'shrub', 'hedge'
    ],
    critical: [
      'fallen tree blocking road', 'tree on power line',
      'dangerous tree', 'unstable tree', 'illegal burning',
      'large scale deforestation'
    ]
  },

  [DEPARTMENTS.CONSTRUCTION_SAFETY]: {
    primary: [
      'construction debris', 'construction waste', 'building material',
      'rubble', 'demolition waste', 'construction site',
      'unsafe building', 'damaged building', 'building collapse',
      'cracked wall', 'structural damage', 'unsafe structure',
      'open pit', 'excavation', 'digging', 'trench',
      'scaffolding', 'unsafe scaffolding', 'construction hazard'
    ],
    secondary: [
      'construction', 'building', 'renovation', 'repair work',
      'maintenance work', 'civil work'
    ],
    critical: [
      'building collapse', 'structural failure', 'unsafe building',
      'open pit', 'deep excavation', 'unsafe scaffolding',
      'falling debris', 'construction accident'
    ]
  },

  [DEPARTMENTS.PUBLIC_PROPERTY]: {
    primary: [
      'vandalism', 'graffiti', 'defacement', 'damage',
      'broken sign', 'damaged sign', 'signboard', 'signage',
      'bus stop', 'bus shelter', 'damaged bus stop',
      'broken wall', 'damaged wall', 'public wall',
      'broken fence', 'damaged fence', 'railing',
      'public property', 'government property', 'civic property'
    ],
    secondary: [
      'paint', 'spray paint', 'marking', 'scratches',
      'broken glass', 'shattered', 'destroyed'
    ],
    critical: [
      'major vandalism', 'destroyed property', 'safety hazard',
      'broken glass', 'sharp edges', 'dangerous damage'
    ]
  },

  [DEPARTMENTS.ANIMAL_CONTROL]: {
    primary: [
      'stray dog', 'stray dogs', 'stray animal', 'stray animals',
      'stray cat', 'loose dog', 'aggressive dog', 'dog attack',
      'rabid dog', 'mad dog', 'dog bite', 'animal bite',
      'injured animal', 'hurt animal', 'wounded animal',
      'dead animal', 'animal carcass', 'animal disturbance',
      'animal menace', 'dog menace', 'cattle', 'cow', 'bull',
      'dead dog', 'dead cat', 'animal on road', 'carcass on road'
    ],
    secondary: [
      'pet', 'domestic animal', 'wild animal', 'monkey',
      'snake', 'bird', 'pigeon', 'dog', 'cat', 'animal'
    ],
    critical: [
      'aggressive dog', 'rabid dog', 'dog attack', 'animal attack',
      'injured animal', 'dead animal on road', 'dangerous animal',
      'animal bite incident', 'dead dog', 'dead cat', 'dead animal'
    ]
  },

  [DEPARTMENTS.FIRE_EMERGENCY]: {
    primary: [
      'fire', 'fire outbreak', 'burning', 'flames', 'blaze',
      'smoke', 'heavy smoke', 'fire hazard', 'fire risk',
      'explosion', 'blast', 'gas leak', 'gas explosion',
      'vehicle fire', 'car fire', 'building fire', 'house fire',
      // Medical/Accident emergencies
      'accident', 'road accident', 'car accident', 'vehicle accident',
      'collision', 'crash', 'hit and run', 'emergency',
      'injured', 'injury', 'casualties', 'victim', 'victims',
      'ambulance needed', 'medical emergency', 'hospital emergency',
      'person injured', 'people injured', 'hurt', 'wounded'
    ],
    secondary: [
      'heat', 'hot', 'smoldering', 'ember', 'ash',
      'burnt', 'charred', 'scorched',
      'medical', 'hospital', 'ambulance', 'paramedic'
    ],
    critical: [
      'active fire', 'fire outbreak', 'large fire', 'spreading fire',
      'explosion', 'gas leak', 'fire emergency', 'people trapped',
      'building on fire', 'major fire',
      // Critical accident keywords
      'road accident', 'serious accident', 'major accident',
      'fatal accident', 'severe injury', 'critical injury',
      'multiple casualties', 'person trapped', 'medical emergency'
    ]
  },

  [DEPARTMENTS.TRAFFIC_MANAGEMENT]: {
    primary: [
      'traffic signal', 'traffic light', 'signal malfunction',
      'signal not working', 'broken signal', 'traffic light out',
      'illegal parking', 'wrong parking', 'parking violation',
      'vehicle blocking', 'road blockage', 'traffic jam',
      'traffic congestion', 'traffic hazard', 'traffic problem',
      'zebra crossing', 'pedestrian crossing', 'crosswalk',
      'speed breaker', 'speed bump', 'road hump'
    ],
    secondary: [
      'traffic', 'vehicles', 'cars', 'traffic flow',
      'road safety', 'pedestrian safety'
    ],
    critical: [
      'signal malfunction', 'no traffic signal', 'traffic chaos',
      'major congestion', 'accident prone', 'safety hazard',
      'dangerous intersection'
    ]
  }
};

// ============================================================================
// PRIORITY INDICATORS
// ============================================================================

const PRIORITY_INDICATORS = {
  HIGH: [
    // Safety threats
    'danger', 'dangerous', 'hazard', 'hazardous', 'unsafe', 'risk',
    'life threatening', 'critical', 'emergency', 'urgent', 'immediate',
    
    // Severity
    'major', 'large', 'massive', 'huge', 'severe', 'serious',
    'extensive', 'widespread', 'significant',
    
    // Active threats
    'active', 'ongoing', 'spreading', 'growing', 'worsening',
    'collapsing', 'falling', 'breaking',
    
    // Human impact
    'accident', 'injury', 'injured', 'hurt', 'trapped', 'stuck',
    'blocking', 'blocked', 'impassable', 'blocking road',
    
    // Health hazards
    'health hazard', 'contamination', 'toxic', 'poisonous',
    'disease', 'infection', 'breeding ground', 'contaminated',
    
    // Specific critical issues
    'exposed wire', 'live wire', 'open manhole', 'burst pipe',
    'gas leak', 'fire', 'explosion', 'collapse', 'flooding',
    'sparking', 'dead animal', 'signal malfunction', 'no signal',
    'fallen tree', 'tree blocking'
  ],
  
  MEDIUM: [
    'moderate', 'medium', 'considerable', 'noticeable',
    'needs attention', 'should fix', 'requires repair',
    'broken', 'damaged', 'not working', 'malfunction',
    'overflow', 'leaking', 'blocked', 'clogged',
    'inconvenience', 'problem', 'issue', 'concern'
  ],
  
  LOW: [
    'minor', 'small', 'little', 'slight', 'cosmetic',
    'aesthetic', 'appearance', 'looks', 'faded',
    'worn', 'old', 'needs maintenance', 'routine',
    'regular', 'normal', 'standard', 'graffiti', 'paint'
  ]
};

// ============================================================================
// CONTEXT PHRASES (Help understand the full picture)
// ============================================================================

const CONTEXT_PHRASES = {
  location: [
    'on the road', 'in the street', 'near', 'at', 'beside',
    'in front of', 'behind', 'next to', 'opposite', 'around'
  ],
  
  time: [
    'since', 'for days', 'for weeks', 'for months', 'recently',
    'yesterday', 'today', 'now', 'currently', 'ongoing'
  ],
  
  impact: [
    'causing', 'leading to', 'resulting in', 'creating',
    'affecting', 'impacting', 'disturbing', 'preventing'
  ],
  
  people: [
    'people', 'citizens', 'residents', 'pedestrians', 'children',
    'elderly', 'disabled', 'commuters', 'public', 'community'
  ]
};

// ============================================================================
// SCORING SYSTEM
// ============================================================================

/**
 * Analyzes text and calculates department scores
 */
function analyzeText(text) {
  const lowerText = text.toLowerCase();
  const scores = {};
  
  // Initialize scores for all departments
  Object.values(DEPARTMENTS).forEach(dept => {
    scores[dept] = 0;
  });
  
  // Score each department based on keyword matches
  for (const [department, keywords] of Object.entries(KEYWORD_DATABASE)) {
    // Primary keywords (high weight)
    keywords.primary.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        scores[department] += 10;
      }
    });
    
    // Secondary keywords (medium weight)
    keywords.secondary.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        scores[department] += 5;
      }
    });
    
    // Critical keywords (bonus points + priority flag)
    keywords.critical.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        scores[department] += 15;
      }
    });
  }
  
  return scores;
}

/**
 * Determines priority level based on text analysis
 */
function analyzePriority(text) {
  const lowerText = text.toLowerCase();
  
  // Health-related keywords that trigger HIGH priority
  const healthKeywords = [
    'health', 'medical', 'hospital', 'emergency', 'ambulance',
    'accident', 'injury', 'injured', 'hurt', 'wounded', 'casualties',
    'disease', 'infection', 'contamination', 'contaminated', 'toxic',
    'poisonous', 'health hazard', 'breeding ground', 'epidemic',
    'sick', 'illness', 'patient', 'victim', 'fatal', 'death',
    'sanitation', 'hygiene', 'unhygienic', 'unsanitary', 'sewage',
    'water contamination', 'food poisoning', 'outbreak'
  ];
  
  // Check for health-related issues first - ALWAYS HIGH PRIORITY
  for (const keyword of healthKeywords) {
    if (lowerText.includes(keyword)) {
      return PRIORITY.HIGH;
    }
  }
  
  let highScore = 0;
  let mediumScore = 0;
  let lowScore = 0;
  
  // Count priority indicators
  PRIORITY_INDICATORS.HIGH.forEach(indicator => {
    if (lowerText.includes(indicator.toLowerCase())) {
      highScore += 3;
    }
  });
  
  PRIORITY_INDICATORS.MEDIUM.forEach(indicator => {
    if (lowerText.includes(indicator.toLowerCase())) {
      mediumScore += 2;
    }
  });
  
  PRIORITY_INDICATORS.LOW.forEach(indicator => {
    if (lowerText.includes(indicator.toLowerCase())) {
      lowScore += 1;
    }
  });
  
  // Determine priority
  if (highScore >= 3) return PRIORITY.HIGH;
  if (highScore > 0) return PRIORITY.HIGH;
  if (mediumScore >= 4) return PRIORITY.MEDIUM;
  if (lowScore >= 3) return PRIORITY.LOW;
  
  // Default to medium if unclear
  return PRIORITY.MEDIUM;
}

/**
 * Calculates confidence score based on match strength
 */
function calculateConfidence(topScore, secondScore, totalMatches) {
  // Base confidence
  let confidence = 0.5;
  
  // Strong match
  if (topScore >= 20) confidence = 0.95;
  else if (topScore >= 15) confidence = 0.90;
  else if (topScore >= 10) confidence = 0.85;
  else if (topScore >= 5) confidence = 0.75;
  
  // Clear winner (big gap between top and second)
  const gap = topScore - secondScore;
  if (gap >= 15) confidence = Math.min(0.98, confidence + 0.05);
  else if (gap >= 10) confidence = Math.min(0.95, confidence + 0.03);
  
  // Multiple matches increase confidence
  if (totalMatches >= 5) confidence = Math.min(0.97, confidence + 0.02);
  
  return confidence;
}

/**
 * Generates reasoning for the classification
 */
function generateReasoning(department, priority, matchDetails) {
  const reasons = [];
  
  // Department reasoning
  if (matchDetails.primaryMatches > 0) {
    reasons.push(`Detected ${matchDetails.primaryMatches} primary indicator(s) for ${department}`);
  }
  
  if (matchDetails.criticalMatches > 0) {
    reasons.push(`Found ${matchDetails.criticalMatches} critical safety indicator(s)`);
  }
  
  // Priority reasoning
  if (priority === PRIORITY.HIGH) {
    reasons.push('High priority due to immediate risk to public safety or property');
  } else if (priority === PRIORITY.MEDIUM) {
    reasons.push('Medium priority - significant inconvenience requiring attention');
  } else {
    reasons.push('Low priority - minor maintenance issue');
  }
  
  return reasons.join('. ') + '.';
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyzes civic issue image/description and returns classification
 * 
 * @param {string} description - Text description of the issue
 * @param {string} title - Optional title/summary
 * @param {string} location - Optional location info
 * @returns {Object} Classification result with department, priority, confidence
 */
export function analyzeIssue(description, title = '', location = '') {
  // Combine all text
  const fullText = `${title} ${description} ${location}`.trim();
  
  if (!fullText) {
    return {
      issue_description: 'No description provided',
      predicted_department: DEPARTMENTS.OTHER,
      priority_level: PRIORITY.MEDIUM,
      confidence_score: 0.3,
      notes: 'Insufficient information for accurate classification'
    };
  }
  
  // Analyze text for department scores
  const scores = analyzeText(fullText);
  
  // Find top 2 departments
  const sortedDepts = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  
  const topDepartment = sortedDepts[0][0];
  const topScore = sortedDepts[0][1];
  const secondScore = sortedDepts[1] ? sortedDepts[1][1] : 0;
  
  // Determine priority
  const priority = analyzePriority(fullText);
  
  // Calculate confidence
  const totalMatches = Math.floor(topScore / 5);
  const confidence = calculateConfidence(topScore, secondScore, totalMatches);
  
  // Count match types for reasoning
  const matchDetails = {
    primaryMatches: 0,
    secondaryMatches: 0,
    criticalMatches: 0
  };
  
  const lowerText = fullText.toLowerCase();
  const deptKeywords = KEYWORD_DATABASE[topDepartment];
  
  if (deptKeywords) {
    deptKeywords.primary.forEach(kw => {
      if (lowerText.includes(kw.toLowerCase())) matchDetails.primaryMatches++;
    });
    deptKeywords.secondary.forEach(kw => {
      if (lowerText.includes(kw.toLowerCase())) matchDetails.secondaryMatches++;
    });
    deptKeywords.critical.forEach(kw => {
      if (lowerText.includes(kw.toLowerCase())) matchDetails.criticalMatches++;
    });
  }
  
  // Generate reasoning
  const reasoning = generateReasoning(topDepartment, priority, matchDetails);
  
  // Create short description
  const issueDescription = title || description.substring(0, 100) + (description.length > 100 ? '...' : '');
  
  // If no clear match, classify as Other
  const finalDepartment = topScore >= 5 ? topDepartment : DEPARTMENTS.OTHER;
  const finalConfidence = topScore >= 5 ? confidence : 0.6;
  
  return {
    issue_description: issueDescription,
    predicted_department: finalDepartment,
    priority_level: priority,
    confidence_score: parseFloat(finalConfidence.toFixed(2)),
    notes: reasoning
  };
}

// ============================================================================
// BATCH ANALYSIS (for multiple issues)
// ============================================================================

/**
 * Analyzes multiple issues at once
 */
export function analyzeBatch(issues) {
  return issues.map(issue => {
    return analyzeIssue(
      issue.description || '',
      issue.title || '',
      issue.location || ''
    );
  });
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export const testClassifier = () => {
  const testCases = [
    {
      title: 'Large pothole on main road',
      description: 'There is a dangerous pothole near the intersection causing accidents',
      location: 'Main Street'
    },
    {
      title: 'Garbage overflow',
      description: 'Overflowing garbage pile on street corner with foul smell',
      location: 'Park Avenue'
    },
    {
      title: 'Stagnant water',
      description: 'Blocked drainage system with stagnant water, mosquito breeding ground',
      location: 'Residential Area'
    },
    {
      title: 'Broken streetlight',
      description: 'Street light not working, area is very dark at night',
      location: '5th Avenue'
    },
    {
      title: 'Water pipe burst',
      description: 'Major water leak from burst pipe, water supply disrupted',
      location: 'Central District'
    }
  ];
  
  console.log('\n🧪 TESTING LOCAL VISUAL ANALYZER\n');
  console.log('='.repeat(80));
  
  testCases.forEach((testCase, index) => {
    console.log(`\nTest Case ${index + 1}:`);
    console.log(`Title: ${testCase.title}`);
    console.log(`Description: ${testCase.description}`);
    
    const result = analyzeIssue(testCase.description, testCase.title, testCase.location);
    
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));
    console.log('-'.repeat(80));
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all available departments
 */
export function getDepartments() {
  return Object.values(DEPARTMENTS);
}

/**
 * Get priority levels
 */
export function getPriorityLevels() {
  return Object.values(PRIORITY);
}

/**
 * Validate classification result
 */
export function validateClassification(result) {
  const validDepartments = Object.values(DEPARTMENTS);
  const validPriorities = Object.values(PRIORITY);
  
  return {
    isValid: 
      validDepartments.includes(result.predicted_department) &&
      validPriorities.includes(result.priority_level) &&
      result.confidence_score >= 0 &&
      result.confidence_score <= 1,
    errors: []
  };
}

export default {
  analyzeIssue,
  analyzeBatch,
  testClassifier,
  getDepartments,
  getPriorityLevels,
  validateClassification,
  DEPARTMENTS,
  PRIORITY
};
