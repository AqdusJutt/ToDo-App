"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // Check both custom claims and Firestore role
      const token = await cred.user.getIdTokenResult(true);
      const customClaimAdmin = token.claims?.admin === true;
      
      // Check Firestore role
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      const firestoreRole = userDoc.exists() && userDoc.data()?.role === 'admin';
      
      if (customClaimAdmin || firestoreRole) {
        router.replace("/admin");
      } else {
        setMsg("This account is not an admin.");
        await signOut(auth);
      }
    } catch (err: any) {
      setMsg(err?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 dark:bg-[#0b1020]">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white dark:bg-white/5 rounded-2xl p-6 shadow border border-black/5 dark:border-white/10"
      >
        <h1 className="text-xl font-semibold mb-2">Admin Sign in</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Only users with admin access can continue.
        </p>

        <div className="grid gap-2 mb-3">
          <label className="text-sm font-medium">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />
        </div>
        <div className="grid gap-2 mb-4">
          <label className="text-sm font-medium">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {msg && <div className="mb-4 text-sm text-red-600 dark:text-red-400">{msg}</div>}

        <div className="flex items-center gap-3">
          <button disabled={busy} className="btn-primary">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <Link href="/" className="btn-ghost">
            User login
          </Link>
        </div>
      </form>
    </div>
  );
}
