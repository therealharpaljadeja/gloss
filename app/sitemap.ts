import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

/** The pages anyone can open: texts live in each reader's browser, so none are listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/library`, changeFrequency: "weekly", priority: 0.6 },
  ];
}
