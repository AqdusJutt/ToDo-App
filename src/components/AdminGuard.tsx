"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import useAdminClaim from "@/hooks/useAdminClaim";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminClaim();

  React.useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) return <div className="p-8 text-sm text-gray-500">Checking admin…</div>;
  if (!user || !isAdmin) return null;

  return <>{children}</>;
}
