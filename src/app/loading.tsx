import { gridClasses } from "@/components/references/ReferenceGrid";

/** Marcadores con la misma proporción 4:5 que las imágenes, para evitar saltos de diseño. */
export default function Loading() {
  return (
    <main
      className="px-[var(--gutter)] pt-10"
      aria-busy="true"
      aria-label="Cargando referencias"
    >
      <div className="mb-10 h-4 w-32 animate-pulse bg-line" />
      <ul className={gridClasses} aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i}>
            <div className="aspect-[4/5] animate-pulse bg-line" />
            <div className="mt-3 h-3 w-1/2 animate-pulse bg-line" />
          </li>
        ))}
      </ul>
    </main>
  );
}
