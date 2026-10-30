const LOCALE = "es-ES";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Jueves, 29 de octubre" */
export function formatLongDate(date: Date): string {
  return capitalize(
    new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long" }).format(date),
  );
}

/** "Jue, 29 oct" (barra en móvil) */
export function formatShortDate(date: Date): string {
  return capitalize(
    new Intl.DateTimeFormat(LOCALE, { weekday: "short", day: "numeric", month: "short" })
      .format(date)
      .replace(".", ""),
  );
}

/** "18:05" */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" }).format(date);
}

/** Fecha de alta de una referencia: "13 oct 2026". Cadena vacía si no es válida. */
export function formatReferenceDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", year: "numeric" })
    .format(d)
    .replace(/\./g, "");
}
