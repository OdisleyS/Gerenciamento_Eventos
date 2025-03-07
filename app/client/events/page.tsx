"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  description?: string;
  // ... demais campos retornados pelo backend
}

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
}

export default function ClientEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const router = useRouter();

  // Carrega os dados do usuário e eventos do back-end
  useEffect(() => {
    // Recupera os dados do usuário logado do localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    fetch("https://localhost:7027/api/events")
      .then((res) => res.json())
      .then((data) => {
        // Ordenar eventos por data - do mais próximo ao mais distante
        const sortedEvents = [...data].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setEvents(sortedEvents);
      })
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

  // Função para lidar com clique no botão de pesquisa
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

  // Filtra eventos baseado no termo de pesquisa
  const filteredEvents = events.filter(event => {
    if (searchTerm === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      event.name.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      (event.description && event.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center">
          {/* Logo à esquerda */}
          <div className="flex-shrink-0 w-1/4">
            <h1 className="text-xl font-bold">EGO - Gestão de Eventos</h1>
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
          
          {/* Área do usuário à direita com barra de pesquisa */}
          <div className="flex-shrink-0 w-1/4 flex justify-end items-center space-x-4">
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
      </header>

      {/* Conteúdo principal */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Comprar Ingressos</h2>
        <h3 className="text-xl font-semibold mb-6 text-center">Próximos Eventos</h3>

        {/* Informação de busca ativa */}
        {searchTerm && (
          <div className="text-center mb-6 text-gray-600">
            Exibindo resultados para: <span className="font-medium">"{searchTerm}"</span>
            <button 
              onClick={() => setSearchTerm("")}
              className="ml-2 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Limpar busca
            </button>
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            {events.length === 0 ? (
              <p className="text-gray-600">Nenhum evento disponível.</p>
            ) : (
              <>
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p className="text-gray-600">Nenhum evento encontrado para "<span className="font-semibold">{searchTerm}</span>".</p>
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                  Limpar busca
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center space-y-2 hover:shadow-lg transition-shadow"
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
          © 2024 EGO - Gestão de Eventos
        </div>
      </footer>
    </div>
  );
}