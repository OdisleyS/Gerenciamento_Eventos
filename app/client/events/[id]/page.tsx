"use client"

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface EventoProps {
  id: string;
  nome: string;
  data: string;
  local: string;
  horario: string;
  descricao: string;
  ingressosDisponiveis: number;
  preco: number;
  classificacaoEtaria: string;
  duracao: string;
  contato: {
    telefone: string;
    email: string;
  };
}

const eventosMock: EventoProps[] = [
  {
    id: "1",
    nome: "Evento A",
    data: "10/10/2024",
    local: "Arena de Shows",
    horario: "19:00",
    descricao: "Show ao vivo com diversas bandas nacionais e internacionais, com participação especial de artistas renomados.",
    ingressosDisponiveis: 100,
    preco: 150.0,
    classificacaoEtaria: "18+",
    duracao: "4 horas",
    contato: {
      telefone: "(11) 99999-9999",
      email: "contato@eventoA.com"
    }
  },
  {
    id: "2",
    nome: "Evento B",
    data: "15/11/2024",
    local: "Teatro Municipal",
    horario: "20:30",
    descricao: "Uma peça teatral emocionante, contando histórias incríveis com grandes atores da cena nacional.",
    ingressosDisponiveis: 50,
    preco: 100.0,
    classificacaoEtaria: "12+",
    duracao: "2 horas",
    contato: {
      telefone: "(21) 98888-7777",
      email: "contato@eventoB.com"
    }
  },
  {
    id: "3",
    nome: "Evento C",
    data: "05/12/2024",
    local: "Centro de Convenções",
    horario: "18:00",
    descricao: "Um congresso sobre tecnologia e inovação, com palestrantes de renome internacional.",
    ingressosDisponiveis: 200,
    preco: 200.0,
    classificacaoEtaria: "Livre",
    duracao: "8 horas",
    contato: {
      telefone: "(31) 97777-6666",
      email: "contato@eventoC.com"
    }
  }
];

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();

  const evento = eventosMock.find(e => e.id === id) || eventosMock[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Controle-SE</h1>
          <nav className="flex space-x-6">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <Link href="/events" className="hover:text-gray-300">Ingressos</Link>
            <Link href="/my-tickets" className="hover:text-gray-300">Meus Ingressos</Link>
          </nav>
          <div className="text-sm">Logado como: Cliente</div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow bg-gray-100 py-8">
        <h1 className="text-2xl font-bold text-center mb-6">Detalhes do Evento</h1>
        
        <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold text-center mb-6">{evento.nome}</h2>
          
          <div className="space-y-3">
            <p><strong>Data:</strong> {evento.data}</p>
            <p><strong>Local:</strong> {evento.local}</p>
            <p><strong>Horário:</strong> {evento.horario}</p>
            <p><strong>Descrição:</strong> {evento.descricao}</p>
            <p><strong>Ingressos disponíveis:</strong> {evento.ingressosDisponiveis}</p>
            <p><strong>Preço:</strong> R$ {evento.preco.toFixed(2)}</p>
            <p><strong>Classificação etária:</strong> {evento.classificacaoEtaria}</p>
            <p><strong>Duração:</strong> {evento.duracao}</p>
            <p><strong>Contato para mais informações:</strong> {evento.contato.telefone} ou <a href={`mailto:${evento.contato.email}`} className="text-blue-600 hover:underline">{evento.contato.email}</a></p>
          </div>
          
          <div className="mt-6">
            <button 
              className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              onClick={() => router.push(`/checkout/${evento.id}`)}
            >
              Comprar Ingresso
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>© 2024 Controle-SE</div>
          <nav className="flex space-x-4">
            <Link href="/about" className="hover:text-gray-300">Sobre</Link>
            <Link href="/contact" className="hover:text-gray-300">Contato</Link>
            <Link href="/help" className="hover:text-gray-300">Ajuda</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default EventDetailPage;
    