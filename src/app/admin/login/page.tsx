import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="mx-auto w-full max-w-sm px-[var(--gutter)] py-24">
      <h1 className="mb-8 text-sm font-semibold uppercase tracking-[0.32em]">
        Acceso
      </h1>
      <LoginForm />
    </main>
  );
}
