import React, { useState } from 'react';
import { auth, googleProvider, twitterProvider } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

interface LoginPageProps {
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'Credenciales inválidas. Si usaste Google anteriormente, intenta entrar con ese botón.';
      case 'auth/user-not-found':
        return 'No se encontró ninguna cuenta con este correo.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta. Inténtalo de nuevo.';
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado. Intenta iniciar sesión.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/popup-closed-by-user':
        return 'Se canceló el inicio de sesión con la cuenta social.';
      case 'auth/network-request-failed':
        return 'Error de red. Verifica tu conexión a internet.';
      default:
        return 'Ocurrió un error inesperado. Por favor, intenta más tarde.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      setError(getFriendlyErrorMessage(err.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (providerType: 'google' | 'twitter') => {
    setIsLoading(true);
    setError(null);
    const provider = providerType === 'google' ? googleProvider : twitterProvider;
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Social Auth Error:", err.code, err.message);
      setError(getFriendlyErrorMessage(err.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements - Matching Landing/Onboarding */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al inicio
        </button>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/20">A+</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h1>
            <p className="text-slate-400 mt-2">
              {mode === 'login' ? 'Ingresa a tu central de análisis' : 'Comienza tu prueba gratuita hoy'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-shake">
              <span className="text-red-400 text-lg">⚠️</span>
              <p className="text-red-400 text-xs font-bold uppercase tracking-tight leading-tight">{error}</p>
            </div>
          )}

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
                {mode === 'login' && (
                  <button type="button" className="text-xs text-blue-400 hover:text-blue-300">¿Olvidaste tu clave?</button>
                )}
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
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-2xl font-bold text-white transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex justify-center items-center text-sm uppercase tracking-widest"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (mode === 'login' ? "Entrar al Sistema" : "Crear Identidad")}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <span className="relative px-4 bg-transparent text-slate-600 text-xs font-bold uppercase tracking-widest">O continúa con</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 py-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium text-white"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('twitter')}
              className="flex items-center justify-center gap-2 py-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium text-white"
            >
              <img src="https://www.svgrepo.com/show/448252/twitter.svg" className="w-5 h-5" alt="Twitter" />
              Twitter
            </button>
          </div>

          <p className="mt-8 text-center text-slate-500 text-sm">
            {mode === 'login' ? (
              <>¿No tienes cuenta? <button onClick={() => setMode('signup')} className="text-blue-400 hover:text-blue-300 font-bold">Regístrate</button></>
            ) : (
              <>¿Ya tienes cuenta? <button onClick={() => setMode('login')} className="text-blue-400 hover:text-blue-300 font-bold">Inicia sesión</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;