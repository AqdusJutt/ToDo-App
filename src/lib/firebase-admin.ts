import admin from 'firebase-admin';

// --- START OF THE DEBUG TEST ---
console.log('====================================================');
console.log('--- FILE: firebase-admin.ts is running NOW ---');
console.log(`--- Current Time: ${new Date().toLocaleTimeString('en-US')} ---`);

// I have updated this line to look for YOUR variable name
const keyFromEnv = process.env.FIREBASE_ADMIN_CREDENTIALS;

if (keyFromEnv) {
  console.log('--- STATUS: SUCCESS! The environment variable was FOUND.');
} else {
  console.log('--- STATUS: FAILED! The environment variable is UNDEFINED.');
}
console.log('====================================================');
// --- END OF THE DEBUG TEST ---

// This now matches your .env.local file
const serviceAccountKey = process.env.FIREBASE_ADMIN_CREDENTIALS;

if (!serviceAccountKey) {
  throw new Error('The FIREBASE_ADMIN_CREDENTIALS environment variable is not set.');
}

// In your .env.local, you used single quotes which need to be parsed as a string literal first
// before being parsed as JSON. If the key is just the JSON object, this is simpler.
// We'll try to parse it directly.
const serviceAccount = JSON.parse(serviceAccountKey);


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };