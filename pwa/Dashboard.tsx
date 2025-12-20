import React, { useState, useEffect } from 'react';
import { fetchRealTimeTrends, RealTrend, getCachedTrends } from '../services/trendService';

interface DashboardProps {
  onSelectTrend?: (title: string) => void;
}

const SETTINGS_KEY = 'analista_plus_user_settings';

const Icons = {
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  ExternalLink: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  TrendUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307L21.75 4.5M21.75 4.5H16.5m5.25 0v5.25" />
    </svg>
  ),
  Key: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  )
};

const Dashboard: React.FC<DashboardProps> = ({ onSelectTrend }) => {
  const [trends, setTrends] = useState<RealTrend[]>([]);
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Iniciando escaneo...');

  const loadingSteps = [
    'Sincronizando con satélites...',
    'Escaneando señales en tiempo real...',
    'Analizando tendencias globales...',
    'Filtrando ruidos de red...',
    'Validando fuentes de información...',
    'Decodificando flujos de datos...',
    'Compilando reporte de impacto...'
  ];

  const [country, setCountry] = useState('República Dominicana');
  const [topic, setTopic] = useState('Política');

  const countries = ['Global', 'República Dominicana', 'España', 'México', 'Colombia', 'Argentina', 'EE.UU.', 'Chile'];
  const topics = ['Todos', 'Política', 'Economía', 'Geopolítica', 'Tecnología', 'Deportes'];

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

    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingSteps.length;
      setLoadingMessage(loadingSteps[messageIndex]);
    }, 2500);

    const data = await fetchRealTimeTrends(country, topic, force);

    clearInterval(interval);

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
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-6 md:space-y-8 pb-32 text-left animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">Monitor de Red</h2>
          <p className="text-cyan-500/60 text-[10px] mt-1 font-mono uppercase tracking-[0.3em]">
            {lastUpdated
              ? `Última Sincronización: ${new Date(lastUpdated).toLocaleTimeString()}`
              : 'Escaneando señales en tiempo real...'
            }
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {/* Plan Status Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hidden md:block backdrop-blur-md relative overflow-hidden group h-fit">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-cyan-500/40 text-[9px] font-black uppercase tracking-widest mb-2 font-mono">Credenciales de Acceso</div>
          <div className="text-2xl font-black text-white uppercase italic">Nivel Pro</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden border border-white/5">
            <div className="bg-cyan-500 h-full w-[45%] shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-widest font-mono">Sincronización: 45%</p>
        </div>

        {/* Trends Main Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 md:p-6 rounded-2xl md:col-span-2 shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-black text-lg text-white uppercase tracking-wider italic">Señales Activas</h3>
              <button
                onClick={() => checkKeyAndLoad(true)}
                disabled={loading}
                className={`p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20 ${loading ? 'animate-spin text-cyan-400' : ''}`}
                title="Sincronizar"
              >
                <Icons.Refresh />
              </button>
            </div>
            <span className={`text-[9px] px-3 py-1 rounded-lg font-black tracking-widest uppercase flex items-center gap-2 border ${loading ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse' : needsKey ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'bg-cyan-400'}`}></span>
              {loading ? 'Escaneando' : 'Online'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
            <div className="flex-1">
              <label className="text-[9px] font-black text-cyan-500/30 uppercase tracking-[0.2em] ml-1 mb-1 block font-mono">Geo_Loc</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-white rounded-lg p-2.5 outline-none focus:border-cyan-500 transition-all uppercase tracking-widest"
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[9px] font-black text-cyan-500/30 uppercase tracking-[0.2em] ml-1 mb-1 block font-mono">Stream_Channel</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-white rounded-lg p-2.5 outline-none focus:border-cyan-500 transition-all uppercase tracking-widest"
              >
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 border border-slate-800/50 rounded-2xl animate-pulse">
                  <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
                  <p className="text-[10px] font-black text-cyan-500/80 uppercase tracking-[0.4em] font-mono animate-pulse">{loadingMessage}</p>
                </div>
                {[1, 2].map(i => <div key={i} className="h-20 bg-slate-900/30 rounded-xl animate-pulse border border-slate-800/30 opacity-40"></div>)}
              </div>
            ) : needsKey ? (
              <div className="p-10 bg-slate-900/80 border border-cyan-500/20 rounded-2xl text-center flex flex-col items-center">
                <div className="text-cyan-400 mb-4">
                  <Icons.Key />
                </div>
                <h4 className="text-white font-black text-lg uppercase tracking-wider mb-2">Acceso Denegado</h4>
                <p className="text-slate-500 text-[10px] mb-8 max-w-xs leading-relaxed uppercase tracking-widest text-center">Se requiere una API Key válida para procesar la red de noticias global.</p>
                <button
                  onClick={() => window.aistudio?.openSelectKey().then(() => checkKeyAndLoad(true))}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-cyan-600/20 active:scale-95"
                >
                  Configurar Credencial
                </button>
              </div>
            ) : errorMsg ? (
              <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                <p className="text-red-400 text-[10px] font-bold mb-4 leading-relaxed uppercase tracking-widest">{errorMsg}</p>
                <button onClick={() => checkKeyAndLoad(true)} className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-500/30">Reintentar Conexión</button>
              </div>
            ) : (
              <>
                {trends.map((item, idx) => {
                  const specificSource = getSourceForTrend(item.title);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-5 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:border-cyan-500/50 transition-all group cursor-pointer shadow-sm relative overflow-hidden"
                      onClick={() => onSelectTrend && onSelectTrend(item.title)}
                    >
                      <div className="absolute inset-0 bg-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex flex-col flex-1 relative z-10">
                        <span className="text-[8px] text-cyan-500/60 font-black uppercase tracking-[0.3em] mb-1.5 font-mono">{item.category}</span>
                        <span className="text-slate-100 text-sm font-bold group-hover:text-cyan-400 leading-tight transition-colors uppercase tracking-tight">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3 ml-4 relative z-10">
                        {specificSource && (
                          <a
                            href={specificSource.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-slate-900 hover:bg-cyan-500/20 rounded-xl text-slate-500 hover:text-cyan-400 transition-all border border-slate-800 hover:border-cyan-500/40"
                            title="Fuente_Original"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Icons.ExternalLink />
                          </a>
                        )}
                        <span className={`text-[8px] font-black px-2.5 py-1.5 rounded-lg tracking-[0.2em] hidden sm:block border ${item.impact === 'Alto' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                          item.impact === 'Medio' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]' :
                            'bg-slate-800/30 text-slate-500 border-slate-700/50'
                          }`}>
                          {item.impact}
                        </span>
                        <div className="text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                          <Icons.TrendUp />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* FUENTES DE VERIFICACIÓN - Tags pequeños al final de la lista */}
                {sources.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-800/20 animate-fade-in-up">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[7px] font-black text-cyan-500/30 uppercase tracking-[0.3em] font-mono mr-2">Fuentes:</span>
                      {sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[8px] font-black bg-slate-900/60 text-slate-500 hover:text-cyan-400 px-2.5 py-1.5 rounded-md border border-slate-800/50 hover:border-cyan-500/30 transition-all hover:bg-cyan-500/5"
                          title={source.title}
                        >
                          <Icons.ExternalLink />
                          <span className="truncate uppercase tracking-[0.1em] max-w-[80px]">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="bg-slate-900/40 p-6 md:p-10 rounded-[2.5rem] border border-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group text-center md:text-left backdrop-blur-xl">
        <div className="absolute inset-0 bg-cyan-500/[0.03] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <h3 className="text-xl md:text-2xl font-black text-white mb-2 uppercase italic tracking-tight">¿Nueva Perspectiva?</h3>
          <p className="text-slate-500 text-xs md:text-sm uppercase tracking-widest font-medium opacity-80">Activa el motor de análisis histórico para estas tendencias.</p>
        </div>
        <button
          onClick={() => onSelectTrend && onSelectTrend('Análisis de impacto socio-político en tiempo real')}
          className="whitespace-nowrap bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-cyan-600/20 active:scale-95 relative z-10"
        >
          Iniciar Productor
        </button>
      </div>
    </div>
  );
};

export default Dashboard;