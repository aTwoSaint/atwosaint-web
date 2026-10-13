import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATWOSAINT",
  description: "ATWOSAINT — referencias y progreso visual.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
