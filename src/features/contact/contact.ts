/**
 * Datos de contacto públicos. No se inventa ninguno: solo se muestran los que el
 * propietario configure en variables de entorno (CONTACT_EMAIL, CONTACT_INSTAGRAM_URL).
 * No son secretos (son datos que se quieren publicar), pero tampoco se escriben en el código.
 */
export type ContactInfo = {
  email?: string;
  instagram?: string;
};

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;

export function parseContact(env: {
  CONTACT_EMAIL?: string;
  CONTACT_INSTAGRAM_URL?: string;
}): ContactInfo {
  const out: ContactInfo = {};

  const email = env.CONTACT_EMAIL?.trim();
  if (email && EMAIL.test(email)) out.email = email;

  const raw = env.CONTACT_INSTAGRAM_URL?.trim();
  if (raw) {
    try {
      const url = new URL(raw);
      if (url.protocol === "https:" && /(^|\.)instagram\.com$/.test(url.hostname)) {
        out.instagram = url.toString();
      }
    } catch {
      /* URL no válida: se ignora */
    }
  }
  return out;
}

export function hasContact(c: ContactInfo): boolean {
  return Boolean(c.email || c.instagram);
}
