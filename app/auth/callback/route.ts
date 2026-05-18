import { type NextRequest, NextResponse } from "next/server";
import { ensureProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Supabase redirects here after a successful OAuth flow with a `?code=...`
 * we exchange for a session. The `role` query param is set in
 * `startGoogleOAuth` so a first-time login lands on the right kind of Profile.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const roleParam = searchParams.get("role");
  const role: "CREATOR" | "BRAND" = roleParam === "BRAND" ? "BRAND" : "CREATOR";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    const msg = error?.message ?? "auth_failed";
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`);
  }

  const existing = await prisma.profile.findUnique({
    where: { id: data.user.id },
    select: { id: true }
  });
  if (!existing) {
    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const displayName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      data.user.email?.split("@")[0] ||
      "User";
    const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : null;
    await ensureProfile({
      id: data.user.id,
      email: data.user.email ?? "",
      role,
      displayName,
      avatarUrl
    });
  }

  return NextResponse.redirect(`${origin}/post-login`);
}
