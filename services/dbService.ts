import { AnalysisResult, Topic, AnalysisType } from '../types';

/**
 * dbService.ts
 * Preparado para migrar a Firebase Firestore.
 * Estructura de colecciones sugerida: 'users/{userId}/productions/{analysisId}'
 */

const STORAGE_KEY = 'analista_plus_library';

export const saveAnalysis = async (analysis: Omit<AnalysisResult, 'id' | 'createdAt'>): Promise<AnalysisResult> => {
  // Simulación de latencia de Cloud Firestore
  await new Promise(resolve => setTimeout(resolve, 600));

  const newAnalysis: AnalysisResult = {
    ...analysis,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  try {
    const currentLibrary = getLibraryFromStorage();
    const updatedLibrary = [newAnalysis, ...currentLibrary];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLibrary));
    return newAnalysis;
  } catch (e) {
    console.error("Error local storage persistence:", e);
    throw new Error("No se pudo guardar en la biblioteca local.");
  }
};

export const getLibrary = async (): Promise<AnalysisResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
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
