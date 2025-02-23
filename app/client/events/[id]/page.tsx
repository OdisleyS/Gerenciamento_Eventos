"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();

  // Busca os eventos do back-end
  useEffect(() => {
    fetch("https://localhost:7027/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Erro ao buscar eventos:", err));
  }, []);

  const handleBuyTicket = async (eventId: number) => {
    try {
      // Para exemplo, o buyerId está fixo; em um cenário real, esse valor viria do usuário autenticado
      const response = await fetch("https://localhost:7027/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          buyerId: 1
        }),
      });
      if (!response.ok) {
        console.error("Erro ao comprar ingresso");
        return;
      }
      alert("Ingresso comprado com sucesso!");
      // Opcional: atualizar a lista de eventos para refletir a nova disponibilidade
    } catch (error) {
      console.error("Erro na compra do ingresso:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Próximos Eventos</h1>
      {events.length === 0 ? (
        <p>Nenhum evento disponível.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div key={event.id} className="p-4 border rounded">
              <h2 className="font-bold text-xl">{event.name}</h2>
              <p>{event.date} - {event.location}</p>
              <p>{event.description}</p>
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => handleBuyTicket(event.id)}
              >
                Comprar Ingresso
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
