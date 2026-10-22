import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    // Solo directivas que no afectan a scripts ni estilos (Next usa scripts en línea y una
    // CSP estricta con nonce obligaría a renderizar todo bajo demanda). Frena clickjacking,
    // <base> inyectado, formularios hacia otros sitios y plugins.
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
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
