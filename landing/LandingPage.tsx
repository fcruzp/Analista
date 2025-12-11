import React, { useState } from 'react';
import HeroCanvas from '../components/HeroCanvas';
import { mockLogin } from '../services/supabaseClient';
import { LEGAL_TEXTS } from '../shared/seeds';

const LandingPage: React.FC = () => {
  const [showModal, setShowModal] = useState<string | null>(null);

  const Modal = ({ title, content }: { title: string, content: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="p-6 overflow-auto text-slate-300 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden scroll-smooth">
      <HeroCanvas />
      
      {/* Navbar */}
      <nav className="fixed w-full z-40 top-0 left-0 border-b border-white/5 backdrop-blur-md bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">A+</div>
            <span className="text-xl font-bold tracking-tight">Analista+</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition">Cómo funciona</a>
            <a href="#features" className="hover:text-white transition">Funcionalidades</a>
            <a href="#integrations" className="hover:text-white transition">Integraciones</a>
            <a href="#pricing" className="hover:text-white transition">Precios</a>
          </div>
          <button 
            onClick={mockLogin}
            className="hidden md:block border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white px-6 py-2 rounded-full text-sm font-medium transition-all"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Hero Section SORA Style */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Glow Effects behind title */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Nuevo Motor GPT-5 Preview
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-tight text-white drop-shadow-2xl">
            ANALIST<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">A+</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-6 font-light leading-relaxed">
            Toma el control de tu narrativa con inteligencia superior.
          </p>
          
          <p className="text-base text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Analista+ es tu sala de redacción personal. Rastrea tendencias globales, cruza datos históricos, sugiere ángulos editoriales únicos y redacta guiones listos para el aire en segundos. Diseñado exclusivamente para comentaristas que exigen rigor, profundidad y velocidad.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button 
              onClick={mockLogin} 
              className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Comenzar Prueba Gratis 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </button>
            <a href="#how-it-works" className="px-8 py-4 text-slate-300 hover:text-white font-medium transition-colors">
              Ver cómo funciona
            </a>
          </div>

          {/* App Mockup / Dashboard Preview */}
          <div className="relative mx-auto max-w-6xl perspective-1000">
             {/* Glow behind the dashboard */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent blur-3xl -z-10"></div>
            
            <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl ring-1 ring-white/10 transform rotate-x-2 transition-transform duration-700 hover:rotate-x-0 group">
              {/* Fake Browser Header */}
              <div className="h-10 border-b border-slate-800 bg-slate-900/90 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto bg-slate-800/50 rounded-md px-3 py-1 text-xs text-slate-500 w-64 text-center font-mono">analista.plus/dashboard</div>
              </div>

              {/* Fake Dashboard Content */}
              <div className="p-6 grid grid-cols-12 gap-6 h-[400px] md:h-[600px] overflow-hidden text-left bg-gradient-to-b from-slate-900 to-slate-950">
                
                {/* Sidebar */}
                <div className="hidden md:block col-span-2 space-y-4 border-r border-slate-800/50 pr-4">
                  <div className="h-8 w-24 bg-slate-800/50 rounded animate-pulse"></div>
                  <div className="space-y-2 mt-8">
                    <div className="h-8 w-full bg-blue-500/10 border-l-2 border-blue-500 rounded-r flex items-center px-3 text-blue-400 text-sm font-medium">Dashboard</div>
                    <div className="h-8 w-full hover:bg-slate-800/30 rounded flex items-center px-3 text-slate-500 text-sm">Producción</div>
                    <div className="h-8 w-full hover:bg-slate-800/30 rounded flex items-center px-3 text-slate-500 text-sm">Biblioteca</div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="col-span-12 md:col-span-10 flex flex-col gap-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
                      <div className="text-xs text-slate-500 uppercase mb-1">Análisis Generados</div>
                      <div className="text-2xl font-bold text-white">1,248</div>
                      <div className="text-xs text-green-400 mt-1">↑ 12% vs mes anterior</div>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
                      <div className="text-xs text-slate-500 uppercase mb-1">Tokens Disponibles</div>
                      <div className="text-2xl font-bold text-white">450k</div>
                      <div className="h-1.5 w-full bg-slate-700 rounded-full mt-2"><div className="h-full w-2/3 bg-blue-500 rounded-full"></div></div>
                    </div>
                    <div className="bg-blue-600/10 p-4 rounded-lg border border-blue-500/20 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div></div>
                       <div className="text-xs text-blue-300 uppercase mb-1">Sugerencia IA</div>
                       <div className="text-sm text-white font-medium">"El impacto del litio en la geopolítica andina" es tendencia creciente.</div>
                       <button className="mt-3 text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-white font-medium transition-colors">Crear Guion</button>
                    </div>
                  </div>

                  {/* Main Chart Area representation */}
                  <div className="flex-1 bg-slate-800/20 rounded-xl border border-slate-700/30 p-6 relative">
                     <div className="flex justify-between items-center mb-6">
                        <div className="h-6 w-48 bg-slate-700/50 rounded"></div>
                        <div className="h-8 w-24 bg-slate-700/50 rounded"></div>
                     </div>
                     {/* Fake Graph */}
                     <div className="flex items-end gap-2 h-48 mt-8 px-4">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-500/60 rounded-t hover:to-blue-400 transition-all cursor-pointer group/bar relative" style={{ height: `${h}%` }}>
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity border border-slate-700 whitespace-nowrap">{h}% Impacto</div>
                          </div>
                        ))}
                     </div>
                     {/* Gradient overlay to fade bottom */}
                     <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Más que una App, tu Productor Ejecutivo</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Analista+ no es solo un generador de texto. Es un sistema integral que automatiza la investigación y producción de medios noticiosos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity"></div>
              <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-xl h-full">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-2xl mb-6">📡</div>
                <h3 className="text-xl font-bold text-white mb-4">1. Rastreo Inteligente</h3>
                <p className="text-slate-400 leading-relaxed">
                  El sistema escanea miles de fuentes globales en tiempo real. Filtra el ruido y detecta noticias relevantes específicamente para tu nicho (economía, política, deportes) y las necesidades de tu audiencia.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
               <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity"></div>
               <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-xl h-full">
                <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center text-2xl mb-6">🧠</div>
                <h3 className="text-xl font-bold text-white mb-4">2. Análisis y Contexto</h3>
                <p className="text-slate-400 leading-relaxed">
                  No solo resume; entiende. La IA cruza la noticia con datos históricos, precedentes legales y contexto geopolítico. Genera ángulos de análisis únicos que te diferencian de la competencia.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 to-orange-600 rounded-xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity"></div>
              <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-xl h-full">
                <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-lg flex items-center justify-center text-2xl mb-6">🎙️</div>
                <h3 className="text-xl font-bold text-white mb-4">3. Producción Multiplataforma</h3>
                <p className="text-slate-400 leading-relaxed">
                  Transforma el análisis instantáneamente en formatos listos para usar: un guion para tu podcast, un hilo viral para redes sociales, o puntos clave para tu intervención en TV.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Herramientas de Clase Mundial</h2>
              <p className="text-slate-400">Todo lo que necesitas para dominar la conversación pública.</p>
            </div>
            <button onClick={mockLogin} className="text-blue-400 font-bold hover:text-blue-300 transition flex items-center gap-2">
              Explorar todas las funciones <span>→</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "⚡", title: "Flash News", desc: "Resúmenes ejecutivos de 1 minuto para estar al día al instante." },
              { icon: "📜", title: "Guionista Pro", desc: "Genera escaletas completas con intro, desarrollo y cierre." },
              { icon: "📚", title: "Contexto Histórico", desc: "Analogías con eventos del pasado para enriquecer tu opinión." },
              { icon: "🐦", title: "Social Media Kit", desc: "Convierte cualquier análisis en hilos de Twitter y posts de LinkedIn." },
              { icon: "🔍", title: "Detector de Sesgo", desc: "Identifica la inclinación política de las fuentes originales." },
              { icon: "💬", title: "Citas Célebres", desc: "Encuentra frases de autores históricos que validen tu punto." },
              { icon: "📊", title: "Datos en Tiempo Real", desc: "Integración con cifras de mercado y encuestas recientes." },
              { icon: "🔒", title: "Privacidad Total", desc: "Tus análisis y ángulos son privados y no entrenan a la IA." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-950 p-6 rounded-xl border border-slate-800 hover:border-slate-600 transition hover:-translate-y-1">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h4 className="font-bold text-lg text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONS SECTION */}
      <section id="integrations" className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-slate-300">Potenciado por la mejor tecnología e integrado a tu flujo</h2>
          
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex flex-col items-center gap-2">
               <div className="text-2xl font-bold text-white">OpenAI</div>
               <span className="text-xs text-slate-500">GPT-5 Preview & GPT-4</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <div className="text-2xl font-bold text-white">Cohere</div>
               <span className="text-xs text-slate-500">Análisis Empresarial</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <div className="text-2xl font-bold text-white">OpenRouter</div>
               <span className="text-xs text-slate-500">Llama 3 & Mistral</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <div className="text-2xl font-bold text-white">Stripe</div>
               <span className="text-xs text-slate-500">Pagos Seguros</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <div className="text-2xl font-bold text-white">Supabase</div>
               <span className="text-xs text-slate-500">Base de Datos Realtime</span>
             </div>
          </div>

          <div className="mt-16 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-white/5">
             <h3 className="text-xl font-bold text-white mb-4">Exportación Directa</h3>
             <p className="text-slate-400 mb-6">
               Conecta Analista+ con tus herramientas favoritas. Exporta guiones directamente a PDF, Markdown o copia a tu portapapeles para pegar en Notion, Google Docs o tu teleprompter.
             </p>
             <div className="flex justify-center gap-4 text-3xl text-slate-500">
                <span title="PDF">📄</span>
                <span title="Google Docs">📝</span>
                <span title="Notion">N</span>
                <span title="Markdown">⬇️</span>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Planes diseñados para tu carrera</h2>
            <p className="text-slate-400">Desde comentaristas novatos hasta cadenas nacionales.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition group hover:-translate-y-1 duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-200">Freemium</h3>
                <div className="text-4xl font-bold mt-2">$0</div>
                <p className="text-sm text-slate-500 mt-2">Para estudiantes y curiosos.</p>
              </div>
              <ul className="space-y-4 text-slate-400 mb-8 text-sm">
                <li className="flex gap-2"><span className="text-blue-500">✓</span> 10 Análisis diarios</li>
                <li className="flex gap-2"><span className="text-blue-500">✓</span> Modelo Cohere / Llama</li>
                <li className="flex gap-2"><span className="text-blue-500">✓</span> Acceso básico a noticias</li>
              </ul>
              <button onClick={mockLogin} className="w-full py-3 rounded-xl border border-slate-700 font-bold hover:bg-slate-800 hover:text-white transition-colors">Elegir Gratis</button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-3xl border border-blue-500/30 bg-slate-900/80 relative shadow-2xl shadow-blue-900/10 group hover:-translate-y-1 duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                Más Popular
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Profesional</h3>
                <div className="text-4xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">$9<span className="text-lg text-slate-500 font-normal">/mes</span></div>
                <p className="text-sm text-slate-400 mt-2">Para periodistas independientes.</p>
              </div>
              <ul className="space-y-4 text-slate-300 mb-8 text-sm">
                <li className="flex gap-2"><span className="text-blue-400">✓</span> 100 Análisis mensuales</li>
                <li className="flex gap-2 font-medium text-white"><span className="text-blue-400">✓</span> GPT-4.1 Mini + Standard</li>
                <li className="flex gap-2"><span className="text-blue-400">✓</span> Plantillas avanzadas</li>
                <li className="flex gap-2"><span className="text-blue-400">✓</span> Modo "Productor"</li>
              </ul>
              <button onClick={mockLogin} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:opacity-90 transition-opacity text-white shadow-lg shadow-blue-500/25">Suscribirse Ahora</button>
            </div>

            {/* Expert */}
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition group hover:-translate-y-1 duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-200">Experto</h3>
                <div className="text-4xl font-bold mt-2">$19<span className="text-lg text-slate-500 font-normal">/mes</span></div>
                <p className="text-sm text-slate-500 mt-2">Para analistas senior y TV.</p>
              </div>
              <ul className="space-y-4 text-slate-400 mb-8 text-sm">
                <li className="flex gap-2"><span className="text-purple-500">✓</span> 400 Análisis mensuales</li>
                <li className="flex gap-2"><span className="text-purple-500">✓</span> GPT-5 Preview</li>
                <li className="flex gap-2"><span className="text-purple-500">✓</span> Historiografía profunda</li>
                <li className="flex gap-2"><span className="text-purple-500">✓</span> Soporte prioritario</li>
              </ul>
              <button onClick={mockLogin} className="w-full py-3 rounded-xl border border-slate-700 font-bold hover:bg-slate-800 hover:text-white transition-colors">Contactar Ventas</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
               <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">A+</div>
               Analista+
            </h4>
            <p className="mb-4">Empoderando voces con inteligencia artificial. La herramienta esencial para el periodismo moderno.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
            </div>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Producto</h5>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-blue-400">Funcionalidades</a></li>
              <li><a href="#integrations" className="hover:text-blue-400">Integraciones</a></li>
              <li><a href="#pricing" className="hover:text-blue-400">Precios</a></li>
              <li><a href="#" className="hover:text-blue-400">Actualizaciones</a></li>
            </ul>
          </div>
          <div>
             <h5 className="text-white font-bold mb-4">Recursos</h5>
             <ul className="space-y-2">
               <li><a href="#" className="hover:text-blue-400">Blog</a></li>
               <li><a href="#" className="hover:text-blue-400">Guías de Uso</a></li>
               <li><a href="#" className="hover:text-blue-400">Comunidad</a></li>
               <li><a href="#" className="hover:text-blue-400">Soporte</a></li>
             </ul>
           </div>
          <div>
            <h5 className="text-white font-bold mb-4">Legal</h5>
            <ul className="space-y-2">
              <li><button onClick={() => setShowModal('terms')} className="hover:text-blue-400">Términos de Servicio</button></li>
              <li><button onClick={() => setShowModal('privacy')} className="hover:text-blue-400">Política de Privacidad</button></li>
              <li><button onClick={() => setShowModal('aiPolicy')} className="hover:text-blue-400">Política de IA</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-900 text-center text-xs">
          © {new Date().getFullYear()} Analista Plus Inc. Todos los derechos reservados.
        </div>
      </footer>

      {showModal && <Modal title={showModal === 'terms' ? 'Términos' : showModal === 'privacy' ? 'Privacidad' : 'Uso de IA'} content={LEGAL_TEXTS[showModal as keyof typeof LEGAL_TEXTS]} />}
    </div>
  );
};

export default LandingPage;