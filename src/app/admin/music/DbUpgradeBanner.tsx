import { pendingUpgrades } from "@/lib/data/db-upgrade";
import { upgradeDatabaseAction } from "./actions";

/** Aviso con botón cuando la base de datos tiene cambios pendientes. No aparece si todo está al día. */
export async function DbUpgradeBanner() {
  let pending: string[] = [];
  try {
    pending = await pendingUpgrades();
  } catch (error) {
    console.error("No se ha podido comprobar el estado de la base de datos", error);
    return null;
  }
  if (pending.length === 0) return null;
  return (
    <section role="alert" className="mb-10 max-w-2xl border border-accent-ink p-5 text-sm">
      <p className="font-medium">La base de datos necesita una actualización.</p>
      <p className="mt-2 text-muted">
        Faltan: {pending.join(" · ")}. Mientras tanto, guardar beats puede dar error. El botón solo añade columnas y
        tablas nuevas; no borra ni cambia nada de lo que ya tienes, y se puede pulsar más de una vez.
      </p>
      <form action={upgradeDatabaseAction} className="mt-4">
        <button
          type="submit"
          className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper"
        >
          Actualizar base de datos
        </button>
      </form>
    </section>
  );
}
