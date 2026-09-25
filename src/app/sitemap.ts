import type { MetadataRoute } from "next";
import { showFeatured } from "@/content/projects";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/hire`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/freelance`, changeFrequency: "monthly", priority: 0.9 },
    // AETHRA: listed again once the case study is back.
    ...(showFeatured ? [{ url: `${siteUrl}/work/aethra`, changeFrequency: "monthly" as const, priority: 0.8 }] : []),
  ];
}
