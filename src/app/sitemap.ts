import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getPublishedCreations } from "@/lib/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/galerie", "/services", "/tarifs", "/a-propos", "/contact"].map(
    (path) => ({
      url: `${SITE_URL}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

  let creationRoutes: MetadataRoute.Sitemap = [];
  try {
    const creations = await getPublishedCreations();
    creationRoutes = creations.map((c) => ({
      url: `${SITE_URL}/galerie/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Supabase indisponible au build : on renvoie au moins les routes statiques.
  }

  return [...staticRoutes, ...creationRoutes];
}
