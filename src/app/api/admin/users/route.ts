import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    // 1. Verify the user is an admin from their token
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();

    if (userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Get the status filter from the URL (e.g., /api/admin/users?status=active)
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active'; // Default to 'active'

    // 3. Query Firestore based on the status
    const usersCollection = admin.firestore().collection('users');
    const snapshot = await usersCollection.where('status', '==', status).get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      const creationTimestamp = data.createdAt ? data.createdAt.toDate() : new Date();

      return {
        uid: doc.id,
        displayName: data.name || 'No Name',
        email: data.email,
        creationTime: creationTimestamp.toLocaleDateString(),
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
