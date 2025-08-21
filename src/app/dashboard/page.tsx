"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    updateDoc, 
    orderBy,
    addDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

// Interface for Admin-Assigned Tasks
interface AssignedTask {
    id: string;
    title: string;
    description: string;
    deadline: { seconds: number; };
    status: 'Pending' | 'Completed';
}

// Interface for Personal To-Dos
interface PersonalTodo {
    id: string;
    text: string;
    completed: boolean;
}

export default function Dashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
    const [personalTodos, setPersonalTodos] = useState<PersonalTodo[]>([]);
    const [newTodoText, setNewTodoText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/');
            return;
        }

        // --- Listener for PERSONAL todos (logic is now directly in this file) ---
        const personalTodosQuery = query(collection(db, `users/${user.uid}/todos`), orderBy("createdAt", "desc"));
        const unsubscribePersonal = onSnapshot(personalTodosQuery, (snapshot) => {
            const todos: PersonalTodo[] = [];
            snapshot.forEach((doc) => {
                todos.push({ id: doc.id, ...doc.data() } as PersonalTodo);
            });
            setPersonalTodos(todos);
            setLoading(false); 
        });

        // --- Listener for ADMIN-ASSIGNED tasks ---
        const assignedTasksQuery = query(collection(db, "tasks"), where("assignedToUid", "==", user.uid), orderBy("createdAt", "desc"));
        const unsubscribeAssigned = onSnapshot(assignedTasksQuery, (snapshot) => {
            const tasks: AssignedTask[] = [];
            snapshot.forEach((doc) => {
                tasks.push({ id: doc.id, ...doc.data() } as AssignedTask);
            });
            setAssignedTasks(tasks);
        });

        // Cleanup both listeners
        return () => {
            unsubscribePersonal();
            unsubscribeAssigned();
        };

    }, [user, router]);
    
    // --- ALL LOGIC IS NOW IN THIS ONE FILE ---

    const handleToggleAssignedTask = async (taskId: string, currentStatus: 'Pending' | 'Completed') => {
        const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, { status: newStatus });
    };
    
    const addPersonalTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodoText.trim() === '' || !user) return;
        await addDoc(collection(db, `users/${user.uid}/todos`), {
            text: newTodoText,
            completed: false,
            createdAt: serverTimestamp(),
        });
        setNewTodoText('');
    };

    const togglePersonalTodo = async (todo: PersonalTodo) => {
        if (!user || !todo.id) return;
        const todoRef = doc(db, `users/${user.uid}/todos`, todo.id);
        await updateDoc(todoRef, { completed: !todo.completed });
    };

    const deletePersonalTodo = async (todoId: string) => {
        if (!user || !todoId) return;
        const todoRef = doc(db, `users/${user.uid}/todos`, todoId);
        await deleteDoc(todoRef);
    };

    const handleLogout = async () => { await logout(); router.push('/'); };
    
    const formatDate = (timestamp: { seconds: number }) => {
        if (!timestamp) return 'No Deadline';
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Your Dashboard</h1>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Logout</button>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-red-500 pb-2">Tasks Assigned to You</h2>
                    {assignedTasks.length === 0 ? (<p className="text-gray-500 mt-4">You have no tasks assigned by an admin.</p>) : (
                        <div className="space-y-4">
                            {assignedTasks.map((task) => (
                                <div key={task.id} className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${task.status === 'Completed' ? 'border-green-500' : 'border-yellow-500'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`text-lg font-bold ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>{task.title}</h3>
                                            <p className="text-gray-600 mt-1">{task.description}</p>
                                            <p className="text-sm text-red-600 font-semibold mt-2">Deadline: {formatDate(task.deadline)}</p>
                                        </div>
                                        <button onClick={() => handleToggleAssignedTask(task.id, task.status)} className={`px-3 py-1.5 text-sm font-semibold rounded-full text-white transition-colors ${task.status === 'Completed' ? 'bg-gray-400' : 'bg-green-500'}`}>{task.status === 'Completed' ? 'Mark as Pending' : 'Mark as Complete'}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">Your Personal To-Do List</h2>
                    <form onSubmit={addPersonalTodo} className="flex gap-2 mb-4">
                        <input type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add a new personal task..."/>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">Add</button>
                    </form>
                    {personalTodos.length === 0 ? (<p className="text-gray-500 mt-4">You have no personal to-dos.</p>) : (
                        <div className="space-y-3">
                            {personalTodos.map(todo => (
                                <div key={todo.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={todo.completed} onChange={() => togglePersonalTodo(todo)} className="h-5 w-5 rounded text-blue-500 focus:ring-blue-500"/>
                                        <p className={`text-gray-800 ${todo.completed ? 'line-through text-gray-400' : ''}`}>{todo.text}</p>
                                    </div>
                                    <button onClick={() => deletePersonalTodo(todo.id!)} className="text-gray-400 hover:text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}