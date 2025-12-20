import React, { useState, useRef, useEffect } from 'react';
import { generateAIAnalysisStream } from '../services/aiService';
import { saveAnalysis } from '../services/dbService';
import { AnalysisType, Topic, UserPlan } from '../types';

interface GeneratorProps {
  prompt: string;
  setPrompt: (v: string) => void;
  topic: Topic;
  setTopic: (v: Topic) => void;
  type: AnalysisType;
  setType: (v: AnalysisType) => void;
  currentResult: string | null;
  setCurrentResult: (res: string | null) => void;
}

const Generator: React.FC<GeneratorProps> = ({ 
  prompt, setPrompt, topic, setTopic, type, setType, currentResult, setCurrentResult 
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(5);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [scrollKey, setScrollKey] = useState(0); 
  const [mobileTab, setMobileTab] = useState<'config' | 'result'>('config');
  
  const outputRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setCurrentResult("");
    setSaveSuccess(false);
    setMobileTab('result');
    
    try {
      await generateAIAnalysisStream({
        userId: 'current-user',
        plan: UserPlan.PROFESSIONAL,
        topic,
        type,
        prompt
      }, (chunk) => {
        setCurrentResult(chunk);
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      });
    } catch (e: any) {
      setCurrentResult(`**Error de Producción:** ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentResult || saving) return;
    setSaving(true);
    try {
      await saveAnalysis({
        title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
        content: currentResult,
        type,
        topic,
        tags: [topic.toLowerCase(), 'ia-generated']
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Error saving:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("¿Limpiar todo el espacio de trabajo?")) {
      setCurrentResult(null);
      setPrompt('');
      setMobileTab('config');
    }
  };

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
    if (!currentResult) return 0;
    const baseDuration = currentResult.length / 10; 
    return baseDuration / (teleprompterSpeed * 0.1); 
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden relative font-sans">
      {/* Selector de Pestañas para Móvil */}
      <div className="md:hidden flex flex-shrink-0 border-b border-cyan-500/10 bg-slate-900/40 sticky top-0 z-30 backdrop-blur-md">
        <button 
          onClick={() => setMobileTab('config')}
          className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${mobileTab === 'config' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/5' : 'text-slate-500'}`}
        >
          Parámetros
        </button>
        <button 
          onClick={() => setMobileTab('result')}
          className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${mobileTab === 'result' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/5' : 'text-slate-500'}`}
        >
          Resultado_IA
          {currentResult && mobileTab !== 'result' && (
            <span className="absolute top-3 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden h-full">
        {/* Sidebar / Config Panel - REFORZADO padding bottom para mobile */}
        <div className={`${mobileTab === 'config' ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/20 p-6 overflow-y-auto print:hidden flex-col h-full relative z-10 pb-40 md:pb-12`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center font-bold text-cyan-400 text-[10px] shadow-[0_0_15px_rgba(34,211,238,0.1)]">MOD</div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Estudio</h2>
            </div>
            {currentResult && (
              <button onClick={handleClear} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              </button>
            )}
          </div>
          
          <div className="space-y-10">
            <section>
              <label className="text-[9px] font-black text-cyan-500/50 uppercase tracking-[0.3em] mb-4 block font-mono">Input_Topic</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(Topic).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={`text-[8px] py-3.5 rounded-xl border font-black uppercase tracking-widest transition-all ${
                      topic === t ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-slate-800 bg-slate-800/20 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <label className="text-[9px] font-black text-cyan-500/50 uppercase tracking-[0.3em] mb-4 block font-mono">Format_Profile</label>
              <div className="space-y-2">
                {[
                  { id: AnalysisType.DEEP, label: 'Estratégico', icon: '🧠' },
                  { id: AnalysisType.SCRIPT, label: 'Guion Aire', icon: '🎙️' },
                  { id: AnalysisType.BRIEF, label: 'Ejecutivo', icon: '📄' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setType(opt.id as any)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${
                      type === opt.id ? 'bg-slate-900 border-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-slate-900/30 border-slate-800 text-slate-500 hover:bg-slate-800/30'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                    <span className="opacity-40">{opt.icon}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <label className="text-[9px] font-black text-cyan-500/50 uppercase tracking-[0.3em] mb-4 block font-mono">Base_Context</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="PROMPT DE PRODUCCIÓN..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl p-5 h-40 text-xs font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none resize-none transition-all placeholder:text-slate-800 tracking-wide"
              ></textarea>
            </section>

            {/* BOTÓN REFORZADO - Siempre visible en el scroll con margen extra */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] text-white shadow-2xl transition-all relative overflow-hidden group ${
                  loading || !prompt ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-cyan-600 hover:bg-cyan-500 active:scale-95 shadow-cyan-500/20'
                }`}
              >
                <span className="relative z-10">{loading ? "Generando..." : "Ejecutar Análisis"}</span>
                {!loading && prompt && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel / Result Viewer */}
        <div className={`${mobileTab === 'result' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#020617] relative overflow-hidden h-full`}>
          <div className="h-16 border-b border-slate-800 bg-slate-900/10 flex items-center justify-between px-6 flex-shrink-0 z-20 backdrop-blur-sm">
             <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-[9px] font-black text-cyan-500/30 uppercase tracking-[0.2em] font-mono leading-none">Status: {loading ? 'Syncing' : 'Standby'}</span>
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : currentResult ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-800'}`}></div>
             </div>
             
             {currentResult && (
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231a1.125 1.125 0 0 1-1.12-1.227L6.34 18m11.318-4.171a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125V4.26a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12h7.5m-7.5 3H12" /></svg>
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saving || saveSuccess} 
                    className={`p-2.5 rounded-xl transition-all border ${saveSuccess ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    {saveSuccess ? '✓' : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>}
                  </button>
                  <button 
                    onClick={() => setShowTeleprompter(true)} 
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-cyan-600/20 transition-all ml-2"
                  >
                    Aire
                  </button>
               </div>
             )}
          </div>

          <div 
            ref={outputRef}
            className="flex-1 p-6 md:p-16 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,_rgba(34,211,238,0.03)_0%,_transparent_50%)]"
          >
            {currentResult ? (
              <div className="max-w-3xl mx-auto pb-48 md:pb-24">
                <div className="prose prose-invert prose-cyan max-w-none text-slate-200">
                  {currentResult.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-white mb-10 border-b border-slate-800 pb-6 leading-tight uppercase italic">{line.replace('# ', '')}</h1>;
                    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-cyan-400 mt-12 mb-6 uppercase tracking-[0.2em]">{line.replace('## ', '')}</h2>;
                    return <p key={i} className="mb-5 text-slate-300 font-light whitespace-pre-wrap text-sm md:text-base leading-relaxed tracking-wide">{line}</p>;
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center animate-pulse">
                 <div className="text-8xl mb-8 text-cyan-500">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                   </svg>
                 </div>
                 <p className="text-[12px] font-black uppercase tracking-[0.6em] text-cyan-400">Station_Ready</p>
                 <p className="text-[10px] mt-4 max-w-[240px] leading-relaxed text-slate-500 font-mono uppercase">A la espera de parámetros para iniciar proceso de síntesis informativa.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TELEPROMPTER OVERLAY */}
      {showTeleprompter && currentResult && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-fade-in select-none"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
            <div className="flex gap-3">
               <button onClick={restartTeleprompter} className="bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl">↺ Inicio</button>
               <button onClick={() => setIsPaused(!isPaused)} className={`${isPaused ? 'bg-green-600' : 'bg-amber-600'} text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl`}>{isPaused ? '▶ Play' : '⏸ Pausa'}</button>
            </div>
            <div className="flex gap-4 items-center">
              <div className="hidden md:flex bg-slate-900/80 px-6 py-3 rounded-xl border border-slate-800 gap-4 items-center">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vel.</span>
                 <input type="range" min="1" max="50" value={teleprompterSpeed} onChange={(e) => setTeleprompterSpeed(parseInt(e.target.value))} className="accent-cyan-500 w-48"/>
              </div>
              <button onClick={() => setShowTeleprompter(false)} className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl">Cerrar</button>
            </div>
          </div>
          
          <div className="max-w-5xl w-full h-[70vh] overflow-hidden relative cursor-pointer" onClick={() => setIsPaused(!isPaused)}>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-transparent to-black z-10"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/20 z-0"></div>
            <div 
              key={scrollKey}
              className={`text-white text-3xl md:text-7xl font-bold leading-snug animate-scroll-up px-12 py-[40vh] text-center whitespace-pre-wrap tracking-tight ${isPaused ? 'pause-animation' : ''}`}
              style={{ animationDuration: `${getTeleprompterDuration()}s`, animationTimingFunction: 'linear', animationFillMode: 'forwards' }}
            >
              {currentResult}
            </div>
          </div>
          <div className="mt-12 text-slate-800 font-black text-[10px] uppercase tracking-[0.5em] font-mono">Aire_Activo // {teleprompterSpeed}x</div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes scroll-up { from { transform: translateY(0); } to { transform: translateY(-100%); } }
        .animate-scroll-up { animation-name: scroll-up; }
        .pause-animation { animation-play-state: paused !important; }
      `}</style>
    </div>
  );
};

export default Generator;