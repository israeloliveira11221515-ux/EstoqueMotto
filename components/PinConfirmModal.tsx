
import React, { useState, useEffect } from 'react';

interface PinConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const PinConfirmModal: React.FC<PinConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title, 
  description 
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError('');
    }
  }, [isOpen]);

  const handleKeyClick = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        // Validate against raw pin stored in setup (Mocking bcrypt verify)
        if (newPin === localStorage.getItem('estoque_motto_raw_pin')) { 
          onSuccess();
          onClose();
        } else {
          const nextAt = attempts + 1;
          setAttempts(nextAt);
          setError(`PIN Incorreto (${nextAt}/5)`);
          setPin('');
          if (nextAt >= 5) setError('Bloqueado por 5 minutos');
        }
      }
    }
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-10 text-center border-b border-slate-50">
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-800 italic tracking-tight">{title || 'Autorização'}</h3>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mt-2">{description || 'Digite o PIN do Gestor'}</p>
        </div>

        <div className="p-10">
          <div className="flex justify-center gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i ? 'bg-blue-600 border-blue-600 scale-125 shadow-[0_0_10px_#3b82f6]' : 'bg-transparent border-slate-200'}`}></div>
            ))}
          </div>

          {error && <p className="text-red-500 text-xs text-center font-black mb-6 uppercase tracking-tight animate-bounce">{error}</p>}

          <div className="grid grid-cols-3 gap-4 mb-10">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'C') setPin('');
                  else if (key === '⌫') handleDelete();
                  else handleKeyClick(key);
                }}
                disabled={attempts >= 5}
                className="h-16 bg-slate-50 hover:bg-slate-100 active:scale-90 text-slate-700 font-black rounded-2xl transition-all flex items-center justify-center text-2xl disabled:opacity-50"
              >
                {key}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 transition-colors">
            Cancelar Operação
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinConfirmModal;
