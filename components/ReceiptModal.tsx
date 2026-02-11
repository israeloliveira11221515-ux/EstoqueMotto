
import React from 'react';
import { Sale, SystemSettings } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  settings: SystemSettings | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale, settings }) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110] no-print animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center no-print">
          <h3 className="font-black text-slate-800 italic">Comprovante de Venda</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="p-8 overflow-y-auto flex-1 bg-white text-slate-800 font-mono text-sm leading-tight printable-area">
          <div className="text-center mb-6 space-y-1">
            <h2 className="text-lg font-black uppercase tracking-tighter">{settings?.workshop_name || 'EstoqueMotto'}</h2>
            <p className="text-xs">{settings?.cnpj || '00.000.000/0001-00'}</p>
            <p className="text-[10px] leading-3 uppercase">
              {settings?.address_street}, {settings?.address_number}<br />
              {settings?.address_neighborhood} - {settings?.address_city}/{settings?.address_state}<br />
              CEP: {settings?.address_zip} | TEL: {settings?.phone_whatsapp}
            </p>
          </div>

          <div className="border-t border-dashed border-slate-300 my-4"></div>

          <div className="flex justify-between text-[11px] mb-4">
            <span>DATA: {new Date(sale.created_at).toLocaleDateString('pt-BR')}</span>
            <span>HORA: {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="mb-4">
            <p className="font-black mb-2 uppercase border-b border-slate-100 pb-1">Cupom Não Fiscal: #{sale.id}</p>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-1">ITEM</th>
                  <th className="text-center py-1">QTD</th>
                  <th className="text-right py-1">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-2 font-medium">{item.name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">R$ {item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-dashed border-slate-300 my-4"></div>

          <div className="space-y-1 text-[12px]">
            <div className="flex justify-between">
              <span className="font-bold">SUBTOTAL</span>
              <span>R$ {sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount_value > 0 && (
              <div className="flex justify-between text-red-600 italic">
                <span>DESCONTO</span>
                <span>- R$ {sale.discount_value.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black pt-2 border-t border-slate-100 mt-2">
              <span>TOTAL</span>
              <span className="text-blue-600">R$ {sale.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 text-[10px] space-y-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-black uppercase mb-1">Pagamento</p>
              <p className="font-medium">{sale.payment_method || 'PIX'}</p>
            </div>
            <div className="text-center pt-8 border-t border-dashed border-slate-200 opacity-50">
              <p className="uppercase font-black">Obrigado pela preferência!</p>
              <p className="mt-1">Sistema EstoqueMotto</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 no-print">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 text-slate-500 font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Fechar
          </button>
          <button 
            onClick={handlePrint} 
            className="flex-[2] py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Imprimir Comprovante
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 0;
            margin: 0;
            font-size: 10pt;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;
