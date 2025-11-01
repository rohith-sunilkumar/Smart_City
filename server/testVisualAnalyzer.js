#!/usr/bin/env node

/**
 * TEST SCRIPT FOR LOCAL VISUAL ANALYZER
 * 
 * Run this script to test the visual analyzer without starting the server
 */

import { analyzeIssue, testClassifier } from './services/localVisualAnalyzer.js';

console.log('\n' + '='.repeat(80));
console.log('🧪 LOCAL VISUAL ANALYZER - TEST SUITE');
console.log('='.repeat(80) + '\n');

// Run built-in tests
console.log('📋 Running built-in test cases...\n');
testClassifier();

// Additional custom tests
console.log('\n' + '='.repeat(80));
console.log('🎯 CUSTOM TEST CASES');
console.log('='.repeat(80) + '\n');

const customTests = [
  {
    title: 'Exposed electrical wire',
    description: 'Dangerous exposed electrical wire hanging from pole, sparking',
    location: 'Market Street',
    expected: {
      department: 'Street Lighting & Electricity',
      priority: 'High'
    }
  },
  {
    title: 'Dead animal on road',
    description: 'Dead dog on the road, causing traffic issues and health hazard',
    location: 'Highway 101',
    expected: {
      department: 'Animal Control',
      priority: 'High'
    }
  },
  {
    title: 'Traffic signal not working',
    description: 'Traffic light malfunction at busy intersection causing congestion',
    location: 'Main & 5th',
    expected: {
      department: 'Traffic Management',
      priority: 'High'
    }
  },
  {
    title: 'Fallen tree blocking road',
    description: 'Large tree has fallen and is blocking the entire road',
    location: 'Oak Avenue',
    expected: {
      department: 'Environment & Parks',
      priority: 'High'
    }
  },
  {
    title: 'Construction debris',
    description: 'Construction waste and debris left on sidewalk, unsafe for pedestrians',
    location: 'Building Site, 3rd Street',
    expected: {
      department: 'Construction & Public Safety',
      priority: 'Medium'
    }
  },
  {
    title: 'Graffiti on public wall',
    description: 'Vandalism and graffiti on government building wall',
    location: 'City Hall',
    expected: {
      department: 'Public Property Damage',
      priority: 'Low'
    }
  },
  {
    title: 'Fire outbreak',
    description: 'Small fire in garbage dump, smoke visible, fire spreading',
    location: 'Industrial Area',
    expected: {
      department: 'Fire & Emergency',
      priority: 'High'
    }
  },
  {
    title: 'Contaminated water',
    description: 'Water supply is contaminated, dirty water coming from taps',
    location: 'Residential Complex',
    expected: {
      department: 'Water Supply',
      priority: 'High'
    }
  }
];

let passed = 0;
let failed = 0;

customTests.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.title}`);
  console.log(`Description: ${test.description}`);
  console.log(`Location: ${test.location}`);
  
  const result = analyzeIssue(test.description, test.title, test.location);
  
  console.log('\n📊 Result:');
  console.log(`   Department: ${result.predicted_department}`);
  console.log(`   Priority: ${result.priority_level}`);
  console.log(`   Confidence: ${(result.confidence_score * 100).toFixed(1)}%`);
  console.log(`   Notes: ${result.notes}`);
  
  // Check if matches expected
  const deptMatch = result.predicted_department === test.expected.department;
  const priorityMatch = result.priority_level === test.expected.priority;
  
  if (deptMatch && priorityMatch) {
    console.log('\n✅ PASS - Matches expected classification');
    passed++;
  } else {
    console.log('\n❌ FAIL - Does not match expected');
    console.log(`   Expected: ${test.expected.department} (${test.expected.priority})`);
    console.log(`   Got: ${result.predicted_department} (${result.priority_level})`);
    failed++;
  }
  
  console.log('-'.repeat(80) + '\n');
});

// Summary
console.log('='.repeat(80));
console.log('📈 TEST SUMMARY');
console.log('='.repeat(80));
console.log(`Total Tests: ${customTests.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Success Rate: ${((passed / customTests.length) * 100).toFixed(1)}%`);
console.log('='.repeat(80) + '\n');

// Performance test
console.log('⚡ PERFORMANCE TEST');
console.log('='.repeat(80));

const perfTest = {
  description: 'Large pothole on main road causing accidents and traffic delays',
  title: 'Dangerous pothole',
  location: 'Main Street'
};

const iterations = 1000;
const startTime = Date.now();

for (let i = 0; i < iterations; i++) {
  analyzeIssue(perfTest.description, perfTest.title, perfTest.location);
}

const endTime = Date.now();
const totalTime = endTime - startTime;
const avgTime = totalTime / iterations;

console.log(`Iterations: ${iterations}`);
console.log(`Total Time: ${totalTime}ms`);
console.log(`Average Time: ${avgTime.toFixed(2)}ms per analysis`);
console.log(`Throughput: ${(1000 / avgTime).toFixed(0)} analyses per second`);
console.log('='.repeat(80) + '\n');

console.log('✨ All tests completed!\n');

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
