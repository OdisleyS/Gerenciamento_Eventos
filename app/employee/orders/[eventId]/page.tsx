"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


interface User {
    id: number;
    name: string;
    email: string;
    role: number;
}

interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
}

interface Order {
    id: number;
    buyerId: number | null;
    buyerName: string;
    orderDate: string;
    totalAmount: number;
    items: OrderItem[];
    status: string; // "pending", "delivered", etc.
}

export default function OrderQueuePage() {
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventName, setEventName] = useState<string>("");

    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId;

    // Recupera os dados do usuário logado do localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Carrega os dados do evento e seus pedidos
    useEffect(() => {
        const fetchEventData = async () => {
            if (!eventId) return;

            setLoading(true);

            try {
                // Buscar dados do evento
                const eventResponse = await fetch(`https://localhost:7027/api/Events/${eventId}`);

                if (!eventResponse.ok) {
                    throw new Error("Evento não encontrado");
                }

                const eventData = await eventResponse.json();
                setEventName(eventData.name);

                // Buscar os pedidos
                // Aqui estamos buscando todos os pedidos e filtrando pelo eventId no frontend
                // Você pode implementar uma rota específica no backend para buscar pedidos por evento
                const ordersResponse = await fetch(`https://localhost:7027/api/Orders`);

                if (!ordersResponse.ok) {
                    throw new Error("Erro ao carregar pedidos");
                }

                const ordersData = await ordersResponse.json();

                // Filtrando apenas pedidos com status "Pending" (0)
                const pendingOrders = ordersData.filter((order: any) =>
                    order.status === 0 || order.status === "Pending" || order.status === "pending"
                );

                // Ordenar pedidos do mais antigo para o mais recente
                const sortedOrders = pendingOrders.sort((a: Order, b: Order) =>
                    new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
                );

                setOrders(sortedOrders);
            } catch (error) {
                console.error("Erro ao carregar dados da fila de pedidos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [eventId]);

    // Função para formatar data e hora
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('pt-BR'),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Função para marcar um pedido como entregue
    const markOrderAsCompleted = async (orderId: number) => {
        try {
            // Chamar API para atualizar o status do pedido
            const response = await fetch(`https://localhost:7027/api/Orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 1 // 1 representa "Delivered" (Entregue)
                })
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar status do pedido");
            }

            // Atualizar a UI removendo o pedido da lista
            setOrders(prevOrders =>
                prevOrders.filter(order => order.id !== orderId)
            );

            alert("Pedido entregue com sucesso!");
        } catch (error) {
            console.error("Erro ao marcar pedido como entregue:", error);
            alert("Erro ao processar pedido. Tente novamente.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="p-8 rounded-lg bg-white/10 backdrop-blur-lg shadow-2xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <p className="text-white/80 mt-4">Carregando fila de pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Cabeçalho */}
            <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Nome do evento como título */}
                        <h1 className="text-2xl font-bold text-blue-400 whitespace-nowrap mr-4">
                            {eventName || "Evento"} - Fila de Pedidos
                        </h1>

                        {/* Espaço flexível para garantir layout */}
                        <div className="flex-grow"></div>

                        {/* Ações do usuário */}
                        <div className="flex items-center space-x-4">
                            {/* Botão para voltar para a loja */}
                            <button
                                onClick={() => router.push(`/employee/store/${eventId}`)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                            >
                                Voltar para Loja
                            </button>

                            {/* Nome do usuário */}
                            <div className="text-sm bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                                {user ? user.name : "Funcionário"}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-gray-900">
                        <h2 className="text-xl font-bold text-white">Fila de Pedidos Pendentes</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            <p className="text-gray-400">Não há pedidos na fila</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
                                    <tr>
                                        <th className="py-3 px-4">Nº Pedido</th>
                                        <th className="py-3 px-4">Cliente</th>
                                        <th className="py-3 px-4">Data/Hora</th>
                                        <th className="py-3 px-4">Itens</th>
                                        <th className="py-3 px-4 text-right">Valor Total</th>
                                        <th className="py-3 px-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {orders.map((order) => {
                                        const { date, time } = formatDateTime(order.orderDate);
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-700/50 transition-colors">
                                                <td className="py-3 px-4 font-medium">#{order.id}</td>
                                                <td className="py-3 px-4">{order.buyerName}</td>
                                                <td className="py-3 px-4">
                                                    <div>{date}</div>
                                                    <div className="text-gray-400 text-sm">{time}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="max-h-24 overflow-y-auto pr-2">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="text-sm">
                                                                <span className="font-medium">{item.quantity}x</span> {item.productName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium text-blue-400">
                                                    R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => markOrderAsCompleted(order.id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                                                    >
                                                        Pedido Entregue
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Rodapé */}
            <footer className="py-4 bg-gray-900 border-t border-gray-800">
                <div className="container mx-auto px-4 text-center text-xs text-gray-500">
                    © 2024 {eventName || "Evento"} - Gerenciamento de Pedidos
                </div>
            </footer>
        </div>
    );
}