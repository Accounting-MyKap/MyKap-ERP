// Fix: Manually define the type for import.meta.env to resolve TypeScript
// errors related to Vite's environment variables. This is a workaround for
// a project configuration issue where 'vite/client' types are not found.
 declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
      // FIX: Add DEV property to the env type to allow development-only logging.
      readonly DEV: boolean;
    }
  }
}


import { createClient } from '@supabase/supabase-js'

// Read Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// The createClient function will throw an error if the URL or key is invalid.
// FIX: Explicitly set auth options to ensure token refresh and session persistence.
// This resolves the issue where signOut fails after the access token expires.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});