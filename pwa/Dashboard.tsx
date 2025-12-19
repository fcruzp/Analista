import React, { useState, useEffect } from 'react';
import { fetchRealTimeTrends, RealTrend, getCachedTrends } from '../services/trendService';

interface DashboardProps {
  onSelectTrend?: (title: string) => void;
}

const SETTINGS_KEY = 'analista_plus_user_settings';

const Dashboard: React.FC<DashboardProps> = ({ onSelectTrend }) => {
  const [trends, setTrends] = useState<RealTrend[]>([]);
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [country, setCountry] = useState('República Dominicana');
  const [topic, setTopic] = useState('Política');

  const countries = ['Global', 'República Dominicana', 'España', 'México', 'Colombia', 'Argentina', 'EE.UU.', 'Chile'];
  const topics = ['Todos', 'Política', 'Economía', 'Geopolítica', 'Tecnología', 'Deportes'];

  // Cargar preferencias iniciales
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCountry(parsed.defaultRegion || 'República Dominicana');
      setTopic(parsed.defaultTopic || 'Política');
    }
  }, []);

  const checkKeyAndLoad = async (force: boolean = false) => {
    setLoading(true);
    setErrorMsg(null);
    setNeedsKey(false);

    // @ts-ignore
    const hasKey = await window.aistudio?.hasSelectedApiKey();
    if (!hasKey && !process.env.API_KEY) {
      setNeedsKey(true);
      setLoading(false);
      return;
    }

    // Leer settings para ver si quiere auto-refresco
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    const autoRefresh = savedSettings ? JSON.parse(savedSettings).autoRefreshNews : false;
    
    // Si no es forzado y el auto-refresco está OFF, intentamos cargar cache primero
    const data = await fetchRealTimeTrends(country, topic, force || autoRefresh);
    
    if (data.error) {
      setErrorMsg(data.error);
      if (data.needsKeySelection) setNeedsKey(true);
      setTrends([]);
    } else {
      setTrends(data.trends);
      setSources(data.sources);
      setLastUpdated(data.lastUpdated || null);
    }
    setLoading(false);
  };

  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio?.openSelectKey();
    checkKeyAndLoad(true);
  };

  useEffect(() => {
    checkKeyAndLoad(false);
  }, [country, topic]);

  const getSourceForTrend = (trendTitle: string) => {
    return sources.find(s => 
      s.title.toLowerCase().includes(trendTitle.toLowerCase().split(' ')[0]) ||
      trendTitle.toLowerCase().includes(s.title.toLowerCase().split(' ')[0])
    );
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-6 md:space-y-8 pb-24 text-left">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Buenos días, Analista.</h2>
          <p className="text-slate-400 text-sm mt-1">
            {lastUpdated 
              ? `Briefing guardado: ${new Date(lastUpdated).toLocaleTimeString()}`
              : 'Tu briefing de IA en tiempo real.'
            }
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl hidden md:block">
          <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">Estado del Plan</div>
          <div className="text-2xl font-bold text-white">Profesional</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-500 h-full w-[45%]"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-medium uppercase tracking-tighter">Uso de tokens: 45%</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-4 md:p-6 rounded-2xl md:col-span-2 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-white">Tendencias Hoy</h3>
              <button 
                onClick={() => checkKeyAndLoad(true)} 
                disabled={loading}
                className="p-1.5 rounded-full text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-30"
                title="Actualizar ahora"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${loading ? 'bg-blue-500/10 text-blue-400' : needsKey ? 'bg-amber-500/10 text-amber-400' : errorMsg ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-blue-400 animate-pulse' : needsKey ? 'bg-amber-400' : errorMsg ? 'bg-red-400' : 'bg-green-400'}`}></span>
              {loading ? 'IA BUSCANDO' : needsKey ? 'KEY REQUERIDA' : 'ACTIVO'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
            <div className="flex-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Región</label>
              <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all disabled:opacity-50"
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Tópico</label>
              <select 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all disabled:opacity-50"
              >
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-900/50 rounded-xl animate-pulse border border-slate-800/50"></div>)
            ) : needsKey ? (
              <div className="p-8 bg-slate-900/80 border border-slate-700 rounded-2xl text-center flex flex-col items-center">
                <div className="text-3xl mb-4">🔑</div>
                <h4 className="text-white font-bold mb-2">Vincular API Key</h4>
                <p className="text-slate-400 text-xs mb-6 max-w-xs leading-relaxed">Para buscar noticias en tiempo real necesitas una llave válida con facturación de AI Studio.</p>
                <button onClick={handleSelectKey} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20">Configurar Llave</button>
              </div>
            ) : errorMsg ? (
              <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
                <p className="text-red-300 text-xs mb-4 leading-relaxed">{errorMsg}</p>
                <button onClick={() => checkKeyAndLoad(true)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Reintentar</button>
              </div>
            ) : (
              trends.map((item, idx) => {
                const specificSource = getSourceForTrend(item.title);
                return (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:border-blue-500/50 transition-all group cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex flex-col flex-1" onClick={() => onSelectTrend && onSelectTrend(item.title)}>
                      <span className="text-[9px] text-purple-400 font-black uppercase tracking-[0.2em] mb-1">{item.category}</span>
                      <span className="text-slate-200 text-sm font-semibold group-hover:text-white leading-tight">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {specificSource && (
                        <a 
                          href={specificSource.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-800 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-all border border-slate-700"
                          title="Ver Fuente Original"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔗
                        </a>
                      )}
                      <span className={`text-[9px] font-black px-2 py-1 rounded-md tracking-tighter hidden sm:block ${
                        item.impact === 'Alto' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                        item.impact === 'Medio' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        'bg-slate-700/30 text-slate-500 border border-slate-700/50'
                      }`}>
                        {item.impact}
                      </span>
                      <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs" onClick={() => onSelectTrend && onSelectTrend(item.title)}>⚡</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!loading && !needsKey && !errorMsg && sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-700/40">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Fuentes Verificadas por IA</p>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, i) => (
                  <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold bg-slate-950 text-slate-400 hover:text-blue-400 hover:bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 transition-all truncate max-w-[180px]">🔗 {source.title}</a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-indigo-600/20 via-slate-900/50 to-purple-600/10 p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group text-center md:text-left">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <h3 className="text-lg md:text-xl font-bold text-white mb-1">¿Tienes un ángulo diferente?</h3>
          <p className="text-slate-400 text-xs md:text-sm">Genera un análisis histórico profundo basado en estas tendencias.</p>
        </div>
        <button 
          onClick={() => onSelectTrend && onSelectTrend('Nuevas tendencias globales y su impacto sociocultural')}
          className="whitespace-nowrap bg-white text-slate-950 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95 relative z-10"
        >
          Ir al Productor
        </button>
      </div>
    </div>
  );
};

export default Dashboard;