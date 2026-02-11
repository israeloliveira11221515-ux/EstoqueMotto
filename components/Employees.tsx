
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('estoque_motto_employees');
    if (saved) {
      setEmployees(JSON.parse(saved));
    } else {
      setEmployees([]);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Equipe de Trabalho</h2>
          <p className="text-gray-500">Gerencie funcionários e permissões.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md">
          Convidar Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                {emp.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-gray-800 truncate">{emp.name}</h4>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{emp.role}</p>
              </div>
              <span className={`w-2 h-2 rounded-full ${emp.status === 'Ativo' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-50">
               <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">OS Mensais</p>
                  <p className="text-lg font-bold text-gray-700">{emp.os_count || 0}</p>
               </div>
               <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Comissão (R$)</p>
                  <p className="text-lg font-bold text-green-600">R$ {(emp.commission || 0).toFixed(2)}</p>
               </div>
            </div>

            <div className="mt-6 flex gap-2">
               <button className="flex-1 text-sm font-medium text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors">Editar</button>
               <button className="flex-1 text-sm font-medium text-gray-400 hover:text-red-600 py-2 rounded-lg transition-colors">Remover</button>
            </div>
          </div>
        ))}
      </div>
      {employees.length === 0 && (
        <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
           <p className="text-slate-300 font-bold italic">Nenhum funcionário cadastrado.</p>
        </div>
      )}
    </div>
  );
};

export default Employees;
