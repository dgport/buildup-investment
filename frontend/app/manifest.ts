import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Build Up Investment",
    short_name: "BuildUp",
    description: "Real estate listings and development projects in Batumi, Georgia",
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
