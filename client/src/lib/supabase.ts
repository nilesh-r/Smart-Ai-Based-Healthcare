import { createClient } from '@supabase/supabase-js';

// Fallback to prevent app crash if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
