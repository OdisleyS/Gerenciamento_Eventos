// auth/ProtectedRoute.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from './AuthContext';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para o login
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Se estiver autenticado, mas não tiver as funções permitidas
    if (!hasRole(allowedRoles)) {
      // Redirecionar com base na função atual
      if (user?.role === 2) { // Funcionário
        router.push(`/employee/store/${user.eventId}`);
      } else if (user?.role === 1) { // Admin
        router.push('/admin/events');
      } else { // Cliente
        router.push('/client/events');
      }
    }
  }, [isAuthenticated, hasRole, allowedRoles, router, user]);

  // Renderiza os filhos apenas se o usuário estiver autenticado e tiver as funções permitidas
  if (isAuthenticated && hasRole(allowedRoles)) {
    return <>{children}</>;
  }

  // Renderiza nada enquanto redireciona
  return null;
}