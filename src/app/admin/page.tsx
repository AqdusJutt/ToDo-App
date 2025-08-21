"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  // --- THIS FUNCTION HAS BEEN UPDATED ---
  const handleAdminLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      router.push("/admin/dashboard");
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      // Add a check to be sure it's a real error
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-10 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Portal</h1>
        <div className="space-y-4">
          <input
            type="email"
            className="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email"
            disabled={loading}
          />
          <input
            type="password"
            className="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
          />
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <button
            onClick={handleAdminLogin}
            disabled={loading}
            className="w-full bg-red-600 py-3 rounded-md font-bold text-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        <div className="mt-6 text-center border-t border-gray-700 pt-4">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white hover:underline text-sm transition-colors"
          >
            ← Back to User Login
          </button>
        </div>
      </div>
    </div>
  );
}