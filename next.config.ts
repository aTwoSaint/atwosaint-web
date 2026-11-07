import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const BLOB = "https://*.public.blob.vercel-storage.com";

/**
 * Política de contenido: la página solo puede cargar recursos propios y de nuestro almacén de Blob.
 * Next.js usa scripts y estilos en línea (una política con nonce obligaría a renderizar todo bajo
 * demanda), por eso se permite 'unsafe-inline'; aun así se bloquea cargar scripts de otros sitios,
 * enviar datos a otros dominios, incrustar la web en otra y los plugins.
 * `https://vercel.com` es el endpoint de subida directa de audio desde /admin.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${BLOB}`,
  `media-src 'self' blob: ${BLOB}`,
  "font-src 'self' data:",
  `connect-src 'self' https://vercel.com ${BLOB}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: csp },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // No anunciar la tecnología del servidor.
  poweredByHeader: false,
  images: {
    // Solo se optimizan imágenes de nuestro almacén de Vercel Blob.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    // Vercel admite ~4,5 MB por petición; dejamos margen para el formulario.
    serverActions: { bodySizeLimit: "4400kb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
