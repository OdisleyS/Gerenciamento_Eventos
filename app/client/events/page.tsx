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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Controle-SE</h1>
          <nav className="flex space-x-4">
            <a href="#" className="hover:text-gray-300">Home</a>
            <a href="#" className="hover:text-gray-300">Ingressos</a>
            <a href="#" className="hover:text-gray-300">Meus Ingressos</a>
          </nav>
          <div className="text-sm">Logado como: Cliente</div>
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
                <p className="text-gray-600">Data: {event.date}</p>
                <p className="text-gray-600">Local: {event.location}</p>
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

      {/* Rodapé */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>© 2024 Controle-SE</div>
          <nav className="flex space-x-4">
            <a href="#" className="hover:text-gray-300">Sobre</a>
            <a href="#" className="hover:text-gray-300">Contato</a>
            <a href="#" className="hover:text-gray-300">Ajuda</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
