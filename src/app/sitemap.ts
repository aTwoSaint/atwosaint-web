import type { MetadataRoute } from "next";
import { getBeats } from "@/lib/data/music";
import { getReferences } from "@/lib/data/references";

const BASE = "https://atwosaint-web.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [beats, refs] = await Promise.all([getBeats().catch(() => []), getReferences().catch(() => [])]);
  const fixed = ["", "/home", "/music", "/archives", "/about", "/contact", "/privacy", "/terms", "/cookies"];
  return [
    ...fixed.map((p) => ({ url: `${BASE}${p}` })),
    ...beats.map((b) => ({ url: `${BASE}/music/${b.slug}` })),
    ...refs.map((r) => ({ url: `${BASE}/archives/${r.slug}` })),
  ];
}
