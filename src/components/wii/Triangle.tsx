/** Flecha triangular azul (paginación y carrusel). */
export function Triangle({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 32"
      width="26"
      height="34"
      aria-hidden
      style={dir === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <linearGradient id={`wii-tri-${dir}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9eafb" />
          <stop offset="1" stopColor="#52bdf0" />
        </linearGradient>
      </defs>
      <path d="M4 3.5 21 16 4 28.5z" fill={`url(#wii-tri-${dir})`} stroke="#2d9bd6" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
