import type { MetadataRoute } from "next";
import { API_BASE_URL, SITE_URL } from "@/lib/constants/env";

interface Listing {
  id: string;
  updatedAt: string;
}
interface Slugged {
  slug: string;
  updatedAt: string;
}

async function fetchAll<T>(path: string, pick: (json: unknown) => T[]): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return pick(await res.json());
  } catch {
    return [];
  }
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, projects, developers] = await Promise.all([
    fetchAll<Listing>("/properties?limit=100&page=1", (j) => (j as { data: Listing[] }).data),
    fetchAll<Slugged>("/projects?limit=100&page=1", (j) => (j as { data: Slugged[] }).data),
    fetchAll<Slugged>("/developers", (j) => j as Slugged[]),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/developers`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticPages,
    ...properties.map((p) => ({
      url: `${SITE_URL}/properties/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...developers.map((d) => ({
      url: `${SITE_URL}/developers/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
