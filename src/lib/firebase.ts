import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCloCroLktXRY-gwRdxzba9OPtQgDS_44w",
  authDomain: "to-do-app-d2980.firebaseapp.com",
  projectId: "to-do-app-d2980",
  storageBucket: "to-do-app-d2980.firebasestorage.app",
  messagingSenderId: "127619535521",
  appId: "1:127619535521:web:28a110649a44918f02d6e0"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 


// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

