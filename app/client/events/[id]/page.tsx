"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface EventDetail {
  id: number;
  name: string;
  date: string;
  location: string;
  description: string;
  // ... demais campos do evento
}

export default function EventDetailPage() {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams(); // Pega o [id] da rota
  const { id } = params;      // Em Next 13, vem como string

  useEffect(() => {
    if (!id) return; // se não tiver id, não faz nada

    fetch(`https://localhost:7027/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Evento não encontrado");
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar evento:", err);
        setLoading(false);
      });
  }, [id]);

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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">{event.name}</h2>
          <p className="text-gray-700 mb-2"><strong>Data:</strong> {event.date}</p>
          <p className="text-gray-700 mb-2"><strong>Local:</strong> {event.location}</p>
          <p className="text-gray-700 mb-4"><strong>Descrição:</strong> {event.description}</p>

          {/* Botão de comprar ingresso */}
          <button
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            onClick={handleBuyTicket}
          >
            Comprar Ingresso
          </button>
        </div>
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
