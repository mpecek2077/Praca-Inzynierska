import type { OrderStatus, OrderType, Prisma } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Nowe",
  IN_PROGRESS: "W realizacji",
  COMPLETED: "Zakończone",
  REJECTED: "Odrzucone",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  CATALOG: "Katalog",
  CUSTOM: "Custom",
};

export function formatOrderStatus(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function formatOrderType(type: OrderType): string {
  return ORDER_TYPE_LABELS[type] ?? type;
}

export function formatOrderDate(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatOrderIdShort(id: string, length = 8): string {
  if (id.length <= length) return id;
  return `${id.slice(0, length)}…`;
}

type CustomPayloadFields = {
  description?: string;
  brandName?: string;
  modelName?: string;
};

function asCustomFields(value: Prisma.JsonValue | null | undefined): CustomPayloadFields {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as CustomPayloadFields;
}

function shortenText(text: string, max = 72): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export type OrderTitleInput = {
  type: OrderType;
  items?: Array<{ part?: { name: string } | null }>;
  customPayload?: Prisma.JsonValue | null;
};

export type OrderTitle = {
  title: string;
  detail?: string;
};

/** Sensowna etykieta na listach zamówień (bez ID w tytule). */
export function formatOrderListTitle(order: OrderTitleInput): OrderTitle {
  if (order.type === "CUSTOM") {
    const payload = asCustomFields(order.customPayload);
    const bits = [
      payload.brandName,
      payload.modelName,
      payload.description,
    ].filter((value): value is string => Boolean(value?.trim()));

    return {
      title: "Wycena niestandardowa",
      detail: bits.length > 0 ? shortenText(bits.join(" · ")) : undefined,
    };
  }

  const names = (order.items ?? [])
    .map((item) => item.part?.name?.trim())
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) {
    return { title: "Zamówienie z konfiguratora" };
  }

  const first = names[0];
  const extra = names.length - 1;
  if (extra > 0) {
    return { title: `${first} i ${extra} więcej` };
  }

  return { title: first };
}
