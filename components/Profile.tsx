
import React, { useState, useRef } from 'react';
import { useAccess } from '../App';
import { SystemSettings } from '../types';

const Profile: React.FC = () => {
  const { mode, settings, updateSettings } = useAccess();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && settings) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newSettings: SystemSettings = {
          ...settings,
          manager_photo: base64String
        };
        updateSettings(newSettings);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Meu Perfil</h2>
          <p className="text-slate-500 font-medium italic">Gerencie suas informações e foto de perfil.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center">
                {settings?.manager_photo ? (
                  <img src={settings.manager_photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-20 h-20 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                )}
              </div>
              <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
              />
            </div>
            <h3 className="mt-6 text-xl font-black text-slate-800 italic">{settings?.manager_name}</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{mode === 'GESTOR' ? 'Administrador' : 'Operacional'}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <h4 className="text-lg font-black text-slate-700 italic border-l-4 border-blue-600 pl-4 uppercase tracking-tighter">Informações Pessoais</h4>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  readOnly={mode !== 'GESTOR'}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all disabled:opacity-50"
                  defaultValue={settings?.manager_name}
                  onChange={(e) => {
                    if (settings && mode === 'GESTOR') {
                       // In a real app we'd save on blur or button click
                    }
                  }}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Oficina Associada</label>
                <input 
                  type="text" 
                  readOnly
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold opacity-60 cursor-not-allowed"
                  defaultValue={settings?.workshop_name}
                />
              </div>

              {mode === 'GESTOR' && (
                <div className="pt-6">
                   <button 
                     onClick={() => alert('Para alterar dados sensíveis, utilize o menu de Configurações.')}
                     className="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 italic text-sm"
                   >
                     Salvar Alterações
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
