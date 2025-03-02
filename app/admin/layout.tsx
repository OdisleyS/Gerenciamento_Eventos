// app/admin/layout.tsx
"use client";

import ProtectedRoute from "@/auth/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      {children}
    </ProtectedRoute>
  );
}