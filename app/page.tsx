import AccountMenu from "@/components/AccountMenu";
import DiscoverClient from "@/components/DiscoverClient";
import { getCurrentProfile } from "@/lib/auth";
import { getDiscoverPage } from "@/lib/queries";

export default async function Page() {
  const [{ hero, featured, grid }, profile] = await Promise.all([
    getDiscoverPage(),
    getCurrentProfile()
  ]);
  return (
    <DiscoverClient
      hero={hero}
      featured={featured}
      grid={grid}
      accountSlot={<AccountMenu profile={profile} />}
    />
  );
}
