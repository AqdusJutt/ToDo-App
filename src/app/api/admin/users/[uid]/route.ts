import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

// Function to "delete" (archive) a user
export async function DELETE(
    request: Request, 
    context: { params: { uid: string } } // CORRECTED arugment type
) {
  const userUidToDelete = context.params.uid; // CORRECTED how we get the uid

  try {
    // Verify admin privileges (important for security)
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminUserDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    if (adminUserDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Update Firestore document to archived
    await admin.firestore().collection('users').doc(userUidToDelete).update({
      status: 'archived',
    });
    
    // 2. Disable the user in Firebase Auth so they cannot log in
    await admin.auth().updateUser(userUidToDelete, { disabled: true });

    return NextResponse.json({ message: 'User archived successfully' });
  } catch (error) {
    console.error('Error archiving user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Function to "restore" a user
export async function PUT(
    request: Request, 
    context: { params: { uid: string } } // CORRECTED argument type
) {
  const userUidToRestore = context.params.uid; // CORRECTED how we get the uid

  try {
    // Verify admin privileges
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken!);
    const adminUserDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    if (adminUserDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Update Firestore document to active
    await admin.firestore().collection('users').doc(userUidToRestore).update({
      status: 'active',
    });

    // 2. Enable the user in Firebase Auth so they can log in again
    await admin.auth().updateUser(userUidToRestore, { disabled: false });

    return NextResponse.json({ message: 'User restored successfully' });
  } catch (error) {
    console.error('Error restoring user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}