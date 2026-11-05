"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

const approveSchema = z.object({
  id: z.string().min(1),
  adjustedPrice: z.coerce.number().positive().optional(),
  adminNote: z.string().trim().optional(),
});

const rejectSchema = z.object({
  id: z.string().min(1),
  adminNote: z
    .string()
    .trim()
    .min(5, "Podaj notatkę dla klienta (co zmienić / dlaczego odrzucono)"),
  adjustedPrice: z.coerce.number().positive().optional(),
});

export type AdminCustomState = {
  error?: string;
  success?: string;
};

export async function approveCustomOrderAction(
  _prev: AdminCustomState,
  formData: FormData,
): Promise<AdminCustomState> {
  if (!(await assertAdmin())) {
    return { error: "Brak uprawnień." };
  }

  const adjustedRaw = String(formData.get("adjustedPrice") ?? "").trim();
  const parsed = approveSchema.safeParse({
    id: formData.get("id"),
    adjustedPrice: adjustedRaw ? adjustedRaw : undefined,
    adminNote: String(formData.get("adminNote") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Błędne dane" };
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.id } });
  if (!order || order.type !== "CUSTOM") {
    return { error: "To nie jest zamówienie custom." };
  }

  const totalPln = parsed.data.adjustedPrice ?? Number(order.totalPln.toString());

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "IN_PROGRESS",
      adjustedPrice: parsed.data.adjustedPrice ?? null,
      totalPln,
      adminNote: parsed.data.adminNote ?? order.adminNote,
    },
  });

  revalidatePath("/admin/zamowienia");
  revalidatePath(`/zamowienie/${order.id}`);
  revalidatePath("/zamowienia");
  return { success: "Zamówienie zatwierdzone (W realizacji)." };
}

export async function rejectCustomOrderAction(
  _prev: AdminCustomState,
  formData: FormData,
): Promise<AdminCustomState> {
  if (!(await assertAdmin())) {
    return { error: "Brak uprawnień." };
  }

  const adjustedRaw = String(formData.get("adjustedPrice") ?? "").trim();
  const parsed = rejectSchema.safeParse({
    id: formData.get("id"),
    adminNote: formData.get("adminNote"),
    adjustedPrice: adjustedRaw ? adjustedRaw : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Błędne dane" };
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.id } });
  if (!order || order.type !== "CUSTOM") {
    return { error: "To nie jest zamówienie custom." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "REJECTED",
      adminNote: parsed.data.adminNote,
      adjustedPrice: parsed.data.adjustedPrice ?? null,
      ...(parsed.data.adjustedPrice
        ? { totalPln: parsed.data.adjustedPrice }
        : {}),
    },
  });

  revalidatePath("/admin/zamowienia");
  revalidatePath(`/zamowienie/${order.id}`);
  revalidatePath("/zamowienia");
  return { success: "Zamówienie odrzucone - notatka widoczna dla klienta." };
}
