import React from 'react';

const Dashboard: React.FC = () => {
  const news = [
    { title: "Inflación global se estabiliza", category: "Economía", impact: "Alto" },
    { title: "Nuevas alianzas en el Pacífico Sur", category: "Geopolítica", impact: "Medio" },
    { title: "Final de temporada histórica", category: "Deportes", impact: "Bajo" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 pb-24">
      <header>
        <h2 className="text-3xl font-bold text-white">Buenos días, Analista.</h2>
        <p className="text-slate-400 mt-2">Aquí tienes tu briefing diario para preparar comentarios.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
          <div className="text-blue-400 text-sm font-bold uppercase mb-2">Estado del Plan</div>
          <div className="text-2xl font-bold text-white">Profesional</div>
          <div className="w-full bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-500 h-full w-[45%]"></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">45/100 Análisis usados</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-white">Tendencias Hoy</h3>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">En tiempo real</span>
          </div>
          <div className="space-y-3">
            {news.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                <div>
                  <span className="text-xs text-purple-400 font-bold mr-2">{item.category}</span>
                  <span className="text-slate-200">{item.title}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${item.impact === 'Alto' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                  {item.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Modo Productor Rápido</h3>
          <p className="text-indigo-200 text-sm">Genera un guion de 1 minuto basado en las tendencias actuales.</p>
        </div>
        <button className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-lg">
          Iniciar Flash
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
