// app/page.tsx
"use client";

import { useEffect } from "react";
import LoginPage from "../components/LoginPage";

export default function Home() {
  // Verificar se o navegador foi fechado na última sessão
  useEffect(() => {
    const checkBrowserClosed = () => {
      // Se temos um usuário armazenado, mas não temos a flag de sessão ativa,
      // isso significa que o navegador foi fechado (não um logout normal)
      if (localStorage.getItem('user') && !sessionStorage.getItem('appSessionActive')) {
        // Limpar dados de autenticação se o navegador foi fechado
        localStorage.removeItem('user');
      }
      
      // Estabelecer que esta sessão está ativa
      sessionStorage.setItem('appSessionActive', 'true');
    };
    
    checkBrowserClosed();
  }, []);

  return <LoginPage />;
}