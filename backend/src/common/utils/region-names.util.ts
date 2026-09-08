import { PrismaService } from '@/prisma/prisma.service';
import { Region } from '@prisma/client';

/**
 * Batch-load localized region names (requested language, falling back to
 * English) for a set of regions. Returns a map region → name.
 */
export async function loadRegionNames(
  prisma: PrismaService,
  regions: (Region | null | undefined)[],
  lang: string,
): Promise<Map<Region, string>> {
  const unique = [...new Set(regions.filter(Boolean))] as Region[];
  const result = new Map<Region, string>();
  if (!unique.length) return result;

  const rows = await prisma.regionTranslations.findMany({
    where: {
      region: { in: unique },
      language: { in: lang !== 'en' ? [lang, 'en'] : ['en'] },
    },
  });

  // English first, then the requested language overrides it
  for (const row of rows.filter((r) => r.language === 'en')) {
    result.set(row.region, row.name);
  }
  for (const row of rows.filter((r) => r.language === lang)) {
    result.set(row.region, row.name);
  }
  return result;
}
