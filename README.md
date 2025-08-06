# Task Tracker with Firebase

A modern task tracking application built with Next.js, Firebase, and TailwindCSS.

## Features

- ✅ **Firebase Authentication** - Sign up and login with email/password
- ✅ **Protected Routes** - Dashboard only accessible to authenticated users
- ✅ **CRUD Operations** - Create, Read, Update, Delete todos
- ✅ **Real-time Data** - Todos stored in Firestore
- ✅ **Modern UI** - Beautiful interface with TailwindCSS
- ✅ **Responsive Design** - Works on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Firebase (Authentication + Firestore)
- **Styling**: TailwindCSS
- **State Management**: React Context API

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
4. Enable Firestore:
   - Go to Firestore Database
   - Create database in test mode (for development)
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Copy the config object

### 2. Update Firebase Config

Replace the placeholder config in `src/lib/firebase.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/
│   ├── dashboard/     # Protected dashboard page
│   ├── layout.tsx     # Root layout with AuthProvider
│   └── page.tsx       # Login/signup page
├── contexts/
│   └── AuthContext.tsx # Firebase auth context
├── lib/
│   └── firebase.ts    # Firebase configuration
└── services/
    └── todoService.ts # Firestore CRUD operations
```

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Login**: Sign in with your credentials
3. **Add Tasks**: Use the input field to add new todos
4. **Manage Tasks**: 
   - Check/uncheck to mark as complete
   - Delete tasks you don't need
   - View creation timestamps
5. **Track Progress**: See statistics for total, completed, and pending tasks

## Firebase Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Environment Variables (Optional)

For better security, you can use environment variables:

1. Create `.env.local` file:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

2. Update `src/lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

## Features Implemented

- [x] Firebase Authentication (Sign up/Login)
- [x] Protected Dashboard Route
- [x] Create/Read/Update/Delete Todos
- [x] Real-time Firestore Integration
- [x] Modern UI with TailwindCSS
- [x] Responsive Design
- [x] Loading States
- [x] Error Handling
- [x] TypeScript Support

## Next Steps

To enhance the application, consider adding:

- [ ] Real-time updates with Firebase listeners
- [ ] Todo categories/tags
- [ ] Due dates and reminders
- [ ] Search and filter functionality
- [ ] Dark mode toggle
- [ ] Export/import todos
- [ ] User profile management
- [ ] Social authentication (Google, GitHub)
