
import React, { useState } from 'react';
import PinConfirmModal from './PinConfirmModal';

const Reports: React.FC = () => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleGenerate = (title: string) => {
    setSelectedReport(title);
    setIsPinModalOpen(true);
  };

  const onPinSuccess = () => {
    console.log(`Gerando relatório: ${selectedReport}`);
    alert(`Relatório "${selectedReport}" gerado com sucesso!`);
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Relatórios Financeiros</h2>
        <p className="text-gray-500">Exporte dados para análise e contabilidade.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Fechamento de Caixa', desc: 'Relatório diário de entradas e saídas detalhadas.', icon: '💰' },
          { title: 'Relatório de Comissões', desc: 'Resumo de valores a pagar para cada funcionário.', icon: '🏷️' },
          { title: 'Giro de Estoque', desc: 'Análise de peças mais utilizadas e rentabilidade.', icon: '📦' },
          { title: 'Faturamento por Período', desc: 'Visão macro do crescimento da oficina.', icon: '📈' },
          { title: 'Inadimplência', desc: 'Lista de clientes com pagamentos pendentes.', icon: '⚠️' },
        ].map((r, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-blue-500 transition-all group cursor-pointer">
            <div className="text-3xl mb-4">{r.icon}</div>
            <h4 className="font-bold text-gray-800 mb-2">{r.title}</h4>
            <p className="text-sm text-gray-500 mb-6">{r.desc}</p>
            <button 
              onClick={() => handleGenerate(r.title)}
              className="w-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Gerar PDF
            </button>
          </div>
        ))}
      </div>

      <PinConfirmModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={onPinSuccess}
        title="Acesso Restrito"
        description={`Digite o PIN para visualizar o relatório de ${selectedReport}`}
      />
    </div>
  );
};

export default Reports;
