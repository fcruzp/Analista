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
  const [scrollKey, setScrollKey] = useState(0); // Para reiniciar la animación
  const outputRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setCurrentResult("");
    setSaveSuccess(false);
    
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

  if (showTeleprompter && currentResult) {
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
            {currentResult}
          </div>
        </div>

        <div className="mt-8 text-slate-700 font-black text-[10px] uppercase tracking-[0.4em] flex flex-col items-center gap-2">
          <span>MODO AIRE ACTIVO • {isPaused ? 'EN PAUSA' : 'SCROLL ACTIVO'}</span>
          <span className="opacity-40">USA EL SCROLL O ARRASTRA PARA CAMBIAR VELOCIDAD</span>
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
    <div className="flex flex-col h-full md:flex-row bg-slate-950">
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/40 p-6 overflow-auto print:hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-lg">⚡</div>
            <h2 className="text-xl font-bold text-white tracking-tight">Estudio IA</h2>
          </div>
          {currentResult && (
            <button onClick={handleClear} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Limpiar estudio">🧹</button>
          )}
        </div>
        
        <div className="space-y-8">
          <section>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">1. Eje Temático</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Topic).map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`text-[9px] py-3 rounded-xl border font-black uppercase tracking-widest transition-all ${
                    topic === t ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'border-slate-800 bg-slate-800/20 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">2. Formato</label>
            <div className="space-y-2">
              {[
                { id: AnalysisType.DEEP, label: 'Análisis Estratégico', icon: '🧠' },
                { id: AnalysisType.SCRIPT, label: 'Guion para Aire', icon: '🎙️' },
                { id: AnalysisType.BRIEF, label: 'Resumen Ejecutivo', icon: '📄' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setType(opt.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    type === opt.id ? 'bg-slate-800 border-blue-500 text-white shadow-lg' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/30'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span>{opt.icon}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">3. Contexto de la Noticia</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Detalla el evento actual..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl p-4 h-32 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all"
            ></textarea>
          </section>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all ${
              loading || !prompt ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
            }`}
          >
            {loading ? "Analizando..." : "✨ Generar Análisis"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden print:bg-white print:overflow-visible text-left">
        <div className="h-14 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between px-6 print:hidden">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workspace Activo</span>
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : currentResult ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-700'}`}></div>
           </div>
           
           {currentResult && (
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="text-[10px] font-black bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  🖨️ PDF / IMPRIMIR
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving || saveSuccess} 
                  className={`text-[10px] font-black px-4 py-2 rounded-lg transition-all ${saveSuccess ? 'bg-green-600' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'}`}
                >
                  {saveSuccess ? '✓ GUARDADO' : '💾 GUARDAR'}
                </button>
                <button 
                  onClick={() => setShowTeleprompter(true)} 
                  className="text-[10px] font-black bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
                >
                  🎥 AIRE
                </button>
             </div>
           )}
        </div>

        <div 
          ref={outputRef}
          className="flex-1 p-6 md:p-12 overflow-y-auto print:overflow-visible print:p-0"
        >
          {currentResult ? (
            <div className="max-w-3xl mx-auto pb-20 print:pb-0">
              <div className="hidden print:block border-b-2 border-black pb-4 mb-8">
                <div className="flex justify-between items-end">
                  <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Reporte Analista+</h1>
                  <p className="text-sm font-bold uppercase text-black">{new Date().toLocaleDateString()} • {topic}</p>
                </div>
              </div>

              <div className="prose prose-invert prose-blue max-w-none text-slate-200 print:text-black leading-relaxed">
                {currentResult.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-white print:text-black mb-8 border-b border-slate-800 print:border-black pb-4">{line.replace('# ', '')}</h1>;
                  if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-blue-400 print:text-black mt-10 mb-4 uppercase tracking-widest">{line.replace('## ', '')}</h2>;
                  return <p key={i} className="mb-4 text-slate-300 print:text-black font-light whitespace-pre-wrap">{line}</p>;
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20 print:hidden">
               <div className="text-8xl mb-6">🎙️</div>
               <p className="text-xs font-black uppercase tracking-widest">Workspace de Producción</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;