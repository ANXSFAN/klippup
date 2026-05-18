import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the secret key. Never import this into a
 * Client Component — the secret key must not reach the browser.
 */
export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY)"
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "campaign-covers";
