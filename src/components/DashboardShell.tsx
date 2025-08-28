"use client";
import React, { PropsWithChildren, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import useAdminClaim from "@/hooks/useAdminClaim";

export default function DashboardShell({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin } = useAdminClaim();

  const nav = [
    { href: "/dashboard", label: "My Tasks" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1020] text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-30 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#0b1020]/70 backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden inline-flex items-center rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10 transition"
              aria-label="Toggle menu"
            >
              <span>☰</span>
            </button>
            <Link href="/" className="font-semibold tracking-tight">
              Task Tracker
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-white/10 ${
                  pathname === n.href ? "bg-gray-100 dark:bg-white/10" : ""
                }`}
              >
                {n.label}
              </Link>
            ))}
            {user && (
              <button onClick={handleLogout} className="btn-ghost ml-2">
                Log out
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 py-6">
        <aside className={`md:sticky md:top-16 h-max ${open ? "block" : "hidden md:block"}`}>
          <nav className="grid gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-2 rounded-xl transition hover:bg-gray-100 dark:hover:bg-white/10 ${
                  pathname === n.href ? "bg-gray-100 dark:bg-white/10" : ""
                }`}
              >
                {n.label}
              </Link>
            ))}
            {user && (
              <button onClick={handleLogout} className="btn-ghost mt-2 text-left">
                Log out
              </button>
            )}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
