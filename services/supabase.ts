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

// FIX: The type 'StorageAdapter' is not exported from '@supabase/supabase-js' in v2.
// Manually define the interface to match the expected shape for the auth storage option.
interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

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

// FINAL FIX: Create a robust, custom storage adapter.
// This prevents the Supabase client from silently falling back to in-memory
// storage if `window.localStorage` is unavailable for any reason during the
// initial, synchronous client creation. By wrapping each operation in a
// try-catch block, we ensure that storage access failures are handled gracefully
// without breaking session persistence.
const customStorageAdapter: StorageAdapter = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[Supabase Storage] Failed to get item '${key}' from localStorage.`, e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Supabase Storage] Failed to set item '${key}' in localStorage.`, e);
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Supabase Storage] Failed to remove item '${key}' from localStorage.`, e);
    }
  },
};


// Create and configure the Supabase client using the modern v2 options structure.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    storage: customStorageAdapter, // Use the robust custom storage adapter
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