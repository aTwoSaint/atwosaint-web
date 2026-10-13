import { ReferenceGrid } from "@/components/references/ReferenceGrid";
import { getReferences } from "@/lib/data/references";

export default async function Home() {
  const references = await getReferences();

  return (
    <main className="px-[var(--gutter)] pt-10">
      <div className="mb-10 flex items-baseline justify-between gap-4">
        <h1 className="text-sm font-semibold uppercase tracking-[0.32em]">
          Referencias
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          ({String(references.length).padStart(2, "0")})
        </p>
      </div>

      {references.length === 0 ? (
        <p className="py-24 font-mono text-xs uppercase tracking-widest text-muted">
          Aún no hay referencias publicadas.
        </p>
      ) : (
        <ReferenceGrid references={references} />
      )}
    </main>
  );
}
