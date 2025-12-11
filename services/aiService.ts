import { UserPlan, Topic, AnalysisType } from '../types';

interface GenerateParams {
  userId: string;
  plan: UserPlan;
  topic: Topic;
  type: AnalysisType;
  prompt: string;
}

// This simulates the call to /functions/ai-proxy
export const generateAIAnalysis = async (params: GenerateParams): Promise<string> => {
  console.log("Calling AI Proxy with:", params);
  
  // SIMULATION DELAY
  await new Promise(resolve => setTimeout(resolve, 2500));

  // In production, this would be:
  // const response = await fetch('/.netlify/functions/ai-proxy', { method: 'POST', body: JSON.stringify(params) });
  // return response.json();

  // MOCK RESPONSES BASED ON TYPE
  if (params.type === AnalysisType.BRIEF) {
    return `**Análisis Breve: ${params.topic}**\n\nLa situación actual presenta una volatilidad inusual. Los indicadores sugieren un cambio de tendencia a corto plazo. Es fundamental observar la reacción de los mercados asiáticos esta madrugada. \n\n*Punto clave:* No subestimar el impacto psicológico en los inversores minoristas.`;
  }

  if (params.type === AnalysisType.ANECDOTE) {
    return `**Anécdota Histórica Relacionada**\n\nRecordemos la crisis de 1929. Mientras todos vendían, Joseph Kennedy (padre de JFK) vendió sus acciones porque su limpiabotas le dio consejos de bolsa. Cuando el mercado es tema de conversación popular, es hora de salir.\n\n*Aplicación:* La saturación actual de noticias sobre ${params.topic} podría indicar un techo similar.`;
  }

  if (params.type === AnalysisType.SCRIPT) {
    return `**GUION DE RADIO/TV (3 min)**\n\n[INTRO]\n"Buenas noches. Hoy no vamos a hablar de cifras, sino de consecuencias..."\n\n[DESARROLLO]\n1. El hecho: ${params.prompt}\n2. El contexto: Esto no pasaba desde hace 10 años.\n3. El ángulo humano: ¿Cómo afecta esto al ciudadano de a pie?\n\n[CIERRE]\n"La pregunta no es si va a pasar, sino cuándo. Soy [Nombre], para Analista+."`;
  }

  return `Generación completa de ${params.type} sobre ${params.topic}. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
};
