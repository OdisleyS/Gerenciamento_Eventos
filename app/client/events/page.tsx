"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  // ... demais campos retornados pelo backend
}

export default function ClientEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();

  // Carrega os eventos do back-end
  useEffect(() => {
    fetch("https://localhost:7027/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Erro ao buscar eventos:", err));
  }, []);

  // Função para formatar a data e hora
  const formatarDataHora = (dataString: string) => {
    try {
      const data = new Date(dataString);
      
      // Formatar data para o padrão brasileiro
      const dia = data.getDate().toString().padStart(2, '0');
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      const ano = data.getFullYear();
      
      // Formatar hora
      const hora = data.getHours().toString().padStart(2, '0');
      const minutos = data.getMinutes().toString().padStart(2, '0');
      
      return `${dia}/${mes}/${ano} às ${hora}:${minutos}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dataString; // Retorna a string original se houver erro
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center">
          {/* Logo à esquerda */}
          <div className="flex-shrink-0 w-1/4">
            <h1 className="text-xl font-bold">Controle-SE</h1>
          </div>
          
          {/* Menu centralizado */}
          <div className="flex-grow flex justify-center">
            <nav className="flex space-x-6">
              <a 
                href="/client/events" 
                className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
              >
                Home
              </a>
              <a 
                href="/client/my-tickets" 
                className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
              >
                Meus Ingressos
              </a>
            </nav>
          </div>
          
          {/* Área do usuário à direita */}
          <div className="flex-shrink-0 w-1/4 flex justify-end">
            <div className="flex items-center space-x-4">
              <div className="text-sm bg-gray-700 px-3 py-1 rounded-full">
                Logado como: Cliente
              </div>
              <a 
                href="http://localhost:3000" 
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Sair
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Comprar Ingressos</h2>
        <h3 className="text-xl font-semibold mb-6 text-center">Próximos Eventos</h3>

        {events.length === 0 ? (
          <p className="text-center">Nenhum evento disponível.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center space-y-2"
              >
                <h3 className="text-xl font-semibold">{event.name}</h3>
                <p className="text-gray-600">
                  <span className="font-medium">Data:</span> {formatarDataHora(event.date)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Local:</span> {event.location}
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                  onClick={() => router.push(`/client/events/${event.id}`)}
                >
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-8 shadow-inner">
        <div className="container mx-auto text-center text-sm">
          © 2024 Controle-SE
        </div>
      </footer>
    </div>
  );
}