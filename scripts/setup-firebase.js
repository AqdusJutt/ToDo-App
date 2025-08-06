#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup for Task Tracker');
console.log('=====================================\n');

console.log('📋 Steps to complete Firebase setup:\n');

console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Create a new project or select an existing one');
console.log('3. Enable Authentication:');
console.log('   - Go to Authentication > Sign-in method');
console.log('   - Enable Email/Password authentication');
console.log('4. Enable Firestore:');
console.log('   - Go to Firestore Database');
console.log('   - Create database in test mode (for development)');
console.log('5. Get your Firebase config:');
console.log('   - Go to Project Settings > General');
console.log('   - Scroll down to "Your apps" section');
console.log('   - Click the web icon (</>) to add a web app');
console.log('   - Copy the config object\n');

console.log('6. Update src/lib/firebase.ts with your config\n');

console.log('7. For production, update Firestore security rules:\n');
console.log('rules_version = \'2\';');
console.log('service cloud.firestore {');
console.log('  match /databases/{database}/documents {');
console.log('    match /todos/{todoId} {');
console.log('      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;');
console.log('      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;');
console.log('    }');
console.log('  }');
console.log('}\n');

console.log('8. Run the development server:');
console.log('   npm run dev\n');

console.log('✅ Your Task Tracker app will be ready to use!'); 