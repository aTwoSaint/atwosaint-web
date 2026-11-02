/** Marcadores con la misma proporción que los canales, para evitar saltos de diseño. */
export default function Loading() {
  return (
    <main className="wii-menu" aria-busy="true" aria-label="Cargando referencias">
      <div className="wii-menu__center">
        <ul className="wii-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <li
              key={i}
              className="wii-channel animate-pulse"
              style={{ animation: "none", opacity: 0.6 }}
            />
          ))}
        </ul>
      </div>
    </main>
  );
}
