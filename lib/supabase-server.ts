import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client using non-public environment variables
// These can be provided at runtime via Docker environment variables
//
// Use SUPABASE_SERVICE_KEY for full access (service role key)
// OR use SUPABASE_ANON_KEY for limited access (anon/public key)

let cachedClient: SupabaseClient | null = null;

function getSupabaseServer(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set SUPABASE_URL and either SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY.'
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

// Export a proxy object that lazily initializes the client
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseServer();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
