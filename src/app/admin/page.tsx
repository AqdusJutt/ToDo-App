"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, signIn, logout } = useAuth();

  useEffect(() => {
    // Check if user is already logged in and is an admin
    const checkAdmin = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data()?.role === 'admin') {
          router.push("/admin/dashboard");
        }
      }
    };
    checkAdmin();
  }, [user, router]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please enter all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First, sign in the user
      const userCredential = await signIn(email, password);
      
      // Then, check if this user has the 'admin' role in Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists() && userDoc.data()?.role === 'admin') {
        router.push("/admin/dashboard");
      } else {
        // If not an admin, log them out and show an error
        await logout();
        setError("Access denied. You are not an administrator.");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Admin Login
        </h2>
        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-green-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="admin@example.com"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-700">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-green-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="********"
            disabled={loading}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>
        
        {/* Back to Main Login Button */}
        <div className="mt-4 text-center border-t pt-4">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Back to Main Login
          </button>
        </div>
      </div>
    </div>
  );
}