import React, { useState, useEffect } from 'react';
import LandingPage from './landing/LandingPage';
import Layout from './components/Layout';
import Dashboard from './pwa/Dashboard';
import Generator from './pwa/Generator';
import { isAuthenticated } from './services/supabaseClient';

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  if (!isAuth) {
    return <LandingPage />;
  }

  // Simple Tab Routing for PWA
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'generator':
        return <Generator />;
      case 'library':
        return <div className="p-10 text-slate-400 text-center">Biblioteca en construcción...</div>;
      case 'profile':
        return <div className="p-10 text-slate-400 text-center">Perfil de Usuario y Stripe Portal aquí.</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
