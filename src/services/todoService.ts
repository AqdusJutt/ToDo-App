import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// REVERTED: The Todo interface now only includes the fields used in the simple app
export interface Todo {
id?: string;
text: string; // The raw user input
completed: boolean;
createdAt: Timestamp;
userId: string;
}

export const todoService = {
// REVERTED: Create a new todo using just text and userId
async createTodo(text: string, userId: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'todos'), {
      text,
      completed: false,
      createdAt: Timestamp.now(),
      userId,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
},

// Get all todos for a user
async getTodos(userId: string): Promise<Todo[]> {
  try {
    console.log('Fetching todos for userId:', userId);
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const todos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Todo[];
    console.log('Found todos:', todos);
    return todos;
  } catch (error) {
    console.error('Error getting todos:', error);
    throw error;
  }
},

// Update a todo
async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
  try {
    const todoRef = doc(db, 'todos', id);
    await updateDoc(todoRef, updates);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
},

// Delete a todo
async deleteTodo(id: string): Promise<void> {
  try {
    const todoRef = doc(db, 'todos', id);
    await deleteDoc(todoRef);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
},

// Toggle todo completion status
async toggleTodo(id: string, completed: boolean): Promise<void> {
  try {
    await this.updateTodo(id, { completed });
  } catch (error) {
    console.error('Error toggling todo:', error);
    throw error;
  }
}
};