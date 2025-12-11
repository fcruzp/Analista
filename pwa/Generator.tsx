import React, { useState } from 'react';
import { generateAIAnalysis } from '../services/aiService';
import { AnalysisType, Topic, UserPlan } from '../types';

const Generator: React.FC = () => {
  const [topic, setTopic] = useState<Topic>(Topic.POLITICS);
  const [type, setType] = useState<AnalysisType>(AnalysisType.DEEP);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null);
    try {
      // Mock User ID and Plan
      const content = await generateAIAnalysis({
        userId: '123',
        plan: UserPlan.PROFESSIONAL,
        topic,
        type,
        prompt
      });
      setResult(content);
    } catch (e) {
      console.error(e);
      setResult("Error generando análisis. Por favor intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full md:flex-row">
      {/* Input Section */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 p-6 overflow-auto">
        <h2 className="text-xl font-bold text-white mb-6">Productor IA</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Tema</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Topic).map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`text-xs py-2 rounded-lg border transition-all ${
                    topic === t 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Formato</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as AnalysisType)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={AnalysisType.DEEP}>Análisis Profundo</option>
              <option value={AnalysisType.BRIEF}>Comentario Breve</option>
              <option value={AnalysisType.SCRIPT}>Guion Estructurado</option>
              <option value={AnalysisType.ANECDOTE}>Anécdota Histórica</option>
              <option value={AnalysisType.BOOK_REF}>Cita de Libro</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">¿Sobre qué quieres hablar?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: La caída del yen y su impacto en el turismo..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-lg flex justify-center items-center ${
              loading || !prompt 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25'
            }`}
          >
            {loading ? (
              <span className="animate-pulse">Generando...</span>
            ) : (
              <>
                <span className="mr-2">✨</span> Generar Análisis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-950 p-6 md:p-10 overflow-auto">
        {result ? (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Resultado Generado</span>
              <div className="flex gap-2">
                <button className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded hover:bg-slate-700">Copiar</button>
                <button className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded hover:bg-slate-700">Guardar</button>
              </div>
            </div>
            <div className="prose prose-invert prose-lg max-w-none bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
              <div dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600">
            <div className="text-6xl mb-4 opacity-20">📝</div>
            <p>Configura los parámetros y comienza a crear.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generator;
