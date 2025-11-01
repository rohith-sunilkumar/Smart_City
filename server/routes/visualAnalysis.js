/**
 * VISUAL ANALYSIS API ROUTES
 * 
 * Provides endpoints for analyzing civic issue images and descriptions
 * using the local visual analyzer (no external APIs required)
 */

import express from 'express';
import { analyzeIssue, analyzeBatch, testClassifier, getDepartments, getPriorityLevels } from '../services/localVisualAnalyzer.js';
import { 
  analyzeWithDataset, 
  getDatasetStats, 
  hybridAnalysis, 
  testDatasetAnalyzer,
  getReferenceImage 
} from '../services/datasetImageAnalyzer.js';

const router = express.Router();

// ============================================================================
// ANALYZE SINGLE ISSUE
// ============================================================================

/**
 * POST /api/visual-analysis/analyze
 * 
 * Analyzes a single civic issue and returns classification
 * 
 * Body:
 * {
 *   "description": "Description of the issue",
 *   "title": "Optional title",
 *   "location": "Optional location"
 * }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { description, title, location } = req.body;
    
    // Validate input
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }
    
    // Analyze the issue
    const result = analyzeIssue(
      description,
      title || '',
      location || ''
    );
    
    // Return result
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Visual Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze issue',
      message: error.message
    });
  }
});

// ============================================================================
// ANALYZE BATCH OF ISSUES
// ============================================================================

/**
 * POST /api/visual-analysis/analyze-batch
 * 
 * Analyzes multiple civic issues at once
 * 
 * Body:
 * {
 *   "issues": [
 *     {
 *       "description": "Issue 1 description",
 *       "title": "Optional title",
 *       "location": "Optional location"
 *     },
 *     ...
 *   ]
 * }
 */
router.post('/analyze-batch', async (req, res) => {
  try {
    const { issues } = req.body;
    
    // Validate input
    if (!Array.isArray(issues) || issues.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Issues array is required'
      });
    }
    
    // Limit batch size
    if (issues.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 issues per batch'
      });
    }
    
    // Analyze all issues
    const results = analyzeBatch(issues);
    
    // Return results
    res.json({
      success: true,
      data: results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Batch Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze issues',
      message: error.message
    });
  }
});

// ============================================================================
// GET AVAILABLE DEPARTMENTS
// ============================================================================

/**
 * GET /api/visual-analysis/departments
 * 
 * Returns list of all available department categories
 */
router.get('/departments', (req, res) => {
  try {
    const departments = getDepartments();
    
    res.json({
      success: true,
      data: departments,
      count: departments.length
    });
  } catch (error) {
    console.error('Get Departments Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get departments',
      message: error.message
    });
  }
});

// ============================================================================
// GET PRIORITY LEVELS
// ============================================================================

/**
 * GET /api/visual-analysis/priorities
 * 
 * Returns list of all priority levels
 */
router.get('/priorities', (req, res) => {
  try {
    const priorities = getPriorityLevels();
    
    res.json({
      success: true,
      data: priorities,
      count: priorities.length
    });
  } catch (error) {
    console.error('Get Priorities Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get priorities',
      message: error.message
    });
  }
});

// ============================================================================
// TEST ENDPOINT (Development only)
// ============================================================================

/**
 * GET /api/visual-analysis/test
 * 
 * Runs test cases to verify the classifier is working
 */
router.get('/test', (req, res) => {
  try {
    // Capture console output
    const originalLog = console.log;
    let output = '';
    
    console.log = (...args) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };
    
    // Run tests
    testClassifier();
    
    // Restore console.log
    console.log = originalLog;
    
    res.json({
      success: true,
      message: 'Test completed successfully',
      output: output
    });
  } catch (error) {
    console.error('Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message
    });
  }
});

// ============================================================================
// DATASET-BASED ANALYSIS
// ============================================================================

/**
 * POST /api/visual-analysis/analyze-with-dataset
 * 
 * Analyzes issue using the local dataset for reference
 */
router.post('/analyze-with-dataset', async (req, res) => {
  try {
    const { description, title, location } = req.body;
    
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }
    
    const result = analyzeWithDataset(description, title || '', location || '');
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Dataset Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze with dataset',
      message: error.message
    });
  }
});

/**
 * POST /api/visual-analysis/hybrid-analyze
 * 
 * Combines dataset-based and rule-based analysis for best results
 */
router.post('/hybrid-analyze', async (req, res) => {
  try {
    const { description, title, location } = req.body;
    
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }
    
    const result = hybridAnalysis(description, title || '', location || '');
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Hybrid Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform hybrid analysis',
      message: error.message
    });
  }
});

/**
 * GET /api/visual-analysis/dataset-stats
 * 
 * Returns statistics about the local dataset
 */
router.get('/dataset-stats', (req, res) => {
  try {
    const stats = getDatasetStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dataset Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dataset statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/visual-analysis/test-dataset
 * 
 * Tests the dataset analyzer
 */
router.get('/test-dataset', (req, res) => {
  try {
    const originalLog = console.log;
    let output = '';
    
    console.log = (...args) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };
    
    testDatasetAnalyzer();
    
    console.log = originalLog;
    
    res.json({
      success: true,
      message: 'Dataset analyzer test completed',
      output: output
    });
  } catch (error) {
    console.error('Dataset Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Dataset test failed',
      message: error.message
    });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/visual-analysis/health
 * 
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'Local Visual Analyzer with Dataset Support',
    version: '2.0.0',
    features: ['rule-based', 'dataset-based', 'hybrid'],
    timestamp: new Date().toISOString()
  });
});

export default router;
