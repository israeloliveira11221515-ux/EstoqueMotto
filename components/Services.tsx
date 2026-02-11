
import React, { useState, useEffect } from 'react';
import { Service, CommissionType } from '../types';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    commission_value: 0,
    description: '',
    base_price: 0,
    commission_type: CommissionType.FIXED
  });

  useEffect(() => {
    const saved = localStorage.getItem('estoque_motto_services');
    if (saved) {
      setServices(JSON.parse(saved));
    } else {
      setServices([]);
    }
  }, []);

  const saveToStorage = (list: Service[]) => {
    setServices(list);
    localStorage.setItem('estoque_motto_services', JSON.stringify(list));
  };

  const handleAdd = () => {
    if (!newService.name) return alert('Nome é obrigatório');
    const s: Service = {
      ...newService as Service,
      id: Math.random().toString(36).substr(2, 9),
      base_price: 0, // Simplified version defaults base price to 0
      commission_type: CommissionType.FIXED // Simplified version defaults to fixed value
    };
    saveToStorage([...services, s]);
    setIsModalOpen(false);
    setNewService({ name: '', commission_value: 0, description: '', base_price: 0, commission_type: CommissionType.FIXED });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Registro de Comissões / Serviços</h2>
          <p className="text-gray-500">Configure os valores de comissão por responsável.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95 italic"
        >
          + Novo Registro
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
             <tr>
               <th className="px-8 py-5">Nome da Pessoa / Serviço</th>
               <th className="px-8 py-5">Valor da Comissão</th>
               <th className="px-8 py-5">Observação</th>
               <th className="px-8 py-5 text-right">Ações</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {services.map((s) => (
               <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-8 py-6 font-bold text-slate-800 italic">{s.name}</td>
                 <td className="px-8 py-6 text-blue-600 font-black italic">R$ {s.commission_value.toFixed(2)}</td>
                 <td className="px-8 py-6 text-slate-500 text-sm italic max-w-xs truncate">{s.description || '-'}</td>
                 <td className="px-8 py-6 text-right">
                   <button className="text-slate-300 hover:text-blue-600 p-2 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
         {services.length === 0 && (
           <div className="p-20 text-center text-slate-300 italic">
              <p className="font-black text-lg opacity-50">Nenhum registro cadastrado.</p>
           </div>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 italic">Novo Registro</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold transition-colors">✕</button>
            </div>
            <div className="p-8 space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nome da Pessoa / Serviço</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" 
                    value={newService.name} 
                    onChange={e => setNewService({...newService, name: e.target.value})} 
                    placeholder="Ex: Comissão do Zé" 
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Valor da Comissão (R$)</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-600 text-lg transition-all" 
                    value={newService.commission_value || ''} 
                    onChange={e => setNewService({...newService, commission_value: parseFloat(e.target.value) || 0})} 
                    placeholder="0.00"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Observação / Descrição</label>
                  <textarea 
                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all resize-none h-24" 
                    value={newService.description} 
                    onChange={e => setNewService({...newService, description: e.target.value})} 
                    placeholder="Alguma descrição ou detalhe adicional..."
                  />
               </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200">Cancelar</button>
               <button onClick={handleAdd} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all italic">Salvar Registro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
