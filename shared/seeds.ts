import { Anecdote, BookReference } from '../types';

export const SEED_ANECDOTES: Anecdote[] = [
  {
    title: "El Churchill Oculto",
    content: "Durante la Segunda Guerra Mundial, Winston Churchill solía trabajar desde su cama hasta el mediodía. Dictaba discursos, leía informes y dirigía el imperio en pijama, demostrando que la productividad no siempre requiere un escritorio.",
    era: "Segunda Guerra Mundial"
  },
  {
    title: "La Diplomacia del Ping Pong",
    content: "En 1971, un encuentro accidental entre jugadores de tenis de mesa de EE.UU. y China llevó a una visita histórica que descongeló las relaciones entre ambas potencias, demostrando cómo el deporte puede preceder a la política.",
    era: "Guerra Fría"
  }
];

export const SEED_BOOKS: BookReference[] = [
  {
    title: "El Príncipe",
    author: "Nicolás Maquiavelo",
    context: "Fundamental para entender la realpolitik moderna.",
    summary: "Analiza cómo los gobernantes deben equilibrar la virtud y la crueldad para mantener el poder y la estabilidad del estado."
  },
  {
    title: "La Riqueza de las Naciones",
    author: "Adam Smith",
    context: "Base del análisis económico liberal.",
    summary: "Explora la división del trabajo, la productividad y los mercados libres como motores de la prosperidad."
  }
];

export const LEGAL_TEXTS = {
  terms: "Términos de Servicio de Analista+...\n1. Aceptación: Al usar este servicio...\n2. Uso de IA: El contenido generado es una sugerencia...",
  privacy: "Política de Privacidad...\nRecopilamos datos mínimos para mejorar la generación de guiones...",
  aiPolicy: "Política de Uso de IA:\n- Freemium: OpenRouter/Cohere.\n- Premium: OpenAI GPT-4/5.\n- No garantizamos exactitud factual absoluta.",
};
