"use client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AuthProfileSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    setDoc(ref, {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      lastLoginAt: serverTimestamp(),
    }, { merge: true });
  }, [user]);

  return null;
}
