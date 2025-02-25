"use client";

import React, { useEffect, useState } from "react";

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  description?: string;
}

interface Ticket {
  id: number;
  eventId: number;
  purchaseDate: string;
  buyerId: number;
  event: Event;
}

interface GroupedTickets {
  event: Event;
  quantity: number;
  tickets: Ticket[];
}

export default function MyTickets() {
  const [groupedTickets, setGroupedTickets] = useState<GroupedTickets[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // buyerId fixo para exemplo; em produção, use o ID do usuário autenticado
    fetch("https://localhost:7027/api/tickets/client/1")
      .then((res) => res.json())
      .then((data: Ticket[]) => {
        // Agrupa os ingressos por eventId
        const groups: { [key: number]: GroupedTickets } = {};
        data.forEach((ticket) => {
          if (groups[ticket.eventId]) {
            groups[ticket.eventId].quantity += 1;
            groups[ticket.eventId].tickets.push(ticket);
          } else {
            groups[ticket.eventId] = {
              event: ticket.event,
              quantity: 1,
              tickets: [ticket],
            };
          }
        });
        setGroupedTickets(Object.values(groups));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar ingressos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Carregando ingressos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Controle-SE</h1>
            <nav className="flex space-x-4">
            <a href="/client/events" className="hover:text-gray-300">Home</a>
            <a href="/client/my-tickets" className="hover:text-gray-300">Meus Ingressos</a>
            </nav>
            <div className="text-sm">Logado como: Cliente</div>
        </div>
        </header>


      {/* Conteúdo Principal */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Meus Ingressos</h2>
        {groupedTickets.length === 0 ? (
          <p className="text-center">Você ainda não comprou nenhum ingresso.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedTickets.map((group) => (
              <div
                key={group.event.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center space-y-2"
              >
                <h3 className="text-xl font-semibold">{group.event.name}</h3>
                <p className="text-gray-600">Data: {group.event.date}</p>
                <p className="text-gray-600">Local: {group.event.location}</p>
                <p className="text-gray-600">
                  Ingressos Comprados: {group.quantity}
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                  onClick={() => window.location.assign(`/client/events/${group.event.id}`)}
                >
                  Ver Detalhes do Evento
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
