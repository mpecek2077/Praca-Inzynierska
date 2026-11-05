"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export type AdminActionState = {
  error?: string;
  success?: string;
};

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

const assetUrlSchema = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value ||
        value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://"),
      `${label}: ścieżka lokalna (/…) lub http(s)`,
    );

const partSchema = z.object({
  name: z.string().trim().min(2, "Podaj nazwę (min. 2 znaki)"),
  description: z.string().trim().optional(),
  pricePln: z.coerce.number().positive("Cena musi być większa od 0"),
  generationId: z.string().min(1, "Wybierz generację"),
  slug: z.string().trim().optional(),
  imageUrl: assetUrlSchema("URL zdjęcia"),
  modelUrl: assetUrlSchema("URL modelu 3D"),
});

export async function createPartAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await assertAdmin())) {
    return { error: "Brak uprawnień administratora." };
  }

  const parsed = partSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    pricePln: formData.get("pricePln"),
    generationId: formData.get("generationId"),
    slug: formData.get("slug") || undefined,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || undefined,
    modelUrl: String(formData.get("modelUrl") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Błędne dane" };
  }

  const generation = await prisma.generation.findUnique({
    where: { id: parsed.data.generationId },
  });
  if (!generation) {
    return { error: "Wybrana generacja nie istnieje." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) {
    return { error: "Nie udało się utworzyć sluga z nazwy." };
  }

  const existing = await prisma.part.findUnique({
    where: {
      generationId_slug: {
        generationId: parsed.data.generationId,
        slug,
      },
    },
  });
  if (existing) {
    return { error: "Część o tym slugu już istnieje w tej generacji." };
  }

  const part = await prisma.part.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      pricePln: parsed.data.pricePln,
      imageUrl: parsed.data.imageUrl || null,
      modelUrl: parsed.data.modelUrl || null,
      generationId: parsed.data.generationId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/czesci");
  revalidatePath("/konfigurator");
  redirect(`/admin/czesci/${part.id}`);
}

export async function updatePartAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await assertAdmin())) {
    return { error: "Brak uprawnień administratora." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Brak ID części." };
  }

  const parsed = partSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    pricePln: formData.get("pricePln"),
    generationId: formData.get("generationId"),
    slug: formData.get("slug") || undefined,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || undefined,
    modelUrl: String(formData.get("modelUrl") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Błędne dane" };
  }

  const current = await prisma.part.findUnique({ where: { id } });
  if (!current) {
    return { error: "Część nie istnieje." };
  }

  const generation = await prisma.generation.findUnique({
    where: { id: parsed.data.generationId },
  });
  if (!generation) {
    return { error: "Wybrana generacja nie istnieje." };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) {
    return { error: "Nie udało się utworzyć sluga z nazwy." };
  }

  const conflict = await prisma.part.findFirst({
    where: {
      generationId: parsed.data.generationId,
      slug,
      NOT: { id },
    },
  });
  if (conflict) {
    return { error: "Część o tym slugu już istnieje w tej generacji." };
  }

  await prisma.part.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      pricePln: parsed.data.pricePln,
      imageUrl: parsed.data.imageUrl || null,
      modelUrl: parsed.data.modelUrl || null,
      generationId: parsed.data.generationId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/czesci");
  revalidatePath(`/admin/czesci/${id}`);
  revalidatePath("/konfigurator");
  return { success: "Zapisano zmiany." };
}

export async function archivePartAction(formData: FormData): Promise<void> {
  if (!(await assertAdmin())) {
    throw new Error("Brak uprawnień administratora.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Brak ID części.");
  }

  await prisma.part.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/czesci");
  revalidatePath("/konfigurator");
}

export async function restorePartAction(formData: FormData): Promise<void> {
  if (!(await assertAdmin())) {
    throw new Error("Brak uprawnień administratora.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Brak ID części.");
  }

  await prisma.part.update({
    where: { id },
    data: { archivedAt: null },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/czesci");
  revalidatePath(`/admin/czesci/${id}`);
  revalidatePath("/konfigurator");
}

/** Twarde usunięcie tylko gdy część nie występuje w żadnym OrderItem. */
export async function deletePartAction(formData: FormData): Promise<void> {
  if (!(await assertAdmin())) {
    throw new Error("Brak uprawnień administratora.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Brak ID części.");
  }

  const usedCount = await prisma.orderItem.count({ where: { partId: id } });
  if (usedCount > 0) {
    throw new Error(
      "Część jest użyta w zamówieniach - możesz tylko archiwizować.",
    );
  }

  await prisma.part.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/admin/czesci");
  revalidatePath("/konfigurator");
  redirect("/admin/czesci");
}

const statusSchema = z.nativeEnum(OrderStatus);

export async function updateOrderStatusAction(
  formData: FormData,
): Promise<void> {
  if (!(await assertAdmin())) {
    throw new Error("Brak uprawnień administratora.");
  }

  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const parsed = statusSchema.safeParse(statusRaw);

  if (!id || !parsed.success) {
    throw new Error("Nieprawidłowy status lub ID zamówienia.");
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new Error("Zamówienie nie istnieje.");
  }

  await prisma.order.update({
    where: { id },
    data: { status: parsed.data },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/zamowienia");
  revalidatePath(`/zamowienie/${id}`);
  revalidatePath("/zamowienia");
}
