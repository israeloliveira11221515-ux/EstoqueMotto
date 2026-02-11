
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
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
    { name: 'Vendas', icon: <ICONS.Reports />, path: '/vendas', hidden: false },
    { name: 'Histórico OS', icon: <ICONS.OS />, path: '/os', hidden: false },
    { name: 'Estoque', icon: <ICONS.Inventory />, path: '/estoque', hidden: false },
    { name: 'Serviços', icon: <ICONS.Settings />, path: '/servicos', hidden: mode === 'OPERACIONAL' },
    { name: 'Relatórios', icon: <ICONS.Reports />, path: '/relatorios', hidden: mode === 'OPERACIONAL' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-500">🔧</span> {settings?.workshop_name || 'EstoqueMotto'}
          </h1>
        </div>

        <div className="mx-4 mt-6 mb-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modo de Acesso</p>
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${mode === 'GESTOR' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`}></div>
              <span className="font-bold text-sm tracking-tight">{mode === 'GESTOR' ? 'ADMINISTRATIVO' : 'OPERACIONAL'}</span>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.filter(i => !i.hidden).map((item) => (
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

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode, gestorOnly?: boolean }> = ({ children, gestorOnly }) => {
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
      <HashRouter>
        <Routes>
          <Route path="/setup" element={settings ? <Navigate to="/login" /> : <Setup />} />
          <Route path="/login" element={!settings ? <Navigate to="/setup" /> : (mode !== 'UNAUTHORIZED' ? <Navigate to="/" /> : <Login />)} />
          <Route path="/dashboard" element={<ProtectedRoute gestorOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/os" element={<ProtectedRoute><WorkOrders /></ProtectedRoute>} />
          <Route path="/estoque" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/caixa" element={<ProtectedRoute><Cashier /></ProtectedRoute>} />
          <Route path="/vendas" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/servicos" element={<ProtectedRoute gestorOnly><Services /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute gestorOnly><Reports /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to={mode === 'GESTOR' ? "/dashboard" : "/caixa"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AccessContext.Provider>
  );
};

export default App;
