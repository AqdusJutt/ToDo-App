"use client";
import React, { useCallback, useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeAllTasks,
  type Task,
} from "@/lib/tasks";

export default function AdminInner() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyCreate, setBusyCreate] = useState(false);
  const [users, setUsers] = useState<Array<{uid: string, name: string, email: string}>>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // 🔴 listen to all tasks (admin view)
  React.useEffect(() => {
    const unsub = subscribeAllTasks((t) => {
      // Filter to only show admin-assigned tasks, not user self-tasks
      const adminTasks = t.filter(task => task.adminAssigned === true);
      setTasks(adminTasks);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔴 fetch users for dropdown
  React.useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/admin/users?status=active', {
          headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUsers(userData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [user]);

  // 🔴 create new task
  const onCreate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      const title = String(formData.get("title") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const deadline = String(formData.get("deadline") || "");
      const assigneeUid =
        (String(formData.get("assigneeUid") || "").trim() || null) as
          | string
          | null;
      if (!title) return;

      setBusyCreate(true);
      try {
        // Use the admin API route instead of client SDK
        const idToken = await user?.getIdToken();
        if (!idToken) {
          throw new Error('No authentication token');
        }

        const response = await fetch('/api/admin/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            title,
            description,
            deadline,
            assigneeUid,
            status: "todo",
            createdBy: user?.uid || "unknown",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create task');
        }

        // Clear form after successful creation
        e.currentTarget.reset();
        
      } catch (error) {
        console.error('Error creating task:', error);
        // You might want to show an error message to the user here
      } finally {
        setBusyCreate(false);
      }
    },
    [user?.uid]
  );

  // 🔴 update status
  const onUpdate = useCallback(async (id: string, patch: Partial<Task>) => {
    try {
      const idToken = await user?.getIdToken();
      if (!idToken) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [user]);

  // 🔴 delete
  const onDelete = useCallback(async (id: string) => {
    try {
      const idToken = await user?.getIdToken();
      if (!idToken) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [user]);

  const list = useMemo(() => tasks, [tasks]);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Assign tasks to users. Only admin-assigned tasks are shown here.
        </p>
      </div>

      {/* Assign task form */}
      <form
        onSubmit={onCreate}
        className="grid gap-4 md:grid-cols-[1fr_1fr_200px_180px] items-end bg-white dark:bg-white/5 p-6 rounded-2xl shadow border border-black/5 dark:border-white/10"
      >
        <div className="grid gap-1">
          <label className="text-sm font-medium">Task Title</label>
          <input
            name="title"
            placeholder="Design review for dashboard"
            className="input"
            required
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Description</label>
          <input 
            name="description" 
            placeholder="Task description and requirements..." 
            className="input" 
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Deadline</label>
          <input 
            name="deadline" 
            type="date" 
            className="input"
            required
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Assign To</label>
          <select 
            name="assigneeUid" 
            className="input"
            required
          >
            <option value="">Choose a user...</option>
            {users.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4 flex justify-center">
          <button 
            type="submit" 
            disabled={busyCreate || loadingUsers}
            className="btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            {busyCreate ? "Assigning Task..." : "🚀 Assign Task"}
          </button>
        </div>
      </form>

      {/* Task list */}
      <ul className="mt-6 grid gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="h-20 rounded-xl animate-pulse bg-gray-200/60 dark:bg-white/10"
              />
            ))
          : list.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{t.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        t.status === 'done' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : t.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-600'
                      }`}>
                        {t.status === 'done' ? '✅ Completed' : 
                         t.status === 'in_progress' ? '🔄 In Progress' : '⏳ To Do'}
                      </span>
                    </div>
                    
                    {t.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {t.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {t.assigneeUid && (
                        <span>👤 Assigned to: {t.assigneeUid}</span>
                      )}
                      {t.dueAt && (
                        <span>📅 Due: {new Date(t.dueAt).toLocaleDateString()}</span>
                      )}
                      <span className="text-blue-600">🔑 Admin Assigned</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => onDelete(t.id!)} className="btn-ghost text-red-600 hover:text-red-800">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
      </ul>
    </DashboardShell>
  );
}
