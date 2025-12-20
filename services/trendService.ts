import { GoogleGenAI } from "@google/genai";

export interface RealTrend {
  title: string;
  category: string;
  impact: 'Alto' | 'Medio' | 'Bajo';
}

export interface TrendResponse {
  trends: RealTrend[];
  sources: { title: string; uri: string }[] | any[];
  error?: string;
  needsKeySelection?: boolean;
  lastUpdated?: string;
}

const STORAGE_KEY = 'analista_plus_trends_cache';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getCachedTrends = (country: string, topic: string): TrendResponse | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const cache = JSON.parse(data);
    if (cache.country === country && cache.topic === topic) {
      return cache.data;
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchRealTimeTrends = async (
  country: string = 'Global',
  topic: string = 'Todos',
  forceRefresh: boolean = false,
  retries = 2,
  backoff = 2000
): Promise<TrendResponse> => {

  if (!forceRefresh) {
    const cached = getCachedTrends(country, topic);
    if (cached) return cached;
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return {
      trends: [],
      sources: [],
      error: "No se detectó una API Key válida. Por favor, selecciona una llave en el panel.",
      needsKeySelection: true
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const countryContext = country === 'Global' ? 'en el mundo' : `en ${country}`;
  const topicContext = topic === 'Todos' ? 'de noticias generales' : `específicamente sobre ${topic}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `IMPORTANTE: Usa la búsqueda de Google. Identifica las 3 tendencias de noticias más importantes e influyentes ${countryContext} ${topicContext} en las últimas 24 horas. 
      Proporciona exactamente 3 líneas con este formato: CATEGORIA | TITULO | IMPACTO (Alto, Medio o Bajo). 
      DEBES consultar y citar al menos 3 fuentes web distintas (una para cada noticia).`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const lines = text.split('\n').filter(line => line.includes('|'));

    if (lines.length === 0) {
      throw new Error("Formato de respuesta no reconocido por la IA.");
    }

    const trends: RealTrend[] = lines.slice(0, 3).map(line => {
      const parts = line.split('|').map(s => s.trim());
      return {
        category: parts[0] || 'General',
        title: parts[1] || 'Sin título',
        impact: (parts[2] as any) || 'Medio'
      };
    });

    // Extracción mejorada y deduplicación de fuentes de grounding
    const metadata = response.candidates?.[0]?.groundingMetadata;
    const rawSources = metadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Fuente Externa',
      uri: chunk.web?.uri || '#'
    })).filter((s: any) => s.uri !== '#') || [];

    // Priorizar fuentes únicas pero intentar que coincidan con la cantidad de trends
    let sources = Array.from(new Map(rawSources.map((s: any) => [s.uri, s])).values());

    // Si tenemos más fuentes que trends, tomamos las primeras N
    if (sources.length > trends.length) {
      sources = sources.slice(0, trends.length);
    }

    const finalResponse: TrendResponse = {
      trends,
      sources,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      country,
      topic,
      data: finalResponse
    }));

    return finalResponse;
  } catch (error: any) {
    console.error("Trend Service Error:", error);

    if (error?.status === 400 || error?.message?.includes("API key not valid")) {
      return {
        trends: [],
        sources: [],
        error: "API Key no válida. Por favor, re-vincula tu cuenta.",
        needsKeySelection: true
      };
    }

    if (error?.status === 429 && retries > 0) {
      await wait(backoff);
      return fetchRealTimeTrends(country, topic, forceRefresh, retries - 1, backoff * 2);
    }

    return {
      trends: [],
      sources: [],
      error: "No pudimos obtener las tendencias. Verifica tu conexión o API Key."
    };
  }
};