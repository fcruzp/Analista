import { AnalysisResult } from '../types';
import { db, auth } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

/**
 * dbService.ts - Capa de persistencia híbrida.
 * - El CONTENIDO (sensible/derechos de autor) se queda en LocalStorage.
 * - Las ESTADÍSTICAS (administrativo) se guardan en Firestore.
 */

const STORAGE_PREFIX = 'analista_plus_library_';

const getLocalKey = () => {
  const user = auth.currentUser;
  if (!user) return null;
  return `${STORAGE_PREFIX}${user.uid}`;
};

export const saveAnalysis = async (analysis: Omit<AnalysisResult, 'id' | 'createdAt'>): Promise<AnalysisResult> => {
  const user = auth.currentUser;
  if (!user) {
    console.error("Tentativa de guardado sin usuario autenticado.");
    throw new Error("Acceso denegado: Usuario no autenticado.");
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const fullData: AnalysisResult = {
    ...analysis,
    id,
    createdAt
  };

  // 1. Guardar localmente (CONTENIDO COMPLETO)
  try {
    const key = getLocalKey();
    if (!key) throw new Error("No se pudo determinar la llave local.");

    const existing = localStorage.getItem(key);
    const library = existing ? JSON.parse(existing) : [];
    library.unshift(fullData);
    localStorage.setItem(key, JSON.stringify(library));

    console.log("💾 Contenido guardado localmente (Privacidad/Copyright OK)");
  } catch (e) {
    console.error("Error en LocalStorage:", e);
    throw new Error("No se pudo guardar localmente.");
  }

  // 2. Guardar estadísticas en Firestore (SIN CONTENIDO)
  try {
    const statsData = {
      userId: user.uid,
      analysisId: id,
      topic: analysis.topic,
      type: analysis.type,
      charCount: analysis.content.length,
      titleSnippet: analysis.title.substring(0, 30),
      createdAt
    };

    console.log("📊 Sincronizando estadísticas administrativas en la nube...");
    await addDoc(collection(db, 'generation_stats'), statsData);

  } catch (e) {
    console.error("⚠️ No se pudieron sincronizar las estadísticas, pero el análisis se guardó localmente:", e);
  }

  return fullData;
};

export const getLibrary = async (): Promise<AnalysisResult[]> => {
  const key = getLocalKey();
  if (!key) return [];

  try {
    const existing = localStorage.getItem(key);
    if (!existing) return [];

    const results = JSON.parse(existing) as AnalysisResult[];
    console.log(`📂 Librería local cargada: ${results.length} elementos.`);
    return results;
  } catch (e) {
    console.error("Error cargando librería local:", e);
    return [];
  }
};

export const deleteAnalysis = async (id: string): Promise<void> => {
  const key = getLocalKey();
  if (!key) return;

  try {
    const existing = localStorage.getItem(key);
    if (!existing) return;

    let library = JSON.parse(existing) as AnalysisResult[];
    library = library.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(library));
    console.log("🗑️ Análisis eliminado del almacenamiento local.");
  } catch (e) {
    console.error("Error eliminando análisis local:", e);
  }
};