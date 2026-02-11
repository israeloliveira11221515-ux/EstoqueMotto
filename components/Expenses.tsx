
import React, { useState, useEffect, useMemo } from 'react';
import { Expense } from '../types';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: 'Geral',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const saved = localStorage.getItem('estoque_motto_expenses');
    if (saved) {
      setExpenses(JSON.parse(saved));
    } else {
      setExpenses([]);
    }
  }, []);

  const saveToStorage = (list: Expense[]) => {
    setExpenses(list);
    localStorage.setItem('estoque_motto_expenses', JSON.stringify(list));
  };

  const handleAdd = () => {
    if (!newExpense.description || !newExpense.amount) return alert('Descrição e Valor são obrigatórios');
    
    const e: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: newExpense.description || '',
      amount: newExpense.amount || 0,
      category: newExpense.category || 'Geral',
      date: newExpense.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    
    const updated = [e, ...expenses];
    saveToStorage(updated);
    setIsModalOpen(false);
    setNewExpense({ description: '', amount: 0, category: 'Geral', date: new Date().toISOString().split('T')[0] });
  };

  const removeExpense = (id: string) => {
    if (window.confirm('Deseja realmente excluir este registro de despesa?')) {
      const updated = expenses.filter(e => e.id !== id);
      saveToStorage(updated);
    }
  };

  const filtered = useMemo(() => {
    return expenses.filter(e => 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm]);

  const totalExpenses = useMemo(() => filtered.reduce((acc, e) => acc + e.amount, 0), [filtered]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Financeiro / Despesas</h2>
          <p className="text-slate-500 font-medium italic">Controle saídas de caixa e retiradas.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total no Período</p>
              <p className="text-xl font-black text-red-600 italic">R$ {totalExpenses.toFixed(2)}</p>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-red-600/20 transition-all active:scale-95 italic"
           >
             + Registrar Saída
           </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar por descrição ou categoria..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Data</th>
              <th className="px-8 py-5">Descrição</th>
              <th className="px-8 py-5">Categoria</th>
              <th className="px-8 py-5">Valor</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 text-sm font-bold text-slate-500">
                  {new Date(e.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-8 py-6 font-bold text-slate-800 italic">{e.description}</td>
                <td className="px-8 py-6">
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                    {e.category}
                  </span>
                </td>
                <td className="px-8 py-6 font-black text-red-600 italic text-lg">R$ {e.amount.toFixed(2)}</td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => removeExpense(e.id)} className="text-slate-200 hover:text-red-500 p-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-20 text-center text-slate-300 italic">
             <p className="font-black text-lg opacity-50">Nenhuma despesa registrada.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 italic">Registrar Nova Despesa</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold transition-colors">✕</button>
            </div>
            <div className="p-8 space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Descrição / Motivo</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" 
                    value={newExpense.description} 
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                    placeholder="Ex: Pagamento de luz, Retirada para almoço..." 
                  />
               </div>
               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Valor (R$)</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-red-600 text-lg transition-all" 
                      value={newExpense.amount || ''} 
                      onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})} 
                      placeholder="0.00"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data</label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all" 
                      value={newExpense.date} 
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                    />
                 </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Categoria</label>
                  <select 
                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-white"
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                  >
                    <option value="Geral">Geral</option>
                    <option value="Suprimentos">Suprimentos</option>
                    <option value="Infraestrutura">Infraestrutura</option>
                    <option value="Sangria / Retirada">Sangria / Retirada</option>
                    <option value="Funcionários">Funcionários</option>
                  </select>
               </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200">Cancelar</button>
               <button onClick={handleAdd} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all italic">Salvar Despesa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
