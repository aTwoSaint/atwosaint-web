import type { Metadata } from "next";
import { MusicStage } from "@/components/music/MusicStage";
import { SiteFooter } from "@/components/night/SiteFooter";
import { getBeats } from "@/lib/data/music";

export const metadata: Metadata = {
  title: "Music",
  description: "Hip-hop instrumentals by aTwoSaint. Listen to every beat and get a license on Traktrain.",
};

export default async function MusicPage() {
  const beats = await getBeats();
  return (
    <main className="nv-music-page">
      <MusicStage beats={beats} />
      <SiteFooter />
    </main>
  );
}
