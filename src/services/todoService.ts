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

export interface Todo {
  id?: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp;
  userId: string;
}

export const todoService = {
  // Create a new todo
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'todos'), {
        ...todo,
        createdAt: Timestamp.now(),
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