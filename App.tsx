import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './landing/LandingPage';
import Layout from './components/Layout';
import Dashboard from './pwa/Dashboard';
import Generator from './pwa/Generator';
import LoginPage from './auth/LoginPage';
import { isAuthenticated } from './services/supabaseClient';
import { getLibrary, deleteAnalysis } from './services/dbService';
import { AnalysisResult, Topic, AnalysisType } from './types';

type AppState = 'landing' | 'login' | 'app';

interface UserSettings {
  autoRefreshNews: boolean;
  defaultRegion: string;
  defaultTopic: string;
  teleprompterBaseSpeed: number;
}

const SETTINGS_KEY = 'analista_plus_user_settings';

const AnalysisViewer: React.FC<{ analysis: AnalysisResult; onClose: () => void }> = ({ analysis, onClose }) => {
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(5);
  const [scrollKey, setScrollKey] = useState(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setTeleprompterSpeed(parsed.teleprompterBaseSpeed || 5);
    }
  }, []);

  const restartTeleprompter = () => {
    setScrollKey(prev => prev + 1);
    setIsPaused(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!showTeleprompter) return;
    const delta = e.deltaY > 0 ? -1 : 1;
    setTeleprompterSpeed(prev => Math.max(1, Math.min(50, prev + delta)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;
    if (Math.abs(diff) > 10) {
      const delta = diff > 0 ? 1 : -1;
      setTeleprompterSpeed(prev => Math.max(1, Math.min(50, prev + delta)));
      touchStartY.current = currentY;
    }
  };

  const getTeleprompterDuration = () => {
    const baseDuration = analysis.content.length / 10; 
    return baseDuration / (teleprompterSpeed * 0.1); 
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-fade-in print:bg-white print:relative text-left">
      <div className="h-16 flex-shrink-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 print:hidden z-30">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onClose} className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors">
            ← <span className="hidden sm:inline">VOLVER</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest truncate max-w-[100px] sm:max-w-none">{analysis.topic}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTeleprompter(true)} 
            className="bg-cyan-600/10 border border-cyan-500/50 text-cyan-400 px-3 py-1.5 md:px-5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all shadow-lg shadow-cyan-500/10"
          >
            🎥 AIRE
          </button>
          <button 
            onClick={() => window.print()} 
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            🖨️
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-20 bg-[radial-gradient(circle_at_50%_0%,_rgba(34,211,238,0.05)_0%,_transparent_50%)] print:p-0 print:bg-white print:overflow-visible">
        <div className="max-w-3xl mx-auto print:max-w-none">
          <div className="hidden print:block border-b-2 border-black pb-4 mb-10">
            <div className="flex justify-between items-end">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Reporte Analista+</h1>
              <p className="text-sm font-bold uppercase text-black">{new Date(analysis.createdAt).toLocaleDateString()} • {analysis.topic}</p>
            </div>
          </div>

          <div className="prose prose-invert prose-cyan max-w-none print:text-black print:prose-neutral">
            <h1 className="text-2xl md:text-4xl font-black mb-8 border-b border-slate-800 pb-4 text-white print:text-black print:border-black leading-tight">{analysis.title}</h1>
            <div className="text-slate-300 print:text-black leading-relaxed text-sm md:text-lg font-light whitespace-pre-wrap">
              {analysis.content}
            </div>
          </div>
        </div>
      </div>

      {showTeleprompter && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 md:p-10 animate-fade-in select-none"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Teleprompter UI remains identical */}
          <div className="absolute md:top-10 top-4 md:left-10 left-3 md:right-10 right-3 flex flex-wrap justify-between items-center z-50 gap-1.5">
            <div className="flex gap-1.5">
               <button onClick={restartTeleprompter} className="bg-slate-800 text-white md:px-6 px-2.5 md:py-3 py-2 rounded-xl font-black md:text-xs text-[8px] uppercase tracking-widest transition-all">↺ INICIO</button>
               <button onClick={() => setIsPaused(!isPaused)} className={`${isPaused ? 'bg-green-600' : 'bg-amber-600'} text-white md:px-6 px-2.5 md:py-3 py-2 rounded-xl font-black md:text-xs text-[8px] uppercase tracking-widest`}>{isPaused ? '▶ PLAY' : '⏸ PAUSA'}</button>
            </div>
            <div className="flex gap-1.5 items-center">
              <input type="range" min="1" max="50" value={teleprompterSpeed} onChange={(e) => setTeleprompterSpeed(parseInt(e.target.value))} className="accent-cyan-500 w-16 md:w-48"/>
              <button onClick={() => setShowTeleprompter(false)} className="bg-red-600 text-white md:px-8 px-3 md:py-3 py-2 rounded-xl font-black md:text-[10px] text-[8px] uppercase tracking-widest">Cerrar</button>
            </div>
          </div>
          <div className="max-w-4xl w-full h-[75vh] overflow-hidden relative border-y border-white/5 cursor-pointer" onClick={() => setIsPaused(!isPaused)}>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-transparent to-black z-10"></div>
            <div key={scrollKey} className={`text-white text-3xl md:text-6xl font-bold leading-relaxed animate-scroll-up px-6 md:px-12 py-[40vh] text-center whitespace-pre-wrap ${isPaused ? 'pause-animation' : ''}`} style={{ animationDuration: `${getTeleprompterDuration()}s`, animationTimingFunction: 'linear', animationFillMode: 'forwards' }}>{analysis.content}</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scroll-up { from { transform: translateY(0); } to { transform: translateY(-100%); } }
        .animate-scroll-up { animation-name: scroll-up; }
        .pause-animation { animation-play-state: paused !important; }
      `}</style>
    </div>
  );
};

const LibraryView: React.FC = () => {
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [filteredItems, setFilteredItems] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingItem, setViewingItem] = useState<AnalysisResult | null>(null);

  // Estados de Filtros
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    const data = await getLibrary();
    setItems(data);
    setFilteredItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Efecto de filtrado
  useEffect(() => {
    let result = items;

    if (search) {
      result = result.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.content.toLowerCase().includes(search.toLowerCase()));
    }

    if (topicFilter !== 'ALL') {
      result = result.filter(i => i.topic === topicFilter);
    }

    if (yearFilter !== 'ALL') {
      result = result.filter(i => new Date(i.createdAt).getFullYear().toString() === yearFilter);
    }

    if (monthFilter !== 'ALL') {
      result = result.filter(i => (new Date(i.createdAt).getMonth() + 1).toString() === monthFilter);
    }

    setFilteredItems(result);
  }, [search, topicFilter, yearFilter, monthFilter, items]);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar este análisis definitivamente?")) {
      await deleteAnalysis(id);
      load();
    }
  };

  // Obtener años únicos para el filtro
  const availableYears = Array.from(new Set(items.map(i => new Date(i.createdAt).getFullYear().toString()))).sort((a,b) => b.localeCompare(a));
  const months = [
    {v: '1', l: 'Enero'}, {v: '2', l: 'Febrero'}, {v: '3', l: 'Marzo'}, {v: '4', l: 'Abril'},
    {v: '5', l: 'Mayo'}, {v: '6', l: 'Junio'}, {v: '7', l: 'Julio'}, {v: '8', l: 'Agosto'},
    {v: '9', l: 'Septiembre'}, {v: '10', l: 'Octubre'}, {v: '11', l: 'Noviembre'}, {v: '12', l: 'Diciembre'}
  ];

  const getTypeInfo = (type: AnalysisType) => {
    switch (type) {
      case AnalysisType.DEEP: return { label: 'Estratégico', icon: '🧠', color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case AnalysisType.SCRIPT: return { label: 'Guion Aire', icon: '🎙️', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
      case AnalysisType.BRIEF: return { label: 'Ejecutivo', icon: '📄', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      default: return { label: 'General', icon: '📝', color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto h-full text-left pb-40">
      {viewingItem && <AnalysisViewer analysis={viewingItem} onClose={() => setViewingItem(null)} />}
      
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight uppercase italic">Archivo Digital</h2>
          <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-widest opacity-60">System Library / Storage v2.4</p>
        </div>
        
        {/* MODULO DE BUSQUEDA SCI-FI */}
        <div className="w-full md:w-auto flex flex-col gap-3">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="CIFRADO POR PALABRA CLAVE..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 bg-slate-900/50 border border-slate-800 rounded-xl px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all placeholder:text-slate-700"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={topicFilter} 
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-2 rounded-lg outline-none focus:border-cyan-500 transition-all"
            >
              <option value="ALL">TODOS LOS TEMAS</option>
              {Object.values(Topic).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select 
              value={yearFilter} 
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-2 rounded-lg outline-none focus:border-cyan-500 transition-all"
            >
              <option value="ALL">AÑO: TODOS</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select 
              value={monthFilter} 
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-2 rounded-lg outline-none focus:border-cyan-500 transition-all"
            >
              <option value="ALL">MES: TODOS</option>
              {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            {(search || topicFilter !== 'ALL' || yearFilter !== 'ALL' || monthFilter !== 'ALL') && (
              <button onClick={() => { setSearch(''); setTopicFilter('ALL'); setYearFilter('ALL'); setMonthFilter('ALL'); }} className="text-[9px] font-black text-cyan-500 uppercase hover:text-white transition-colors ml-2">Limpiar ×</button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800/50"></div>)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-700 border border-slate-800 border-dashed rounded-3xl">
           <div className="text-5xl mb-6 opacity-20">📂</div>
           <p className="text-sm font-black uppercase tracking-[0.4em]">Sin coincidencias en el archivo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const typeInfo = getTypeInfo(item.type);
            return (
              <div key={item.id} className="group bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col hover:border-cyan-500/50 transition-all relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${typeInfo.bg}`}>
                    <span className="text-xs">{typeInfo.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${typeInfo.color}`}>{typeInfo.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-8 italic opacity-60">
                  "{item.content.substring(0, 150)}..."
                </p>
                <div className="mt-auto flex justify-between items-center relative z-10">
                   <span className="text-[9px] font-black text-cyan-500/40 uppercase tracking-[0.2em] font-mono">{item.topic}</span>
                   <div className="flex gap-2">
                     <button onClick={() => setViewingItem(item)} className="p-2.5 bg-slate-800 hover:bg-cyan-600/20 rounded-xl text-slate-400 hover:text-cyan-400 transition-all border border-slate-700">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                     </button>
                     <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-slate-800 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-all border border-slate-700">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProfileView: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    autoRefreshNews: false,
    defaultRegion: 'República Dominicana',
    defaultTopic: 'Política',
    teleprompterBaseSpeed: 5
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-left pb-40 md:pb-16 flex flex-col min-h-screen">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight uppercase italic">Configuración</h2>
        <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-widest opacity-60">Identity Core / Preferences</p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
           <h3 className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.3em] mb-8">🛰️ Inteligencia y Red</h3>
           
           <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider">Actualización Automática</h4>
                  <p className="text-slate-500 text-[10px] mt-1 uppercase">Sincronización de tendencias al inicio de sesión.</p>
                </div>
                <button 
                  onClick={() => setSettings({...settings, autoRefreshNews: !settings.autoRefreshNews})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.autoRefreshNews ? 'bg-cyan-600 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-slate-800 border border-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoRefreshNews ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Región de rastreo</label>
                   <select 
                     value={settings.defaultRegion}
                     onChange={(e) => setSettings({...settings, defaultRegion: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs font-bold focus:border-cyan-500 outline-none transition-all uppercase tracking-widest"
                   >
                     {['Global', 'República Dominicana', 'España', 'México', 'Colombia', 'Argentina', 'EE.UU.', 'Chile'].map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Canal por defecto</label>
                   <select 
                     value={settings.defaultTopic}
                     onChange={(e) => setSettings({...settings, defaultTopic: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs font-bold focus:border-cyan-500 outline-none transition-all uppercase tracking-widest"
                   >
                     {['Todos', 'Política', 'Economía', 'Geopolítica', 'Tecnología', 'Deportes'].map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
             </div>
           </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
           <h3 className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.3em] mb-8">🎙️ Parámetros de Teleprompter</h3>
           <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-white font-bold text-xs uppercase tracking-wider">Velocidad Nominal</label>
                <span className="text-cyan-400 font-black font-mono shadow-[0_0_10px_rgba(34,211,238,0.3)]">{settings.teleprompterBaseSpeed} GHz</span>
              </div>
              <input 
                type="range" min="1" max="50"
                value={settings.teleprompterBaseSpeed}
                onChange={(e) => setSettings({...settings, teleprompterBaseSpeed: parseInt(e.target.value)})}
                className="w-full accent-cyan-600 h-1 bg-slate-800 rounded-full"
              />
              <p className="text-slate-500 text-[9px] mt-4 uppercase italic font-mono">Sync: Esta velocidad se aplicará automáticamente a todas las sesiones de Aire.</p>
           </div>
        </div>

        <div className="flex justify-center md:justify-end gap-4 pt-8 pb-20 md:pb-12">
           <button 
             onClick={handleSave}
             disabled={saveStatus !== 'idle'}
             className={`w-full md:w-auto px-12 py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 ${
               saveStatus === 'saved' ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-500/20'
             }`}
           >
             {saveStatus === 'idle' ? 'Guardar Cambios' : saveStatus === 'saving' ? 'Sincronizando...' : '✓ Sincronizado'}
           </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [genPrompt, setGenPrompt] = useState('');
  const [genTopic, setGenTopic] = useState<Topic>(Topic.POLITICS);
  const [genType, setGenType] = useState<AnalysisType>(AnalysisType.DEEP);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      setAppState('app');
    }
  }, []);

  const handleSelectTrend = (trendTitle: string) => {
    setGenPrompt(trendTitle);
    setActiveTab('generator');
  };

  const renderPwaContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onSelectTrend={handleSelectTrend} />;
      case 'generator': return <Generator prompt={genPrompt} setPrompt={setGenPrompt} topic={genTopic} setTopic={setGenTopic} type={genType} setType={setGenType} currentResult={currentAnalysis} setCurrentResult={setCurrentAnalysis} />;
      case 'library': return <LibraryView />;
      case 'profile': return <ProfileView />;
      default: return <Dashboard onSelectTrend={handleSelectTrend} />;
    }
  };

  if (appState === 'landing') return <LandingPage onGoToLogin={() => setAppState('login')} />;
  if (appState === 'login') return <LoginPage onBack={() => setAppState('landing')} />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div key={activeTab} className="h-full animate-fade-in">
        {renderPwaContent()}
      </div>
    </Layout>
  );
};

export default App;