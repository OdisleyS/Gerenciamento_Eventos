"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface EventDetail {
  id: number;
  name: string;
  date: string;
  endDate: string;
  location: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  totalTickets: number;
  availableTickets: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
}

export default function EventDetailPage() {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isEventDay, setIsEventDay] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketCount, setTicketCount] = useState(1); // Estado para controlar a quantidade de ingressos
  const [cameFromMyTickets, setCameFromMyTickets] = useState(false); // Para controlar de onde o usuário veio

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // Verificar se o usuário já tem ingressos para este evento
  const checkUserHasTicket = async (userId: number, eventId: string | string[] | number) => {
    try {
      // Converta eventId para número, independente de ser string ou array
      const parsedEventId = Array.isArray(eventId) ? parseInt(eventId[0]) : parseInt(String(eventId));

      const response = await fetch(`https://localhost:7027/api/tickets/client/${userId}`);

      if (!response.ok) {
        console.error("Erro ao verificar ingressos do usuário");
        return false;
      }

      const tickets = await response.json();

      // Verifica se o usuário tem algum ingresso para este evento específico
      const hasEventTicket = tickets.some((ticket: any) => ticket.eventId === parsedEventId);

      setHasTicket(hasEventTicket);
      return hasEventTicket;
    } catch (error) {
      console.error("Erro ao verificar ingressos:", error);
      return false;
    }
  };

  useEffect(() => {
    // Verifica o referrer para saber de onde o usuário veio
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      // Se o referrer contém "my-tickets", o usuário veio da página de meus ingressos
      if (referrer.includes("my-tickets")) {
        setCameFromMyTickets(true);
      }
      
      // Alternativa: usar localStorage para rastrear a origem
      const storedOrigin = localStorage.getItem("navigation_origin");
      if (storedOrigin === "my-tickets") {
        setCameFromMyTickets(true);
        // Limpar após uso
        localStorage.removeItem("navigation_origin");
      }
    }
    
    // Recupera os dados do usuário logado do localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
  
      // Verificar se o usuário tem ingresso para este evento
      if (id) {
        checkUserHasTicket(userData.id, id);
      }
    }
  
    if (!id) return;
  
    fetch(`https://localhost:7027/api/Events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Evento não encontrado");
        return res.json();
      })
      .then((data) => {
        setEvent(data);
  
        // Verifica se o evento está acontecendo agora - entre a data inicial e final
        const eventStartDate = new Date(data.date);
        const eventEndDate = new Date(data.endDate);
        const today = new Date();
  
        // Evento está acontecendo se: data atual está entre início e fim
        const isHappening = today >= eventStartDate && today <= eventEndDate;
  
        setIsEventDay(isHappening);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar evento:", err);
        setLoading(false);
      });
  }, [id]);

  // Função para formatar apenas a data (DD/MM/AAAA)
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

  // Função para aumentar a quantidade de ingressos
  const increaseTicketCount = () => {
    if (event && ticketCount < event.availableTickets) {
      setTicketCount(ticketCount + 1);
    }
  };

  // Função para diminuir a quantidade de ingressos
  const decreaseTicketCount = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  // Modificada para comprar múltiplos ingressos
  const handleBuyTicket = async () => {
    if (!event) return;

    // Verificar se o usuário está logado
    if (!user) {
      alert("Você precisa estar logado para comprar ingressos");
      return;
    }

    // Verificar se há ingressos suficientes disponíveis
    if (event.availableTickets < ticketCount) {
      alert(`Apenas ${event.availableTickets} ingressos disponíveis para este evento.`);
      return;
    }

    try {
      const response = await fetch("https://localhost:7027/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          buyerId: user.id,
          quantity: ticketCount // Enviando a quantidade selecionada
        }),
      });

      if (!response.ok) {
        console.error("Erro ao comprar ingresso");
        alert("Não foi possível completar a compra do ingresso. Por favor, tente novamente.");
        return;
      }

      // Atualizar o estado para mostrar que agora o usuário tem ingresso
      setHasTicket(true);

      // Atualizar a quantidade de ingressos disponíveis no estado local
      setEvent({
        ...event,
        availableTickets: event.availableTickets - ticketCount
      });

      // Resetar o contador de ingressos
      setTicketCount(1);

      alert(`${ticketCount} ingresso${ticketCount > 1 ? 's' : ''} comprado${ticketCount > 1 ? 's' : ''} com sucesso!`);
      
      // Redirecionar para a página "Meus Ingressos" após a compra
      router.push("/client/my-tickets");
    } catch (error) {
      console.error("Erro na compra do ingresso:", error);
      alert("Ocorreu um erro durante a compra do ingresso. Por favor, tente novamente.");
    }
  };

  const handleAccessStore = () => {
    // Redireciona para a loja do evento com o ID correto
    router.push(`/store/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Carregando informações do evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-600">Evento não encontrado</p>
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

      {/* Conteúdo principal */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">{event.name}</h2>

          {/* Informações do Evento */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Informações do Evento</h3>
            <p className="text-gray-700">
              <span className="font-medium">Início:</span> {formatarDataHora(event.date)}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Termino:</span> {formatarDataHora(event.endDate)}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Local:</span> {event.location}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Ingressos restantes:</span> {event.availableTickets}
            </p>

            <p className="text-gray-700">
              <span className="font-medium">Descrição:</span> {event.description || "Sem descrição disponível"}
            </p>
          </div>

          {/* Informações de Contato */}
          <div className="mt-6 pt-4 border-t space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Informações de Contato</h3>
            {event.contactEmail && (
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {event.contactEmail}
              </p>
            )}
            {event.contactPhone && (
              <p className="text-gray-700">
                <span className="font-medium">Telefone:</span> {event.contactPhone}
              </p>
            )}
            {!event.contactEmail && !event.contactPhone && (
              <p className="text-gray-500 italic">Nenhuma informação de contato disponível</p>
            )}
          </div>

          {/* Botões de ação */}
          <div className="mt-8 pt-4 border-t flex flex-col items-center space-y-4">
            {/* CENÁRIO 1: Usuário vem da página de ingressos (não de "Meus Ingressos") */}
            {!cameFromMyTickets && (
              <>
                {event.availableTickets > 0 ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-700 font-medium">Quantidade de ingressos:</span>
                      <div className="flex items-center border rounded-md">
                        <button 
                          onClick={decreaseTicketCount}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-l-md"
                          disabled={ticketCount <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-1">{ticketCount}</span>
                        <button 
                          onClick={increaseTicketCount}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-r-md"
                          disabled={ticketCount >= event.availableTickets}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors w-full max-w-xs"
                      onClick={handleBuyTicket}
                    >
                      {ticketCount > 1 ? `Comprar ${ticketCount} Ingressos` : "Comprar Ingresso"}
                    </button>
                  </>
                ) : (
                  <div className="px-6 py-3 bg-red-500 text-white rounded-md">
                    Ingressos Esgotados
                  </div>
                )}
              </>
            )}
            
            {/* CENÁRIO 2: Usuário vem da página "Meus Ingressos" */}
            {cameFromMyTickets && hasTicket && isEventDay && (
              <button
                className="mt-4 px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors w-full max-w-xs"
                onClick={handleAccessStore}
              >
                Acessar Loja do Evento
              </button>
            )}
          </div>
        </div>
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