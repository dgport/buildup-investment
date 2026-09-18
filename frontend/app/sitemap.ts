import type { MetadataRoute } from "next";
import { API_BASE_URL, SITE_URL } from "@/lib/constants/env";

interface Listing {
  id: string;
  updatedAt: string;
  isDemo?: boolean;
}
interface Slugged {
  slug: string;
  updatedAt: string;
  isDemo?: boolean;
}

async function fetchJson(path: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Sitemap source unavailable: ${res.status}`);
  return res.json();
}

async function fetchPages<T>(path: string): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const json = await fetchJson(`${path}?limit=100&page=${page}`) as { data: T[]; meta: { totalPages: number } };
    results.push(...json.data);
    totalPages = json.meta.totalPages;
    page++;
  } while (page <= totalPages);
  return results;
}

// Generate against live data, including records added after the image was built.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, projects, developers] = await Promise.all([
    fetchPages<Listing>("/properties"),
    fetchPages<Slugged>("/projects"),
    fetchJson("/developers") as Promise<Slugged[]>,
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/developers`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/listing-terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...properties.filter((p) => !p.isDemo).map((p) => ({
      url: `${SITE_URL}/properties/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...projects.filter((p) => !p.isDemo).map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...developers.filter((d) => !d.isDemo).map((d) => ({
      url: `${SITE_URL}/developers/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
