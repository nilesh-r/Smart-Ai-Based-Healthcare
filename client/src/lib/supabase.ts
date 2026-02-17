import { createClient } from '@supabase/supabase-js';

// Fallback to prevent app crash if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// RUNTIME CONFIGURATION CHECK
if (import.meta.env.PROD) {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('localhost') || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        console.error(
            '%c CRITICAL CONFIGURATION ERROR: Supabase URL is not set correctly for production! %c\n' +
            'Value: ' + import.meta.env.VITE_SUPABASE_URL + '\n' +
            'The app will likely redirect to localhost or fail to login.\n' +
            'Please check your Render Environment Variables.',
            'background: red; color: white; font-size: 16px; padding: 4px; border-radius: 4px;',
            'background: transparent; color: inherit;'
        );
    }
}

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
