import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

export async function DELETE(
    request: Request, 
    context: { params: { uid: string } }
) {
  const userUidToDelete = context.params.uid;

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

    await admin.firestore().collection('users').doc(userUidToDelete).update({
      status: 'archived',
    });

    await admin.auth().updateUser(userUidToDelete, { disabled: true });

    return NextResponse.json({ message: 'User archived successfully' });
  } catch (error) {
    console.error('Error archiving user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
    request: Request, 
    context: { params: { uid: string } }
) {
  const userUidToRestore = context.params.uid;

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

    await admin.firestore().collection('users').doc(userUidToRestore).update({
      status: 'active',
    });

    await admin.auth().updateUser(userUidToRestore, { disabled: false });

    return NextResponse.json({ message: 'User restored successfully' });
  } catch (error) {
    console.error('Error restoring user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
