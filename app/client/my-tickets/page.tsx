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
  isPastEvent: boolean; // Para marcar eventos passados
}

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
}

export default function MyTickets() {
  const [groupedTickets, setGroupedTickets] = useState<GroupedTickets[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<GroupedTickets[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Estados para a funcionalidade de pesquisa
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    // Recupera os dados do usuário logado do localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Usar o ID do usuário autenticado em vez de um ID fixo
      fetch(`https://localhost:7027/api/tickets/client/${userData.id}`)
        .then((res) => res.json())
        .then((data: Ticket[]) => {
          // Restante do código permanece igual
          const groups: { [key: number]: GroupedTickets } = {};
          const now = new Date();

          data.forEach((ticket) => {
            // Verifica se o evento já passou
            const eventDate = new Date(ticket.event.date);
            const isPastEvent = eventDate < now;

            if (groups[ticket.eventId]) {
              groups[ticket.eventId].quantity += 1;
              groups[ticket.eventId].tickets.push(ticket);
              groups[ticket.eventId].isPastEvent = isPastEvent;
            } else {
              groups[ticket.eventId] = {
                event: ticket.event,
                quantity: 1,
                tickets: [ticket],
                isPastEvent: isPastEvent
              };
            }
          });

          // Converte para array e ordena com eventos futuros primeiro
          const sortedTickets = Object.values(groups).sort((a, b) => {
            // Se um é passado e outro é futuro, o futuro vem primeiro
            if (a.isPastEvent && !b.isPastEvent) return 1;
            if (!a.isPastEvent && b.isPastEvent) return -1;

            // Entre eventos do mesmo tipo (futuros ou passados), ordena por data
            return new Date(a.event.date).getTime() - new Date(b.event.date).getTime();
          });

          setGroupedTickets(sortedTickets);
          setFilteredTickets(sortedTickets);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erro ao buscar ingressos:", err);
          setLoading(false);
        });
      }
    }, []);
  // Efeito para filtrar os ingressos quando o termo de pesquisa mudar
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTickets(groupedTickets);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const filtered = groupedTickets.filter(group =>
        group.event.name.toLowerCase().includes(lowerCaseSearch) ||
        group.event.location.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredTickets(filtered);
    }
  }, [searchTerm, groupedTickets]);

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

  // Função para lidar com o botão de pesquisa
  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      // Focar o input quando ativar a pesquisa
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    } else {
      // Limpar a pesquisa quando fechar
      setSearchTerm("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-150"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Carregando ingressos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
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
                Ingressos
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
              {/* Barra de pesquisa */}
              <div className="relative">
                <div className={`flex items-center overflow-hidden transition-all duration-300 ${isSearchActive ? 'w-48' : 'w-10'} bg-gray-700 rounded-full`}>
                  <button
                    onClick={toggleSearch}
                    className="p-2 rounded-full text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </button>

                  {isSearchActive && (
                    <input
                      id="search-input"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar evento..."
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white text-sm pr-8"
                    />
                  )}
                </div>

                {isSearchActive && searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>

              <div className="text-sm bg-gray-700 px-3 py-1 rounded-full">
                {user ? user.name : "Carregando..."}
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

        {searchTerm && (
          <div className="text-sm text-gray-600 mb-4 text-center">
            Resultados para: <span className="text-gray-800 font-medium">"{searchTerm}"</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setIsSearchActive(false);
              }}
              className="ml-2 text-blue-600 hover:text-blue-500 underline text-xs"
            >
              Limpar
            </button>
          </div>
        )}

        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-md">
            {groupedTickets.length === 0 ? (
              <div>
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600">Você ainda não comprou nenhum ingresso.</p>
              </div>
            ) : (
              <div>
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-600">Nenhum evento encontrado para "<span className="font-semibold">{searchTerm}</span>".</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setIsSearchActive(false);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-500 underline"
                >
                  Limpar pesquisa
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((group) => (
              <div
                key={group.event.id}
                className={`${group.isPastEvent
                  ? "bg-gray-200 border border-gray-300"
                  : "bg-white"
                  } rounded-lg shadow-md p-6 flex flex-col items-center space-y-2 relative transition-all hover:shadow-lg`}
              >
                {group.isPastEvent && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Evento Passado
                  </div>
                )}
                <h3 className={`text-xl font-semibold ${group.isPastEvent ? "text-gray-600" : ""}`}>
                  {group.event.name}
                </h3>
                <p className={`${group.isPastEvent ? "text-gray-500" : "text-gray-600"}`}>
                  <span className="font-medium">Data:</span> {formatarData(group.event.date)}
                </p>
                <p className={`${group.isPastEvent ? "text-gray-500" : "text-gray-600"}`}>
                  <span className="font-medium">Hora:</span> {formatarHora(group.event.date)}
                </p>
                <p className={`${group.isPastEvent ? "text-gray-500" : "text-gray-600"}`}>
                  <span className="font-medium">Local:</span> {group.event.location}
                </p>
                <p className={`${group.isPastEvent ? "text-gray-500" : "text-gray-600"}`}>
                  <span className="font-medium">Ingressos Comprados:</span> {group.quantity}
                </p>
                <button
                  className={`mt-4 px-4 py-2 rounded transition-colors ${group.isPastEvent
                    ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  onClick={() =>
                    !group.isPastEvent && window.location.assign(`/client/events/${group.event.id}`)
                  }
                  disabled={group.isPastEvent}
                >
                  {group.isPastEvent ? "Evento Encerrado" : "Ver Detalhes do Evento"}
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