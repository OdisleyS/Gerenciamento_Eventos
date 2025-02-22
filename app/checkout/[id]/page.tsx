"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface EventoProps {
  id: string
  nome: string
  data: string
  local: string
  horario: string
  descricao: string
  ingressosDisponiveis: number
  preco: number
  classificacaoEtaria: string
  duracao: string
  contato: {
    telefone: string
    email: string
  }
}

// Dados mock compartilhados com a página de detalhes do evento
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
]

const CheckoutPage: React.FC = () => {
  const { id } = useParams()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "boleto" | "pix">("credit")
  const [evento, setEvento] = useState<EventoProps | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados para os campos do cartão de crédito
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCVC, setCardCVC] = useState("")
  
  // Carrega os dados do evento com base no ID da URL
  useEffect(() => {
    // Simulando uma chamada de API
    const fetchEvento = () => {
      const eventoFound = eventosMock.find(e => e.id === id)
      
      if (eventoFound) {
        setEvento(eventoFound)
      } else {
        // Redireciona para a lista de eventos se o evento não existir
        alert("Evento não encontrado")
        router.push("/events")
      }
      
      setLoading(false)
    }
    
    fetchEvento()
  }, [id, router])

  // Função para lidar com a mudança na forma de pagamento
  const handlePaymentMethodChange = (method: "credit" | "boleto" | "pix") => {
    setPaymentMethod(method)
  }

  // Função para formatar o número do cartão
  const formatCardNumber = (value: string) => {
    const formattedValue = value.replace(/\D/g, "").slice(0, 16)
    let formatted = ""
    for (let i = 0; i < formattedValue.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " "
      }
      formatted += formattedValue[i]
    }
    return formatted
  }

  // Função para formatar a data de validade
  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 4)
    if (numbers.length > 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
    }
    return numbers
  }

  // Função para formatar o CVC
  const formatCVC = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 3)
  }

  // Função para confirmar o pagamento
  const handleConfirmPayment = () => {
    if (!evento) return
    
    // Aqui você implementaria a lógica para processar o pagamento
    alert(`Pagamento confirmado com sucesso para o evento: ${evento.nome}!`)
    router.push("/confirmation")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl">Carregando informações do evento...</p>
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-red-600">Evento não encontrado</p>
      </div>
    )
  }

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
          <div className="text-sm">Logado como: Consumidor</div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
          <h1 className="text-2xl font-bold text-center mb-6">Finalizar Pagamento</h1>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-center mb-6">Resumo do Pedido</h2>
            <div className="space-y-2">
              <p><strong>Evento:</strong> {evento.nome}</p>
              <p><strong>Data:</strong> {evento.data}</p>
              <p><strong>Local:</strong> {evento.local}</p>
              <p><strong>Ingresso:</strong> 1 x R$ {evento.preco.toFixed(2)}</p>
              <p><strong>Total a Pagar:</strong> R$ {evento.preco.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-center mb-6">Escolha a Forma de Pagamento</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="credit"
                  name="paymentMethod"
                  checked={paymentMethod === "credit"}
                  onChange={() => handlePaymentMethodChange("credit")}
                  className="mr-2"
                />
                <label htmlFor="credit">Cartão de Crédito</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="boleto"
                  name="paymentMethod"
                  checked={paymentMethod === "boleto"}
                  onChange={() => handlePaymentMethodChange("boleto")}
                  className="mr-2"
                />
                <label htmlFor="boleto">Boleto Bancário</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="pix"
                  name="paymentMethod"
                  checked={paymentMethod === "pix"}
                  onChange={() => handlePaymentMethodChange("pix")}
                  className="mr-2"
                />
                <label htmlFor="pix">PIX</label>
              </div>
            </div>
          </div>

          {/* Formulário de Cartão de Crédito */}
          {paymentMethod === "credit" && (
            <div className="mb-8">
              <h3 className="font-bold mb-4">Informações do Cartão de Crédito</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="cardNumber" className="block mb-1">Número do Cartão:</label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="cardName" className="block mb-1">Nome no Cartão:</label>
                  <input
                    type="text"
                    id="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Nome Completo"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label htmlFor="cardExpiry" className="block mb-1">Validade (MM/AA):</label>
                  <input
                    type="text"
                    id="cardExpiry"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiryDate(e.target.value))}
                    placeholder="MM/AA"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label htmlFor="cardCVC" className="block mb-1">CVC:</label>
                  <input
                    type="text"
                    id="cardCVC"
                    value={cardCVC}
                    onChange={(e) => setCardCVC(formatCVC(e.target.value))}
                    placeholder="123"
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informações de Boleto Bancário */}
          {paymentMethod === "boleto" && (
            <div className="mb-8">
              <h3 className="font-bold mb-4">Informações do Boleto Bancário</h3>
              <p className="mb-4">Um boleto será gerado após a confirmação. O prazo de compensação é de até 3 dias úteis.</p>
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-medium">Instruções:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>O boleto terá vencimento em 3 dias úteis</li>
                  <li>Você receberá o boleto por e-mail</li>
                  <li>O ingresso será liberado após a compensação do pagamento</li>
                </ul>
              </div>
            </div>
          )}

          {/* Informações de PIX */}
          {paymentMethod === "pix" && (
            <div className="mb-8">
              <h3 className="font-bold mb-4">Pagamento via PIX</h3>
              <div className="flex flex-col items-center mb-4">
                <div className="bg-gray-200 h-48 w-48 flex items-center justify-center mb-4">
                  <p className="text-center">QR Code PIX</p>
                </div>
                <p className="font-medium">Chave PIX: evento@controle-se.com.br</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-medium">Instruções:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Escaneie o QR Code com o app do seu banco</li>
                  <li>Ou copie a chave PIX e faça a transferência</li>
                  <li>O pagamento é processado em instantes</li>
                  <li>Mantenha esta página aberta até a confirmação</li>
                </ul>
              </div>
            </div>
          )}

          <button
            className="bg-gray-800 w-full text-white py-3 px-4 rounded hover:bg-gray-700 transition-colors"
            onClick={handleConfirmPayment}
          >
            Confirmar Pagamento
          </button>
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
  )
}

export default CheckoutPage