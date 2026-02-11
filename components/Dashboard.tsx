
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import PinConfirmModal from './PinConfirmModal';
import { useAccess } from '../App';
import { Product, Sale, WorkOrder, OSStatus } from '../types';

const StatCard: React.FC<{ title: string; value: string; detail?: string; color: string; icon?: string }> = ({ title, value, detail, color, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="flex flex-col">
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {detail && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{detail}</span>}
      </div>
    </div>
    <div className={`mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden`}>
      <div className={`h-full ${color}`} style={{ width: '100%' }}></div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { enterAsOperacional } = useAccess();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Date Range State
  const defaultStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);
  const defaultEndDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [dateStart, setDateStart] = useState(defaultStartDate);
  const [dateEnd, setDateEnd] = useState(defaultEndDate);

  // Load Real Data
  const products: Product[] = useMemo(() => JSON.parse(localStorage.getItem('estoque_motto_products') || '[]'), []);
  const sales: Sale[] = useMemo(() => JSON.parse(localStorage.getItem('estoque_motto_sales') || '[]'), []);
  const osList: WorkOrder[] = useMemo(() => JSON.parse(localStorage.getItem('estoque_motto_os') || '[]'), []);
  // Mock expenses for the card - In a real app this would come from an 'expenses' table
  const expenses: any[] = useMemo(() => JSON.parse(localStorage.getItem('estoque_motto_expenses') || '[]'), []);

  // 1. Calculations for Cards
  const stockValue = useMemo(() => products.reduce((acc, p) => acc + (p.quantity * (p.price_cost || 0)), 0), [products]);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const stats = useMemo(() => {
    let dayTotal = 0;
    let monthTotal = 0;
    let monthExpenses = 0;

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

    // Expenses logic
    expenses.forEach(e => {
        const eDate = e.date || e.created_at;
        if (eDate && eDate.startsWith(currentMonth)) monthExpenses += e.amount || 0;
    });

    return { dayTotal, monthTotal, monthExpenses };
  }, [sales, osList, expenses, today, currentMonth]);

  // 2. Filtered Graph Data based on selected range
  const graphData = useMemo(() => {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    const dataMap: Record<string, number> = {};

    // Generate days in range
    let current = new Date(start);
    while (current <= end) {
      const key = current.toISOString().split('T')[0];
      dataMap[key] = 0;
      current.setDate(current.getDate() + 1);
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
      name: date.split('-').slice(1).reverse().join('/'), // format DD/MM
      total,
      fullDate: date
    })).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [sales, osList, dateStart, dateEnd]);

  const hasData = graphData.some(d => d.total > 0);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Painel do Gestor</h2>
          <p className="text-slate-500 font-medium italic">Monitoramento financeiro e operacional.</p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setIsPinModalOpen(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-6 py-3 rounded-2xl font-black transition-all flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Modo Operacional
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Vendas do Dia" value={`R$ ${stats.dayTotal.toFixed(2)}`} detail="Total hoje" color="bg-green-500" icon="💰" />
        <StatCard title="Vendas do Mês" value={`R$ ${stats.monthTotal.toFixed(2)}`} detail="Receita Bruta" color="bg-blue-500" icon="📈" />
        <StatCard title="Despesas" value={`R$ ${stats.monthExpenses.toFixed(2)}`} detail="Saídas Mensais" color="bg-red-500" icon="📉" />
        <StatCard title="Valor Estoque" value={`R$ ${stockValue.toFixed(2)}`} detail="Custo Total" color="bg-purple-500" icon="📦" />
        <StatCard title="OS Ativas" value={osList.filter(o => o.status !== OSStatus.FINALIZADA && o.status !== OSStatus.CANCELADA).length.toString()} detail="Em andamento" color="bg-orange-500" icon="🔧" />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
            <h3 className="font-black text-slate-800 flex items-center gap-3 italic text-xl">
               <span className="text-blue-500 tracking-tighter text-2xl">●</span> DESEMPENHO DE VENDAS (R$)
            </h3>
            
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100 w-full lg:w-auto">
                <div className="flex items-center gap-2 flex-1 lg:flex-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">De</span>
                    <input 
                        type="date" 
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 flex-1 lg:flex-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Até</span>
                    <input 
                        type="date" 
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {hasData ? (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}}
                    tickFormatter={(val) => `R$ ${val}`}
                    dx={-10}
                />
                <Tooltip 
                   contentStyle={{ 
                       borderRadius: '20px', 
                       border: 'none', 
                       boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                       padding: '16px',
                       backgroundColor: '#ffffff'
                   }}
                   itemStyle={{ fontWeight: '800', fontStyle: 'italic', color: '#2563eb' }}
                   labelStyle={{ fontWeight: '800', marginBottom: '8px', color: '#1e293b', fontSize: '12px' }}
                   formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Faturamento']}
                />
                <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
             <div className="text-center p-12">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <p className="text-slate-400 font-black italic text-xl tracking-tight">Sem dados para o período selecionado</p>
                <p className="text-slate-300 font-medium mt-2">As vendas aparecerão aqui após serem pagas.</p>
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
