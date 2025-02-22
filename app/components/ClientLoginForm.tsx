"use client"

import { useRouter } from "next/navigation"  // Adicione esta linha
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ClientLoginData } from "../types"

const clientSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  clientId: z.string().min(1, { message: "ID do cliente é obrigatório" }),
})

export default function ClientLoginForm() {
  const router = useRouter()  // Adicione esta linha
  
  const form = useForm<ClientLoginData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      email: "",
      password: "",
      clientId: "",
    },
  })

  const onSubmit = (data: ClientLoginData) => {
    console.log("Login data:", data)
    // Sua lógica de autenticação aqui
    
    // Adicione esta linha para redirecionar após o login
    router.push('/client/events')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Seu ID de cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Entrar como Cliente
        </Button>
      </form>
    </Form>
  )
}
