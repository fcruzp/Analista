import React from 'react';
import { mockLogout } from '../services/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Icons = {
  Dashboard: ({ active }: { active?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-all ${active ? 'active-glow' : ''}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6a2.25 2.25 0 0 1 2.25-2.25h12a2.25 2.25 0 0 1 2.25 2.25v12a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25V6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6M9 14h3" />
    </svg>
  ),
  Generator: ({ active }: { active?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-all ${active ? 'active-glow' : ''}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Library: ({ active }: { active?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-all ${active ? 'active-glow' : ''}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c1.097 0 2.148.195 3.122.552m12 0a8.967 8.967 0 0 1-3.122-.552c-1.097 0-2.148.195-3.122.552m3.122-.552V4.26c-.978-.358-2.025-.552-3.122-.552-1.097 0-2.148.195-3.122.552m3.122-.552c1.097 0 2.148.195 3.122.552m-3.122-.552v12.75m0-12.75v12.75" />
    </svg>
  ),
  Profile: ({ active }: { active?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-all ${active ? 'active-glow' : ''}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
    </svg>
  ),
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', icon: Icons.Dashboard, label: 'Panel' },
    { id: 'generator', icon: Icons.Generator, label: 'Estudio' },
    { id: 'library', icon: Icons.Library, label: 'Archivo' },
    { id: 'profile', icon: Icons.Profile, label: 'ID' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">

      {/* Mobile Top Header - Sci-fi Style */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/60 backdrop-blur-2xl border-b border-cyan-500/10 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-400 text-xs shadow-[0_0_15px_rgba(34,211,238,0.2)]">A+</div>
          <span className="font-black tracking-tighter text-white text-lg uppercase italic">Analista<span className="text-cyan-400 font-normal">+</span></span>
        </div>
        <button
          onClick={mockLogout}
          className="w-10 h-10 flex items-center justify-center border border-slate-800 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/5 transition-all"
        >
          <Icons.Logout />
        </button>
      </header>

      {/* Sidebar Desktop - Tech Console Style */}
      <aside className="hidden md:flex flex-col w-72 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl relative">
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"></div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center font-bold text-cyan-400 text-sm shadow-[0_0_20px_rgba(34,211,238,0.1)]">A+</div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Analista+</h1>
              <p className="text-[10px] text-cyan-500 font-mono tracking-widest mt-1 opacity-60 uppercase">System Active</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all relative group ${isActive
                    ? 'bg-cyan-500/5 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-500 hover:bg-slate-900/50 hover:text-slate-300 border border-transparent'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-[3px] h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                )}
                <Icon active={isActive} />
                <span className={`font-bold text-xs uppercase tracking-[0.2em] ${isActive ? 'text-cyan-400' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-900 bg-slate-900/20">
          <button onClick={mockLogout} className="group w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-all font-mono text-[10px] uppercase tracking-widest">
            <Icons.Logout />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative pt-16 md:pt-0 bg-[#020617]">
        {children}
      </main>

      {/* Mobile Bottom Nav - Neon Sci-Fi Glassmorphism */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl flex justify-around p-2 z-50 shadow-2xl safe-area-bottom overflow-hidden">
        {/* Subtle Background Glow for Nav */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none"></div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center w-16 h-14 transition-all duration-500 rounded-xl ${isActive ? 'text-cyan-400' : 'text-slate-600'
                }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute -top-1 w-8 h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-pulse-glow"></div>
              )}

              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon active={isActive} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0 text-cyan-400' : 'opacity-40 translate-y-1'}`}>
                {item.label}
              </span>

              {/* Internal Glow for Active Item */}
              {isActive && (
                <div className="absolute inset-0 bg-cyan-500/10 blur-xl -z-10 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;