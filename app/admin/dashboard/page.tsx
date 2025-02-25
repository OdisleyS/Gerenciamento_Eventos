"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

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
  totalTickets: z.coerce.number({
    invalid_type_error: "Total de ingressos deve ser um número",
  }),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email({ message: "Email de contato inválido" }).optional(),
});

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
}

export default function NewEventPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const form = useForm<EventFormValues>({
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

  // Recupera os dados do usuário logado do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }
    try {
      const localDate = new Date(data.date);
      const utcDate = localDate.toISOString();

      const response = await fetch("https://localhost:7027/api/Events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: utcDate,
          createdBy: user.id,
        }),
      });

      if (!response.ok) {
        console.error("Erro ao criar evento");
        return;
      }

      alert("Evento criado com sucesso!");
      router.push("/admin/events");
      form.reset();
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gestão de Eventos - Admin</h1>
          <div className="text-sm">
            Logado como: {user ? user.name : "Carregando..."}
          </div>
          <nav className="space-x-4">
            <a href="/admin/events" className="hover:underline">
              Meus Eventos
            </a>
            <a href="/logout" className="hover:underline">
              Sair
            </a>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Cadastrar Novo Evento</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded shadow-md">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do Evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do Evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Local do Evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalTickets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de Ingressos</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Total de Ingressos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone de Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="email@contato.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Cadastrar Evento</Button>
          </form>
        </Form>
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
