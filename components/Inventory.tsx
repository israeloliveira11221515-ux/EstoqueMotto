
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useAccess } from '../App';
import PinConfirmModal from './PinConfirmModal';

const Inventory: React.FC = () => {
  const { mode } = useAccess();
  const isGestor = mode === 'GESTOR';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    quantity: 0,
    min_stock: 5,
    price_cost: 0,
    price_sell: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('estoque_motto_products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      setProducts([]);
      localStorage.setItem('estoque_motto_products', JSON.stringify([]));
    }
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveToStorage = (list: Product[]) => {
    setProducts(list);
    localStorage.setItem('estoque_motto_products', JSON.stringify(list));
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const checkPriceAuthorization = (targetProduct: Partial<Product>, originalProduct?: Product) => {
    if (isGestor) return true;
    const costChanged = targetProduct.price_cost !== (originalProduct?.price_cost || 0);
    const sellChanged = targetProduct.price_sell !== (originalProduct?.price_sell || 0);
    return !(costChanged || sellChanged);
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    if (!checkPriceAuthorization(editingProduct, products.find(p => p.id === editingProduct.id))) {
      setPendingAction(() => () => performSaveEdit());
      setIsPinModalOpen(true);
    } else {
      performSaveEdit();
    }
  };

  const performSaveEdit = () => {
    if (!editingProduct) return;
    const updated = products.map(p => p.id === editingProduct.id ? (editingProduct as Product) : p);
    saveToStorage(updated);
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    if (!newProduct.name) return alert('Nome é obrigatório');
    if (!checkPriceAuthorization(newProduct)) {
      setPendingAction(() => () => performAddProduct());
      setIsPinModalOpen(true);
    } else {
      performAddProduct();
    }
  };

  const performAddProduct = () => {
    const productToAdd: Product = {
      name: newProduct.name || '',
      sku: newProduct.sku || '',
      quantity: newProduct.quantity || 0,
      min_stock: newProduct.min_stock || 5,
      price_cost: newProduct.price_cost || 0,
      price_sell: newProduct.price_sell || 0,
      id: Math.random().toString(36).substr(2, 9)
    };
    const updated = [...products, productToAdd];
    saveToStorage(updated);
    setIsAddModalOpen(false);
    setNewProduct({ name: '', sku: '', quantity: 0, min_stock: 5, price_cost: 0, price_sell: 0 });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Estoque</h2>
          <p className="text-slate-500 font-medium">Controle de peças e insumos.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          + Adicionar Peça
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Peça / SKU</th>
              <th className="px-8 py-5">Qtd Atual</th>
              {isGestor && <th className="px-8 py-5">Custo (R$)</th>}
              <th className="px-8 py-5">Venda (R$)</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="font-bold text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-400 font-medium tracking-tight uppercase">{p.sku || 'Sem SKU'}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-sm font-black ${p.quantity <= p.min_stock ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {p.quantity} un
                  </span>
                </td>
                {isGestor && <td className="px-8 py-6 text-slate-500 font-medium">R$ {p.price_cost.toFixed(2)}</td>}
                <td className="px-8 py-6 font-black text-blue-600 italic">R$ {p.price_sell.toFixed(2)}</td>
                <td className="px-8 py-6 text-right">
                   <button onClick={() => handleEdit(p)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-20 text-center text-slate-300">
             <p className="font-black text-lg italic tracking-tight">Nenhuma peça cadastrada.</p>
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800 italic">Editar Peça</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nome</label>
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Preço de Custo (R$)</label>
                  <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-slate-600" value={editingProduct.price_cost} onChange={e => setEditingProduct({...editingProduct, price_cost: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Preço de Venda (R$)</label>
                  <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-600" value={editingProduct.price_sell} onChange={e => setEditingProduct({...editingProduct, price_sell: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ajuste de Estoque</label>
                <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black" value={editingProduct.quantity} onChange={e => setEditingProduct({...editingProduct, quantity: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200">Cancelar</button>
              <button onClick={handleSaveEdit} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800 italic">Nova Peça</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nome</label>
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ex: Óleo 5W30" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">SKU / Código</label>
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium uppercase" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="PECA-123" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Preço de Custo (R$)</label>
                  <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-slate-600" value={newProduct.price_cost} onChange={e => setNewProduct({...newProduct, price_cost: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Preço de Venda (R$)</label>
                  <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-600" value={newProduct.price_sell} onChange={e => setNewProduct({...newProduct, price_sell: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Qtd Inicial</label>
                  <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Estoque Mínimo</label>
                  <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-red-500" value={newProduct.min_stock} onChange={e => setNewProduct({...newProduct, min_stock: parseInt(e.target.value) || 0})} />
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200">Cancelar</button>
              <button onClick={handleAddProduct} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">Adicionar Produto</button>
            </div>
          </div>
        </div>
      )}

      <PinConfirmModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={() => {
          if (pendingAction) pendingAction();
          setPendingAction(null);
        }}
        title="Autorizar Operação"
        description="Esta ação requer autorização do gestor em modo operacional."
      />
    </div>
  );
};

export default Inventory;
