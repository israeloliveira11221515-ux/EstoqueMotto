
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import PinConfirmModal from './PinConfirmModal';
import { useAccess } from '../App';
import { Product, Sale, WorkOrder, OSStatus } from '../types';

const StatCard: React.FC<{ title: string; value: string; detail?: string; color: string }> = ({ title, value, detail, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
    <div className="flex flex-col">
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      {detail && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{detail}</span>}
    </div>
    <div className={`mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden`}>
      <div className={`h-full ${color}`} style={{ width: '100%' }}></div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { enterAsOperacional } = useAccess();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Load Real Data
  const products: Product[] = useMemo(() => JSON.parse(localStorage.getItem('estoque_motto_products') || '[]'), []);
  const sales: Sale[] = useMemo(() => JSON.parse(localStorage.getItem('estoque_motto_sales') || '[]'), []);
  const osList: WorkOrder[] = useMemo(() => JSON.parse(localStorage.getItem('estoque_motto_os') || '[]'), []);

  // 1. Stock Value (Cost)
  const stockValue = useMemo(() => products.reduce((acc, p) => acc + (p.quantity * (p.price_cost || 0)), 0), [products]);

  // 2. Sales of the Day / Month
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const stats = useMemo(() => {
    let dayTotal = 0;
    let monthTotal = 0;

    // From PDV Sales
    sales.forEach(s => {
      const sDate = s.created_at.split('T')[0];
      if (sDate === today) dayTotal += s.total;
      if (sDate.startsWith(currentMonth)) monthTotal += s.total;
    });

    // From Paid OS
    osList.forEach(os => {
      if (os.status === OSStatus.FINALIZADA && os.paid_at) {
        const oDate = os.paid_at.split('T')[0];
        if (oDate === today) dayTotal += os.total_amount;
        if (oDate.startsWith(currentMonth)) monthTotal += os.total_amount;
      }
    });

    return { dayTotal, monthTotal };
  }, [sales, osList, today, currentMonth]);

  // 3. Last 30 Days Graph Data
  const graphData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dataMap[key] = 0;
    }

    // Accumulate Sales
    sales.forEach(s => {
      const k = s.created_at.split('T')[0];
      if (dataMap[k] !== undefined) dataMap[k] += s.total;
    });

    // Accumulate Paid OS
    osList.forEach(os => {
      if (os.status === OSStatus.FINALIZADA && os.paid_at) {
        const k = os.paid_at.split('T')[0];
        if (dataMap[k] !== undefined) dataMap[k] += os.total_amount;
      }
    });

    return Object.entries(dataMap).map(([date, total]) => ({
      name: date.split('-').slice(1).join('/'),
      total
    }));
  }, [sales, osList]);

  const hasData = graphData.some(d => d.total > 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Painel do Gestor</h2>
          <p className="text-gray-500">Visão geral em tempo real da oficina.</p>
        </div>
        <button 
          onClick={() => setIsPinModalOpen(true)}
          className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Ativar Modo Operacional
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Vendas do Dia" value={`R$ ${stats.dayTotal.toFixed(2)}`} detail="PDV + OS Finalizadas" color="bg-green-500" />
        <StatCard title="Vendas do Mês" value={`R$ ${stats.monthTotal.toFixed(2)}`} detail="Mês Atual" color="bg-blue-500" />
        <StatCard title="Valor do Estoque" value={`R$ ${stockValue.toFixed(2)}`} detail="Preço de Custo" color="bg-purple-500" />
        <StatCard title="OS Ativas" value={osList.filter(o => o.status !== OSStatus.FINALIZADA && o.status !== OSStatus.CANCELADA).length.toString()} detail="Em Aberto/Andamento" color="bg-orange-500" />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-8 flex items-center gap-2 italic">
           <span className="text-blue-500 tracking-tighter">●</span> DESEMPENHO DOS ÚLTIMOS 30 DIAS (R$)
        </h3>
        {hasData ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Vendido']}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
             <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <p className="text-slate-300 font-bold italic">Aguardando as primeiras vendas...</p>
             </div>
          </div>
        )}
      </div>

      <PinConfirmModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={() => enterAsOperacional()}
        title="Ativar Modo Operacional"
        description="Digite o PIN do Gestor para restringir esta tela"
      />
    </div>
  );
};

export default Dashboard;
