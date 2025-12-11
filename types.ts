export enum UserPlan {
  FREEMIUM = 'FREEMIUM',
  PROFESSIONAL = 'PROFESSIONAL',
  EXPERT = 'EXPERT',
  CORPORATE = 'CORPORATE'
}

export enum AnalysisType {
  DEEP = 'DEEP',
  BRIEF = 'BRIEF',
  SCRIPT = 'SCRIPT',
  ANECDOTE = 'ANECDOTE',
  BOOK_REF = 'BOOK_REF'
}

export enum Topic {
  POLITICS = 'POLITICS',
  ECONOMY = 'ECONOMY',
  GEOPOLITICS = 'GEOPOLITICS',
  SPORTS = 'SPORTS'
}

export interface UserProfile {
  id: string;
  email: string;
  plan: UserPlan;
  tokensUsed: number;
  tokensLimit: number;
}

export interface AnalysisResult {
  id: string;
  title: string;
  content: string;
  type: AnalysisType;
  topic: Topic;
  createdAt: string;
  tags: string[];
}

export interface BookReference {
  title: string;
  author: string;
  context: string;
  summary: string;
}

export interface Anecdote {
  title: string;
  content: string;
  era: string;
}
