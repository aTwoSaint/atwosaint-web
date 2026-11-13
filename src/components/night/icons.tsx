import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P): P => ({
  viewBox: "0 0 24 24",
  width: 24,
  height: 24,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
  ...p,
});

export const HouseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 11 12 3.8 20.5 11" />
    <path d="M6 9.6V20h4.2v-5.6h3.6V20H18V9.6" />
  </svg>
);
export const MusicIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </svg>
);
export const ArchiveIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4" width="17" height="6" rx="1" />
    <path d="M5 10v9.5h14V10" />
    <path d="M10 14h4" />
  </svg>
);
export const AboutIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <path d="M12 7.6v.2" strokeWidth={2.4} />
  </svg>
);
export const MessageIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5.5h16v11H9.5L5.5 20v-3.5H4z" />
  </svg>
);
export const MailIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
export const PlayIcon = (p: P) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5Z" />
  </svg>
);
export const PauseIcon = (p: P) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <rect x="6" y="4.5" width="4.2" height="15" rx="1" />
    <rect x="13.8" y="4.5" width="4.2" height="15" rx="1" />
  </svg>
);
export const ChevronIcon = ({ dir = "right", ...p }: P & { dir?: "left" | "right" }) => (
  <svg {...base(p)}>
    <path d={dir === "right" ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"} />
  </svg>
);
export const ExternalIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6" />
    <path d="M20 4 10.5 13.5" />
    <path d="M18 14v5H5V6h5" />
  </svg>
);
export const ShareIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="2.4" />
    <circle cx="17.5" cy="6" r="2.4" />
    <circle cx="17.5" cy="18" r="2.4" />
    <path d="m8.1 10.9 7.3-3.8M8.1 13.1l7.3 3.8" />
  </svg>
);

/* Marcas: dibujos sencillos de los iconos habituales (no son los archivos oficiales). */
export const InstagramIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r=".6" fill="currentColor" />
  </svg>
);
export const YouTubeIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="m10.2 9.3 4.6 2.7-4.6 2.7z" fill="currentColor" />
  </svg>
);
export const TikTokIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 3.5v11.2a3.7 3.7 0 1 1-3.7-3.7" />
    <path d="M14 3.5c.3 2.4 1.9 4 4.5 4.2" />
  </svg>
);
/** Monograma «T» dentro de una cápsula: marca genérica para Traktrain. */
export const TraktrainIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3.5" width="18" height="17" rx="4.5" />
    <path d="M8 8.5h8M12 8.5v8" />
  </svg>
);
