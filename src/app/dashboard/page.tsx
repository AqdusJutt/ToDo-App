// Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { todoService, Todo } from "@/services/todoService";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { supabase, setSupabaseAuth } from "@/lib/supabase";

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      loadTodos();
      fetchUserData(user.uid);

      const syncAuth = async () => {
        try {
          const token = await user.getIdToken();
          await setSupabaseAuth(token);
        } catch (error) {
          console.error("Error syncing Firebase and Supabase auth:", error);
        }
      };
      syncAuth();

      setCurrentDate(
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }
  }, [user]);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDisplayName(userData.name || null);
        setProfilePicUrl(userData.profilePicUrl || null);
      } else {
        setDisplayName(null);
        setProfilePicUrl(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setDisplayName(null);
      setProfilePicUrl(null);
    }
  };

  const loadTodos = async () => {
    if (!user?.uid) {
      console.log("No user UID found");
      return;
    }

    try {
      setLoading(true);
      const userTodos = await todoService.getTodos(user.uid);
      setTodos(userTodos);
    } catch (error) {
      console.error("Error loading todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim() || !user?.uid) return;

    try {
      setSubmitting(true);
      await todoService.createTodo({
        text: newTodo.trim(),
        completed: false,
        userId: user.uid,
      });
      setNewTodo("");
      await loadTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await todoService.toggleTodo(id, !completed);
      await loadTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      await loadTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitting) {
      addTodo();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    try {
      setSubmitting(true);
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.uid}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("todo") // <-- Updated here
        .upload(filePath, file);

      if (uploadError) {
        console.error("Supabase upload failed:", uploadError);
        throw uploadError;
      }

      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("todo") // <-- Updated here
        .getPublicUrl(filePath);

      if (publicUrlError) {
        console.error("Failed to get public URL:", publicUrlError);
        throw publicUrlError;
      }

      const downloadURL = publicUrlData.publicUrl;

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { profilePicUrl: downloadURL });

      setProfilePicUrl(downloadURL);
    } catch (error) {
      console.error("An error occurred during image upload:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "";
    const date =
      timestamp && typeof timestamp === "object" && "toDate" in timestamp
        ? (timestamp as { toDate: () => Date }).toDate()
        : new Date(timestamp as string | number);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-full h-full text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-3.007a.999.999 0 011-1h22a.999.999 0 011 1zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome back, {displayName ? displayName : user?.email}!
                </h1>
                <p className="text-gray-600">{currentDate}</p>
                <label className="cursor-pointer text-sm text-blue-500 hover:text-blue-600 transition-colors mt-2 block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={submitting}
                  />
                  {submitting ? "Uploading..." : "Change Profile Picture"}
                </label>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Add New Task
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What do you need to do today?"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={submitting}
              />
              <button
                onClick={addTodo}
                disabled={submitting || !newTodo.trim()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Your Tasks ({todos.filter((t) => !t.completed).length} remaining)
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading tasks...</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No tasks yet!</p>
                <p>Add your first task above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      todo.completed
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id!, todo.completed)}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-blue-400"
                      />
                      <div className="flex-1">
                        <p
                          className={`text-lg ${
                            todo.completed
                              ? "line-through text-gray-500"
                              : "text-gray-800"
                          }`}
                        >
                          {todo.text}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(todo.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id!)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-4"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {todos.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {todos.length}
                </p>
                <p className="text-gray-600">Total Tasks</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <p className="text-2xl font-bold text-green-500">
                  {todos.filter((t) => t.completed).length}
                </p>
                <p className="text-gray-600">Completed</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {todos.filter((t) => !t.completed).length}
                </p>
                <p className="text-gray-600">Pending</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}