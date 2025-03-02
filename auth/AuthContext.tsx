// auth/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Definição de tipos
export type UserRole = 0 | 1 | 2; // 0: Cliente, 1: Admin, 2: Funcionário

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  eventId?: number;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Provedor de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const router = useRouter();

  // Carrega o usuário do localStorage na inicialização
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoadingUser(false);
  }, []);

  // Configuração para limpar o localStorage ao fechar o navegador
  // Esta abordagem é mais limpa e não interfere com navegações normais
  useEffect(() => {
    // Definir uma flag de sessão para detectar fechamento real do navegador
    sessionStorage.setItem('appSessionActive', 'true');
    
    // Não precisamos fazer nada mais aqui, pois vamos verificar na próxima vez
    // que o usuário carregar a aplicação
  }, []);

  // Função para fazer login
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('appSessionActive', 'true');

    // Redirecionar com base na função (role)
    if (userData.role === 2) { // Funcionário
      router.push(`/employee/store/${userData.eventId}`);
    } else if (userData.role === 1) { // Admin
      router.push('/admin/events');
    } else { // Cliente
      router.push('/client/events');
    }
  };

  // Função para fazer logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('appSessionActive');
    router.push('/');
  };

  // Função para verificar se o usuário tem uma das funções fornecidas
  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      hasRole 
    }}>
      {!isLoadingUser && children}
    </AuthContext.Provider>
  );
}