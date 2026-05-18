import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../lib/db";
import { ensureProfile } from "../lib/auth";
import type { UserRole } from "../app/generated/prisma/client";

/**
 * Seeds three test accounts using the Supabase Admin API, skipping email
 * confirmation. Re-running is safe — it idempotently picks up existing
 * auth.users by email and upserts the matching Profile.
 */

interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: "creator@test.klippup.local",
    password: "creator-pass-123",
    role: "CREATOR",
    displayName: "Test Creator"
  },
  {
    email: "brand@test.klippup.local",
    password: "brand-pass-123",
    role: "BRAND",
    displayName: "Test Brand"
  },
  {
    email: "admin@test.klippup.local",
    password: "admin-pass-123",
    role: "ADMIN",
    displayName: "Test Admin"
  }
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");

  const admin = createClient(url, key, { auth: { persistSession: false } });

  for (const u of TEST_USERS) {
    console.log(`\n[${u.email}] creating…`);

    let userId: string | null = null;

    const created = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role, displayName: u.displayName }
    });

    if (created.error) {
      // Already exists — find them via listUsers.
      const msg = created.error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
        if (list.error) throw list.error;
        const existing = list.data.users.find((x) => x.email === u.email);
        if (!existing) throw new Error(`createUser failed and listUsers couldn't find ${u.email}`);
        userId = existing.id;
        // Reset password so the documented credentials always work.
        const reset = await admin.auth.admin.updateUserById(userId, { password: u.password });
        if (reset.error) throw reset.error;
        console.log(`  already exists → password reset`);
      } else {
        throw created.error;
      }
    } else {
      userId = created.data.user?.id ?? null;
      console.log(`  auth.users row created`);
    }

    if (!userId) throw new Error(`No user id for ${u.email}`);

    await ensureProfile({
      id: userId,
      email: u.email,
      role: u.role,
      displayName: u.displayName
    });
    console.log(`  Profile + sub-profile upserted (role=${u.role})`);
  }

  console.log("\nDone. Credentials:");
  for (const u of TEST_USERS) {
    console.log(`  ${u.role.padEnd(7)}  ${u.email}  /  ${u.password}`);
  }
}

main()
  .catch((err) => {
    console.error("\nFailed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
