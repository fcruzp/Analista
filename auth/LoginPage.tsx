import React, { useState } from 'react';
import { mockLogin } from '../services/supabaseClient';

interface LoginPageProps {
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular retraso de red para feedback visual
    setTimeout(() => {
      mockLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="mb-8 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al inicio
        </button>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/20">A+</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-slate-400 mt-2">Ingresa a tu central de análisis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="nombre@medio.com"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2 ml-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
                <button type="button" className="text-xs text-blue-400 hover:text-blue-300">¿Olvidaste tu clave?</button>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Iniciar Sesión"}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <span className="relative px-4 bg-transparent text-slate-600 text-xs font-bold uppercase tracking-widest">O continúa con</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium">
              <img src="https://www.svgrepo.com/show/303106/apple-black-logo.svg" className="w-5 h-5 invert" alt="Apple" />
              Apple
            </button>
          </div>

          <p className="mt-8 text-center text-slate-500 text-sm">
            ¿No tienes cuenta? <button className="text-blue-400 hover:text-blue-300 font-bold">Pruébalo gratis</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;