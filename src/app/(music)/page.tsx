import type { Metadata } from "next";
import { MusicRoom } from "@/components/music/MusicRoom";
import { albums } from "@/content/music";

export const metadata: Metadata = {
  title: "Music",
  description: "ATWOSAINT — música.",
};

export default function MusicPage() {
  return (
    <main className="room__main">
      <MusicRoom albums={albums} />
    </main>
  );
}
