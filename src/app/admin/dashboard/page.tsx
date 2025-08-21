"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Interfaces for the component's state
interface UserData {
  uid: string; email: string; displayName: string; creationTime: string;
}
interface NewTask {
  title: string; description: string; deadline: string; assignedToUid: string;
}
interface AssignedTask {
  id: string; title: string; assignedToName: string; deadline: string; status: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState('active'); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [newTask, setNewTask] = useState<NewTask>({ title: '', description: '', deadline: '', assignedToUid: '' });
  const [assignmentStatus, setAssignmentStatus] = useState({ message: '', error: false });
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    setLoadingUsers(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/admin/users?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) { 
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [user, filter]);

  const fetchAssignedTasks = useCallback(async () => {
    if (!user) return;
    setLoadingTasks(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/admin/tasks`, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setAssignedTasks(data);
    } catch (error) { 
      console.error("Error fetching assigned tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    const verifyAdmin = async () => {
      if (!user) { router.push("/admin"); return; }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data()?.role === 'admin') {
        setIsAdmin(true);
      } else {
        await logout(); router.push("/admin");
      }
    };
    verifyAdmin();
  }, [user, authLoading, router, logout]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchAssignedTasks();
    }
  }, [isAdmin, fetchUsers, fetchAssignedTasks]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleAssignTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignedToUid || !newTask.deadline) {
      setAssignmentStatus({ message: 'Title, deadline, and assigned user are required.', error: true });
      return;
    }
    const selectedUser = users.find(u => u.uid === newTask.assignedToUid);
    if (!selectedUser) return;

    try {
      await addDoc(collection(db, "tasks"), {
        title: newTask.title, description: newTask.description, deadline: new Date(newTask.deadline),
        status: "Pending", assignedToUid: selectedUser.uid, assignedToName: selectedUser.displayName,
        assignedByUid: user?.uid, createdAt: serverTimestamp()
      });
      setAssignmentStatus({ message: 'Task assigned successfully!', error: false });
      fetchAssignedTasks(); // Refresh the list
      setTimeout(() => {
        setIsModalOpen(false); setNewTask({ title: '', description: '', deadline: '', assignedToUid: '' });
        setAssignmentStatus({ message: '', error: false });
      }, 1500);
    } catch (error) {
      setAssignmentStatus({ message: 'Failed to assign task.', error: true });
      console.error("Error assigning task: ", error);
    }
  };

  const handleUserAction = async (uid: string, action: 'archive' | 'restore') => {
    const idToken = await user?.getIdToken();
    const method = action === 'archive' ? 'DELETE' : 'PUT';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        const response = await fetch(`/api/admin/users/${uid}`, {
          method: method, headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (!response.ok) throw new Error(`Failed to ${action} user`);
        fetchUsers();
      } catch (error) {
        alert(`Error: Could not ${action} user.`);
        console.error(`Error during ${action}:`, error);
      }
    }
  };

  const handleLogout = async () => { await logout(); router.push("/admin"); };

  if (authLoading || !isAdmin) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Logout</button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Manage Users</h2>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button onClick={() => setFilter('active')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'active' ? 'bg-red-500 text-white shadow' : 'bg-transparent text-gray-700'}`}>Active</button>
                  <button onClick={() => setFilter('archived')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'archived' ? 'bg-red-500 text-white shadow' : 'bg-transparent text-gray-700'}`}>Archived</button>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold">+ Assign Task</button>
              </div>
            </div>
            {loadingUsers ? (
              <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length > 0 ? users.map((u) => (
                      <tr key={u.uid}>
                        <td className="px-6 py-4 text-sm text-gray-900">{u.displayName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.creationTime}</td>
                        <td className="px-6 py-4 text-sm">
                          {filter === 'active' ? ( <button onClick={() => handleUserAction(u.uid, 'archive')} className="text-red-600 hover:text-red-900 font-medium">Archive</button> ) : ( <button onClick={() => handleUserAction(u.uid, 'restore')} className="text-green-600 hover:text-green-900 font-medium">Restore</button> )}
                        </td>
                      </tr>
                    )) : (<tr><td colSpan={4} className="text-center py-8 text-gray-500">No users found.</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Assigned Tasks</h2>
            {loadingTasks ? (
              <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedTasks.length > 0 ? assignedTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{task.assignedToName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{task.deadline}</td>
                        <td className="px-6 py-4 text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{task.status}</span></td>
                      </tr>
                    )) : (<tr><td colSpan={4} className="text-center py-8 text-gray-500">No tasks assigned yet.</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Assign a New Task</h2>
            <form onSubmit={handleAssignTask}>
              <div className="mb-4"><label className="block text-gray-700 font-semibold mb-2" htmlFor="title">Task Title</label><input type="text" name="title" id="title" value={newTask.title} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div className="mb-4"><label className="block text-gray-700 font-semibold mb-2" htmlFor="description">Description</label><textarea name="description" id="description" value={newTask.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-gray-700 font-semibold mb-2" htmlFor="assignedToUid">Assign To</label><select name="assignedToUid" id="assignedToUid" value={newTask.assignedToUid} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required><option value="" disabled>Select a user</option>{users.filter(u => filter === 'active').map(u => (<option key={u.uid} value={u.uid}>{u.displayName}</option>))}</select></div>
                <div><label className="block text-gray-700 font-semibold mb-2" htmlFor="deadline">Deadline</label><input type="date" name="deadline" id="deadline" value={newTask.deadline} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required /></div>
              </div>
              {assignmentStatus.message && (<p className={`text-sm mb-4 ${assignmentStatus.error ? 'text-red-500' : 'text-green-500'}`}>{assignmentStatus.message}</p>)}
              <div className="flex justify-end gap-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-lg">Assign Task</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}