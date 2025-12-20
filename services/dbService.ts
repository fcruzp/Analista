import { AnalysisResult, Topic, AnalysisType } from '../types';

/**
 * dbService.ts - Capa de persistencia para el SaaS.
 * Actualmente utiliza LocalStorage para demo, pero está estructurado para 
 * conectarse a Supabase o Firebase en producción.
 */

const STORAGE_KEY = 'analista_plus_library';

export const saveAnalysis = async (analysis: Omit<AnalysisResult, 'id' | 'createdAt'>): Promise<AnalysisResult> => {
  // Simulación de latencia de red hacia un backend serverless
  await new Promise(resolve => setTimeout(resolve, 800));

  const newAnalysis: AnalysisResult = {
    ...analysis,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  try {
    const currentLibrary = getLibraryFromStorage();
    const updatedLibrary = [newAnalysis, ...currentLibrary];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLibrary));
    
    // Aquí iría la llamada a tu API:
    // await fetch('/api/save', { method: 'POST', body: JSON.stringify(newAnalysis) });
    
    return newAnalysis;
  } catch (e) {
    console.error("Error en persistencia SaaS:", e);
    throw new Error("No se pudo guardar en la nube.");
  }
};

export const getLibrary = async (): Promise<AnalysisResult[]> => {
  // Simulación de carga desde base de datos remota
  await new Promise(resolve => setTimeout(resolve, 600));
  return getLibraryFromStorage();
};

export const deleteAnalysis = async (id: string): Promise<void> => {
  const currentLibrary = getLibraryFromStorage();
  const filtered = currentLibrary.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

const getLibraryFromStorage = (): AnalysisResult[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};