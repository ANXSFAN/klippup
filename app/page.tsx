import DiscoverClient from "@/components/DiscoverClient";
import { getDiscoverPage } from "@/lib/queries";

export default async function Page() {
  const { hero, featured, grid } = await getDiscoverPage();
  return <DiscoverClient hero={hero} featured={featured} grid={grid} />;
}
