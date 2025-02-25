"use client";

import React, { useEffect, useState } from "react";

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  availableTickets: number;
  totalTickets: number;
  // ... quaisquer outros campos retornados do backend
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Exemplo: supomos que /api/admin/events retorna apenas os eventos do Admin logado
    fetch("https://localhost:7027/api/Events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar eventos do admin:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gestão de Eventos - Admin</h1>
          <nav className="flex space-x-4">
            <a href="/admin/events" className="hover:text-gray-300">
              Meus Eventos
            </a>
            <a href="/admin/dashboard" className="hover:text-gray-300">
              Cadastrar Evento
            </a>
          </nav>
          <div className="text-sm">Logado como: Nome Admin</div>
          {/* Opcional: Botão de Sair */}
          <button
            className="bg-transparent hover:text-gray-300"
            onClick={() => {
              // Lógica de logout se necessário
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Meus Eventos</h2>
        {events.length === 0 ? (
          <p>Nenhum evento cadastrado ainda.</p>
        ) : (
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">Nome</th>
                <th className="py-3 px-4 text-left">Data</th>
                <th className="py-3 px-4 text-left">Local</th>
                <th className="py-3 px-4 text-left">Ingressos Disponíveis</th>
                <th className="py-3 px-4 text-left">Total</th>
                {/* Você pode colocar mais colunas para editar/excluir se quiser */}
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b">
                  <td className="py-2 px-4">{ev.name}</td>
                  <td className="py-2 px-4">{ev.date}</td>
                  <td className="py-2 px-4">{ev.location}</td>
                  <td className="py-2 px-4">{ev.availableTickets}</td>
                  <td className="py-2 px-4">{ev.totalTickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>© 2024 Gestão de Eventos</div>
          <nav className="flex space-x-4">
            <a href="#" className="hover:text-gray-300">
              Sobre
            </a>
            <a href="#" className="hover:text-gray-300">
              Contato
            </a>
            <a href="#" className="hover:text-gray-300">
              Ajuda
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
