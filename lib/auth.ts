import { prisma } from "./db";
import type { UserRole } from "@/app/generated/prisma/client";
import { getSupabaseServer } from "./supabase/server";

export interface ProfileSnapshot {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
}

/**
 * Reads the current Supabase user + their Profile row. Returns `null` for
 * anonymous visitors or when the auth row has no matching Profile (which
 * shouldn't happen, but we don't want to throw in layouts if it does).
 */
export async function getCurrentProfile(): Promise<ProfileSnapshot | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, role: true, displayName: true, avatarUrl: true }
  });
  return profile;
}

/**
 * Idempotent profile creation, used by both password signup and first-time
 * OAuth login. `displayName` falls back to the email's local part if blank.
 */
export async function ensureProfile(args: {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string | null;
}): Promise<ProfileSnapshot> {
  const name = args.displayName.trim() || args.email.split("@")[0] || "User";
  return prisma.profile.upsert({
    where: { id: args.id },
    update: {},
    create: {
      id: args.id,
      email: args.email,
      role: args.role,
      displayName: name,
      avatarUrl: args.avatarUrl ?? null,
      ...(args.role === "CREATOR"
        ? { creator: { create: {} } }
        : args.role === "BRAND"
          ? { brand: { create: { brandName: name } } }
          : {})
    },
    select: { id: true, email: true, role: true, displayName: true, avatarUrl: true }
  });
}
