
import React, { useState, useEffect } from 'react';
import { useAccess } from '../App';
import { useNavigate } from 'react-router-dom';
import { SystemSettings } from '../types';

const Setup: React.FC = () => {
  const { updateSettings } = useAccess();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    workshop_name: '',
    cnpj: '',
    address_street: '',
    address_number: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    phone_whatsapp: '',
    manager_name: '',
    pin: '',
    pinConfirm: ''
  });
  const [error, setError] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  // Effect to trigger address lookup when CEP has 8 digits
  useEffect(() => {
    const cleanCep = formData.address_zip.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      handleCepLookup(cleanCep);
    }
  }, [formData.address_zip]);

  const handleCepLookup = async (cep: string) => {
    setLoadingCep(true);
    setError('');
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setError('CEP inválido ou não encontrado.');
      } else {
        setFormData(prev => ({
          ...prev,
          address_street: data.logradouro || '',
          address_neighborhood: data.bairro || '',
          address_city: data.localidade || '',
          address_state: data.uf || ''
        }));
      }
    } catch (err) {
      setError('Erro ao buscar o CEP. Tente preencher manualmente.');
      console.error(err);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.workshop_name || !formData.cnpj || !formData.phone_whatsapp) {
        setError('Preencha os dados básicos da oficina.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.address_street || !formData.address_city || !formData.address_zip) {
        setError('Preencha o endereço completo.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pin !== formData.pinConfirm) {
      setError('Os PINs não conferem.');
      return;
    }
    if (formData.pin.length < 4) {
      setError('O PIN deve ter no mínimo 4 dígitos.');
      return;
    }

    const settings: SystemSettings = {
      ...formData,
      gestor_pin_hash: 'hashed_' + formData.pin, // Simulating hash for demo
      max_discount_sem_pin: 5
    };

    localStorage.setItem('estoque_motto_raw_pin', formData.pin);
    updateSettings(settings);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-10 md:p-14">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">🔧</div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">Configuração Inicial</h1>
              <p className="text-slate-400 font-medium italic">Bem-vindo ao EstoqueMotto. Vamos configurar sua oficina.</p>
            </div>
          </div>

          <div className="flex gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h2 className="text-xl font-black text-slate-700 italic border-l-4 border-blue-600 pl-4">Dados da Oficina</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nome da Oficina</label>
                    <input name="workshop_name" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.workshop_name} onChange={handleChange} placeholder="Ex: Oficina do João" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">CNPJ</label>
                    <input name="cnpj" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0001-00" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">WhatsApp de Contato</label>
                    <input name="phone_whatsapp" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone_whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h2 className="text-xl font-black text-slate-700 italic border-l-4 border-blue-600 pl-4">Localização</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">CEP</label>
                    <input name="address_zip" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.address_zip} onChange={handleChange} placeholder="00000-000" />
                    {loadingCep && <div className="absolute right-3 bottom-3 animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rua / Logradouro</label>
                    <input name="address_street" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.address_street} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Número</label>
                    <input name="address_number" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.address_number} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Bairro</label>
                    <input name="address_neighborhood" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.address_neighborhood} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cidade</label>
                    <input name="address_city" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.address_city} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Estado</label>
                    <input name="address_state" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.address_state} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h2 className="text-xl font-black text-slate-700 italic border-l-4 border-blue-600 pl-4">Gestor e Segurança</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nome do Gestor</label>
                    <input name="manager_name" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.manager_name} onChange={handleChange} placeholder="Nome completo" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Definir PIN (4 dígitos)</label>
                      <input name="pin" type="password" maxLength={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-black" value={formData.pin} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Confirmar PIN</label>
                      <input name="pinConfirm" type="password" maxLength={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-black" value={formData.pinConfirm} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-2xl animate-bounce">{error}</p>}

            <div className="pt-8 flex gap-4">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all">Voltar</button>
              )}
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">Próximo Passo</button>
              ) : (
                <button type="submit" className="flex-1 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95">Concluir Cadastro</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Setup;
