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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface EventFormValues {
  name: string;
  description?: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  location: string;
  totalTickets: number;
  contactPhone?: string;
  contactEmail?: string;
}

const eventSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  description: z.string().optional(),
  date: z.string().min(1, { message: "Data é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
  endDate: z.string().min(1, { message: "Data final é obrigatória" }),
  endTime: z.string().min(1, { message: "Horário final é obrigatório" }),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      description: "",
      date: "",
      time: "",
      endDate: "",
      endTime: "",
      location: "",
      totalTickets: 0,
      contactPhone: "",
      contactEmail: "",
    },
  });

  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');

    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limitedNumbers = numbers.slice(0, 11);

    // Aplica a máscara (XX) XXXXX-XXXX
    if (limitedNumbers.length > 0) {
      // Formato para números com mais de 2 dígitos
      if (limitedNumbers.length > 2) {
        // Se tiver mais de 7 dígitos, adiciona o hífen
        if (limitedNumbers.length > 7) {
          return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
        }
        return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
      }
      return `(${limitedNumbers})`;
    }

    return limitedNumbers;
  };

  // Recupera os dados do usuário logado do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    if (!user) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combina a data e o horário de início para criar um objeto de data completo
      const [startYear, startMonth, startDay] = data.date.split('-').map(Number);
      const [startHours, startMinutes] = data.time.split(':').map(Number);

      // Combina a data e o horário de fim para criar um objeto de data completo para o endDate
      const [endYear, endMonth, endDay] = data.endDate.split('-').map(Number);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);

      // Mês em JavaScript é 0-indexed (0-11), então subtraímos 1
      const eventDateTime = new Date(startYear, startMonth - 1, startDay, startHours, startMinutes);
      const eventEndDateTime = new Date(endYear, endMonth - 1, endDay, endHours, endMinutes);

      const utcDate = eventDateTime.toISOString();
      const utcEndDate = eventEndDateTime.toISOString();

      const response = await fetch("https://localhost:7027/api/Events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: utcDate, // Envia a data com o horário
          endDate: utcEndDate, // Envia a data final com o horário
          createdBy: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar evento");
      }

      alert("Evento criado com sucesso!");

      setTimeout(() => {
        router.push("/admin/events");
        form.reset();
      }, 500);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      alert("Não foi possível criar o evento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
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

      {/* Conteúdo Principal */}
      <main className="container mx-auto p-6 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
            Cadastrar Novo Evento
          </h2>

          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-gray-700">Informações do Evento</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Nome e Descrição */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Nome do Evento
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome do Evento"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Descrição
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Descrição do Evento"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Data, Horário e Local */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Data de Início
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Horário de Início
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Local
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Local do Evento"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Data e Horário de Fim */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Data de Término
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Horário de Término
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Ingressos e Contato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                    <FormField
                      control={form.control}
                      name="totalTickets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Total de Ingressos
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Total de Ingressos"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Telefone de Contato
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                              value={formatPhoneNumber(field.value || '')}
                              onChange={(e) => {
                                const formattedValue = formatPhoneNumber(e.target.value);
                                field.onChange(formattedValue);
                              }}
                              maxLength={16} // (XX) XXXXX-XXXX tem 16 caracteres com formatação
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <div className="pt-2 border-t">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Email de Contato
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="email@contato.com"
                              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 flex justify-end space-x-3 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() => router.push("/admin/events")}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gray-800 hover:bg-gray-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Cadastrando..." : "Cadastrar Evento"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-8 shadow-inner">
        <div className="container mx-auto text-center text-sm">
          © 2024 Gestão de Eventos
        </div>
      </footer>
    </div>
  );
}