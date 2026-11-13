/**
 * Datos públicos de la marca. Son los facilitados por el titular; no se inventa ninguno.
 * Cambiarlos aquí los actualiza en el pie de página, el contacto y los documentos legales.
 */
export const site = {
  name: "aTwoSaint",
  url: "https://atwosaint-web.vercel.app",
  email: "atwosaint2@gmail.com",
  /** Redacta un correo en Gmail (enlace facilitado por el titular). */
  emailCompose: "https://mail.google.com/mail/?view=cm&to=atwosaint2%40gmail.com",
  traktrain: "https://traktrain.com/atwosaint",
  socials: {
    instagram: "https://www.instagram.com/atwosaint_/",
    youtube: "https://www.youtube.com/@atwosaint2",
    tiktok: "https://www.tiktok.com/@atwosaint",
  },
} as const;

/**
 * Duración de la pantalla de bienvenida en milisegundos (se acota a 1500–2500).
 * Se puede cambiar con la variable NEXT_PUBLIC_SPLASH_MS.
 */
export const SPLASH_MS = (() => {
  const n = Number(process.env.NEXT_PUBLIC_SPLASH_MS);
  return Number.isFinite(n) && n > 0 ? Math.min(2500, Math.max(1500, n)) : 2000;
})();

/**
 * Datos legales del titular. Mientras estén vacíos no se muestran; hay que completarlos antes de
 * vender (la normativa española de servicios de la sociedad de la información exige identificar al titular).
 */
export const legalHolder: { name?: string; taxId?: string; address?: string } = {};
