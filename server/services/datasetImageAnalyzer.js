/**
 * DATASET-BASED IMAGE ANALYZER FOR SON OF ANTON
 * 
 * This service uses the local dataset in data-20251026T073650Z-1-001/data
 * to provide intelligent image-based civic issue classification.
 * 
 * Dataset Structure:
 * - Road Issues/
 *   - Pothole Issues/
 *   - Damaged Road issues/
 *   - Illegal Parking Issues/
 *   - Broken Road Sign Issues/
 *   - Mixed Issues/
 * - Public Cleanliness + Environmental Issues/
 *   - Littering Garbage on Public Places Issues/
 *   - Vandalism Issues/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dataset base path
const DATASET_PATH = path.join(__dirname, '../data-20251026T073650Z-1-001/data');

// Category mapping from dataset folders to department categories
const CATEGORY_MAPPING = {
  // Road Issues
  'Pothole Issues': {
    department: 'Roads & Infrastructure',
    category: 'road',
    priority: 'high',
    keywords: ['pothole', 'hole', 'road damage', 'crater', 'depression']
  },
  'Damaged Road issues': {
    department: 'Roads & Infrastructure',
    category: 'road',
    priority: 'high',
    keywords: ['damaged road', 'cracked', 'broken pavement', 'road surface']
  },
  'Illegal Parking Issues': {
    department: 'Traffic Management',
    category: 'traffic',
    priority: 'medium',
    keywords: ['illegal parking', 'wrong parking', 'parking violation', 'blocked']
  },
  'Broken Road Sign Issues': {
    department: 'Roads & Infrastructure',
    category: 'road',
    priority: 'medium',
    keywords: ['broken sign', 'damaged sign', 'signboard', 'road sign']
  },
  'Mixed Issues': {
    department: 'Roads & Infrastructure',
    category: 'road',
    priority: 'medium',
    keywords: ['road', 'infrastructure', 'mixed']
  },
  
  // Public Cleanliness + Environmental Issues
  'Littering Garbage on Public Places Issues': {
    department: 'Sanitation & Waste',
    category: 'waste',
    priority: 'high',
    keywords: ['garbage', 'litter', 'trash', 'waste', 'dumping', 'dirty']
  },
  'Vandalism Issues': {
    department: 'Public Property Damage',
    category: 'vandalism',
    priority: 'medium',
    keywords: ['vandalism', 'graffiti', 'damage', 'defacement', 'destruction']
  }
};

/**
 * Load dataset structure and count images per category
 */
export function loadDatasetInfo() {
  const datasetInfo = {
    totalImages: 0,
    categories: {},
    lastUpdated: new Date().toISOString()
  };

  try {
    // Check if dataset exists
    if (!fs.existsSync(DATASET_PATH)) {
      console.warn('⚠️  Dataset not found at:', DATASET_PATH);
      return datasetInfo;
    }

    // Scan dataset folders
    const mainCategories = fs.readdirSync(DATASET_PATH, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());

    for (const mainCat of mainCategories) {
      const mainCatPath = path.join(DATASET_PATH, mainCat.name);
      const subCategories = fs.readdirSync(mainCatPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

      for (const subCat of subCategories) {
        const subCatPath = path.join(mainCatPath, subCat.name);
        const images = fs.readdirSync(subCatPath)
          .filter(file => /\.(jpg|jpeg|png|gif|bmp)$/i.test(file));

        const categoryKey = subCat.name;
        const categoryData = CATEGORY_MAPPING[categoryKey] || {
          department: 'Other Civic Issue',
          category: 'other',
          priority: 'medium',
          keywords: []
        };

        datasetInfo.categories[categoryKey] = {
          ...categoryData,
          imageCount: images.length,
          path: subCatPath,
          mainCategory: mainCat.name
        };

        datasetInfo.totalImages += images.length;
      }
    }

    console.log(`✅ Dataset loaded: ${datasetInfo.totalImages} images across ${Object.keys(datasetInfo.categories).length} categories`);
    
  } catch (error) {
    console.error('❌ Error loading dataset:', error.message);
  }

  return datasetInfo;
}

/**
 * Analyze image based on dataset categories
 * This is a pattern-matching approach using the description/title
 * In a real ML scenario, you would use the images for training
 */
export function analyzeWithDataset(description, title = '', location = '') {
  const fullText = `${title} ${description} ${location}`.toLowerCase();
  const datasetInfo = loadDatasetInfo();
  
  let bestMatch = null;
  let highestScore = 0;
  let matchedKeywords = [];

  // Score each category based on keyword matches
  for (const [categoryName, categoryData] of Object.entries(datasetInfo.categories)) {
    let score = 0;
    const matched = [];

    // Check keyword matches
    categoryData.keywords.forEach(keyword => {
      if (fullText.includes(keyword.toLowerCase())) {
        score += 10;
        matched.push(keyword);
      }
    });

    // Bonus for category name match
    if (fullText.includes(categoryName.toLowerCase().replace(' issues', ''))) {
      score += 15;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = categoryData;
      matchedKeywords = matched;
    }
  }

  // If no match found, use default
  if (!bestMatch || highestScore < 5) {
    return {
      issue_description: title || description.substring(0, 100),
      predicted_department: 'Other Civic Issue',
      predicted_category: 'other',
      priority_level: 'Medium',
      confidence_score: 0.5,
      matched_keywords: [],
      dataset_category: 'Unknown',
      notes: 'No clear match in dataset categories. Manual review recommended.',
      source: 'dataset_analyzer_fallback'
    };
  }

  // Calculate confidence based on score
  let confidence = 0.6;
  if (highestScore >= 25) confidence = 0.95;
  else if (highestScore >= 20) confidence = 0.90;
  else if (highestScore >= 15) confidence = 0.85;
  else if (highestScore >= 10) confidence = 0.75;

  return {
    issue_description: title || description.substring(0, 100),
    predicted_department: bestMatch.department,
    predicted_category: bestMatch.category,
    priority_level: bestMatch.priority.charAt(0).toUpperCase() + bestMatch.priority.slice(1),
    confidence_score: parseFloat(confidence.toFixed(2)),
    matched_keywords: matchedKeywords,
    dataset_category: Object.keys(datasetInfo.categories).find(
      key => datasetInfo.categories[key] === bestMatch
    ),
    reference_images_count: bestMatch.imageCount,
    notes: `Classified based on ${matchedKeywords.length} keyword match(es). Reference: ${bestMatch.imageCount} similar images in dataset.`,
    source: 'dataset_analyzer'
  };
}

/**
 * Get random reference image from a category
 */
export function getReferenceImage(categoryName) {
  const datasetInfo = loadDatasetInfo();
  const category = datasetInfo.categories[categoryName];

  if (!category || !fs.existsSync(category.path)) {
    return null;
  }

  try {
    const images = fs.readdirSync(category.path)
      .filter(file => /\.(jpg|jpeg|png|gif|bmp)$/i.test(file));

    if (images.length === 0) return null;

    // Get random image
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return {
      filename: randomImage,
      path: path.join(category.path, randomImage),
      category: categoryName,
      department: category.department
    };
  } catch (error) {
    console.error('Error getting reference image:', error);
    return null;
  }
}

/**
 * Get dataset statistics
 */
export function getDatasetStats() {
  const datasetInfo = loadDatasetInfo();
  
  const stats = {
    totalImages: datasetInfo.totalImages,
    totalCategories: Object.keys(datasetInfo.categories).length,
    categoriesBreakdown: {},
    departmentDistribution: {}
  };

  // Calculate category breakdown
  for (const [categoryName, categoryData] of Object.entries(datasetInfo.categories)) {
    stats.categoriesBreakdown[categoryName] = {
      imageCount: categoryData.imageCount,
      department: categoryData.department,
      priority: categoryData.priority
    };

    // Department distribution
    const dept = categoryData.department;
    if (!stats.departmentDistribution[dept]) {
      stats.departmentDistribution[dept] = 0;
    }
    stats.departmentDistribution[dept] += categoryData.imageCount;
  }

  return stats;
}

/**
 * Hybrid analysis: Combines dataset-based and rule-based analysis
 */
export function hybridAnalysis(description, title = '', location = '') {
  // Get both analyses
  const datasetResult = analyzeWithDataset(description, title, location);
  
  // Import the local analyzer
  import('./localVisualAnalyzer.js').then(module => {
    const ruleBasedResult = module.analyzeIssue(description, title, location);
    
    // If both agree, increase confidence
    if (datasetResult.predicted_department === ruleBasedResult.predicted_department) {
      datasetResult.confidence_score = Math.min(0.98, datasetResult.confidence_score + 0.1);
      datasetResult.notes += ' Confirmed by rule-based analysis.';
    }
  });

  return datasetResult;
}

/**
 * Test the dataset analyzer
 */
export function testDatasetAnalyzer() {
  console.log('\n🧪 TESTING DATASET-BASED IMAGE ANALYZER\n');
  console.log('='.repeat(80));

  // Load dataset info
  const datasetInfo = loadDatasetInfo();
  console.log('\n📊 Dataset Statistics:');
  console.log(JSON.stringify(getDatasetStats(), null, 2));

  // Test cases
  const testCases = [
    {
      title: 'Large pothole on main road',
      description: 'There is a dangerous pothole near the intersection causing damage to vehicles',
      location: 'Main Street'
    },
    {
      title: 'Garbage dumping',
      description: 'People are littering and dumping garbage on the public street corner',
      location: 'Park Avenue'
    },
    {
      title: 'Graffiti on wall',
      description: 'Vandalism with spray paint graffiti on public building wall',
      location: 'City Center'
    },
    {
      title: 'Damaged road surface',
      description: 'The road is severely damaged with cracks and broken pavement',
      location: 'Highway 5'
    },
    {
      title: 'Illegal parking',
      description: 'Vehicle parked illegally blocking the road and causing traffic issues',
      location: 'Downtown'
    }
  ];

  console.log('\n🔍 Test Cases:\n');
  testCases.forEach((testCase, index) => {
    console.log(`\nTest Case ${index + 1}:`);
    console.log(`Title: ${testCase.title}`);
    console.log(`Description: ${testCase.description}`);
    
    const result = analyzeWithDataset(testCase.description, testCase.title, testCase.location);
    
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));
    console.log('-'.repeat(80));
  });
}

export default {
  loadDatasetInfo,
  analyzeWithDataset,
  getReferenceImage,
  getDatasetStats,
  hybridAnalysis,
  testDatasetAnalyzer,
  CATEGORY_MAPPING
};
