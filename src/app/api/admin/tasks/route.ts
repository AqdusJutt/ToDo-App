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
    const tasks = await Promise.all(tasksSnapshot.docs.map(async (doc) => {
        const data = doc.data() as any;
        const statusRaw = data.status;
        const completed = statusRaw === 'done' || statusRaw === 'Completed';
        
        // Handle both dueAt (new) and deadline (legacy) fields with proper error handling
        let deadline = null;
        let deadlineFormatted = 'No deadline';
        
        try {
          if (data.dueAt) {
            if (data.dueAt.toDate && typeof data.dueAt.toDate === 'function') {
              deadline = data.dueAt.toDate();
            } else if (data.dueAt instanceof Date) {
              deadline = data.dueAt;
            } else {
              deadline = new Date(data.dueAt);
            }
          } else if (data.deadline) {
            if (data.deadline.toDate && typeof data.deadline.toDate === 'function') {
              deadline = data.deadline.toDate();
            } else if (data.deadline instanceof Date) {
              deadline = data.deadline;
            } else {
              deadline = new Date(data.deadline);
            }
          }
          
          if (deadline && !isNaN(deadline.getTime())) {
            deadlineFormatted = deadline.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
        } catch (error) {
          console.warn('Error processing deadline for task:', doc.id, error);
          deadlineFormatted = 'Invalid date';
        }
        
        // Get user name with improved error handling
        let assignedToName = data.assignedToName || 'Unknown User';
        let assignedToEmail = data.assigneeEmail || 'No email';
        
        if (data.assigneeUid && !data.assignedToName) {
          try {
            const userDoc = await admin.firestore().collection('users').doc(data.assigneeUid).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              assignedToName = userData?.name || userData?.displayName || userData?.email || 'Unknown User';
              assignedToEmail = userData?.email || 'No email';
            }
          } catch (error) {
            console.warn('Could not fetch user name for task:', doc.id, error);
            assignedToName = 'Unknown User';
            assignedToEmail = 'No email';
          }
        }
        
        return {
            id: doc.id,
            title: data.title,
            description: data.description ?? null,
            status: completed ? 'Completed' : (statusRaw === 'in_progress' ? 'In progress' : 'Pending'),
            completed,
            assignedToName: assignedToName,
            assignedToEmail: assignedToEmail,
            deadline: deadlineFormatted,
        };
    }));

    return NextResponse.json(tasks);

  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    // 2. Get the task data from the request body
    const body = await request.json();
    const { title, description, deadline, assigneeUid, status, createdBy } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // 3. Create the task using Admin SDK (bypasses Security Rules)
    const taskData: any = {
      title,
      description: description || null,
      // Primary field for new system
      assigneeUid: assigneeUid || null,
      // Legacy field for backward compatibility
      assignedToUid: assigneeUid || null,
      assignedToName: null, // Will be populated below
      status: status || 'todo',
      createdBy: createdBy || decodedToken.uid,
      adminAssigned: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // Add deadline field
      dueAt: deadline ? admin.firestore.Timestamp.fromDate(new Date(deadline)) : null,
      // Legacy deadline field for backward compatibility
      deadline: deadline ? admin.firestore.Timestamp.fromDate(new Date(deadline)) : null,
    };

    // If we have assigneeUid, try to get the user's name
    if (assigneeUid) {
      try {
        const userDoc = await admin.firestore().collection('users').doc(assigneeUid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          taskData.assignedToName = userData?.name || userData?.displayName || userData?.email || 'Unknown User';
        }
      } catch (error) {
        console.warn('Could not fetch user name for assignee:', error);
        taskData.assignedToName = 'Unknown User';
      }
    }

    const docRef = await admin.firestore().collection('tasks').add(taskData);

    return NextResponse.json({ 
      id: docRef.id, 
      message: 'Task created successfully' 
    });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}