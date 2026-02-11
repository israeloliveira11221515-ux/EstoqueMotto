
import React, { useState, useMemo, useEffect } from 'react';
import { useAccess } from '../App';
import { Product, SaleStatus, PaymentMethod, Sale, SaleItem } from '../types';
import PinConfirmModal from './PinConfirmModal';
import ReceiptModal from './ReceiptModal';

const Cashier: React.FC = () => {
  const { mode, settings } = useAccess();
  const isGestor = mode === 'GESTOR';

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discountVal, setDiscountVal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Receipt State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // Debounced search logic simulating Supabase .or(`nome.ilike.%term%,sku.ilike.%term%`)
  useEffect(() => {
    const handler = setTimeout(() => {
      const term = searchTerm.trim();
      if (term.length >= 2) {
        setLoading(true);
        try {
          const allProducts: Product[] = JSON.parse(localStorage.getItem('estoque_motto_products') || '[]');
          const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(term.toLowerCase()) || 
            (p.sku && p.sku.toLowerCase().includes(term.toLowerCase()))
          );
          setSearchResults(filtered);
        } catch (error) {
          console.error("Erro ao buscar produtos:", error);
          alert("Ocorreu um erro ao buscar os produtos.");
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price } 
            : item
        );
      }
      return [...prev, { 
        product_id: product.id, 
        name: product.name, 
        quantity: 1, 
        unit_price: product.price_sell, 
        subtotal: product.price_sell 
      }];
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQty = (id: string, d: number) => setCart(p => p.map(i => i.product_id === id ? {...i, quantity: Math.max(1, i.quantity + d), subtotal: Math.max(1, i.quantity + d) * i.unit_price} : i));
  const remove = (id: string) => setCart(p => p.filter(i => i.product_id !== id));

  const subtotal = useMemo(() => cart.reduce((acc, i) => acc + i.subtotal, 0), [cart]);
  const total = Math.max(0, subtotal - discountVal);

  const handleFinish = () => {
    if (cart.length === 0) return;
    const isHighDiscount = discountVal > (subtotal * 0.05); // More than 5% requires PIN
    if (isHighDiscount && !isGestor) {
      setIsPinModalOpen(true);
    } else {
      processFinalize();
    }
  };

  const processFinalize = () => {
    const newSale: Sale = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      status: SaleStatus.PAGA,
      subtotal: subtotal,
      discount_value: discountVal,
      total: total,
      actor_type: mode,
      created_at: new Date().toISOString(),
      items: [...cart],
      payment_method: paymentMethod
    };

    const savedSales = JSON.parse(localStorage.getItem('estoque_motto_sales') || '[]');
    const updatedSales = [newSale, ...savedSales];
    localStorage.setItem('estoque_motto_sales', JSON.stringify(updatedSales));

    // Update product quantities in stock
    const allProducts: Product[] = JSON.parse(localStorage.getItem('estoque_motto_products') || '[]');
    const updatedProducts = allProducts.map(p => {
      const cartItem = cart.find(item => item.product_id === p.id);
      if (cartItem) {
        return { ...p, quantity: Math.max(0, p.quantity - cartItem.quantity) };
      }
      return p;
    });
    localStorage.setItem('estoque_motto_products', JSON.stringify(updatedProducts));

    setLastSale(newSale);
    setIsReceiptModalOpen(true);
    
    // Reset state
    setCart([]);
    setDiscountVal(0);
    setSearchTerm('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Balcão (PDV)</h2>
        <p className="text-slate-500 font-medium">Realize vendas e gere recibos rapidamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar peça por nome ou SKU..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-4 top-4 text-slate-400">
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                )}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-2xl z-30 max-h-72 overflow-y-auto">
                {searchResults.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => addToCart(p)} 
                    className="w-full flex items-center justify-between p-5 hover:bg-blue-50 text-left border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-400 font-bold uppercase">
                        {p.sku ? `SKU: ${p.sku}` : 'Sem SKU'} • Est: {p.quantity}
                      </div>
                    </div>
                    <div className="text-blue-600 font-black italic text-lg">R$ {p.price_sell.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            )}
            {searchTerm.length >= 2 && searchResults.length === 0 && !loading && (
              <div className="absolute left-0 right-0 mt-3 bg-white border border-slate-100 rounded-3xl shadow-lg p-5 text-center text-slate-400 italic">
                Nenhum produto encontrado.
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-600 uppercase tracking-widest text-xs italic">Carrinho de Peças</h3>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">{cart.length} ITENS</span>
            </div>
            {cart.length === 0 ? (
              <div className="p-16 text-center text-slate-300">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <p className="font-black text-lg italic tracking-tight">O carrinho está vazio.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {cart.map(item => (
                  <div key={item.product_id} className="p-8 flex items-center justify-between group">
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-lg italic">{item.name}</div>
                      <div className="text-xs text-slate-400 font-medium">Preço Unitário: R$ {item.unit_price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                        <button onClick={() => updateQty(item.product_id, -1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black hover:bg-red-50 hover:text-red-500 transition-all">-</button>
                        <span className="font-black text-lg w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product_id, 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black hover:bg-green-50 hover:text-green-500 transition-all">+</button>
                      </div>
                      <div className="w-32 text-right">
                         <div className="text-slate-400 text-[10px] font-black uppercase">Subtotal</div>
                         <div className="font-black text-slate-800 text-xl italic">R$ {item.subtotal.toFixed(2)}</div>
                      </div>
                      <button onClick={() => remove(item.product_id)} className="text-slate-200 hover:text-red-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 sticky top-8">
            <h3 className="text-2xl font-black text-slate-800 mb-8 italic flex items-center gap-3">
              <span className="text-blue-600">💸</span> Checkout
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between font-medium text-slate-500">
                <span className="text-sm">Subtotal Bruto</span>
                <span className="font-black text-slate-800 italic">R$ {subtotal.toFixed(2)}</span>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Desconto (R$)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-black text-red-500 text-lg"
                  value={discountVal || ''}
                  onChange={e => setDiscountVal(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="pt-6 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setPaymentMethod(PaymentMethod.PIX)} className={`py-4 rounded-2xl font-black text-sm transition-all ${paymentMethod === PaymentMethod.PIX ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400'}`}>PIX</button>
                   <button onClick={() => setPaymentMethod(PaymentMethod.CREDITO)} className={`py-4 rounded-2xl font-black text-sm transition-all ${paymentMethod === PaymentMethod.CREDITO ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400'}`}>CARTÃO</button>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-end mb-8">
                  <div className="text-slate-400 font-black text-[10px] uppercase">Total Líquido</div>
                  <div className="text-4xl font-black text-blue-600 italic tracking-tighter">R$ {total.toFixed(2)}</div>
                </div>

                <button 
                  onClick={handleFinish}
                  disabled={cart.length === 0}
                  className="w-full py-5 bg-green-600 hover:bg-green-700 disabled:opacity-30 text-white font-black text-xl rounded-3xl shadow-2xl shadow-green-600/20 transition-all active:scale-95"
                >
                  Finalizar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PinConfirmModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={processFinalize}
        title="Desconto Elevado"
        description="Vendas com desconto superior a 5% requerem PIN do Gestor."
      />

      <ReceiptModal 
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        sale={lastSale}
        settings={settings}
      />
    </div>
  );
};

export default Cashier;
