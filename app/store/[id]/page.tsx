"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
}

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageData?: any; // Campo do backend
  imageUrl?: string; // Campo para uso na UI
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function EventStorePage() {
  const [user, setUser] = useState<User | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;

  // Recupera os dados do usuário logado do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Carrega os dados do evento e seus produtos
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
        setEvent(eventData);
        
        // Buscar os produtos configurados para este evento
        const settingsResponse = await fetch(`https://localhost:7027/api/EventSettings/${eventId}`);
        
        if (!settingsResponse.ok) {
          throw new Error("Erro ao carregar produtos");
        }
        
        const settingsData = await settingsResponse.json();
        
        if (!settingsData.products || !Array.isArray(settingsData.products)) {
          console.warn("Nenhum produto encontrado ou formato inválido", settingsData);
          setProducts([]);
          return;
        }
        
        // Processar os produtos e suas imagens
        const processedProducts = settingsData.products.map((product: any) => {
          let imageUrl = '/api/placeholder/200/200'; // Imagem padrão
          
          // Converter os dados binários da imagem para URL
          if (product.imageData) {
            try {
              // Os dados podem vir em vários formatos diferentes, tentamos lidar com todos
              let base64String = '';
              
              if (Array.isArray(product.imageData)) {
                // Se for um array de bytes
                base64String = btoa(String.fromCharCode.apply(null, product.imageData));
              } else if (typeof product.imageData === 'object') {
                // Se for um objeto como Buffer
                const bytes = new Uint8Array(Object.values(product.imageData));
                base64String = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
              } else if (typeof product.imageData === 'string') {
                // Se já for uma string (talvez já em base64)
                base64String = product.imageData;
              }
              
              if (base64String) {
                imageUrl = `data:image/jpeg;base64,${base64String}`;
              }
            } catch (error) {
              console.error("Erro ao processar imagem do produto:", error);
            }
          }
          
          return {
            ...product,
            imageUrl
          };
        });
        
        setProducts(processedProducts);
      } catch (error) {
        console.error("Erro ao carregar dados da loja:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId]);

  // Verifica se um produto está no carrinho
  const isProductInCart = (productId: number) => {
    return cart.some(item => item.product.id === productId);
  };

  // Adiciona um produto ao carrinho
  const addToCart = (product: Product) => {
    // Verificar se o produto já está no carrinho
    if (isProductInCart(product.id)) {
      return; // Se já estiver no carrinho, não faz nada
    }
    
    // Verificar se há estoque disponível
    if (product.quantity <= 0) {
      alert("Produto fora de estoque!");
      return;
    }
    
    // Adicionar novo item ao carrinho
    setCart([...cart, { product, quantity: 1 }]);
  };

  // Remove um produto do carrinho
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Atualiza a quantidade de um produto no carrinho
  const updateCartItemQuantity = (productId: number, newQuantity: number) => {
    // Encontrar o produto para verificar o estoque
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Verificar estoque
    if (newQuantity > product.quantity) {
      alert(`Apenas ${product.quantity} unidades disponíveis deste produto!`);
      newQuantity = product.quantity;
    }
    
    if (newQuantity <= 0) {
      // Remover o item se a quantidade for 0 ou negativa
      removeFromCart(productId);
    } else {
      // Atualizar a quantidade
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      ));
    }
  };

  // Filtra produtos baseado no termo de pesquisa
  const filteredProducts = products.filter(product => {
    if (searchTerm === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.category && product.category.toLowerCase().includes(searchLower))
    );
  });

  // Agrupar produtos por categoria
  const groupProductsByCategory = () => {
    const groupedProducts: { [key: string]: Product[] } = {};
    
    filteredProducts.forEach(product => {
      const category = product.category || 'Sem Categoria';
      if (!groupedProducts[category]) {
        groupedProducts[category] = [];
      }
      groupedProducts[category].push(product);
    });
    
    return groupedProducts;
  };
  
  // Obter categorias ordenadas
  const getSortedCategories = () => {
    const categories = Object.keys(groupProductsByCategory());
    return categories.sort();
  };

  // Calcula o total do carrinho
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  // Finaliza a compra
const handleCheckout = async () => {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }
  
  if (!user) {
    alert("Você precisa estar logado para finalizar a compra.");
    return;
  }

  setProcessing(true);
  
  try {
    // Preparar os dados para a API
    const orderData = {
      buyerId: user.id,
      buyerName: user.name, // Nome do usuário logado
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };
    
    // Enviar a requisição para a API de Orders
    const response = await fetch("https://localhost:7027/api/Orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      // Ler a mensagem de erro do servidor, se houver
      const errorData = await response.text();
      throw new Error(`Erro ao finalizar compra: ${errorData}`);
    }
    
    const orderResult = await response.json();
    
    // Atualizar o estado local dos produtos (para UI)
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.product.id === product.id);
      if (cartItem) {
        return {
          ...product,
          quantity: product.quantity - cartItem.quantity
        };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    
    // Limpar o carrinho e fechar o modal
    setCart([]);
    setShowCart(false);
    
    // Mostrar confirmação para o usuário
    alert(`Compra realizada com sucesso! Número do pedido: ${orderResult.id}`);
    
  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    alert(error instanceof Error ? error.message : "Erro ao finalizar a compra. Tente novamente.");
  } finally {
    setProcessing(false);
  }
};

  // Função para lidar com clique no botão de pesquisa
  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      // Focar o input quando ativar a pesquisa
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    } else {
      // Limpar a pesquisa quando fechar
      setSearchTerm("");
    }
  };

  // Lidar com o fechamento da barra de pesquisa
  const closeSearch = () => {
    setIsSearchActive(false);
    setSearchTerm("");
  };

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    };
    return new Date(date).toLocaleDateString('pt-BR', options);
  };

  const formatTime = (date: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(date).toLocaleTimeString('pt-BR', options);
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
          <p className="text-white/80 mt-4">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Cabeçalho com barra de pesquisa melhorada */}
      <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Nome do evento como título da loja */}
            <h1 className="text-2xl font-bold text-blue-400 whitespace-nowrap mr-4">
              {event?.name || "Loja do Evento"}
            </h1>
            
            {/* Espaço flexível para garantir layout */}
            <div className="flex-grow"></div>
            
            {/* Ações do usuário */}
            <div className="flex items-center space-x-4">
              {/* Barra de pesquisa ao lado do carrinho */}
              <div className="relative">
                <div className={`flex items-center overflow-hidden transition-all duration-300 ${isSearchActive ? 'w-48' : 'w-10'} bg-gray-800 rounded-full`}>
                  <button 
                    onClick={toggleSearch}
                    className="p-2 rounded-full text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </button>
                  
                  {isSearchActive && (
                    <input
                      id="search-input"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white text-sm pr-8"
                    />
                  )}
                </div>
                
                {isSearchActive && searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Botão do carrinho */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 text-white/80 hover:text-blue-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              
              {/* Nome do usuário */}
              <div className="text-sm bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                {user ? user.name : "Visitante"}
              </div>
              
              {/* Voltar para o site principal */}
              <a 
                href="/client/events" 
                className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full border border-gray-700 transition-colors"
              >
                Voltar
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Lista de produtos agrupados por categoria */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-bold text-blue-400">
              Produtos Disponíveis
            </h2>
            {searchTerm && (
              <div className="text-sm text-gray-400">
                Resultados para: <span className="text-white font-medium">"{searchTerm}"</span>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="ml-2 text-blue-400 hover:text-blue-300 underline text-xs"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              {products.length === 0 ? (
                <>
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <p className="text-gray-400">Nenhum produto disponível para este evento.</p>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <p className="text-gray-400">Nenhum produto encontrado para "<span className="font-semibold">{searchTerm}</span>".</p>
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setIsSearchActive(false);
                    }} 
                    className="mt-4 text-blue-400 hover:text-blue-300 underline"
                  >
                    Limpar pesquisa
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {getSortedCategories().map((category) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 px-3 py-2 bg-gray-800 border-l-4 border-blue-500 rounded-r-lg inline-block">
                    {category}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {groupProductsByCategory()[category].map((product) => (
                      <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 transition-all hover:shadow-lg hover:shadow-blue-900/20 group">
                        <div className="h-48 overflow-hidden relative">
                          <img 
                            src={product.imageUrl || '/api/placeholder/200/200'} 
                            alt={product.name}
                            className="w-full h-full object-cover object-center transition-transform group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/200/200' }}
                          />
                          {product.quantity <= 0 && (
                            <div className="absolute inset-0 bg-black/75 flex items-center justify-center backdrop-blur-sm">
                              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                Esgotado
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-medium mb-2 truncate" title={product.name}>
                            {product.name}
                          </h3>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xl font-bold text-blue-400">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                            {product.quantity > 0 && (
                              <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">
                                {product.quantity} disponíveis
                              </span>
                            )}
                          </div>
                          {/* Botão de adicionar ao carrinho com estado diferente quando já adicionado */}
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.quantity <= 0 || isProductInCart(product.id)}
                            className={`w-full py-2 rounded-lg text-white text-sm font-medium transition-all ${
                              product.quantity <= 0 
                                ? 'bg-gray-700 cursor-not-allowed'
                                : isProductInCart(product.id)
                                  ? 'bg-green-600 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {product.quantity <= 0 
                              ? 'Esgotado' 
                              : isProductInCart(product.id) 
                                ? 'Adicionado ✓' 
                                : 'Adicionar ao Carrinho'
                            }
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal do Carrinho */}
      {showCart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col border border-gray-700 shadow-2xl">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-400">Seu Carrinho</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Itens do carrinho */}
            <div className="p-4 flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <p className="text-gray-400">Seu carrinho está vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center border-b border-gray-700 pb-4">
                      <div className="w-16 h-16 flex-shrink-0 mr-4 overflow-hidden rounded-lg bg-gray-800">
                        <img
                          src={item.product.imageUrl || '/api/placeholder/80/80'}
                          alt={item.product.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/80/80' }}
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-medium truncate" title={item.product.name}>
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-blue-400 font-semibold">
                          R$ {item.product.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 text-sm transition-colors"
                        >
                          -
                        </button>
                        <span className="mx-2 w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                      </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé do carrinho com total e ações */}
            <div className="border-t border-gray-700 p-4 bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-xl text-blue-400">
                  R$ {calculateTotal().toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCart(false)}
                  className="flex-1 py-2 border border-gray-600 rounded-lg text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Continuar Comprando
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || processing}
                  className={`flex-1 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                    cart.length > 0 && !processing
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </span>
                  ) : (
                    'Finalizar Compra'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé */}
      <footer className="py-4 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">
          © 2024 {event?.name || "Loja do Evento"} - Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}