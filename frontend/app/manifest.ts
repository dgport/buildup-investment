import type { MetadataRoute } from "next";
import { IS_RENT_SITE } from "@/lib/market";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: IS_RENT_SITE ? "BuildUp Rent" : "Build Up Investment",
    short_name: IS_RENT_SITE ? "BuildUp Rent" : "BuildUp",
    description: IS_RENT_SITE ? "Long-term and daily property rentals in Georgia" : "Real estate listings and development projects in Batumi, Georgia",
    start_url: "/",
    display: "standalone",
    background_color: "#042f2e",
    theme_color: "#042f2e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
