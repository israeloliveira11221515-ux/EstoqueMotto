
import React, { useState, useEffect, useMemo } from 'react';
import { useAccess } from '../App';
import { Sale, SaleStatus } from '../types';
import ReceiptModal from './ReceiptModal';

const Sales: React.FC = () => {
  const { mode, settings } = useAccess();
  const isGestor = mode === 'GESTOR';

  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Receipt State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [saleForReceipt, setSaleForReceipt] = useState<Sale | null>(null);

  // Load sales from localStorage
  useEffect(() => {
    const savedSales = localStorage.getItem('estoque_motto_sales');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      setSales([]);
      localStorage.setItem('estoque_motto_sales', JSON.stringify([]));
    }
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.actor_type.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [sales, searchTerm]);

  const totalRevenue = useMemo(() => filteredSales.reduce((acc, s) => acc + s.total, 0), [filteredSales]);
  const totalSales = filteredSales.length;

  const handleOpenReceipt = (sale: Sale) => {
    setSaleForReceipt(sale);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Histórico de Vendas</h2>
          <p className="text-slate-500 font-medium">Relatórios e listagem de todas as vendas de balcão.</p>
        </div>
        
        {isGestor && (
          <div className="flex gap-4">
             <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Vendido</p>
                <p className="text-xl font-black text-blue-600 italic">R$ {totalRevenue.toFixed(2)}</p>
             </div>
             <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd Vendas</p>
                <p className="text-xl font-black text-slate-800 italic">{totalSales}</p>
             </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input 
            type="text" 
            placeholder="Buscar por ID da venda ou tipo de acesso..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">ID / Data</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Acesso</th>
              <th className="px-8 py-5">Subtotal</th>
              <th className="px-8 py-5">Desconto</th>
              <th className="px-8 py-5">Total</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="font-black text-slate-800 italic">#{sale.id}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    {new Date(sale.created_at).toLocaleString('pt-BR')}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${sale.status === SaleStatus.PAGA ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[10px] font-black tracking-widest uppercase ${sale.actor_type === 'GESTOR' ? 'text-blue-500' : 'text-amber-500'}`}>
                    {sale.actor_type}
                  </span>
                </td>
                <td className="px-8 py-6 text-slate-500 font-medium">R$ {sale.subtotal.toFixed(2)}</td>
                <td className="px-8 py-6 text-red-500 font-medium italic">- R$ {sale.discount_value.toFixed(2)}</td>
                <td className="px-8 py-6 font-black text-slate-800 text-lg italic">R$ {sale.total.toFixed(2)}</td>
                <td className="px-8 py-6 text-right">
                   <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenReceipt(sale)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Reimprimir Recibo"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </button>
                      <button 
                        onClick={() => setSelectedSale(sale)}
                        className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                        title="Ver Detalhes"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSales.length === 0 && (
          <div className="p-20 text-center text-slate-300">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p className="font-black text-xl italic tracking-tight">Nenhuma venda registrada.</p>
          </div>
        )}
      </div>

      {selectedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800 italic">Detalhes da Venda #{selectedSale.id}</h3>
              <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600 font-black text-xl">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data / Hora</p>
                    <p className="font-bold text-slate-800">{new Date(selectedSale.created_at).toLocaleString('pt-BR')}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acesso</p>
                    <p className="font-bold text-slate-800">{selectedSale.actor_type}</p>
                 </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-500">Resumo Financeiro</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-bold text-slate-700">R$ {selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Desconto Aplicado</span>
                    <span className="font-bold text-red-500">- R$ {selectedSale.discount_value.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-slate-800 text-lg italic">TOTAL PAGO</span>
                    <span className="font-black text-blue-600 text-2xl italic">R$ {selectedSale.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => handleOpenReceipt(selectedSale)}
                  className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Ver Comprovante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReceiptModal 
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        sale={saleForReceipt}
        settings={settings}
      />
    </div>
  );
};

export default Sales;
