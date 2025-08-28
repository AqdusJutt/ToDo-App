"use client";
import AdminGuard from "@/components/AdminGuard";
import AdminInner from "./_inner";

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminInner />
    </AdminGuard>
  );
}
