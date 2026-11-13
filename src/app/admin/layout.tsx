import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

/** La zona de administración conserva su propia interfaz funcional (cabecera y pie sencillos). */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div lang="es" className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
