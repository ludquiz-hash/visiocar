import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

// Regular client for user operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Admin client for service operations (bypasses RLS)
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper to get authenticated client with user's JWT
export function getAuthClient(jwt) {
  return createClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    }
  );
}