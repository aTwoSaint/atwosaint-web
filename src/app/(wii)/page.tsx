import type { Metadata } from "next";
import { MusicRoom } from "@/components/music/MusicRoom";
import { albums as demoAlbums } from "@/content/music";
import { getAlbums } from "@/lib/data/music";

export const metadata: Metadata = {
  title: "Music",
  description: "ATWOSAINT — música.",
};

export default async function MusicPage() {
  const real = await getAlbums();
  // Mientras no haya música publicada se muestra la demostración, rotulada como tal.
  const albums = real.length > 0 ? real : demoAlbums;
  return (
    <main className="wii-music">
      <MusicRoom albums={albums} />
    </main>
  );
}
