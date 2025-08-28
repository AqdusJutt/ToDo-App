"use client";
import React from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeUserSelfTasks,
  subscribeAdminAssignedTasks,
  updateTask,
  createSelfTask,
  type Task,
  removeTask,
} from "@/lib/tasks";

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"my" | "assigned">("my");
  const [selfTasks, setSelfTasks] = React.useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = React.useState<Task[]>([]);
  const [loadingSelf, setLoadingSelf] = React.useState(true);
  const [loadingAssigned, setLoadingAssigned] = React.useState(true);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");

  // 🔴 listen to self-created tasks
  React.useEffect(() => {
    if (!user) return;
    setLoadingSelf(true);
    const unsub = subscribeUserSelfTasks(user.uid, (t) => {
      setSelfTasks(t);
      setLoadingSelf(false);
    });
    return () => unsub?.();
  }, [user]);

  // 🔴 listen to admin-assigned tasks
  React.useEffect(() => {
    if (!user) return;
    setLoadingAssigned(true);
    const unsub = subscribeAdminAssignedTasks(user.uid, (t) => {
      setAssignedTasks(t);
      setLoadingAssigned(false);
    });
    return () => unsub?.();
  }, [user]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!user || !title) return;
    await createSelfTask({ title, description: newDesc.trim() || null, createdBy: user.uid });
    setNewTitle("");
    setNewDesc("");
  };

  const formatDeadline = (dueAt: any) => {
    if (!dueAt) return null;
    try {
      const date = dueAt.toDate ? dueAt.toDate() : new Date(dueAt);
      return date.toLocaleDateString();
    } catch {
      return null;
    }
  };

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="inline-flex rounded-lg overflow-hidden border border-black/5 dark:border-white/10">
          <button onClick={() => setActiveTab("my")} className={`px-3 py-1.5 text-sm ${activeTab === "my" ? "bg-gray-100 dark:bg-white/10" : ""}`}>My Tasks</button>
          <button onClick={() => setActiveTab("assigned")} className={`px-3 py-1.5 text-sm ${activeTab === "assigned" ? "bg-gray-100 dark:bg-white/10" : ""}`}>Assigned by Admin</button>
        </div>
      </div>

      {activeTab === "my" && (
        <>
          <form onSubmit={onCreate} className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input className="input" placeholder="Task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input className="input" placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              <button className="btn-primary">Add</button>
            </div>
          </form>

          <ul className="grid gap-3">
            {loadingSelf
              ? Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="h-20 animate-pulse rounded-xl bg-gray-200/60 dark:bg-white/10" />
                ))
              : selfTasks.map((t) => (
                  <li key={t.id} className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{t.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status: {t.status.replace("_", " ")}</p>
                    </div>
                    <select defaultValue={t.status} onChange={(e) => updateTask(t.id!, { status: e.target.value as Task["status"] })} className="select">
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                  </li>
                ))}
          </ul>
        </>
      )}

      {activeTab === "assigned" && (
        <ul className="grid gap-3">
          {loadingAssigned
            ? Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="h-20 animate-pulse rounded-xl bg-gray-200/60 dark:bg-white/10" />
              ))
            : assignedTasks.map((t) => (
                <li key={t.id} className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.title}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Status: {t.status.replace("_", " ")}</span>
                      {t.dueAt && (
                        <span>Due: {formatDeadline(t.dueAt)}</span>
                      )}
                    </div>
                  </div>
                  <select defaultValue={t.status} onChange={(e) => updateTask(t.id!, { status: e.target.value as Task["status"] })} className="select">
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </li>
              ))}
        </ul>
      )}
    </DashboardShell>
  );
}
