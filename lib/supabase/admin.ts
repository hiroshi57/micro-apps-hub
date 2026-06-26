import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/** Service Role クライアント（サーバーサイド専用） */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
