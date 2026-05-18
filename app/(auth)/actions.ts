"use server";

import { z } from "zod";
import { ensureProfile } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase/server";

export type AuthResult = { ok: true } | { ok: false; error: string };

const signUpSchema = z.object({
  role: z.enum(["CREATOR", "BRAND"]),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1)
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const oauthSchema = z.object({
  role: z.enum(["CREATOR", "BRAND"])
});

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export async function signUpWithPassword(input: unknown): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };
  const { role, email, password, displayName } = parsed.data;

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, displayName } }
  });
  if (error) return { ok: false, error: error.message };
  if (!data.user) return { ok: false, error: "NO_USER" };

  await ensureProfile({ id: data.user.id, email, role, displayName });
  return { ok: true };
}

export async function signInWithPassword(input: unknown): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function startGoogleOAuth(
  input: unknown
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const parsed = oauthSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID" };

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteOrigin()}/auth/callback?role=${parsed.data.role}`
    }
  });
  if (error || !data.url) return { ok: false, error: error?.message ?? "OAUTH_FAILED" };
  return { ok: true, url: data.url };
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
}
