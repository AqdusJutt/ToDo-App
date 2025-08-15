"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  creationTime: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState('active'); // State to control the user filter
  const router = useRouter();
  const { user, logout } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      // Append the status filter to the API request URL
      const response = await fetch(`/api/admin/users?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [user, filter]); // Re-run fetchUsers when user or filter changes

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user) {
        router.push("/admin");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data()?.role === 'admin') {
        setIsAdmin(true);
      } else {
        await logout();
        router.push("/admin");
      }
    };
    verifyAdmin();
  }, [user, router, logout]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const handleUserAction = async (uid: string, action: 'archive' | 'restore') => {
    const idToken = await user?.getIdToken();
    const method = action === 'archive' ? 'DELETE' : 'PUT';
    
    if (confirm(`Are you sure you want to ${action} this user?`)) {
        try {
            const response = await fetch(`/api/admin/users/${uid}`, {
                method: method,
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            if (!response.ok) throw new Error(`Failed to ${action} user`);
            alert(`User ${action}d successfully!`);
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error(`Error during ${action}:`, error);
            alert(`Error: Could not ${action} user.`);
        }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/admin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!isAdmin) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {filter === 'active' ? 'Active Users' : 'Archived Users'}
            </h2>
            <div className="flex gap-2">
                <button onClick={() => setFilter('active')} className={`px-3 py-1 text-sm rounded-md ${filter === 'active' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Active</button>
                <button onClick={() => setFilter('archived')} className={`px-3 py-1 text-sm rounded-md ${filter === 'archived' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Archived</button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.uid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.displayName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.creationTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {filter === 'active' ? (
                          <button onClick={() => handleUserAction(u.uid, 'archive')} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                        ) : (
                          <button onClick={() => handleUserAction(u.uid, 'restore')} className="text-green-600 hover:text-green-900 font-medium">Restore</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}