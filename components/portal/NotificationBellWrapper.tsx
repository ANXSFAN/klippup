import { getCurrentProfile } from "@/lib/auth";
import { countUnread, listMyNotifications } from "@/lib/notification-queries";
import NotificationBell from "./NotificationBell";

/**
 * Server wrapper that pre-loads the bell's data. Renders nothing for
 * anonymous visitors so it can be safely dropped into any layout/header.
 */
export default async function NotificationBellWrapper() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const [rows, unread] = await Promise.all([
    listMyNotifications(profile.id, 8),
    countUnread(profile.id)
  ]);
  return <NotificationBell rows={rows} unread={unread} />;
}
