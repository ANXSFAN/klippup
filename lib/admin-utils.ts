import { revalidatePath } from "next/cache";

/** Parses a `sortOrder` text field; falls back to 0. */
export function parseSortOrder(s: string): number {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Maps a thrown error to a short code the client can localize. */
export function prismaErrorCode(e: unknown): string {
  if (e && typeof e === "object" && "code" in e && (e as { code?: unknown }).code === "P2002") {
    return "DUPLICATE_SLUG";
  }
  if (e instanceof Error) return e.message;
  return "UNKNOWN";
}

/** Revalidates the public home page + the admin pages affected by taxonomy edits. */
export function revalidateAdmin(...extraPaths: string[]): void {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/campaigns");
  for (const p of extraPaths) revalidatePath(p);
}
