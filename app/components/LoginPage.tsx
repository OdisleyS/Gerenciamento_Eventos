import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ClientLoginForm from "./ClientLoginForm"
import EmployeeLoginForm from "./EmployeeLoginForm"
import Link from "next/link"
import ThemeToggle from "./ThemeToggle"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Escolha o tipo de usuário e faça login</CardDescription>
        </CardHeader>
        <ThemeToggle />
        <CardContent>
          <Tabs defaultValue="client">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client">Cliente</TabsTrigger>
              <TabsTrigger value="employee">Funcionário</TabsTrigger>
            </TabsList>
            <TabsContent value="client">
              <ClientLoginForm />
            </TabsContent>
            <TabsContent value="employee">
              <EmployeeLoginForm />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Ainda não tem conta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

