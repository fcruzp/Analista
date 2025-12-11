import { createClient } from '@supabase/supabase-js';

// NOTE: In a real environment, these are process.env.VITE_SUPABASE_URL
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mock auth for demo purposes since we don't have a real backend connected in this preview
export const mockLogin = async () => {
  localStorage.setItem('analista_session', 'true');
  window.location.reload();
};

export const mockLogout = async () => {
  localStorage.removeItem('analista_session');
  window.location.reload();
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('analista_session');
};