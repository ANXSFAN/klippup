import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, updatedAt: true }
  });

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    ...campaigns.map((c) => ({
      url: `${siteUrl}/campaigns/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
