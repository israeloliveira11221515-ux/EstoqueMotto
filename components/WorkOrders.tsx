
import React, { useState, useEffect } from 'react';
import { OSStatus, WorkOrder, Commission, OSItem, Service, CommissionType, Employee } from '../types';

const WorkOrders: React.FC = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOS, setNewOS] = useState<Partial<WorkOrder>>({
    customer_name: '',
    vehicle_model: '',
    vehicle_plate: '',
    total_amount: 0,
    status: OSStatus.ABERTA,
    items: []
  });

  useEffect(() => {
    const saved = localStorage.getItem('estoque_motto_os');
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      setOrders([]);
      localStorage.setItem('estoque_motto_os', JSON.stringify([]));
    }
  }, []);

  const saveToStorage = (list: WorkOrder[]) => {
    setOrders(list);
    localStorage.setItem('estoque_motto_os', JSON.stringify(list));
  };

  const finalizeOrder = (order: WorkOrder) => {
    if (order.status === OSStatus.FINALIZADA) return alert('Esta OS já está finalizada/paga.');

    try {
      // 1. Mark as Finalized
      const now = new Date().toISOString();
      const updatedOrder: WorkOrder = { 
        ...order, 
        status: OSStatus.FINALIZADA, 
        paid_at: now 
      };

      // 2. Generate Commissions
      const services: Service[] = JSON.parse(localStorage.getItem('estoque_motto_services') || '[]');
      const employees: Employee[] = JSON.parse(localStorage.getItem('estoque_motto_employees') || '[]');
      const currentCommissions: Commission[] = JSON.parse(localStorage.getItem('estoque_motto_commissions') || '[]');
      
      const newCommissions: Commission[] = [];

      order.items.forEach(item => {
        if (!item.employee_id) return; // Skip if no employee responsible

        const serviceDef = services.find(s => s.id === item.service_id);
        const employeeDef = employees.find(e => e.id === item.employee_id);
        
        let commissionValue = 0;

        if (serviceDef) {
          if (serviceDef.commission_type === CommissionType.FIXED) {
            commissionValue = serviceDef.commission_value;
          } else if (serviceDef.commission_type === CommissionType.PERCENT) {
            commissionValue = (item.price * serviceDef.commission_value) / 100;
          }
        } else if (employeeDef && employeeDef.default_commission_percent > 0) {
          // Fallback to employee default percent
          commissionValue = (item.price * employeeDef.default_commission_percent) / 100;
        }

        if (commissionValue > 0) {
          newCommissions.push({
            id: Math.random().toString(36).substr(2, 9),
            order_id: order.id,
            order_item_id: item.id,
            employee_id: item.employee_id,
            value: commissionValue,
            status: 'CONFIRMADA',
            created_at: now
          });
        }
      });

      // 3. Save everything
      const updatedList = orders.map(o => o.id === order.id ? updatedOrder : o);
      saveToStorage(updatedList);
      localStorage.setItem('estoque_motto_commissions', JSON.stringify([...currentCommissions, ...newCommissions]));

      alert(`OS #${order.id} Finalizada! ${newCommissions.length} comissões geradas.`);
    } catch (e) {
      console.error(e);
      alert('Erro ao processar fechamento da OS.');
    }
  };

  const filtered = orders.filter(os => 
    (os.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     os.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'ALL' || os.status === filterStatus)
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleAddOS = () => {
    if (!newOS.customer_name || !newOS.vehicle_plate) return alert('Cliente e Placa são obrigatórios');
    
    const osToAdd: WorkOrder = {
      customer_name: newOS.customer_name || '',
      vehicle_model: newOS.vehicle_model || '',
      vehicle_plate: newOS.vehicle_plate || '',
      total_amount: newOS.total_amount || 0,
      status: newOS.status || OSStatus.ABERTA,
      items: [], // Start empty, items managed in a real flow
      id: (orders.length + 1000).toString(),
      created_at: new Date().toISOString()
    };
    
    const updated = [osToAdd, ...orders];
    saveToStorage(updated);
    setIsAddModalOpen(false);
    setNewOS({ customer_name: '', vehicle_model: '', vehicle_plate: '', total_amount: 0, status: OSStatus.ABERTA, items: [] });
  };

  const getStatusColor = (status: OSStatus) => {
    switch(status) {
      case OSStatus.ABERTA: return 'bg-blue-100 text-blue-700';
      case OSStatus.EM_ANDAMENTO: return 'bg-amber-100 text-amber-700';
      case OSStatus.AGUARDANDO_PECA: return 'bg-purple-100 text-purple-700';
      case OSStatus.FINALIZADA: return 'bg-green-100 text-green-700';
      case OSStatus.CANCELADA: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ordens de Serviço</h2>
          <p className="text-gray-500">Gerencie os atendimentos e comissões.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2"
        >
          <span>+</span> Nova OS
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Buscar por cliente ou placa..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <select 
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Todos os Status</option>
          <option value={OSStatus.ABERTA}>Aberta</option>
          <option value={OSStatus.EM_ANDAMENTO}>Em Andamento</option>
          <option value={OSStatus.AGUARDANDO_PECA}>Aguardando Peça</option>
          <option value={OSStatus.FINALIZADA}>Finalizada</option>
          <option value={OSStatus.CANCELADA}>Cancelada</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">ID / Data</th>
              <th className="px-6 py-4">Cliente / Veículo</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((os) => (
              <tr key={os.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">#{os.id}</div>
                  <div className="text-xs text-gray-500">{new Date(os.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{os.customer_name}</div>
                  <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">{os.vehicle_model} • {os.vehicle_plate}</div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">
                  R$ {os.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(os.status)}`}>
                    {os.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   {os.status !== OSStatus.FINALIZADA && os.status !== OSStatus.CANCELADA && (
                     <button 
                       onClick={() => finalizeOrder(os)}
                       className="bg-green-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-md hover:bg-green-700 transition-colors shadow-sm active:scale-95"
                     >
                       Receber e Finalizar
                     </button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-400 font-medium italic">Nenhuma ordem de serviço cadastrada.</p>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800 italic">Nova Ordem de Serviço</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nome do Cliente</label>
                <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newOS.customer_name} onChange={e => setNewOS({...newOS, customer_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Modelo do Veículo</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newOS.vehicle_model} onChange={e => setNewOS({...newOS, vehicle_model: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Placa</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 uppercase" value={newOS.vehicle_plate} onChange={e => setNewOS({...newOS, vehicle_plate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Orçamento Inicial (R$)</label>
                <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={newOS.total_amount} onChange={e => setNewOS({...newOS, total_amount: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">Cancelar</button>
              <button onClick={handleAddOS} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">Criar Ordem</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;
