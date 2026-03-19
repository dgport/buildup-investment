import { MetadataRoute } from "next";
import { TEAM_MEMBERS } from "./[locale]/team/[id]/_components/TeamMembers";

const BASE_URL = process.env.SITE_URL || "https://www.prestigeaudit.ge";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/services",
    "/services/financial-audit",
    "/services/tax-services",
    "/services/accounting",
    "/services/valuation",
    "/services/legal",
    "/services/consulting",
    "/team",
  ];

  const teamPages = TEAM_MEMBERS.map((m) => `/team/${m.id}`);

  const allPaths = [...staticPages, ...teamPages];

  return allPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/team/") ? 0.6 : 0.8,
  }));
}
