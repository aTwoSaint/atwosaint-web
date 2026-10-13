import type { Reference } from "@/features/references/types";
import { ReferenceCard } from "./ReferenceCard";

/** 2 columnas en móvil, 3 desde tableta, 4 en pantallas muy anchas. */
export const gridClasses =
  "grid grid-cols-2 gap-x-[var(--gutter)] gap-y-12 md:grid-cols-3 2xl:grid-cols-4";

export function ReferenceGrid({ references }: { references: Reference[] }) {
  return (
    <ul className={gridClasses}>
      {references.map((reference, i) => (
        <ReferenceCard key={reference.id} reference={reference} priority={i < 4} />
      ))}
    </ul>
  );
}
