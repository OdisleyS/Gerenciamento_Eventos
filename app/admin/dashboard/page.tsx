"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Defina o tipo Event conforme esperado do back‑end
interface Event {
  id: number;
  name: string;
  description?: string;
  date: string;
  location: string;
  totalTickets: number;
  availableTickets: number;
  contactPhone?: string;
  contactEmail?: string;
  createdBy: number;
}

// Valores do formulário para cadastro de evento
interface EventFormValues {
  name: string;
  description?: string;
  date: string;
  location: string;
  totalTickets: number;
  contactPhone?: string;
  contactEmail?: string;
}

const eventSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  description: z.string().optional(),
  date: z.string().min(1, { message: "Data é obrigatória" }),
  location: z.string().min(1, { message: "Local é obrigatório" }),
  totalTickets: z.number({ invalid_type_error: "Total de ingressos deve ser um número" }),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email({ message: "Email de contato inválido" }).optional(),
});

export default function AdminDashboard() {
  // Para testes, simule o admin logado com ID 1 e nome "Admin Name"
  const adminId = 1;
  const adminName = "Admin Name";

  const [events, setEvents] = useState<Event[]>([]);
  const { register, handleSubmit, reset } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      description: "",
      date: "",
      location: "",
      totalTickets: 0,
      contactPhone: "",
      contactEmail: "",
    },
  });

  // Função para buscar eventos reais do back‑end
  const fetchEvents = async () => {
    try {
      const res = await fetch("https://localhost:7027/api/Events");
      if (!res.ok) {
        console.error("Erro ao buscar eventos");
        return;
      }
      const data: Event[] = await res.json();
      // Filtra somente os eventos criados pelo admin logado
      const adminEvents = data.filter((event) => event.createdBy === adminId);
      setEvents(adminEvents);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    try {
      const response = await fetch("https://localhost:7027/api/Events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          createdBy: adminId,
        }),
      });
      if (!response.ok) {
        console.error("Erro ao criar evento");
        return;
      }
      // Após criar o evento, atualize a lista
      await fetchEvents();
      reset();
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gestão de Eventos - Admin</h1>
          <div className="text-sm">Logado como: {adminName}</div>
          <nav>
            <Link href="/logout" className="hover:underline">
              Sair
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-8">
        {/* Seção "Meus Eventos" */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Meus Eventos</h2>
          {events.length === 0 ? (
            <p>Nenhum evento cadastrado.</p>
          ) : (
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Nome</th>
                  <th className="border px-4 py-2">Data</th>
                  <th className="border px-4 py-2">Local</th>
                  <th className="border px-4 py-2">Ingressos Disponíveis</th>
                  <th className="border px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="border px-4 py-2">{event.name}</td>
                    <td className="border px-4 py-2">{event.date}</td>
                    <td className="border px-4 py-2">{event.location}</td>
                    <td className="border px-4 py-2">{event.availableTickets}</td>
                    <td className="border px-4 py-2">{event.totalTickets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Seção "Cadastrar Novo Evento" */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Cadastrar Novo Evento</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block">Nome do Evento</label>
              <Input {...register("name")} placeholder="Nome do Evento" />
            </div>
            <div>
              <label className="block">Descrição</label>
              <Input {...register("description")} placeholder="Descrição do Evento" />
            </div>
            <div>
              <label className="block">Data</label>
              <Input type="date" {...register("date")} />
            </div>
            <div>
              <label className="block">Local</label>
              <Input {...register("location")} placeholder="Local do Evento" />
            </div>
            <div>
              <label className="block">Total de Ingressos</label>
              <Input type="number" {...register("totalTickets", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="block">Telefone de Contato</label>
              <Input {...register("contactPhone")} placeholder="Telefone" />
            </div>
            <div>
              <label className="block">Email de Contato</label>
              <Input {...register("contactEmail")} placeholder="email@contato.com" />
            </div>
            <Button type="submit">Cadastrar Evento</Button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          © 2024 Gestão de Eventos
        </div>
      </footer>
    </div>
  );
}
