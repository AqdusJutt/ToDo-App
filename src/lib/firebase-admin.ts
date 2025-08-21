import admin from 'firebase-admin';

// Check if the environment variable is missing right away
if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
  throw new Error('The FIREBASE_ADMIN_CREDENTIALS environment variable is not set.');
}

let serviceAccount;
try {
  // Try to parse the JSON key from the environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
} catch (error) {
  // If it fails, give a very clear error message in the server terminal
  console.error('Firebase Admin Error: Failed to parse service account key.', error);
  throw new Error('The FIREBASE_ADMIN_CREDENTIALS key is not valid JSON. Please check your environment variable.');
}

// This is the important check to prevent re-initializing the app
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Export the initialized admin instance for use in your API routes
export { admin };