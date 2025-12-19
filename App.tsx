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

  if (showTeleprompter) {
    return (
      <div 
        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-10 animate-fade-in select-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="absolute top-10 left-10 right-10 flex flex-wrap justify-between items-center z-50">
          <div className="flex gap-4">
             <button 
                onClick={restartTeleprompter}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-2"
              >
                <span>↺</span> Inicio
              </button>
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`${isPaused ? 'bg-green-600' : 'bg-amber-600'} text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-2`}
              >
                <span>{isPaused ? '▶ RESUMIR' : '⏸ PAUSAR'}</span>
              </button>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Velocidad</span>
              <input 
                type="range" min="1" max="50" 
                value={teleprompterSpeed} 
                onChange={(e) => setTeleprompterSpeed(parseInt(e.target.value))}
                className="accent-blue-500 w-32 md:w-48 cursor-pointer"
              />
              <span className="text-blue-400 font-black text-xs w-6 text-center">{teleprompterSpeed}</span>
            </div>
            <button 
              onClick={() => setShowTeleprompter(false)}
              className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
        
        <div 
          className="max-w-4xl w-full h-[75vh] overflow-hidden relative border-y border-white/5 cursor-pointer"
          onClick={() => setIsPaused(!isPaused)}
        >
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-transparent to-black z-10"></div>
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-500/10 z-0"></div>
          
          <div 
            key={scrollKey}
            className={`text-white text-4xl md:text-6xl font-bold leading-relaxed animate-scroll-up px-12 py-[40vh] text-center whitespace-pre-wrap ${isPaused ? 'pause-animation' : ''}`}
            style={{ 
              animationDuration: `${getTeleprompterDuration()}s`,
              animationTimingFunction: 'linear',
              animationFillMode: 'forwards',
            }}
          >
            {analysis.content}
          </div>
        </div>

        <div className="mt-8 text-slate-700 font-black text-[10px] uppercase tracking-[0.4em] flex flex-col items-center gap-2">
          <span>MODO AIRE ACTIVO • {isPaused ? 'EN PAUSA' : 'SCROLL ACTIVO'}</span>
          <span className="opacity-40 uppercase">Click para pausar • Scroll o Drag para velocidad</span>
        </div>

        <style>{`
          @keyframes scroll-up {
            from { transform: translateY(0); }
            to { transform: translateY(-100%); }
          }
          .animate-scroll-up {
            animation-name: scroll-up;
          }
          .pause-animation {
            animation-play-state: paused !important;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-fade-in print:bg-white print:relative text-left">
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors">
            ← VOLVER
          </button>
          <div className="h-4 w-px bg-slate-800"></div>
          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{analysis.topic}</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTeleprompter(true)} 
            className="bg-blue-600/10 border border-blue-500/50 text-blue-400 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg"
          >
            🎥 AIRE
          </button>
          <button 
            onClick={() => window.print()} 
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg"
          >
            🖨️ PDF / IMPRIMIR
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 md:p-20 bg-[radial-gradient(circle_at_50%_0%,_rgba(30,41,59,0.3)_0%,_transparent_50%)] print:p-0 print:bg-white print:overflow-visible">
        <div className="max-w-3xl mx-auto print:max-w-none">
          <div className="hidden print:block border-b-2 border-black pb-4 mb-10">
            <div className="flex justify-between items-end">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Reporte Analista+</h1>
              <p className="text-sm font-bold uppercase text-black">{new Date(analysis.createdAt).toLocaleDateString()} • {analysis.topic}</p>
            </div>
          </div>

          <div className="prose prose-invert prose-blue max-w-none print:text-black print:prose-neutral">
            <h1 className="text-4xl font-black mb-8 border-b border-slate-800 pb-4 text-white print:text-black print:border-black leading-tight">{analysis.title}</h1>
            <div className="text-slate-300 print:text-black leading-relaxed text-lg font-light whitespace-pre-wrap">
              {analysis.content}
            </div>
          </div>

          <div className="hidden print:block mt-20 pt-10 border-t border-slate-200 text-[10px] text-slate-400 text-center italic">
            Documento generado por Analista+ IA Engine. Verifique datos sensibles.
          </div>
        </div>
      </div>
    </div>
  );
};

const LibraryView: React.FC = () => {
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingItem, setViewingItem] = useState<AnalysisResult | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getLibrary();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar este análisis definitivamente?")) {
      await deleteAnalysis(id);
      load();
    }
  };

  const getTypeInfo = (type: AnalysisType) => {
    switch (type) {
      case AnalysisType.DEEP:
        return { label: 'Estratégico', icon: '🧠', color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case AnalysisType.SCRIPT:
        return { label: 'Guion Aire', icon: '🎙️', color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case AnalysisType.BRIEF:
        return { label: 'Ejecutivo', icon: '📄', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      default:
        return { label: 'General', icon: '📝', color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto h-full text-left">
      {viewingItem && <AnalysisViewer analysis={viewingItem} onClose={() => setViewingItem(null)} />}
      
      <div className="flex justify-between items-end mb-10 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Tu Biblioteca</h2>
          <p className="text-slate-500 text-sm mt-1">Historial de producciones guardadas.</p>
        </div>
        <button onClick={load} className="p-2 text-slate-400 hover:text-white transition-colors">
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800/50"></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-600">
           <div className="text-6xl mb-6 opacity-20">📚</div>
           <p className="text-lg font-bold">Biblioteca vacía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 print:hidden">
          {items.map((item) => {
            const typeInfo = getTypeInfo(item.type);
            return (
              <div key={item.id} className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-blue-500/50 transition-all relative shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${typeInfo.bg}`}>
                    <span className="text-xs">{typeInfo.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${typeInfo.color}`}>{typeInfo.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-6 italic">
                  "{item.content.substring(0, 150)}..."
                </p>
                <div className="mt-auto flex justify-between items-center">
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{item.topic}</span>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => setViewingItem(item)}
                       className="p-2 bg-slate-800 hover:bg-blue-600/20 rounded-lg text-slate-400 hover:text-blue-400 transition-all shadow-sm" 
                       title="Ver completo e Imprimir"
                     >
                      👁️
                     </button>
                     <button 
                       onClick={() => handleDelete(item.id)} 
                       className="p-2 bg-slate-800 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all shadow-sm" 
                       title="Eliminar"
                     >
                      🗑️
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
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full text-left">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">Configuración del Analista</h2>
        <p className="text-slate-500 text-sm mt-1">Personaliza tu entorno de producción inteligente.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">🛰️ Preferencias de Inteligencia</h3>
           
           <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm">Actualización Automática</h4>
                  <p className="text-slate-500 text-xs mt-1">Buscar nuevas tendencias cada vez que entras a la app.</p>
                </div>
                <button 
                  onClick={() => setSettings({...settings, autoRefreshNews: !settings.autoRefreshNews})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.autoRefreshNews ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoRefreshNews ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Región por Defecto</label>
                   <select 
                     value={settings.defaultRegion}
                     onChange={(e) => setSettings({...settings, defaultRegion: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                   >
                     {['Global', 'República Dominicana', 'España', 'México', 'Colombia', 'Argentina', 'EE.UU.', 'Chile'].map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tópico Favorito</label>
                   <select 
                     value={settings.defaultTopic}
                     onChange={(e) => setSettings({...settings, defaultTopic: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                   >
                     {['Todos', 'Política', 'Economía', 'Geopolítica', 'Tecnología', 'Deportes'].map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
             </div>
           </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">🎙️ Ajustes de Teleprompter (Aire)</h3>
           <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-white font-bold text-sm">Velocidad Base</label>
                <span className="text-blue-400 font-black font-mono">{settings.teleprompterBaseSpeed}</span>
              </div>
              <input 
                type="range" min="1" max="50"
                value={settings.teleprompterBaseSpeed}
                onChange={(e) => setSettings({...settings, teleprompterBaseSpeed: parseInt(e.target.value)})}
                className="w-full accent-blue-600 h-1.5 bg-slate-800 rounded-full"
              />
              <p className="text-slate-500 text-[10px] mt-4 uppercase italic">Esta velocidad se aplicará automáticamente al iniciar cualquier sesión de Aire.</p>
           </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
           <button 
             onClick={handleSave}
             disabled={saveStatus !== 'idle'}
             className={`px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
               saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
             }`}
           >
             {saveStatus === 'idle' ? 'Guardar Cambios' : saveStatus === 'saving' ? 'Guardando...' : '¡Ajustes Guardados!'}
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
      case 'dashboard':
        return <Dashboard onSelectTrend={handleSelectTrend} />;
      case 'generator':
        return (
          <Generator 
            prompt={genPrompt}
            setPrompt={setGenPrompt}
            topic={genTopic}
            setTopic={setGenTopic}
            type={genType}
            setType={setGenType}
            currentResult={currentAnalysis}
            setCurrentResult={setCurrentAnalysis}
          />
        );
      case 'library':
        return <LibraryView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <Dashboard onSelectTrend={handleSelectTrend} />;
    }
  };

  if (appState === 'landing') {
    return <LandingPage onGoToLogin={() => setAppState('login')} />;
  }

  if (appState === 'login') {
    return <LoginPage onBack={() => setAppState('landing')} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div key={activeTab} className="h-full animate-fade-in">
        {renderPwaContent()}
      </div>
    </Layout>
  );
};

export default App;