import { GoogleGenAI } from "@google/genai";
import { UserPlan, Topic, AnalysisType } from '../types';

interface GenerateParams {
  userId: string;
  plan: UserPlan;
  topic: Topic;
  type: AnalysisType;
  prompt: string;
}

export const generateAIAnalysisStream = async (
  params: GenerateParams,
  onChunk: (text: string) => void
): Promise<void> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key no configurada.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const typeInstructions = {
    [AnalysisType.DEEP]: "Realiza un análisis profundo, estructurado y con visión crítica. Usa subtítulos y puntos clave.",
    [AnalysisType.BRIEF]: "Escribe un comentario breve, directo y contundente de máximo 2 párrafos.",
    [AnalysisType.SCRIPT]: "Crea un guion profesional para radio o TV con marcas de tiempo [00:00], tono sugerido y ganchos de audiencia.",
    [AnalysisType.ANECDOTE]: "Busca y relata una anécdota histórica o curiosa que sirva como analogía perfecta para el tema.",
    [AnalysisType.BOOK_REF]: "Cita un libro fundamental que explique el trasfondo de este tema y resume su relevancia actual."
  };

  // El sistema ahora incluye la instrucción de buscar información de último minuto
  const systemPrompt = `Eres un productor experto de noticias de élite. 
  Tu objetivo es ayudar a un analista a brillar usando información EN TIEMPO REAL.
  
  CONTEXTO ACTUAL:
  - Tema: ${params.topic}
  - Formato: ${params.type}
  - Instrucción: ${typeInstructions[params.type]}
  
  REGLA CRÍTICA: Utiliza la búsqueda de Google para obtener los datos más recientes sobre "${params.prompt}". 
  No te bases en tu conocimiento previo si hay noticias de las últimas 48 horas.
  
  REGLAS DE FORMATO:
  - Responde ÚNICAMENTE en formato Markdown elegante.
  - NO utilices iconos, emojis ni símbolos gráficos.
  - Evita el uso excesivo de asteriscos. Úsalos solo para negritas (\*\*texto\*\*).
  - Usa títulos (#) y subtítulos (##, ###) para estructurar la información.
  - El tono debe ser profesional y directo.`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: `Analiza lo siguiente basándote en los últimos acontecimientos: ${params.prompt}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        topP: 0.9,
        tools: [{ googleSearch: {} }] // ACTIVADO para precisión total
      },
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }
  } catch (error: any) {
    console.error("Error en streaming de IA:", error);
    throw new Error(error.message || "Error al conectar con la IA.");
  }
};
