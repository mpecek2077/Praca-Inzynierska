import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { PartThumb } from "@/components/part-thumb";
import { StatusBadge } from "@/components/status-badge";
import { auth } from "@/lib/auth";
import { formatPricePln } from "@/lib/catalog-types";
import {
  formatOrderDate,
  formatOrderListTitle,
} from "@/lib/order-labels";
import {
  COMPLEXITY_LABELS,
  FINISH_LABELS,
  MATERIAL_LABELS,
  QUALITY_LABELS,
  type Complexity,
  type Finish,
  type Material,
  type Quality,
} from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

type CustomPayload = {
  brandName?: string;
  modelName?: string;
  description?: string;
  complexity?: number;
  material?: string;
  volumeCm3?: number;
  infill?: number;
  quality?: string;
  finish?: string;
  estimatedPrice?: number;
  modelFileName?: string;
  modelFilePath?: string;
  modelFileSize?: number;
};

function asPayload(value: Prisma.JsonValue | null): CustomPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as CustomPayload;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    const { id } = await params;
    redirect(`/login?callbackUrl=${encodeURIComponent(`/zamowienie/${id}`)}`);
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          part: {
            select: { name: true, imageUrl: true },
          },
        },
      },
    },
  });

  const isOwner = order?.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!order || (!isOwner && !isAdmin)) {
    notFound();
  }

  const payload = asPayload(order.customPayload);
  const label = formatOrderListTitle(order);

  return (
    <section>
      <h1>{label.title}</h1>
      <p className="lead">
        {label.detail
          ? label.detail
          : order.type === "CUSTOM"
            ? "Szczegóły wyceny niestandardowej."
            : "Potwierdzenie zamówienia z konfiguratora."}{" "}
        Status śledzisz w „Moje zamówienia”.
      </p>

      <div className="panel">
        <div className="order-meta">
          <p className="order-id-secondary">
            <span className="muted">Numer:</span>{" "}
            <code className="order-id">{order.id}</code>
          </p>
          <p>
            <span className="muted">Data:</span> {formatOrderDate(order.createdAt)}
          </p>
          <p>
            <span className="muted">Status:</span>{" "}
            <StatusBadge status={order.status} />
          </p>
          <p>
            <span className="muted">Suma:</span>{" "}
            <strong className="part-price">
              {formatPricePln(Number(order.totalPln.toString()))}
            </strong>
            {order.adjustedPrice && payload.estimatedPrice
              ? ` (skorygowana z szacunku ${formatPricePln(payload.estimatedPrice)})`
              : order.adjustedPrice
                ? " (cena skorygowana przez admina)"
                : ""}
          </p>
        </div>

        {order.adminNote && (
          <div
            className={`alert ${order.status === "REJECTED" ? "alert-error" : "alert-ok"}`}
            style={{ marginTop: "1rem" }}
          >
            <strong>Notatka admina:</strong> {order.adminNote}
          </div>
        )}

        {order.type === "CATALOG" && (
          <>
            <h2 style={{ marginTop: "1.25rem", marginBottom: "0.75rem" }}>
              Pozycje
            </h2>
            <ul className="order-lines with-thumbs">
              {order.items.map((item) => (
                <li key={item.id}>
                  <div className="order-line-main">
                    <PartThumb
                      src={item.part.imageUrl}
                      alt={item.part.name}
                      className="part-thumb-xs"
                    />
                    <span>
                      {item.part.name} × {item.quantity}
                    </span>
                  </div>
                  <span>
                    {formatPricePln(
                      Number(item.unitPrice.toString()) * item.quantity,
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {order.type === "CUSTOM" && (
          <>
            <h2 style={{ marginTop: "1.25rem", marginBottom: "0.75rem" }}>
              Parametry wyceny
            </h2>
            <dl className="custom-payload-dl">
              <div>
                <dt>Pojazd</dt>
                <dd>
                  {payload.brandName} {payload.modelName}
                </dd>
              </div>
              <div>
                <dt>Opis</dt>
                <dd>{payload.description}</dd>
              </div>
              <div>
                <dt>Specyfikacja</dt>
                <dd>
                  {MATERIAL_LABELS[(payload.material as Material) ?? "PLA"]} ·{" "}
                  {payload.volumeCm3} cm³ · wypełnienie {payload.infill}% ·{" "}
                  {QUALITY_LABELS[(payload.quality as Quality) ?? "standard"]} ·{" "}
                  {FINISH_LABELS[(payload.finish as Finish) ?? "raw"]} ·
                  geometria{" "}
                  {COMPLEXITY_LABELS[
                    (payload.complexity as Complexity) ?? 2
                  ] ?? payload.complexity}{" "}
                  (info)
                </dd>
              </div>
              <div>
                <dt>Plik modelu</dt>
                <dd>
                  {payload.modelFilePath ? (
                    <a
                      href={payload.modelFilePath}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {payload.modelFileName ?? payload.modelFilePath}
                    </a>
                  ) : (
                    <span className="muted">Brak pliku</span>
                  )}
                </dd>
              </div>
            </dl>
          </>
        )}
      </div>

      <div className="actions" style={{ marginTop: "1.25rem" }}>
        <Link href="/zamowienia" className="btn">
          Moje zamówienia
        </Link>
        <Link href="/konfigurator" className="btn btn-secondary">
          Konfigurator
        </Link>
        <Link href="/wycena" className="btn btn-secondary">
          Nowa wycena
        </Link>
      </div>
    </section>
  );
}
