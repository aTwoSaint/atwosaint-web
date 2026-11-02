import { ChannelMenu } from "@/components/wii/ChannelMenu";
import { getReferences } from "@/lib/data/references";

export default async function Home() {
  const references = await getReferences();
  return <ChannelMenu references={references} />;
}
