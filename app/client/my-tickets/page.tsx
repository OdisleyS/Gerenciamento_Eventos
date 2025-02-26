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

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
}

export default function MyTickets() {
  const [groupedTickets, setGroupedTickets] = useState<GroupedTickets[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Recupera os dados do usuário logado do localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
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

  // Função para formatar apenas a data (DD/MM/AAAA)
  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      
      // Formatar data para o padrão brasileiro
      const dia = data.getDate().toString().padStart(2, '0');
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      const ano = data.getFullYear();
      
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data não disponível";
    }
  };

  // Função para obter apenas a hora (HH:MM)
  const formatarHora = (dataString: string) => {
    try {
      const data = new Date(dataString);
      
      // Formatar hora
      const hora = data.getHours().toString().padStart(2, '0');
      const minutos = data.getMinutes().toString().padStart(2, '0');
      
      return `${hora}:${minutos}`;
    } catch (error) {
      console.error("Erro ao formatar hora:", error);
      return "Hora não disponível";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Carregando ingressos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
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
                Logado como: {user ? user.name : "Carregando..."}
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
                <p className="text-gray-600">
                  <span className="font-medium">Data:</span> {formatarData(group.event.date)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Hora:</span> {formatarHora(group.event.date)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Local:</span> {group.event.location}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Ingressos Comprados:</span> {group.quantity}
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-8 shadow-inner">
        <div className="container mx-auto text-center text-sm">
          © 2024 Controle-SE
        </div>
      </footer>
    </div>
  );
}