import React, { useState, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AccessMode, SystemSettings } from './types';
import { ICONS } from './constants';
import Dashboard from './components/Dashboard';
import WorkOrders from './components/WorkOrders';
import Inventory from './components/Inventory';
import Cashier from './components/Cashier';
import Sales from './components/Sales';
import Services from './components/Services';
import Reports from './components/Reports';
import Login from './components/Login';
import Setup from './components/Setup';
import Profile from './components/Profile';
import Checklist from './components/Checklist';
import Expenses from './components/Expenses';

import { supabase } from './Lib/supabase'; // ✅ Supabase client

// Access Context
interface AccessContextType {
  mode: AccessMode;
  settings: SystemSettings | null;
  enterAsGestor: (pin: string) => boolean;
  enterAsOperacional: () => void;
  logout: () => void;
  updateSettings: (newSettings: SystemSettings) => void;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (!context) throw new Error('useAccess must be used within AccessProvider');
  return context;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode, logout, settings } = useAccess();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <ICONS.Dashboard />, path: '/dashboard', hidden: mode === 'OPERACIONAL' },
    { name: 'PDV (Caixa)', icon: <ICONS.Cashier />, path: '/caixa', hidden: false },
    {
      name: 'Financeiro / Despesas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m.599-1c.51-.598.81-1.364.81-2.201 0-1.768-1.432-3.201-3.201-3.201-1.768 0-3.201 1.433-3.201 3.201 0 .837.3 1.603.81 2.201m4.792 0c.266.31.428.71.428 1.144 0 1.02-.828 1.848-1.848 1.848-1.02 0-1.848-.828-1.848-1.848 0-.434.162-.834.428-1.144m3.268 0A3.3 3.3 0 0112 15.8c-.85 0-1.61-.318-2.18-.844"
          ></path>
        </svg>
      ),
      path: '/despesas',
      hidden: mode === 'OPERACIONAL',
    },
    { name: 'Vendas', icon: <ICONS.Reports />, path: '/vendas', hidden: false },
    { name: 'Histórico OS', icon: <ICONS.OS />, path: '/os', hidden: false },
    { name: 'Estoque', icon: <ICONS.Inventory />, path: '/estoque', hidden: false },
    {
      name: 'Checklist',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          ></path>
        </svg>
      ),
      path: '/checklist',
      hidden: false,
    },
    { name: 'Serviços', icon: <ICONS.Settings />, path: '/servicos', hidden: false },
    { name: 'Relatórios', icon: <ICONS.Reports />, path: '/relatorios', hidden: mode === 'OPERACIONAL' },
    {
      name: 'Meu Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          ></path>
        </svg>
      ),
      path: '/perfil',
      hidden: false,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl no-print">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-500">🔧</span> {settings?.workshop_name || 'EstoqueMotto'}
          </h1>
        </div>

        <div className="mx-4 mt-6 mb-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modo de Acesso</p>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                mode === 'GESTOR'
                  ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'
                  : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
              }`}
            ></div>
            <span className="font-bold text-sm tracking-tight">{mode === 'GESTOR' ? 'ADMINISTRATIVO' : 'OPERACIONAL'}</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems
            .filter((i) => !i.hidden)
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-semibold text-sm">{item.name}</span>
              </Link>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors text-sm font-bold"
          >
            <ICONS.Logout />
            Encerrar Sessão
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; gestorOnly?: boolean }> = ({ children, gestorOnly }) => {
  const { mode, settings } = useAccess();

  if (!settings) return <Navigate to="/setup" replace />;
  if (mode === 'UNAUTHORIZED') return <Navigate to="/login" replace />;
  if (gestorOnly && mode !== 'GESTOR') return <Navigate to="/caixa" replace />;

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(() => {
    const saved = localStorage.getItem('estoque_motto_settings');
    return saved ? JSON.parse(saved) : null;
  });

  const [mode, setMode] = useState<AccessMode>(() => {
    const saved = localStorage.getItem('estoque_motto_mode') as AccessMode;
    return saved || 'UNAUTHORIZED';
  });

  // ✅ BOTÃO DE TESTE SUPABASE (TEMPORÁRIO)
  async function testarSupabase() {
    const { data, error } = await supabase
      .from('produtos')
      .insert([
        {
          nome: 'TESTE SUPABASE',
          quantidade: 1,
          custo: 10,
          preco: 20,
          estoque_minimo: 1,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('SUPABASE ERRO:', error);
      alert('Erro Supabase: ' + error.message);
      return;
    }

    console.log('SUPABASE OK:', data);
    alert('✅ Gravou no Supabase! Veja a tabela produtos.');
  }

  const enterAsGestor = (pin: string) => {
    if (settings && pin === localStorage.getItem('estoque_motto_raw_pin')) {
      setMode('GESTOR');
      localStorage.setItem('estoque_motto_mode', 'GESTOR');
      return true;
    }
    return false;
  };

  const enterAsOperacional = () => {
    setMode('OPERACIONAL');
    localStorage.setItem('estoque_motto_mode', 'OPERACIONAL');
  };

  const logout = () => {
    setMode('UNAUTHORIZED');
    localStorage.removeItem('estoque_motto_mode');
  };

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    localStorage.setItem('estoque_motto_settings', JSON.stringify(newSettings));
  };

  return (
    <AccessContext.Provider value={{ mode, settings, enterAsGestor, enterAsOperacional, logout, updateSettings }}>
      {/* ✅ Botão temporário para testar Supabase */}
      <div className="fixed bottom-4 right-4 z-[9999] no-print">
        <button
          onClick={testarSupabase}
          className="px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-lg font-bold text-sm hover:bg-slate-50"
        >
          TESTAR SUPABASE
        </button>
      </div>

      <HashRouter>
        <Routes>
          <Route path="/setup" element={settings ? <Navigate to="/login" /> : <Setup />} />
          <Route path="/login" element={!settings ? <Navigate to="/setup" /> : mode !== 'UNAUTHORIZED' ? <Navigate to="/" /> : <Login />} />
          <Route path="/dashboard" element={<ProtectedRoute gestorOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/os" element={<ProtectedRoute><WorkOrders /></ProtectedRoute>} />
          <Route path="/estoque" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/checklist" element={<ProtectedRoute><Checklist /></ProtectedRoute>} />
          <Route path="/caixa" element={<ProtectedRoute><Cashier /></ProtectedRoute>} />
          <Route path="/vendas" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/servicos" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/despesas" element={<ProtectedRoute gestorOnly><Expenses /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute gestorOnly><Reports /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to={mode === 'GESTOR' ? '/dashboard' : '/caixa'} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AccessContext.Provider>
  );
};

export default App;
