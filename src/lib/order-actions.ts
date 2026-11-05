"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const cartItemSchema = z.object({
  partId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const placeOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Koszyk jest pusty"),
});

export type PlaceOrderState = {
  error?: string;
  orderId?: string;
};

function toPrice(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

export async function placeOrderAction(
  rawItems: unknown,
): Promise<PlaceOrderState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Musisz być zalogowany, aby złożyć zamówienie." };
  }

  const parsed = placeOrderSchema.safeParse(rawItems);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane koszyka",
    };
  }

  // Scal duplikaty partId (gdyby client wysłał dwa razy to samo)
  const quantityByPartId = new Map<string, number>();
  for (const item of parsed.data.items) {
    quantityByPartId.set(
      item.partId,
      (quantityByPartId.get(item.partId) ?? 0) + item.quantity,
    );
  }

  const partIds = [...quantityByPartId.keys()];
  const parts = await prisma.part.findMany({
    where: { id: { in: partIds } },
    select: { id: true, pricePln: true, name: true },
  });

  if (parts.length !== partIds.length) {
    const found = new Set(parts.map((part) => part.id));
    const missing = partIds.filter((id) => !found.has(id));
    return {
      error: `Część niedostępna w katalogu (id: ${missing[0]}). Odśwież koszyk i spróbuj ponownie.`,
    };
  }

  const lines = parts.map((part) => {
    const quantity = quantityByPartId.get(part.id)!;
    const unitPrice = toPrice(part.pricePln);
    return {
      partId: part.id,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });

  const totalPln = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      type: "CATALOG",
      status: "NEW",
      totalPln,
      items: {
        create: lines.map((line) => ({
          partId: line.partId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      },
    },
    select: { id: true },
  });

  return { orderId: order.id };
}
