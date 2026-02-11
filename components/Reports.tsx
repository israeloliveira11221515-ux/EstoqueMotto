
import React, { useState } from 'react';
import PinConfirmModal from './PinConfirmModal';
import { Sale, WorkOrder, Product, Commission } from '../types';

const Reports: React.FC = () => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ title: string; id: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClick = (report: { title: string; id: string }) => {
    setSelectedReport(report);
    setIsPinModalOpen(true);
  };

  const downloadCSV = (data: string, filename: string) => {
    const blob = new Blob(["\ufeff" + data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onPinSuccess = () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    
    // Simulate processing time for "generation"
    setTimeout(() => {
      try {
        let csvContent = "";
        const now = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

        switch (selectedReport.id) {
          case 'caixa': {
            const sales: Sale[] = JSON.parse(localStorage.getItem('estoque_motto_sales') || '[]');
            csvContent = "ID;Data;Status;Pagamento;Subtotal;Desconto;Total\n";
            sales.forEach(s => {
              csvContent += `${s.id};${new Date(s.created_at).toLocaleString('pt-BR')};${s.status};${s.payment_method || 'PIX'};${s.subtotal.toFixed(2)};${s.discount_value.toFixed(2)};${s.total.toFixed(2)}\n`;
            });
            break;
          }
          case 'comissoes': {
            const commissions: Commission[] = JSON.parse(localStorage.getItem('estoque_motto_commissions') || '[]');
            csvContent = "ID;OS_ID;Funcionario_ID;Valor;Status;Data\n";
            commissions.forEach(c => {
              csvContent += `${c.id};${c.order_id};${c.employee_id};${c.value.toFixed(2)};${c.status};${new Date(c.created_at).toLocaleString('pt-BR')}\n`;
            });
            break;
          }
          case 'estoque': {
            const products: Product[] = JSON.parse(localStorage.getItem('estoque_motto_products') || '[]');
            csvContent = "ID;Nome;SKU;Quantidade;Minimo;Custo;Venda\n";
            products.forEach(p => {
              csvContent += `${p.id};${p.name};${p.sku || ''};${p.quantity};${p.min_stock};${p.price_cost.toFixed(2)};${p.price_sell.toFixed(2)}\n`;
            });
            break;
          }
          case 'faturamento': {
            const sales: Sale[] = JSON.parse(localStorage.getItem('estoque_motto_sales') || '[]');
            const os: WorkOrder[] = JSON.parse(localStorage.getItem('estoque_motto_os') || '[]');
            csvContent = "Origem;ID;Data;Valor\n";
            sales.forEach(s => csvContent += `VENDA;${s.id};${s.created_at};${s.total.toFixed(2)}\n`);
            os.filter(o => o.paid_at).forEach(o => csvContent += `OS;${o.id};${o.paid_at};${o.total_amount.toFixed(2)}\n`);
            break;
          }
          default:
            csvContent = "Relatório sem dados disponíveis.";
        }

        downloadCSV(csvContent, `Relatorio_${selectedReport.id}_${now}.csv`);
        alert(`Relatório "${selectedReport.title}" baixado com sucesso!`);
      } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        alert("Erro ao processar dados do relatório.");
      } finally {
        setIsGenerating(false);
        setSelectedReport(null);
      }
    }, 800);
  };

  const reportTypes = [
    { id: 'caixa', title: 'Fechamento de Caixa', desc: 'Relatório diário de entradas e saídas detalhadas.', icon: '💰' },
    { id: 'comissoes', title: 'Relatório de Comissões', desc: 'Resumo de valores a pagar para cada funcionário.', icon: '🏷️' },
    { id: 'estoque', title: 'Giro de Estoque', desc: 'Análise de peças mais utilizadas e rentabilidade.', icon: '📦' },
    { id: 'faturamento', title: 'Faturamento por Período', desc: 'Visão macro do crescimento da oficina.', icon: '📈' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Relatórios do Gestor</h2>
          <p className="text-slate-500 font-medium italic">Exporte dados financeiros e operacionais para análise.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {reportTypes.map((r) => (
          <div 
            key={r.id} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:opacity-10 transition-opacity grayscale group-hover:grayscale-0">
               {r.icon}
            </div>
            <div className="text-4xl mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
               {r.icon}
            </div>
            <h4 className="font-black text-slate-800 mb-2 text-xl italic">{r.title}</h4>
            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">{r.desc}</p>
            <button 
              onClick={() => handleGenerateClick(r)}
              disabled={isGenerating}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isGenerating && selectedReport?.id === r.id ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
              )}
              {isGenerating && selectedReport?.id === r.id ? 'Gerando...' : 'Baixar Dados (CSV)'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2rem] flex items-center gap-6">
         <div className="text-4xl">💡</div>
         <p className="text-amber-800 text-sm font-medium italic">
           Os relatórios são exportados em formato <b>CSV</b>, compatível com Excel, Planilhas Google e outros sistemas de contabilidade. 
           O download iniciará automaticamente após a confirmação do PIN.
         </p>
      </div>

      <PinConfirmModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={onPinSuccess}
        title="Acesso Restrito"
        description={`Confirme o PIN para exportar o relatório de ${selectedReport?.title}`}
      />
    </div>
  );
};

export default Reports;
