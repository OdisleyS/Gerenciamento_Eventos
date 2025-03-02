// app/employee/layout.tsx
"use client";

import ProtectedRoute from "@/auth/ProtectedRoute";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
      {children}
    </ProtectedRoute>
  );
}