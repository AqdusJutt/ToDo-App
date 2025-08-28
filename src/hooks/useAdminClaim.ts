"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function useAdminClaim() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      try {
        // Check both custom claims and Firestore role
        const token = await user.getIdTokenResult(true);
        const customClaimAdmin = token.claims?.admin === true;
        
        // Check Firestore role
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const firestoreRole = userDoc.exists() && userDoc.data()?.role === 'admin';
        
        if (!cancelled) {
          setIsAdmin(customClaimAdmin || firestoreRole);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { isAdmin, loading };
}
