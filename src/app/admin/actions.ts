"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdminCredentials } from "@/lib/auth/credentials";
import { endSession, requireAdmin, startSession } from "@/lib/auth/session";
import {
  createReferenceSchema,
  idSchema,
  loginSchema,
  type ActionState,
} from "@/features/references/schema";
import {
  createReference,
  deleteReference,
  setReferenceStatus,
  SlugConflictError,
} from "@/lib/data/admin-references";
import {
  ImageError,
  MAX_TOTAL_BYTES,
  processImage,
  type ProcessedImage,
} from "@/lib/images/process";
import { deleteImages, uploadImage } from "@/lib/storage/blob";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function refreshPublicPages() {
  revalidatePath("/", "layout");
}

/* ───────────── Sesión ───────────── */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  // Se conserva el correo escrito (React vacía el formulario tras cada envío); la contraseña, nunca.
  const typedEmail = formData.get("email");
  const generic: ActionState = {
    error: "Correo o contraseña incorrectos.",
    values: { email: typeof typedEmail === "string" ? typedEmail.slice(0, 254) : "" },
  };
  if (!parsed.success) return generic;

  const ok = await checkAdminCredentials(
    parsed.data.email,
    parsed.data.password,
  );
  if (!ok) {
    await sleep(500);
    return generic;
  }

  await startSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

/* ───────────── Referencias ───────────── */

function fileFrom(formData: FormData, name: string): File | null {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

export async function createReferenceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const values = Object.fromEntries(
    ["title", "description", "category", "alt", "status"].map((k) => [
      k,
      typeof formData.get(k) === "string" ? (formData.get(k) as string) : "",
    ]),
  );

  const parsed = createReferenceSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { fieldErrors, values };
  }

  const primaryFile = fileFrom(formData, "image");
  const hoverFile = fileFrom(formData, "hoverImage");
  if (!primaryFile) {
    return { fieldErrors: { image: "Elige una imagen." }, values };
  }
  if (primaryFile.size + (hoverFile?.size ?? 0) > MAX_TOTAL_BYTES) {
    return {
      error: "Las imágenes juntas no pueden superar 4 MB. Reduce su tamaño.",
      values,
    };
  }

  let primary: ProcessedImage;
  let hover: ProcessedImage | null = null;
  try {
    primary = await processImage(Buffer.from(await primaryFile.arrayBuffer()));
    if (hoverFile) {
      hover = await processImage(Buffer.from(await hoverFile.arrayBuffer()));
    }
  } catch (error) {
    if (error instanceof ImageError) {
      return { fieldErrors: { image: error.message }, values };
    }
    throw error;
  }

  const uploaded: string[] = [];
  try {
    const id = randomBytes(4).toString("hex");
    const a = await uploadImage(primary.data, `ref-${id}-a`);
    uploaded.push(a.url);
    const b = hover ? await uploadImage(hover.data, `ref-${id}-b`) : null;
    if (b) uploaded.push(b.url);

    const base = {
      alt: parsed.data.alt,
      mimeType: primary.mimeType,
    };
    await createReference(
      parsed.data,
      {
        ...base,
        url: a.url,
        storageKey: a.pathname,
        width: primary.width,
        height: primary.height,
        sizeBytes: primary.sizeBytes,
      },
      hover && b
        ? {
            ...base,
            alt: `${parsed.data.alt} (segunda imagen)`,
            url: b.url,
            storageKey: b.pathname,
            width: hover.width,
            height: hover.height,
            sizeBytes: hover.sizeBytes,
          }
        : null,
    );
  } catch (error) {
    await deleteImages(uploaded); // no dejar archivos huérfanos
    console.error("Error al crear la referencia", error);
    if (error instanceof SlugConflictError) {
      return {
        error: "Ya existe una referencia con ese título. Inténtalo de nuevo.",
        values,
      };
    }
    return {
      error: "No se ha podido guardar la referencia. Inténtalo de nuevo.",
      values,
    };
  }

  refreshPublicPages();
  return { ok: true };
}

export async function toggleStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  const status = formData.get("status") === "published" ? "published" : "draft";
  if (!id.success) return;
  await setReferenceStatus(id.data, status);
  refreshPublicPages();
}

export async function deleteReferenceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  const urls = await deleteReference(id.data);
  await deleteImages(urls);
  refreshPublicPages();
}
