import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserPlan } from '../types';
import { db, auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface OnboardingViewProps {
    user: User;
    onComplete: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [accountName, setAccountName] = useState('');

    const plans = [
        {
            id: UserPlan.FREEMIUM,
            name: 'Freemium',
            price: '$0',
            features: ['10 Análisis diarios', 'Google Gemini 1.5 Flash'],
            buttonText: 'Elegir Gratis',
            isPopular: false
        },
        {
            id: UserPlan.PROFESSIONAL,
            name: 'Profesional',
            price: '$9',
            features: ['100 Análisis mensuales', 'Google Gemini 1.5 Pro', 'Modo "Productor"'],
            buttonText: 'Suscribirse Ahora',
            isPopular: true
        },
        {
            id: UserPlan.EXPERT,
            name: 'Experto',
            price: '$19',
            features: ['400 Análisis mensuales', 'Google Gemini 1.5 Ultra (Preview)'],
            buttonText: 'Elegir Experto',
            isPopular: false
        }
    ];

    const handleFinish = async () => {
        if (!selectedPlan) return;
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                displayName: accountName || user.displayName || 'Operador',
                plan: selectedPlan,
                onboarded: true,
                createdAt: new Date().toISOString()
            }, { merge: true });

            setTimeout(() => {
                onComplete();
            }, 1500);
        } catch (err) {
            alert("Error guardando perfil: " + err);
            setIsSaving(false);
        }
    };

    const renderStep1 = () => (
        <div className="animate-fade-in w-full max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Selecciona tu Plan</h1>
                <p className="text-slate-400 text-sm md:text-lg uppercase tracking-widest">Paso 1 de 3: Elige tu motor de análisis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative p-8 rounded-3xl border transition-all cursor-pointer group flex flex-col ${selectedPlan === plan.id
                                ? 'border-blue-500 bg-slate-900/90 ring-1 ring-blue-500/50 shadow-2xl shadow-blue-500/10'
                                : plan.isPopular
                                    ? 'border-blue-500/30 bg-slate-900/80 shadow-2xl shadow-blue-900/5 hover:border-blue-500/50'
                                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                            }`}
                    >
                        {plan.isPopular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">Más Popular</div>
                        )}

                        <h3 className={`text-xl font-bold mb-1 ${plan.isPopular ? 'text-white' : 'text-slate-200'}`}>{plan.name}</h3>
                        <div className={`text-4xl font-bold mt-2 mb-6 ${plan.isPopular ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-white'}`}>
                            {plan.price}<span className="text-lg text-slate-500 font-normal">/mes</span>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {plan.features.map((f, i) => (
                                <li key={i} className={`flex items-start gap-2 text-sm ${plan.isPopular ? 'text-slate-300' : 'text-slate-400'}`}>
                                    <span className="text-blue-400 font-bold">✓</span> {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`w-full py-4 rounded-xl font-bold transition-all text-sm ${selectedPlan === plan.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : plan.isPopular
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                                        : 'border border-slate-700 hover:bg-slate-800 text-white'
                                }`}
                        >
                            {selectedPlan === plan.id ? 'Seleccionado' : plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-16 flex flex-col items-center gap-6">
                <button
                    onClick={() => setStep(2)}
                    disabled={!selectedPlan}
                    className="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg text-white transition-all shadow-[0_0_40px_rgba(37,99,235,0.2)] hover:shadow-[0_0_60px_rgba(37,99,235,0.4)] disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none active:scale-[0.98]"
                >
                    Continuar →
                </button>
                <button
                    onClick={() => signOut(auth)}
                    className="text-slate-600 font-bold text-sm hover:text-red-400 transition-all uppercase tracking-widest"
                >
                    Cancelar y Cerrar Sesión
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-fade-in max-w-md mx-auto w-full px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Identidad</h1>
            <p className="text-slate-400 text-sm md:text-lg uppercase tracking-widest mb-12">Paso 2 de 3: ¿Cómo te verán en la red?</p>

            <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Nombre del Operador o Medio</label>
                <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="E.g. ANALISTA_SUPREME"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-800 text-lg"
                />
                <p className="text-[11px] text-slate-500 mt-6 leading-relaxed italic">Este nombre se utilizará en los encabezados de tus reportes y análisis generados.</p>
            </div>

            <div className="mt-12 flex flex-col md:flex-row justify-center gap-4">
                <button onClick={() => setStep(1)} className="px-8 py-4 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-all">← Atrás</button>
                <button
                    onClick={() => setStep(3)}
                    disabled={!accountName}
                    className="px-12 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-full font-bold text-white transition-all shadow-xl active:scale-95"
                >
                    Siguiente Paso →
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-fade-in max-w-md mx-auto w-full px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Activación</h1>
            <p className="text-slate-400 text-sm md:text-lg uppercase tracking-widest mb-12">Paso 3 de 3: Pasarela Segura (Mockup)</p>

            <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl text-left space-y-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plan:</span>
                    <span className="text-lg font-bold text-blue-400 uppercase italic tracking-tighter">{selectedPlan}</span>
                </div>

                <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tarjeta de Crédito / Débito</label>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-5 text-slate-600 font-mono text-sm flex justify-between items-center opacity-70">
                        <span>#### #### #### ####</span>
                        <span className="text-[10px]">MM/YY</span>
                    </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <p className="text-[10px] text-amber-500 uppercase tracking-wide leading-relaxed font-bold">
                        ⚠️ Modo Demostración: Haz clic en "Confirmar" para activar tu acceso instantáneamente sin cargos reales.
                    </p>
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-6">
                <button
                    onClick={handleFinish}
                    disabled={isSaving}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 disabled:bg-slate-800 disabled:text-slate-500 rounded-full font-bold text-lg transition-all shadow-2xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-4"
                >
                    {isSaving ? (
                        <>
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <span>Procesando...</span>
                        </>
                    ) : 'Confirmar y Activar →'}
                </button>
                <button onClick={() => setStep(2)} className="text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-all">← Volver al paso anterior</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-left relative overflow-x-hidden">
            {/* Background elements to match LandingPage */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full"></div>

            <div className="w-full relative z-10 flex flex-col items-center">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
};

export default OnboardingView;
