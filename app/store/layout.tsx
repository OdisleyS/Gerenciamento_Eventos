// app/store/layout.tsx
"use client";

import ProtectedRoute from "@/auth/ProtectedRoute";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[0, 1]}>
      {children}
    </ProtectedRoute>
  );
}