import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

/**
 * Lands here right after a successful sign-in or sign-up. Reads the Profile's
 * role and routes the user to the correct dashboard. Pure dispatch — no UI.
 */
export default async function PostLoginPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "BRAND") redirect("/brand");
  if (profile.role === "ADMIN") redirect("/admin");
  redirect("/creator");
}
