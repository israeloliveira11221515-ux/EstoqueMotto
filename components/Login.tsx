
import React, { useState } from 'react';
import { useAccess } from '../App';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { enterAsGestor, enterAsOperacional, settings } = useAccess();
  const navigate = useNavigate();
  const [showKeypad, setShowKeypad] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleGestorClick = () => {
    setShowKeypad(true);
  };

  const handleOperacionalClick = () => {
    enterAsOperacional();
    navigate('/caixa');
  };

  const handleKeyClick = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) { // Auto-validate for 4 digit PIN
        const success = enterAsGestor(newPin);
        if (success) {
          navigate('/dashboard');
        } else {
          setError('PIN Inválido');
          setPin('');
        }
      }
    }
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {!showKeypad ? (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div>
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-5xl mx-auto mb-6 shadow-2xl shadow-blue-500/20">
                🔧
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter italic">{settings?.workshop_name || 'EstoqueMotto'}</h1>
              <p className="text-slate-400 mt-2 font-medium">Gestão Inteligente de Oficina</p>
            </div>

            <div className="grid gap-4 pt-4">
              <button 
                onClick={handleGestorClick}
                className="group relative bg-white py-6 rounded-3xl flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <div className="text-left">
                  <span className="block font-black text-slate-800 text-lg">Entrar como Gestor</span>
                  <span className="block text-xs text-slate-400 font-bold uppercase tracking-widest">Acesso Administrativo</span>
                </div>
              </button>

              <button 
                onClick={handleOperacionalClick}
                className="group relative bg-slate-800 py-6 rounded-3xl flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 border border-slate-700"
              >
                <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div className="text-left">
                  <span className="block font-black text-white text-lg">Entrar como Operacional</span>
                  <span className="block text-xs text-slate-500 font-bold uppercase tracking-widest">Acesso Balcão</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in slide-in-from-bottom duration-300">
            <button onClick={() => setShowKeypad(false)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800">PIN do Gestor</h2>
              <p className="text-slate-400 text-sm font-medium">Digite seu código de acesso</p>
            </div>

            <div className="flex justify-center gap-2 mb-10">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                    pin.length > i ? 'bg-blue-600 border-blue-600 scale-125' : 'bg-transparent border-slate-200'
                  }`}
                ></div>
              ))}
            </div>

            {error && <p className="text-red-500 font-black text-sm mb-6 animate-bounce">{error}</p>}

            <div className="grid grid-cols-3 gap-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'C') setPin('');
                    else if (key === '⌫') handleDelete();
                    else handleKeyClick(key);
                  }}
                  className={`h-16 rounded-2xl text-2xl font-black transition-all active:scale-90 flex items-center justify-center
                    ${key === 'C' ? 'text-red-500 hover:bg-red-50' : key === '⌫' ? 'text-slate-400 hover:bg-slate-50' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}
                  `}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
