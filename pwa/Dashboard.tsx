import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fetchRealTimeTrends, RealTrend, getCachedTrends } from '../services/trendService';
import { Topic, AnalysisType, UserProfile } from '../types';

interface DashboardProps {
  onSelectTrend: (trend: string) => void;
  user: User | null;
  profile: UserProfile | null;
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

const Dashboard: React.FC<DashboardProps> = ({ onSelectTrend, user, profile }) => {
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
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            PANEL DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-normal">CONTROL</span>
          </h2>
          <p className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.4em] font-mono mb-2">
            {profile?.displayName ? `BIENVENIDO, ${profile.displayName.toUpperCase()}` : (user?.email ? `OPERADOR: ${user.email.split('@')[0].toUpperCase()}` : 'INICIALIZANDO SISTEMA...')}
          </p>
        </div>
        <div className="text-left md:text-right">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">Monitor de Red</h2>
          <p className="text-blue-500/60 text-[10px] mt-1 font-mono uppercase tracking-[0.3em]">
            {lastUpdated
              ? `Última Sincronización: ${new Date(lastUpdated).toLocaleTimeString()}`
              : 'Escaneando señales en tiempo real...'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {/* Plan Status Card */}
        {/* Plan Status Card - Updated for visibility and style */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden group h-fit md:col-span-1 shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-blue-400/40 text-[9px] font-black uppercase tracking-widest mb-2 font-mono italic">Licencia de Operador</div>
          <div className="text-2xl font-black text-white uppercase italic tracking-tighter">
            {profile?.plan || 'STANDARD'} <span className="text-[10px] text-blue-500 font-normal">S+</span>
          </div>
          <div className="w-full bg-slate-950 border border-slate-800 h-2 rounded-full mt-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-full w-[85%] shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-1000"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-widest font-mono">Potencial de Sistema: 85%</p>
        </div>

        {/* Trends Main Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 md:p-6 rounded-2xl md:col-span-2 shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-black text-lg text-white uppercase tracking-wider italic">Señales Activas</h3>
              <button
                onClick={() => checkKeyAndLoad(true)}
                disabled={loading}
                className={`p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/20 ${loading ? 'animate-spin text-blue-400' : ''}`}
                title="Sincronizar"
              >
                <Icons.Refresh />
              </button>
            </div>
            <span className={`text-[9px] px-3 py-1 rounded-lg font-black tracking-widest uppercase flex items-center gap-2 border ${loading ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' : needsKey ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-blue-400 shadow-[0_0_5px_rgba(37,99,235,0.8)]' : 'bg-blue-400'}`}></span>
              {loading ? 'Escaneando' : 'Sincronizado'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
            <div className="flex-1">
              <label className="text-[9px] font-black text-blue-400/30 uppercase tracking-[0.2em] ml-1 mb-2 block font-mono">Geopolítica / Región</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-800 text-xs font-bold text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all uppercase tracking-widest focus:ring-1 focus:ring-blue-500/20"
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[9px] font-black text-blue-400/30 uppercase tracking-[0.2em] ml-1 mb-2 block font-mono">Canal / Temática</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-800 text-xs font-bold text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-all uppercase tracking-widest focus:ring-1 focus:ring-blue-500/20"
              >
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 border border-slate-800/50 rounded-2xl animate-pulse">
                  <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
                  <p className="text-[10px] font-black text-blue-500/80 uppercase tracking-[0.4em] font-mono animate-pulse">{loadingMessage}</p>
                </div>
                {[1, 2].map(i => <div key={i} className="h-20 bg-slate-900/30 rounded-xl animate-pulse border border-slate-800/30 opacity-40"></div>)}
              </div>
            ) : needsKey ? (
              <div className="p-10 bg-slate-900/80 border border-blue-500/20 rounded-[2rem] text-center flex flex-col items-center shadow-2xl">
                <div className="text-blue-500 mb-6 scale-125">
                  <Icons.Key />
                </div>
                <h4 className="text-white font-black text-lg uppercase tracking-wider mb-2 italic">Credenciales Requeridas</h4>
                <p className="text-slate-500 text-[10px] mb-8 max-w-xs leading-relaxed uppercase tracking-widest text-center">Protocolo de seguridad activo: Se requiere una API Key de AI Studio para procesar inteligencia en tiempo real.</p>
                <button
                  // @ts-ignore
                  onClick={() => window.aistudio?.openSelectKey().then(() => checkKeyAndLoad(true))}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-600/30 active:scale-95"
                >
                  Configurar Acceso
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
                      className="flex items-center justify-between p-5 bg-slate-950/40 border border-slate-800/60 rounded-2xl hover:border-blue-500/50 transition-all group cursor-pointer shadow-sm relative overflow-hidden active:scale-[0.98]"
                      onClick={() => onSelectTrend && onSelectTrend(item.title)}
                    >
                      <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex flex-col flex-1 relative z-10">
                        <span className="text-[8px] text-blue-500/60 font-black uppercase tracking-[0.3em] mb-1.5 font-mono italic">{item.category}</span>
                        <span className="text-slate-100 text-sm font-bold group-hover:text-blue-400 leading-tight transition-colors uppercase tracking-tight">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3 ml-4 relative z-10">
                        {specificSource && (
                          <a
                            href={specificSource.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-slate-900 hover:bg-blue-500/20 rounded-xl text-slate-500 hover:text-blue-400 transition-all border border-slate-800 hover:border-blue-500/40"
                            title="Fuente_Original"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Icons.ExternalLink />
                          </a>
                        )}
                        <span className={`text-[8px] font-black px-2.5 py-1.5 rounded-lg tracking-[0.2em] hidden sm:block border ${item.impact === 'Alto' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                          item.impact === 'Medio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(37,99,235,0.1)]' :
                            'bg-slate-800/30 text-slate-500 border-slate-700/50'
                          }`}>
                          {item.impact}
                        </span>
                        <div className="text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
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
                      <span className="text-[7px] font-black text-blue-500/30 uppercase tracking-[0.3em] font-mono mr-2 italic">Verificación:</span>
                      {sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[8px] font-black bg-slate-900/60 text-slate-500 hover:text-blue-400 px-2.5 py-1.5 rounded-lg border border-slate-800/50 hover:border-blue-500/30 transition-all hover:bg-blue-500/5"
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
      <div className="bg-slate-900/60 p-8 md:p-12 rounded-[3rem] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group text-center md:text-left backdrop-blur-2xl">
        <div className="absolute inset-0 bg-blue-500/[0.04] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase italic tracking-tighter">¿Nueva Perspectiva?</h3>
          <p className="text-slate-500 text-xs md:text-sm uppercase tracking-widest font-bold opacity-70 leading-relaxed max-w-md">Activa el motor de análisis estratégico de alto impacto para las tendencias actuales.</p>
        </div>
        <button
          onClick={() => onSelectTrend && onSelectTrend('Análisis de impacto socio-político en tiempo real')}
          className="whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-2xl shadow-blue-600/30 active:scale-95 relative z-10"
        >
          Iniciar Productor
        </button>
      </div>
    </div>
  );
};

export default Dashboard;