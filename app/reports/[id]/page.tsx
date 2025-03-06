// arquivo: app/reports/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import html2canvas from 'html2canvas';


interface ReportItemDto {
    productId: number;
    productName: string;
    totalSold: number;
    revenue: number;
    currentStock: number;
}

interface EventReportDto {
    totalProductsSold: number;
    totalRevenue: number;
    soldOutProducts: ReportItemDto[];
    remainingProducts: ReportItemDto[];
    productWithHighestStock: ReportItemDto | null;
    productMostSold: ReportItemDto | null;
    reportItems: ReportItemDto[];
}

export default function ReportsPage() {
    const [report, setReport] = useState<EventReportDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [event, setEvent] = useState<{ id: number; name: string } | null>(null);
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const router = useRouter();

    const params = useParams();
    const eventId = params.id;

    useEffect(() => {
        // Recupera os dados do usuário logado do localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        async function fetchData() {
            try {
                // Buscar dados do evento
                const eventResponse = await fetch(`https://localhost:7027/api/Events/${eventId}`);
                if (!eventResponse.ok) {
                    throw new Error("Evento não encontrado");
                }
                const eventData = await eventResponse.json();
                setEvent({ id: eventData.id, name: eventData.name });

                // Buscar dados do relatório
                const reportResponse = await fetch(`https://localhost:7027/api/Reports/${eventId}`);
                if (!reportResponse.ok) {
                    throw new Error("Erro ao carregar relatório");
                }
                const reportData: EventReportDto = await reportResponse.json();
                setReport(reportData);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [eventId]);

    // Função para baixar o relatório como imagem
    const downloadAsImage = async () => {
        const reportElement = document.getElementById('report-container');
        
        if (!reportElement) {
            alert('Elemento do relatório não encontrado');
            return;
        }
        
        try {
            setIsExporting(true);
            
            const canvas = await html2canvas(reportElement, {
                scale: 2, // Melhor qualidade
                useCORS: true, // Permitir imagens de outras origens
                logging: false, // Desativar logs
                backgroundColor: '#1f2937' // Cor de fundo escura para combinar com seu tema
            });
            
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `relatório-evento-${event?.name || eventId}.png`;
            link.click();
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            alert('Ocorreu um erro ao exportar o relatório. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    // Download como PDF
    const downloadAsPDF = async () => {
        const reportElement = document.getElementById('report-container');
        
        if (!reportElement) {
            alert('Elemento do relatório não encontrado');
            return;
        }
        
        try {
            setIsExporting(true);
            
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#1f2937'
            });
            
            const imgData = canvas.toDataURL('image/png');

            
            // Calcular dimensões para ajustar a imagem ao PDF
            const imgWidth = 210; // Largura de A4 em mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
        } catch (error) {
            console.error('Erro ao exportar relatório como PDF:', error);
            alert('Ocorreu um erro ao exportar o relatório. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    // Função para voltar para a loja
    const handleBackToStore = () => {
        router.push(`/employee/store/${eventId}`);
    };

    // Função para navegar para a fila de pedidos
    const handleViewOrders = () => {
        router.push(`/employee/orders/${eventId}`);
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
                    <p className="text-white/80 mt-4">Carregando relatório...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
                <div className="bg-red-500/20 backdrop-blur-sm p-6 rounded-lg border border-red-500/50 max-w-md">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Erro ao carregar relatório</h3>
                    <p className="text-white/80">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
                <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg border border-gray-700 max-w-md">
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum dado disponível</h3>
                    <p className="text-white/80">Não encontramos relatórios para este evento.</p>
                    <button
                        onClick={handleBackToStore}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                    >
                        Voltar para a loja
                    </button>
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
                            {event?.name || "Evento"} - Relatórios
                        </h1>

                        {/* Espaço flexível para garantir layout */}
                        <div className="flex-grow"></div>

                        {/* Ações do usuário */}
                        <div className="flex items-center space-x-4">
                            {/* Botões de exportação */}
                            {isExporting ? (
                                <button
                                    disabled
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center space-x-2"
                                >
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>Exportando...</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={downloadAsImage}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Exportar como Imagem
                                    </button>
                                </>
                            )}

                            {/* Botão para voltar para a loja */}
                            <button
                                onClick={handleBackToStore}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                            >
                                Voltar para Loja
                            </button>

                            {/* Botão para ver pedidos */}
                            <button
                                onClick={handleViewOrders}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
                            >
                                Fila de Pedidos
                            </button>

                            {/* Nome do usuário */}
                            <div className="text-sm bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                                {user ? user.name : "Funcionário"}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal - Agora com ID para captura */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <div id="report-container" className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
                    {/* Cards com métricas resumidas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total de Produtos Vendidos */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg hover:shadow-blue-900/20 transition-all">
                            <h3 className="text-gray-400 text-sm mb-1">Total de Produtos Vendidos</h3>
                            <p className="text-3xl font-bold text-blue-400">{report.totalProductsSold}</p>
                        </div>

                        {/* Rendimento Total */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg hover:shadow-blue-900/20 transition-all">
                            <h3 className="text-gray-400 text-sm mb-1">Faturamento Total</h3>
                            <p className="text-3xl font-bold text-green-400">R$ {report.totalRevenue.toFixed(2)}</p>
                        </div>

                        {/* Produto com Maior Estoque */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg hover:shadow-blue-900/20 transition-all">
                            <h3 className="text-gray-400 text-sm mb-1">Produto com Maior Estoque</h3>
                            {report.productWithHighestStock ? (
                                <div>
                                    <p className="text-lg font-bold text-white truncate" title={report.productWithHighestStock.productName}>
                                        {report.productWithHighestStock.productName}
                                    </p>
                                    <p className="text-xl font-bold text-yellow-400">{report.productWithHighestStock.currentStock}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Sem dados</p>
                            )}
                        </div>

                        {/* Produto Mais Vendido */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg hover:shadow-blue-900/20 transition-all">
                            <h3 className="text-gray-400 text-sm mb-1">Produto Mais Vendido</h3>
                            {report.productMostSold ? (
                                <div>
                                    <p className="text-lg font-bold text-white truncate" title={report.productMostSold.productName}>
                                        {report.productMostSold.productName}
                                    </p>
                                    <p className="text-xl font-bold text-purple-400">{report.productMostSold.totalSold} unid.</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Sem dados</p>
                            )}
                        </div>
                    </div>

                    {/* Seções de Relatório */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Produtos Esgotados */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                            <div className="bg-gray-900 p-4 border-b border-gray-700">
                                <h2 className="text-xl font-bold text-white">Produtos Esgotados</h2>
                            </div>
                            <div className="p-4 max-h-64 overflow-y-auto">
                                {report.soldOutProducts.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <p>Nenhum produto esgotado</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {report.soldOutProducts.map((item) => (
                                            <li key={item.productId} className="p-3 bg-gray-700/50 rounded-md flex justify-between items-center">
                                                <span className="font-medium">{item.productName}</span>
                                                <div className="text-right">
                                                    <span className="bg-blue-900/50 text-blue-200 text-xs px-2 py-1 rounded">
                                                        Vendidos: {item.totalSold}
                                                    </span>
                                                    <span className="ml-2 bg-green-900/50 text-green-200 text-xs px-2 py-1 rounded">
                                                        R$ {item.revenue.toFixed(2)}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Produtos com Estoque */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                            <div className="bg-gray-900 p-4 border-b border-gray-700">
                                <h2 className="text-xl font-bold text-white">Produtos com Estoque</h2>
                            </div>
                            <div className="p-4 max-h-64 overflow-y-auto">
                                {report.remainingProducts.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <p>Todos os produtos estão esgotados</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {report.remainingProducts.map((item) => (
                                            <li key={item.productId} className="p-3 bg-gray-700/50 rounded-md flex justify-between items-center">
                                                <span className="font-medium">{item.productName}</span>
                                                <div>
                                                    <span className="bg-yellow-900/50 text-yellow-200 text-xs px-2 py-1 rounded">
                                                        Estoque: {item.currentStock}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabela detalhada de produtos */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden mb-8">
                        <div className="bg-gray-900 p-4 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">Desempenho dos Produtos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
                                    <tr>
                                        <th className="py-3 px-4 border-b border-gray-700">Produto</th>
                                        <th className="py-3 px-4 border-b border-gray-700 text-center">Vendidos</th>
                                        <th className="py-3 px-4 border-b border-gray-700 text-center">Estoque Atual</th>
                                        <th className="py-3 px-4 border-b border-gray-700 text-right">Faturamento</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {report.reportItems.map((item) => (
                                        <tr key={item.productId} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="py-3 px-4 font-medium">{item.productName}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full text-sm">
                                                    {item.totalSold}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-sm ${item.currentStock === 0
                                                    ? 'bg-red-900/30 text-red-300'
                                                    : 'bg-green-900/30 text-green-300'
                                                    }`}>
                                                    {item.currentStock}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium text-green-400">
                                                R$ {item.revenue.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Rodapé */}
            <footer className="py-4 bg-gray-900 border-t border-gray-800">
                <div className="container mx-auto px-4 text-center text-xs text-gray-500">
                    © 2024 {event?.name || "Evento"} - Relatórios de Vendas
                </div>
            </footer>
        </div>
    )}