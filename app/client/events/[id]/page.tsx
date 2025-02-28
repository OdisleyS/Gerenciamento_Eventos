"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface EventDetail {
  id: number;
  name: string;
  date: string;
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

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    // Recupera os dados do usuário logado do localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (!id) return;

    fetch(`https://localhost:7027/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Evento não encontrado");
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        
        // Verifica se o dia do evento é hoje
        const eventDate = new Date(data.date);
        const today = new Date();
        
        // Compara apenas as datas (ignora o horário)
        const isToday = 
          eventDate.getDate() === today.getDate() &&
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getFullYear() === today.getFullYear();
        
        setIsEventDay(isToday);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar evento:", err);
        setLoading(false);
      });
  }, [id]);

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

  const handleBuyTicket = async () => {
    if (!event) return;

    try {
      // Exemplo: buyerId fixo em 1. Em produção, você usaria o ID do usuário logado
      const response = await fetch("https://localhost:7027/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          buyerId: 1,
        }),
      });

      if (!response.ok) {
        console.error("Erro ao comprar ingresso");
        return;
      }

      alert("Ingresso comprado com sucesso!");
      // Se quiser, redireciona para "Meus Ingressos" ou algo assim
      // router.push("/client/my-tickets");
    } catch (error) {
      console.error("Erro na compra do ingresso:", error);
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

      {/* Conteúdo principal */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">{event.name}</h2>
          
          {/* Informações do Evento */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Informações do Evento</h3>
            <p className="text-gray-700">
              <span className="font-medium">Data:</span> {formatarData(event.date)}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Hora:</span> {formatarHora(event.date)}
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
          <div className="mt-8 pt-4 border-t flex justify-center space-x-4">
            <button
              className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
              onClick={handleBuyTicket}
              disabled={event.availableTickets <= 0}
            >
              {event.availableTickets > 0 ? "Comprar Ingresso" : "Ingressos Esgotados"}
            </button>
            
            {isEventDay && (
              <button
                className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
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