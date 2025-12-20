import React, { useState, useEffect } from 'react';
import { mockLogin } from '../services/supabaseClient';
import { LEGAL_TEXTS } from '../shared/seeds';

type ViewState = 'home' | 'blog' | 'guide' | 'community' | 'support';

// --- ICONS COMPONENTS ---
const Icons = {
  Flash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Script: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.097 0 2.148.195 3.122.552m12 0a8.967 8.967 0 01-3.122-.552c-1.097 0-2.148.195-3.122.552m3.122-.552V4.26c-.978-.358-2.025-.552-3.122-.552-1.097 0-2.148.195-3.122.552m3.122.552c1.097 0 2.148.195 3.122.552m-3.122-.552v12.75m0-12.75v12.75" />
    </svg>
  ),
  Social: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185zm3.933 12.814a2.25 2.25 0 10-3.933-2.185 2.25 2.25 0 003.933 2.185z" />
    </svg>
  ),
  Bias: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75V8.25m8.25 12.75a.75.75 0 00.75.75h6.75a.75.75 0 00.75-.75V14.25M6.75 22.5a.75.75 0 00.75-.75v-13.5a.75.75 0 00-.75-.75H5.25a.75.75 0 00-.75.75v13.5a.75.75 0 00.75.75h1.5zm10.5 0a.75.75 0 00.75-.75v-7.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v7.5a.75.75 0 00.75.75h1.5z" />
    </svg>
  ),
  Quotes: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  Data: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  Privacy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.562 3.337 10.345 8.135 12.427a11.99 11.99 0 008.135-12.427c0-1.3-.21-2.548-.598-3.716a11.99 11.99 0 01-7.662-3.712z" />
    </svg>
  )
};

// --- SUB-COMPONENTS ---

const BlogView = () => (
  <div className="pt-32 pb-20 max-w-4xl mx-auto px-6 min-h-screen animate-fade-in">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Blog de Analista+</h2>
      <p className="text-slate-400">Perspectivas sobre periodismo, IA y el futuro de los medios.</p>
    </div>

    <div className="space-y-12 text-left">
      {[
        { date: "24 Oct 2023", title: "El fin del bloqueo del escritor en la redacción", desc: "Cómo los LLMs están transformando las mesas de noticias urgentes.", author: "Equipo A+" },
        { date: "10 Oct 2023", title: "Ética y Alucinaciones: Guía para editores", desc: "Protocolos de verificación cuando usas inteligencia artificial para generar guiones.", author: "Carlos M." },
        { date: "02 Oct 2023", title: "Entrevista: 'Mi productor ahora es un algoritmo'", desc: "Hablamos con analistas de CNN y BBC sobre la integración de herramientas como Analista+.", author: "Sarah J." }
      ].map((post, i) => (
        <div key={i} className="group cursor-pointer border-b border-slate-800 pb-8">
          <div className="text-sm text-blue-500 mb-2 font-mono">{post.date}</div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{post.title}</h3>
          <p className="text-slate-400 leading-relaxed mb-4">{post.desc}</p>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Por {post.author}</div>
        </div>
      ))}
    </div>
  </div>
);

const GuideView = () => (
  <div className="pt-32 pb-20 max-w-4xl mx-auto px-6 min-h-screen animate-fade-in text-left">
    <div className="mb-12 border-b border-slate-800 pb-8">
      <h2 className="text-4xl font-bold text-white mb-4">Guía de Uso</h2>
      <p className="text-xl text-slate-400">Domina Analista+ en 5 minutos.</p>
    </div>

    <div className="space-y-12">
      <div className="flex gap-6">
        <div className="text-4xl font-bold text-slate-700">01</div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Configura tu Perfil</h3>
          <p className="text-slate-400">Define si tu estilo es "Serio", "Sarcástico" o "Educativo" en el panel de control. La IA ajustará el tono de todos los guiones generados.</p>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="text-4xl font-bold text-slate-700">02</div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Generando tu Primer Análisis</h3>
          <p className="text-slate-400">Ve a la pestaña "Productor IA". Selecciona un tema (ej. Economía) y escribe un prompt simple como: <span className="italic text-slate-500">"Caída del Euro frente al Dólar"</span>.</p>
        </div>
      </div>
    </div>
  </div>
);

const MockupSidebar = ({ step }: { step: number }) => (
  <div className="hidden md:block col-span-3 space-y-4 border-r border-slate-800/50 pr-4 h-full">
    <div className="h-8 w-24 bg-slate-800/50 rounded animate-pulse mb-8"></div>
    <div className="space-y-2">
      <div className={`h-10 w-full rounded-lg flex items-center px-4 gap-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${step === 0 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500'}`}>
        <span className="text-lg">📊</span> Panel
      </div>
      <div className={`h-10 w-full rounded-lg flex items-center px-4 gap-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${step === 1 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500'}`}>
        <span className="text-lg">🎙️</span> Estudio
      </div>
      <div className={`h-10 w-full rounded-lg flex items-center px-4 gap-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${step === 2 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500'}`}>
        <span className="text-lg">📂</span> Archivo
      </div>
    </div>
  </div>
);

interface HomeContentProps {
  mockupStep: number;
  onScrollToPricing: () => void;
  onOpenVideo: () => void;
  onStart: () => void;
}

const HomeContent: React.FC<HomeContentProps> = ({ mockupStep, onScrollToPricing, onOpenVideo, onStart }) => (
  <>
    {/* Hero Section */}
    <header className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto text-center relative z-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Potenciado por Google Gemini 1.5 Ultra
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-tight text-white drop-shadow-2xl">
          ANALIST<span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 animate-text-glow transform origin-center">A+</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-6 font-light leading-relaxed">
          Toma el control de tu narrativa con inteligencia superior.
        </p>

        <p className="text-base text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Analista+ es tu sala de redacción personal. Rastrea tendencias globales, cruza datos históricos, sugiere ángulos editoriales únicos y redacta guiones listos para el aire en segundos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <button
            onClick={onStart}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Comenzar Prueba Gratis
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </button>
          <button
            onClick={onOpenVideo}
            className="px-8 py-4 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Ver cómo funciona
          </button>
        </div>

        {/* MOCKUP REMAIN THE SAME FOR VISUAL CONSISTENCY */}
        <div className="relative mx-auto max-w-6xl perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent blur-3xl -z-10"></div>
          <div className="relative bg-slate-900/90 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl ring-1 ring-white/10 transform rotate-x-2 transition-transform duration-700 hover:rotate-x-0 group">
            <div className="h-10 border-b border-slate-800 bg-slate-900/90 flex items-center px-4 gap-4">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80"></div><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div><div className="w-3 h-3 rounded-full bg-green-500/80"></div></div>
              <div className="flex-1 max-w-2xl mx-auto bg-slate-800/50 rounded-md px-3 py-1 flex items-center justify-between text-xs text-slate-500 font-mono"><span>analista.plus/app</span></div>
            </div>
            <div className="p-6 grid grid-cols-12 gap-6 h-[500px] overflow-hidden text-left bg-gradient-to-b from-slate-900 to-slate-950">
              <MockupSidebar step={mockupStep} />
              <div className="col-span-12 md:col-span-9 relative">
                <div className={`absolute inset-0 transition-all duration-700 transform ${mockupStep === 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                  <div className="flex justify-between items-center mb-8">
                    <div><h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Panel de Control</h3><p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest">System Status: Active</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                      <div className="text-slate-500 text-[8px] uppercase font-black tracking-widest mb-2">Análisis Totales</div>
                      <div className="text-2xl font-mono text-white">1,248</div>
                    </div>
                    <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                      <div className="text-slate-500 text-[8px] uppercase font-black tracking-widest mb-2">Fuentes Activas</div>
                      <div className="text-2xl font-mono text-cyan-400">14,502</div>
                    </div>
                    <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/20">
                      <div className="text-cyan-500/60 text-[8px] uppercase font-black tracking-widest mb-2">Uso Mensual</div>
                      <div className="text-2xl font-mono text-white">85%</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/10 rounded-xl border border-slate-700/30 p-6 h-48 flex items-end justify-between gap-2">
                    {[35, 55, 40, 70, 50, 85, 60, 90, 75, 50, 65, 95].map((h, i) => (
                      <div key={i} className="w-full bg-cyan-500/30 rounded-t" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>

                {/* STEP 1: ESTUDIO (GENERATOR) */}
                <div className={`absolute inset-0 transition-all duration-700 transform ${mockupStep === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center font-bold text-cyan-400 text-[8px]">MOD</div>
                      <h3 className="text-xl font-black text-white uppercase italic">Estudio IA</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-6 h-full">
                    <div className="col-span-4 space-y-4">
                      <div className="space-y-1">
                        <div className="text-[7px] font-black text-cyan-500/50 uppercase tracking-widest">Tema</div>
                        <div className="grid grid-cols-2 gap-1">
                          {['POL', 'ECO', 'GEO', 'TEC'].map(t => <div key={t} className={`h-6 rounded border text-[6px] flex items-center justify-center font-black ${t === 'POL' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-800/30 border-slate-700 text-slate-500'}`}>{t}</div>)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[7px] font-black text-cyan-500/50 uppercase tracking-widest">Perfil</div>
                        <div className="h-8 w-full rounded bg-slate-800/30 border border-slate-700"></div>
                      </div>
                      <div className="h-20 w-full rounded bg-slate-950 border border-slate-800"></div>
                      <div className="h-10 w-full rounded bg-cyan-600"></div>
                    </div>
                    <div className="col-span-8 bg-slate-950/50 rounded-xl border border-slate-800 p-6 overflow-hidden relative">
                      <div className="prose prose-invert prose-cyan max-w-none text-[8px] leading-relaxed text-left">
                        <h4 className="text-cyan-400 font-black uppercase tracking-widest mb-4 border-b border-slate-800 pb-2 italic">Análisis: Estabilidad del Euro</h4>
                        <p className="mb-3 text-white font-bold">Resumen Ejecutivo:</p>
                        <p className="text-slate-400 mb-4 font-light">
                          El mercado europeo muestra señales de fortalecimiento frente a datos industriales de Alemania.
                          Se observa un pivote en la política del BCE hacia <span className="text-cyan-400 font-bold">tasas de interés</span> restrictivas.
                        </p>
                        <h5 className="text-slate-200 font-bold uppercase tracking-wider mb-2">Puntos de Análisis</h5>
                        <ul className="space-y-2 text-slate-400 list-inside list-disc">
                          <li>Inflación subyacente bajando al 2.4%</li>
                          <li>Impacto de precios de energía estables</li>
                          <li>Proyección alcista para Q1 2025</li>
                        </ul>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* STEP 2: ARCHIVO (LIBRARY) */}
                <div className={`absolute inset-0 transition-all duration-700 transform ${mockupStep === 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-white uppercase italic">Archivo Digital</h3>
                    <div className="h-px w-20 bg-cyan-500/30 mt-1"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { t: "Conflicto en Medio Oriente", d: "Análisis estratégico sobre las implicaciones...", c: "GEO" },
                      { t: "Tendencias Tech 2024", d: "Resumen ejecutivo de IA aplicada...", c: "TEC" },
                      { t: "Presupuesto Nacional", d: "Guion aire sobre el nuevo proyecto de ley...", c: "ECO" },
                      { t: "Elecciones Regionales", d: "Prospección política y datos históricos...", c: "POL" }
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg flex flex-col h-24">
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-[6px] font-black text-cyan-400 bg-cyan-500/10 px-1 rounded uppercase tracking-widest">{item.c}</div>
                          <div className="text-[6px] text-slate-600 font-mono">24/10/24</div>
                        </div>
                        <div className="text-[9px] font-bold text-white mb-1 truncate">{item.t}</div>
                        <div className="text-[7px] text-slate-500 line-clamp-2 italic">"{item.d}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* HOW IT WORKS */}
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Investigación y Producción Automatizada</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Analista+ integra el flujo de trabajo de un experto en una sola interfaz inteligente.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative text-left">
          {[
            { icon: Icons.Flash, color: "text-blue-400", bg: "bg-blue-400/10", title: "1. Rastreo Inteligente", text: "El sistema escanea miles de fuentes globales en tiempo real." },
            { icon: Icons.Bias, color: "text-purple-400", bg: "bg-purple-400/10", title: "2. Análisis y Contexto", text: "La IA cruza la noticia con datos históricos y precedentes legales." },
            { icon: Icons.Script, color: "text-emerald-400", bg: "bg-emerald-400/10", title: "3. Producción", text: "Transforma el análisis en guiones, hilos o puntos clave." }
          ].map((item, i) => (
            <div key={i} className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500"></div>
              <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-xl h-full flex flex-col items-start transition-transform group-hover:-translate-y-1">
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 border border-white/5 ${item.color} shadow-inner`}>
                  <item.icon />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* NEW FEATURES SECTION WITH OUTLINE ICONS AND GLOW */}
    <section id="features" className="py-24 bg-slate-900/50 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Herramientas de Clase Mundial</h2>
          <p className="text-slate-400">Tecnología de punta diseñada para elevar tu discurso.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            { icon: Icons.Flash, title: "Flash News", desc: "Resúmenes ejecutivos de 1 minuto listos para leer.", glow: "shadow-blue-500/10" },
            { icon: Icons.Script, title: "Guionista Pro", desc: "Genera escaletas completas con tiempos sugeridos.", glow: "shadow-purple-500/10" },
            { icon: Icons.History, title: "Contexto Histórico", desc: "Analogías automáticas con eventos clave del pasado.", glow: "shadow-emerald-500/10" },
            { icon: Icons.Social, title: "Social Media Kit", desc: "Hilos de Twitter y posts optimizados para LinkedIn.", glow: "shadow-orange-500/10" },
            { icon: Icons.Bias, title: "Detector de Sesgo", desc: "Análisis de neutralidad en fuentes externas.", glow: "shadow-red-500/10" },
            { icon: Icons.Quotes, title: "Citas Célebres", desc: "Encuentra la frase perfecta para cerrar tu segmento.", glow: "shadow-cyan-500/10" },
            { icon: Icons.Data, title: "Datos en Real-time", desc: "Integración directa con tendencias y mercados.", glow: "shadow-pink-500/10" },
            { icon: Icons.Privacy, title: "Privacidad Total", desc: "Tus prompts y resultados son 100% confidenciales.", glow: "shadow-indigo-500/10" },
          ].map((f, idx) => (
            <div key={idx} className={`group bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] shadow-lg`}>
              <div className="relative mb-6">
                {/* Glow behind icon */}
                <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xl">
                  <f.icon />
                </div>
              </div>
              <h4 className="font-bold text-lg text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{f.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* PRICING */}
    <section id="pricing" className="py-24 bg-slate-950 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Planes diseñados para tu carrera</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition">
            <h3 className="text-xl font-bold text-slate-200">Freemium</h3>
            <div className="text-4xl font-bold mt-2">$0</div>
            <ul className="space-y-4 text-slate-400 my-8 text-sm">
              <li className="flex gap-2 font-medium">✓ 10 Análisis diarios</li>
              <li className="flex gap-2">✓ Google Gemini 1.5 Flash</li>
            </ul>
            <button onClick={onStart} className="w-full py-3 rounded-xl border border-slate-700 font-bold hover:bg-slate-800 text-white transition-colors">Elegir Gratis</button>
          </div>
          <div className="p-8 rounded-3xl border border-blue-500/30 bg-slate-900/80 relative shadow-2xl shadow-blue-900/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg">Más Popular</div>
            <h3 className="text-xl font-bold text-white">Profesional</h3>
            <div className="text-4xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">$9<span className="text-lg text-slate-500 font-normal">/mes</span></div>
            <ul className="space-y-4 text-slate-300 my-8 text-sm">
              <li className="flex gap-2"><span className="text-blue-400 font-bold">✓</span> 100 Análisis mensuales</li>
              <li className="flex gap-2 font-medium text-white"><span className="text-blue-400 font-bold">✓</span> Google Gemini 1.5 Pro</li>
              <li className="flex gap-2"><span className="text-blue-400 font-bold">✓</span> Modo "Productor"</li>
            </ul>
            <button onClick={onStart} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:opacity-90 transition-opacity text-white shadow-xl shadow-blue-600/20">Suscribirse Ahora</button>
          </div>
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition">
            <h3 className="text-xl font-bold text-slate-200">Experto</h3>
            <div className="text-4xl font-bold mt-2">$19<span className="text-lg text-slate-500 font-normal">/mes</span></div>
            <ul className="space-y-4 text-slate-400 my-8 text-sm">
              <li className="flex gap-2">✓ 400 Análisis mensuales</li>
              <li className="flex gap-2">✓ Google Gemini 1.5 Ultra (Preview)</li>
            </ul>
            <button onClick={onStart} className="w-full py-3 rounded-xl border border-slate-700 font-bold hover:bg-slate-800 text-white transition-colors">Contactar Ventas</button>
          </div>
        </div>
      </div>
    </section>
  </>
);

interface LandingPageProps {
  onGoToLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [mockupStep, setMockupStep] = useState(0);
  const [view, setView] = useState<ViewState>('home');

  const scrollToSection = (id: string) => {
    if (view !== 'home') {
      setView('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (view !== 'home') window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    const interval = setInterval(() => setMockupStep((p) => (p + 1) % 3), 5000);
    return () => clearInterval(interval);
  }, []);

  const ModalComponent = showModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in text-left">
      <div className={`bg-slate-900 border border-slate-700 rounded-2xl w-full flex flex-col shadow-2xl ${showModal === 'video' ? 'max-w-4xl p-0 overflow-hidden' : 'max-w-2xl p-6 max-h-[80vh]'}`}>
        <div className={`${showModal === 'video' ? 'absolute top-2 right-2 z-10' : 'pb-6 border-b border-slate-800 flex justify-between items-center'}`}>
          {showModal !== 'video' && (
            <h3 className="text-xl font-bold text-white">
              {showModal === 'terms' ? 'Términos' : showModal === 'privacy' ? 'Privacidad' : 'Uso de IA'}
            </h3>
          )}
          <button onClick={() => setShowModal(null)} className={`hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors ${showModal === 'video' ? 'bg-black/50 text-white hover:bg-black/80' : 'text-slate-400'}`}>✕</button>
        </div>

        {showModal === 'video' ? (
          <div className="relative pt-[56.25%] w-full bg-black">
            <iframe
              src="https://www.youtube.com/embed/SbO9xfTzXwA?si=7dexlqpBv4Q-0uo6&controls=0&autoplay=1"
              title="YouTube video player"
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="overflow-auto text-slate-300 whitespace-pre-wrap leading-relaxed mt-4">
            {LEGAL_TEXTS[showModal as keyof typeof LEGAL_TEXTS]}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden relative">
      <nav className="fixed w-full z-40 top-0 left-0 border-b border-white/5 backdrop-blur-md bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center text-left">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">A+</div>
            <span className="text-xl font-bold tracking-tight">Analista+</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
            {view === 'home' ? (
              <>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition">Cómo funciona</button>
                <button onClick={() => scrollToSection('features')} className="hover:text-white transition">Funcionalidades</button>
                <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition">Precios</button>
              </>
            ) : <button onClick={() => setView('home')} className="hover:text-white transition font-bold">← Volver</button>}
          </div>
          <button onClick={onGoToLogin} className="border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white px-6 py-2 rounded-full text-sm font-medium transition-all">Iniciar Sesión</button>
        </div>
      </nav>

      <main className="min-h-screen text-center">
        {view === 'home' && <HomeContent mockupStep={mockupStep} onScrollToPricing={() => scrollToSection('pricing')} onOpenVideo={() => setShowModal('video')} onStart={onGoToLogin} />}
        {view === 'blog' && <BlogView />}
        {view === 'guide' && <GuideView />}
        {view === 'community' && <div className="pt-32 min-h-screen">Comunidad en construcción</div>}
        {view === 'support' && <div className="pt-32 min-h-screen">Soporte en construcción</div>}
      </main>

      <footer className="border-t border-slate-900 py-12 bg-slate-950 text-sm text-slate-500 text-left">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">Analista+</h4>
            <p className="mb-4">Empoderando voces con inteligencia artificial. La herramienta esencial para el periodismo moderno.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Producto</h5>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors">Funcionalidades</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-400 transition-colors">Precios</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Recursos</h5>
            <ul className="space-y-2">
              <li><button onClick={() => setView('blog')} className="hover:text-blue-400 transition-colors">Blog</button></li>
              <li><button onClick={() => setView('guide')} className="hover:text-blue-400 transition-colors">Guía de Uso</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Legal</h5>
            <ul className="space-y-2">
              <li><button onClick={() => setShowModal('terms')} className="hover:text-blue-400 transition-colors">Términos</button></li>
              <li><button onClick={() => setShowModal('privacy')} className="hover:text-blue-400 transition-colors">Privacidad</button></li>
            </ul>
          </div>
        </div>
      </footer>
      {ModalComponent}
    </div>
  );
};

export default LandingPage;