// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function GET(request: Request) {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  const idToken = authorizationHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // --- ADD THESE LOGS ---
    console.log("Decoded Token Email:", decodedToken.email);
    console.log("Is Admin Email?:", decodedToken.email === "your-admin-email@example.com");
    // --- END LOGS ---

    // Make sure this email exactly matches the email you logged in with
    const adminEmails = ["admin@gmail.com"]; // REPLACE with your actual admin emails
    
    if (!adminEmails.includes(decodedToken.email as string)) {
        return NextResponse.json({ error: 'Forbidden: Not an admin' }, { status: 403 });
    }

    const allUsers = await adminAuth.listUsers();
    const usersData = allUsers.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      creationTime: user.metadata.creationTime,
    }));

    return NextResponse.json(usersData);
  } catch (error) {
    console.error('Error fetching users in API route:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}