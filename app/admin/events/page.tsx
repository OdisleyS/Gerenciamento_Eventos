"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  availableTickets: number;
  totalTickets: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
}

interface EditEventForm {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  
  // Estados para modal de edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState<EditEventForm>({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    contactPhone: "",
    contactEmail: ""
  });

  // Recupera os dados do usuário logado do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchEvents = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Função para calcular total de ingressos vendidos corretamente
  const getTotalTicketsSold = () => {
    return events.reduce((total, event) => {
      return total + (event.totalTickets - event.availableTickets);
    }, 0);
  };

  // Função para encontrar o próximo evento (com data mais próxima no futuro)
  const getNextEvent = () => {
    if (events.length === 0) return null;
    
    const today = new Date();
    const futureEvents = events.filter(event => new Date(event.date) >= today);
    
    if (futureEvents.length === 0) return events[0]; // Se não houver eventos futuros, retorna o primeiro
    
    return futureEvents.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];
  };

  // Função para navegação para nova página de evento
  const navigateToNewEvent = () => {
    router.push("/admin/dashboard");
  };

  // Função para exportar/baixar relatório do evento
  const handleExportEvent = (event: Event) => {
    try {
      // Criar um objeto com os dados do evento para exportação
      const eventData = {
        nome: event.name,
        descricao: event.description || "N/A",
        data: new Date(event.date).toLocaleDateString('pt-BR'),
        hora: new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        local: event.location,
        ingressosTotal: event.totalTickets,
        ingressosDisponiveis: event.availableTickets,
        ingressosVendidos: event.totalTickets - event.availableTickets,
        telefoneContato: event.contactPhone || "N/A",
        emailContato: event.contactEmail || "N/A"
      };

      // Converter dados para formato CSV
      const headers = Object.keys(eventData).join(',');
      const values = Object.values(eventData).join(',');
      const csvContent = `${headers}\n${values}`;
      
      // Criar um blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `evento_${event.id}_${event.name.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      
      // Iniciar download e limpar
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      alert("Erro ao exportar relatório. Tente novamente.");
    }
  };

  // Função para abrir modal de edição
  const openEditModal = (event: Event) => {
    setCurrentEvent(event);
    
    // Preparar data e hora para o formulário
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Formatar hora (HH:MM)
    const hours = eventDate.getHours().toString().padStart(2, '0');
    const minutes = eventDate.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    setEditForm({
      name: event.name,
      description: event.description || "",
      date: formattedDate,
      time: formattedTime,
      location: event.location,
      contactPhone: event.contactPhone || "",
      contactEmail: event.contactEmail || ""
    });
    
    setShowEditModal(true);
  };

  // Função para abrir modal de confirmação de exclusão
  const openDeleteModal = (event: Event) => {
    setCurrentEvent(event);
    setShowDeleteModal(true);
  };

  // Função para atualizar evento
  const handleUpdateEvent = async () => {
    if (!currentEvent) return;

    try {
      // Combinar data e hora
      const dateTime = new Date(`${editForm.date}T${editForm.time}`);
      const utcDate = dateTime.toISOString();

      const response = await fetch(`https://localhost:7027/api/Events/${currentEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          date: utcDate,
          location: editForm.location,
          contactPhone: editForm.contactPhone,
          contactEmail: editForm.contactEmail
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar evento");
      }

      // Fechar modal e atualizar lista
      setShowEditModal(false);
      fetchEvents();
      alert("Evento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      alert("Erro ao atualizar evento. Tente novamente.");
    }
  };

  // Função para deletar evento
  const handleDeleteEvent = async () => {
    if (!currentEvent) return;

    try {
      const response = await fetch(`https://localhost:7027/api/Events/${currentEvent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir evento");
      }

      // Fechar modal e atualizar lista
      setShowDeleteModal(false);
      fetchEvents();
      alert("Evento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert("Erro ao excluir evento. Tente novamente.");
    }
  };

  // Função para lidar com mudanças no formulário
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse delay-150"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  const nextEvent = getNextEvent();

  // Função para extrair e formatar a data e hora de um evento
  const formatEventDateTime = (dateString: string) => {
    const eventDate = new Date(dateString);
    return {
      date: eventDate.toLocaleDateString('pt-BR'),
      time: eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header - Usando a estrutura do primeiro arquivo */}
      <header className="bg-gray-800 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gestão de Eventos - Admin</h1>
          
          {/* Menu centralizado */}
          <nav className="flex-1 flex justify-center">
            <a 
              href="/admin/events" 
              className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              Meus Eventos
            </a>
            <a 
              href="/admin/dashboard" 
              className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              Cadastrar Evento
            </a>
          </nav>
          
          {/* Área do usuário à direita */}
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
      </header>

      {/* Conteúdo Principal - Mantendo o original do segundo arquivo */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Meus Eventos</h2>
            <button 
              onClick={navigateToNewEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Novo Evento
            </button>
          </div>
          {events.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600 text-lg">Nenhum evento cadastrado ainda.</p>
              <button 
                onClick={navigateToNewEvent}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Cadastrar Primeiro Evento
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 text-left">
                    <th className="py-3 px-4 font-semibold rounded-tl-lg">Nome</th>
                    <th className="py-3 px-4 font-semibold">Data</th>
                    <th className="py-3 px-4 font-semibold">Hora</th>
                    <th className="py-3 px-4 font-semibold">Local</th>
                    <th className="py-3 px-4 font-semibold text-center">Ingressos Disponíveis</th>
                    <th className="py-3 px-4 font-semibold text-center">Total</th>
                    <th className="py-3 px-4 font-semibold text-center">Vendidos</th>
                    <th className="py-3 px-4 font-semibold text-center rounded-tr-lg">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, index) => {
                    const ticketsSold = ev.totalTickets - ev.availableTickets;
                    const { date, time } = formatEventDateTime(ev.date);
                    return (
                      <tr key={ev.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}>
                        <td className="py-3 px-4 font-medium">{ev.name}</td>
                        <td className="py-3 px-4">{date}</td>
                        <td className="py-3 px-4">{time}</td>
                        <td className="py-3 px-4">{ev.location}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-sm ${ev.availableTickets > ev.totalTickets * 0.5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {ev.availableTickets}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{ev.totalTickets}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {ticketsSold}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => openEditModal(ev)}
                              className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleExportEvent(ev)}
                              className="p-1 rounded text-green-600 hover:bg-green-100 transition-colors"
                              title="Exportar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => openDeleteModal(ev)}
                              className="p-1 rounded text-red-600 hover:bg-red-100 transition-colors"
                              title="Excluir"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm mb-1">Total de Eventos</p>
              <p className="text-2xl font-bold text-blue-900">{events.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm mb-1">Ingressos Vendidos</p>
              <p className="text-2xl font-bold text-green-900">
                {getTotalTicketsSold()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-purple-800 text-sm mb-1">Próximo Evento</p>
              <p className="text-lg font-bold text-purple-900">
                {nextEvent ? `${nextEvent.name} (${new Date(nextEvent.date).toLocaleDateString('pt-BR')})` : "Nenhum evento"}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Usando a estrutura do primeiro arquivo */}
      <footer className="bg-gray-800 text-white p-4 mt-8 shadow-inner">
        <div className="container mx-auto text-center text-sm">
          © 2024 Gestão de Eventos
        </div>
      </footer>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Editar Evento</h2>
            <div className="space-y-4">
              {/* Formulário de edição */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nome do Evento</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Descrição</label>
                <input
                  type="text"
                  name="description"
                  value={editForm.description}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Data</label>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Hora</label>
                  <input
                    type="time"
                    name="time"
                    value={editForm.time}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Local</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Telefone de Contato</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={editForm.contactPhone}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email de Contato</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={editForm.contactEmail}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Confirmar Exclusão</h2>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir o evento "{currentEvent?.name}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteEvent}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}