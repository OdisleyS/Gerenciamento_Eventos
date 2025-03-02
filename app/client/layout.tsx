// app/client/layout.tsx
"use client";

import ProtectedRoute from "@/auth/ProtectedRoute";

export default function ClientLayout({
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