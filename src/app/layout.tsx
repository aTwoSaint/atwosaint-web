import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://atwosaint-web.vercel.app"),
  title: {
    default: "aTwoSaint",
    template: "%s — aTwoSaint",
  },
  description: "aTwoSaint — independent hip-hop production, sound and visual identity.",
  openGraph: { siteName: "aTwoSaint", type: "website", images: [{ url: "/logo-night.png", width: 667, height: 327 }] },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <div id="contenido" className="flex flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
