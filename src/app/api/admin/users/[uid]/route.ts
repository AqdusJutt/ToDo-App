import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

// Function to "delete" (archive) a user
export async function DELETE(
  request: NextRequest,
  context: { params: { uid: string } }   // <-- FIXED
) {
  const { uid } = context.params;  // <-- destructure inside ✅

  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminUserDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    if (adminUserDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await admin.firestore().collection('users').doc(uid).update({
      status: 'archived',
    });

    await admin.auth().updateUser(uid, { disabled: true });

    return NextResponse.json({ message: 'User archived successfully' });
  } catch (error) {
    console.error('Error archiving user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Function to "restore" a user
export async function PUT(
  request: NextRequest,
  context: { params: { uid: string } }   // <-- FIXED
) {
  const { uid } = context.params;  // <-- destructure inside ✅

  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminUserDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    if (adminUserDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await admin.firestore().collection('users').doc(uid).update({
      status: 'active',
    });

    await admin.auth().updateUser(uid, { disabled: false });

    return NextResponse.json({ message: 'User restored successfully' });
  } catch (error) {
    console.error('Error restoring user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
