#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Deploying Firestore rules and indexes...\n');

try {
  // Deploy Firestore rules
  console.log('📝 Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('\n✅ Firestore rules deployed successfully!');
  
  // Deploy Firestore indexes
  console.log('\n📊 Deploying Firestore indexes...');
  execSync('firebase deploy --only firestore:indexes', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('\n✅ Firestore indexes deployed successfully!');
  console.log('\n🎉 All Firestore configurations deployed!');
  
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n💡 Make sure you have:');
  console.log('   1. Firebase CLI installed: npm install -g firebase-tools');
  console.log('   2. Logged in: firebase login');
  console.log('   3. Project selected: firebase use <project-id>');
  process.exit(1);
}
