// services/supabase.ts

// Fix: Manually define the type for import.meta.env to resolve TypeScript
// errors related to Vite's environment variables.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
      readonly DEV: boolean;
      // Allow additional custom environment variables
      [key: string]: any;
    }
  }
}

import { createClient } from '@supabase/supabase-js';

// IMPORTANT: The VITE_SUPABASE_ANON_KEY is designed to be public and will be
// visible in the client bundle. Security is enforced through Supabase Row Level
// Security (RLS) policies. NEVER use the service_role key in client-side code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate presence of required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Create and configure the Supabase client using the modern v2 options structure.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    storage: window.localStorage, // Explicitly use localStorage for session persistence
    storageKey: 'sb-mykap-erp-auth-token', // Custom key for the session
    debug: import.meta.env.DEV, // Enable auth debugging in development
  },
  global: {
    headers: {
      'x-application-name': 'mykap-erp-app', // For Supabase dashboard logs
    },
  },
});

// Add auth state change listener for debugging in development
if (import.meta.env.DEV) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(
      `%c[Supabase Auth] Event: ${event}`,
      'color: #3ecf8e; font-weight: bold;',
      {
        session: session ? 'Active' : 'None',
        user: session?.user?.email,
        expiresAt: session?.expires_at 
          ? new Date(session.expires_at * 1000).toLocaleString() 
          : 'N/A',
      }
    );
  });
}