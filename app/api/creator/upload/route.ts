import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getServiceSupabase, SCREENSHOT_BUCKET } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/** Upload limit for submission screenshots. Larger than typical mobile
 *  screenshots — 8 MB matches the admin upload route's cap. */
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Authenticated upload endpoint for creator-provided proof images (e.g. a
 * screenshot of the platform's view count). Stored under `screenshots/` in
 * the same Supabase bucket as campaign covers — file gets a random name so
 * uploaders can't collide or guess each other's paths.
 */
export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  let file: FormDataEntryValue | null;
  try {
    const formData = await req.formData();
    file = formData.get("file");
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 8 MB)" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const rawExt = file.name.includes(".") ? file.name.split(".").pop() ?? "" : "";
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
  // Per-creator subdirectory so uploaders can't enumerate / collide.
  const path = `${profile.id}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;

  const { error } = await supabase.storage.from(SCREENSHOT_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(SCREENSHOT_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
