"use client"

import React from "react"
import { useRouter } from "next/navigation"

interface EventCardProps {
  id: string
  title: string
  date: string
  location: string
}

const EventCard: React.FC<EventCardProps> = ({ id, title, date, location }) => {
  const router = useRouter()

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center space-y-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">Data: {date}</p>
      <p className="text-gray-600">Local: {location}</p>
      <button
        onClick={() => router.push(`events/${id}`)}
        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
      >
        Ver Detalhes
      </button>
    </div>
  )
}

const EventsPage: React.FC = () => {
  const events: EventCardProps[] = [
    { id: "1", title: "Evento A", date: "10/10/2024", location: "Arena de Shows" },
    { id: "2", title: "Evento B", date: "20/11/2024", location: "Estádio Municipal" },
    { id: "3", title: "Evento C", date: "15/12/2024", location: "Centro de Convenções" },
    { id: "4", title: "Evento D", date: "05/01/2025", location: "Parque de Exposições" },
    { id: "5", title: "Evento E", date: "22/01/2025", location: "Auditório Central" },
    { id: "6", title: "Evento F", date: "10/02/2025", location: "Ginásio Poliesportivo" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">EGO - Gestão de Eventos</h1>
          <nav className="flex space-x-4">
            <a href="#" className="hover:text-gray-300">Home</a>
            <a href="#" className="hover:text-gray-300">Ingressos</a>
            <a href="#" className="hover:text-gray-300">Meus Ingressos</a>
          </nav>
          <div className="text-sm">Logado como: Cliente</div>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Comprar Ingressos</h2>
        <h3 className="text-xl font-semibold mb-6 text-center">Próximos Eventos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} id={event.id} title={event.title} date={event.date} location={event.location} />
          ))}
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>© 2024 EGO - Gestão de Eventos</div>
          <nav className="flex space-x-4">
            <a href="#" className="hover:text-gray-300">Sobre</a>
            <a href="#" className="hover:text-gray-300">Contato</a>
            <a href="#" className="hover:text-gray-300">Ajuda</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default EventsPage
