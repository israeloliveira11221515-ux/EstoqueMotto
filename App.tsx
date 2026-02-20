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
import { supabase } from './Lib/supabase';

// ================= CONTEXTO =================

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

// ================= LAYOUT =================

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode, logout, settings } = useAccess();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <ICONS.Dashboard />, path: '/dashboard', hidden: mode === 'OPERACIONAL' },
    { name: 'PDV (Caixa)', icon: <ICONS.Cashier />, path: '/caixa', hidden: false },
    { name: 'Vendas', icon: <ICONS.Reports />, path: '/vendas', hidden: false },
    { name: 'Histórico OS', icon: <ICONS.OS />, path: '/os', hidden: false },
    { name: 'Estoque', icon: <ICONS.Inventory />, path: '/estoque', hidden: false },
    { name: 'Relatórios', icon: <ICONS.Reports />, path: '/relatorios', hidden: mode === 'OPERACIONAL' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      <aside style={{ width: 250, background: '#0f172a', color: 'white', padding: 20 }}>
        <h1 style={{ fontWeight: 'bold', marginBottom: 20 }}>
          🔧 {settings?.workshop_name || 'EstoqueMotto'}
        </h1>

        {menuItems.filter(i => !i.hidden).map(item => (
          <div key={item.path} style={{ marginBottom: 10 }}>
            <Link to={item.path} style={{ color: 'white', textDecoration: 'none' }}>
              {item.name}
            </Link>
          </div>
        ))}

        <button
          onClick={logout}
          style={{
            marginTop: 20,
            padding: 10,
            width: '100%',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 8
          }}
        >
          Encerrar Sessão
        </button>
      </aside>

      <main style={{ flex: 1, padding: 30 }}>{children}</main>
    </div>
  );
};

// ================= PROTECTED ROUTE =================

const ProtectedRoute: React.FC<{ children: React.ReactNode; gestorOnly?: boolean }> = ({ children, gestorOnly }) => {
  const { mode, settings } = useAccess();

  if (!settings) return <Navigate to="/setup" replace />;
  if (mode === 'UNAUTHORIZED') return <Navigate to="/login" replace />;
  if (gestorOnly && mode !== 'GESTOR') return <Navigate to="/caixa" replace />;

  return <Layout>{children}</Layout>;
};

// ================= APP =================

const App: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(() => {
    const saved = localStorage.getItem('estoque_motto_settings');
    return saved ? JSON.parse(saved) : null;
  });

  const [mode, setMode] = useState<AccessMode>(() => {
    const saved = localStorage.getItem('estoque_motto_mode') as AccessMode;
    return saved || 'UNAUTHORIZED';
  });

  // ================= TESTE SUPABASE =================

  async function testarSupabase() {
    const { data, error } = await supabase
      .from('produtos')
      .insert([
        {
          nome: 'TESTE SUPABASE',
          quantidade: 1,
          custo: 10,
          preco: 20,
          estoque_minimo: 1
        }
      ])
      .select()
      .single();

    if (error) {
      alert("Erro Supabase: " + error.message);
      return;
    }

    alert("✅ Gravou no Supabase!");
    console.log(data);
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
      
      {/* BOTÃO FIXO GARANTIDO */}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 999999 }}>
        <button
          onClick={testarSupabase}
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid #ccc',
            background: 'white',
            fontWeight: 700,
            cursor: 'pointer'
          }}
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
          <Route path="/" element={<Navigate to={mode === 'GESTOR' ? "/dashboard" : "/caixa"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AccessContext.Provider>
  );
};

export default App;
