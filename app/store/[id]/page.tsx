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

  // Adiciona um produto ao carrinho
  const addToCart = (product: Product) => {
    // Verificar se há estoque disponível
    if (product.quantity <= 0) {
      alert("Produto fora de estoque!");
      return;
    }
    
    // Verificar se o produto já está no carrinho
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Se a quantidade desejada exceder o estoque, mostrar aviso
      if (existingItem.quantity + 1 > product.quantity) {
        alert("Quantidade máxima atingida para este produto!");
        return;
      }
      
      // Incrementar a quantidade do item existente
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Adicionar novo item ao carrinho
      setCart([...cart, { product, quantity: 1 }]);
    }
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

  // Agrupar produtos por categoria
  const groupProductsByCategory = () => {
    const groupedProducts: { [key: string]: Product[] } = {};
    
    products.forEach(product => {
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
    
    try {
      // Para cada produto no carrinho, atualizar o estoque
      for (const item of cart) {
        // Em um ambiente real, você teria uma API dedicada para processar compras
        // Aqui estamos simulando a atualização do estoque
        const updatedProducts = products.map(product => {
          if (product.id === item.product.id) {
            return {
              ...product,
              quantity: product.quantity - item.quantity
            };
          }
          return product;
        });
        
        setProducts(updatedProducts);
      }
      
      alert("Compra realizada com sucesso!");
      setCart([]);
      setShowCart(false);
      
      // Em um ambiente real, aqui você redirecionaria para uma página de confirmação
      // router.push(`/store/${eventId}/confirmation`);
    } catch (error) {
      console.error("Erro ao finalizar compra:", error);
      alert("Erro ao finalizar a compra. Tente novamente.");
    }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-800 to-indigo-900">
        <div className="p-8 rounded-lg bg-white/10 backdrop-blur-lg shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></div>
          </div>
          <p className="text-white/80 mt-4">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Nome do evento como título da loja */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            {event?.name || "Loja do Evento"}
          </h1>
          
          <div className="flex items-center space-x-6">
            {/* Botão do carrinho */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            
            {/* Nome do usuário */}
            <div className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              {user ? user.name : "Visitante"}
            </div>
            
            {/* Voltar para o site principal */}
            <a 
              href="/client/events" 
              className="text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full transition-colors"
            >
              Voltar
            </a>
          </div>
        </div>
      </header>

      {/* Lista de produtos agrupados por categoria */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Produtos Disponíveis
          </h2>
          
          {products.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/10">
              <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <p className="text-white/80">Nenhum produto disponível para este evento.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {getSortedCategories().map((category) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-lg inline-block">
                    {category}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {groupProductsByCategory()[category].map((product) => (
                      <div key={product.id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/20 group">
                        <div className="h-48 overflow-hidden relative">
                          <img 
                            src={product.imageUrl || '/api/placeholder/200/200'} 
                            alt={product.name}
                            className="w-full h-full object-cover object-center transition-transform group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/200/200' }}
                          />
                          {product.quantity <= 0 && (
                            <div className="absolute inset-0 bg-black/75 flex items-center justify-center backdrop-blur-sm">
                              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
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
                            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                            {product.quantity > 0 && (
                              <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/80">
                                {product.quantity} disponíveis
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.quantity <= 0}
                            className={`w-full py-2 rounded-lg text-white text-sm font-medium transition-all ${
                              product.quantity > 0 
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-md hover:shadow-purple-500/30' 
                                : 'bg-white/20 cursor-not-allowed'
                            }`}
                          >
                            {product.quantity > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
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
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col border border-white/10 shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Seu Carrinho</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
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
                  <svg className="w-16 h-16 mx-auto text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <p className="text-white/80">Seu carrinho está vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center border-b border-white/10 pb-4">
                      <div className="w-16 h-16 flex-shrink-0 mr-4 overflow-hidden rounded-lg bg-white/10">
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
                        <p className="text-sm bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-semibold">
                          R$ {item.product.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-sm transition-colors"
                        >
                          -
                        </button>
                        <span className="mx-2 w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-sm transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-2 text-white/60 hover:text-pink-500 transition-colors"
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
            <div className="border-t border-white/10 p-4 bg-black/20">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  R$ {calculateTotal().toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCart(false)}
                  className="flex-1 py-2 border border-white/20 rounded-lg text-white/90 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Continuar Comprando
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`flex-1 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                    cart.length > 0 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-md hover:shadow-purple-500/30' 
                      : 'bg-white/20 cursor-not-allowed'
                  }`}
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé */}
      <footer className="py-4 bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-xs text-white/60">
          © 2024 {event?.name || "Loja do Evento"} - Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}
