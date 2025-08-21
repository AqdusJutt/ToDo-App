import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    // 1. Security Check: Verify the user making the request is an admin
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    if (userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch all tasks from the 'tasks' collection, ordered by most recent
    const tasksSnapshot = await admin.firestore().collection('tasks')
      .orderBy('createdAt', 'desc')
      .get();
    
    // 3. Format the data to be sent to the frontend
    const tasks = tasksSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            status: data.status,
            assignedToName: data.assignedToName,
            // Convert Firestore Timestamp to a readable date string
            deadline: new Date(data.deadline._seconds * 1000).toLocaleDateString(),
        };
    });

    return NextResponse.json(tasks);

  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}