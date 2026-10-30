/** Marca tipográfica de ATWOSAINT (no existe archivo de logotipo; se reutiliza el recurso del sitio). */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wii-wordmark ${className}`}>
      <span aria-hidden className="wii-wordmark__dot" />
      ATWOSAINT
    </span>
  );
}
