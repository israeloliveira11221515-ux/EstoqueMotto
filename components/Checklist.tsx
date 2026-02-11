
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { useAccess } from '../App';

const Checklist: React.FC = () => {
  const { settings } = useAccess();
  const products: Product[] = useMemo(() => JSON.parse(localStorage.getItem('estoque_motto_products') || '[]'), []);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Checklist de Estoque</h2>
          <p className="text-slate-500 font-medium italic">Gere um documento para conferência física das peças.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Imprimir Checklist (PDF)
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 no-print">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Filtrar peças para o checklist..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10 print:shadow-none print:border-none print:p-0">
        <div className="hidden print:block mb-10 text-center border-b-2 border-slate-900 pb-6">
          <h1 className="text-2xl font-black uppercase">{settings?.workshop_name || 'EstoqueMotto'}</h1>
          <p className="text-sm font-bold mt-1">CHECKLIST PARA CONFERÊNCIA FÍSICA DE ESTOQUE</p>
          <p className="text-xs mt-2 uppercase">Emitido em: {new Date().toLocaleString('pt-BR')}</p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 print:bg-slate-100 text-[10px] font-black text-slate-400 print:text-slate-900 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 w-12 text-center">Status</th>
              <th className="px-6 py-4">Peça / SKU</th>
              <th className="px-6 py-4 text-center">Sistema</th>
              <th className="px-6 py-4 text-center">Físico</th>
              <th className="px-6 py-4">Observações do Conferente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 text-center">
                  <div className="w-6 h-6 border-2 border-slate-200 rounded mx-auto"></div>
                </td>
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-800">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{p.sku || 'S/ SKU'}</div>
                </td>
                <td className="px-6 py-5 text-center font-black text-slate-500">
                  {p.quantity}
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="w-16 h-8 border-b border-slate-300 mx-auto"></div>
                </td>
                <td className="px-6 py-5">
                  <div className="w-full h-8 border-b border-slate-100"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-20 text-center text-slate-300">
             <p className="font-black text-lg italic tracking-tight">Nenhuma peça para exibir.</p>
          </div>
        )}

        <div className="hidden print:block mt-20 pt-10 border-t border-slate-200">
          <div className="flex justify-around">
            <div className="text-center">
              <div className="w-64 border-b border-slate-900 mb-2"></div>
              <p className="text-xs font-bold uppercase">Responsável pela Conferência</p>
            </div>
            <div className="text-center">
              <div className="w-64 border-b border-slate-900 mb-2"></div>
              <p className="text-xs font-bold uppercase">Visto do Gestor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
