// Loaded by the Prisma CLI (migrate / db push / studio / db pull).
// Uses DIRECT_URL — the Supabase *session* pooler (port 5432, no pgbouncer) — because
// the transaction pooler in DATABASE_URL can't run migrations. The app runtime uses
// DATABASE_URL via a driver adapter in lib/db.ts, not this file.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
