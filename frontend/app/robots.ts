import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashboard",
          "/signin",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/google-auth-success",
          "/google-auth-error",
          "/properties/new",
          "/properties/*/edit",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
