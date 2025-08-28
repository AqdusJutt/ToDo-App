"use client";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  limit,
} from "firebase/firestore";

export type Task = {
  id?: string;
  title: string;
  description?: string | null;
  assigneeUid?: string | null;
  assigneeEmail?: string | null;
  status: "todo" | "in_progress" | "done";
  dueAt?: Date | null;
  createdBy: string; // admin uid
  createdAt?: any;
  updatedAt?: Date | null;
  adminAssigned?: boolean; // true if created by admin for a user
};

// ✅ Create new task
export async function createTask(t: Omit<Task, "id" | "createdAt">) {
  const payload = {
    ...t,
    assigneeUid: t.assigneeUid ?? null,
    assigneeEmail: t.assigneeEmail ?? null,
    description: t.description ?? null,
    dueAt: t.dueAt ?? null,
    adminAssigned: t.adminAssigned ?? false,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "tasks"), payload);
  return ref.id;
}

// ✅ Create a self task for the current user
export async function createSelfTask(params: {
  title: string;
  description?: string | null;
  dueAt?: Date | null;
  createdBy: string; // same as user uid
}) {
  const payload: Omit<Task, "id"> = {
    title: params.title,
    description: params.description ?? null,
    assigneeUid: params.createdBy,
    assigneeEmail: null,
    status: "todo",
    dueAt: params.dueAt ?? null,
    createdBy: params.createdBy,
    adminAssigned: false,
  } as any;
  const ref = await addDoc(collection(db, "tasks"), { ...payload, createdAt: serverTimestamp() });
  return ref.id;
}

// ✅ Subscribe only tasks for logged-in user (uid OR email)
export function subscribeMyTasks(
  { uid, email }: { uid?: string | null; email?: string | null },
  cb: (tasks: Task[]) => void
) {
  const constraints = [orderBy("createdAt", "desc"), limit(100)];
  const listeners: Array<() => void> = [];
  const mapDoc = (id: string, raw: any): Task => ({
    id,
    title: raw.title,
    description: raw.description ?? null,
    assigneeUid: raw.assigneeUid ?? raw.assignedToUid ?? null,
    assigneeEmail: raw.assigneeEmail ?? null,
    status:
      (raw.status === "Completed"
        ? "done"
        : raw.status === "Pending"
        ? "todo"
        : raw.status) ?? "todo",
    dueAt: raw.dueAt ?? raw.deadline ?? null,
    createdBy: raw.createdBy ?? raw.assignedByUid ?? "unknown",
    createdAt: raw.createdAt ?? null,
  });

  if (!uid && !email) return () => {};

  // Maintain a map to merge multiple listeners without duplicates
  const idToTask = new Map<string, Task>();
  const flush = () => cb(Array.from(idToTask.values()));

  if (uid) {
    const q1 = query(collection(db, "tasks"), where("assigneeUid", "==", uid), ...constraints);
    listeners.push(
      onSnapshot(q1, (snap) => {
        snap.docChanges().forEach((change) => {
          const t = mapDoc(change.doc.id, change.doc.data());
          if (change.type === "removed") {
            idToTask.delete(change.doc.id);
          } else {
            idToTask.set(change.doc.id, t);
          }
        });
        flush();
      })
    );

    // Legacy support: assignedToUid
    const qLegacy = query(
      collection(db, "tasks"),
      where("assignedToUid", "==", uid),
      ...constraints
    );
    listeners.push(
      onSnapshot(qLegacy, (snap) => {
        snap.docChanges().forEach((change) => {
          const t = mapDoc(change.doc.id, change.doc.data());
          if (change.type === "removed") {
            idToTask.delete(change.doc.id);
          } else {
            idToTask.set(change.doc.id, t);
          }
        });
        flush();
      })
    );
  }

  if (!uid && email) {
    const qEmail = query(
      collection(db, "tasks"),
      where("assigneeEmail", "==", email),
      ...constraints
    );
    listeners.push(
      onSnapshot(qEmail, (snap) => {
        idToTask.clear();
        snap.docs.forEach((d) => idToTask.set(d.id, mapDoc(d.id, d.data())));
        flush();
      })
    );
  }

  return () => listeners.forEach((unsub) => unsub());
}

// ✅ Subscribe to self-created tasks (not adminAssigned)
export function subscribeUserSelfTasks(userUid: string, cb: (tasks: Task[]) => void) {
  const qSelf = query(
    collection(db, "tasks"),
    where("assigneeUid", "==", userUid),
    where("adminAssigned", "==", false),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  return onSnapshot(qSelf, (snap) => {
    cb(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[]
    );
  });
}

// ✅ Subscribe to tasks assigned by admin to this user
export function subscribeAdminAssignedTasks(userUid: string, cb: (tasks: Task[]) => void) {
  console.log('🔍 Subscribing to admin-assigned tasks for user:', userUid);
  
  const qAssigned = query(
    collection(db, "tasks"),
    where("assigneeUid", "==", userUid),
    where("adminAssigned", "==", true),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  
  return onSnapshot(qAssigned, (snap) => {
    console.log('📋 Admin-assigned tasks snapshot:', snap.docs.length, 'tasks');
    const tasks = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[];
    console.log('📋 Admin-assigned tasks data:', tasks);
    cb(tasks);
  }, (error) => {
    console.error('❌ Error in admin-assigned tasks subscription:', error);
    cb([]);
  });
}

// ✅ Subscribe all tasks (for admin view)
export function subscribeAllTasks(cb: (tasks: Task[]) => void) {
  const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"), limit(200));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[]);
  });
}

// ✅ Update task (status/assignee/etc)
export async function updateTask(id: string, patch: Partial<Task>) {
  const updateData = {
    ...patch,
    updatedAt: new Date(),
  };
  await updateDoc(doc(db, "tasks", id), updateData as any);
}

// ✅ Delete task
export async function removeTask(id: string) {
  await deleteDoc(doc(db, "tasks", id));
}
