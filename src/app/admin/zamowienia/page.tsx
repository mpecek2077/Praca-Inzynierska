import Link from "next/link";
import { AdminCustomReview } from "@/components/admin-custom-review";
import { AdminOrderStatusForm } from "@/components/admin-order-status-form";
import { OrdersTabs, resolveOrdersTab } from "@/components/orders-tabs";
import { PartThumb } from "@/components/part-thumb";
import { StatusBadge } from "@/components/status-badge";
import { formatPricePln } from "@/lib/catalog-types";
import {
  formatOrderDate,
  formatOrderIdShort,
  formatOrderListTitle,
  formatOrderType,
} from "@/lib/order-labels";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type AdminOrdersPageProps = {
  searchParams: Promise<{ tab?: string }>;
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
};

function asPayload(value: Prisma.JsonValue | null): CustomPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as CustomPayload;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const tab = resolveOrdersTab((await searchParams).tab);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      items: {
        include: {
          part: { select: { name: true, imageUrl: true } },
        },
      },
    },
  });

  const activeOrders = orders.filter(
    (order) => order.status === "NEW" || order.status === "IN_PROGRESS",
  );
  const doneOrders = orders.filter((order) => order.status === "COMPLETED");
  const rejectedOrders = orders.filter((order) => order.status === "REJECTED");
  const visible =
    tab === "done"
      ? doneOrders
      : tab === "rejected"
        ? rejectedOrders
        : activeOrders;

  return (
    <section>
      <h1>Zamówienia</h1>
      <p className="lead">
        Katalog i wyceny custom. Custom: zatwierdź lub odrzuć z notatką.
      </p>

      {orders.length === 0 ? (
        <div className="panel">
          <p className="muted">Brak zamówień w bazie.</p>
        </div>
      ) : (
        <>
          <OrdersTabs
            basePath="/admin/zamowienia"
            activeTab={tab}
            activeCount={activeOrders.length}
            doneCount={doneOrders.length}
            rejectedCount={rejectedOrders.length}
          />
          {visible.length === 0 ? (
            <div className="panel">
              <p className="muted">Brak zamówień w tej sekcji.</p>
            </div>
          ) : (
            <div className="stack">
              {visible.map((order) => {
                const payload = asPayload(order.customPayload);
                const isCustom = order.type === "CUSTOM";
                const label = formatOrderListTitle(order);
                return (
                  <article
                    key={order.id}
                    className={`panel admin-order-card${isCustom ? " is-custom" : ""}`}
                  >
                    {isCustom && (
                      <span className="order-type-badge order-type-badge-custom">
                        Custom
                      </span>
                    )}
                    <div className="admin-order-head">
                      <div>
                        <h2>
                          <Link href={`/zamowienie/${order.id}`}>
                            {label.title}
                          </Link>
                          {!isCustom && (
                            <span
                              className={`type-pill type-${order.type.toLowerCase()}`}
                            >
                              {formatOrderType(order.type)}
                            </span>
                          )}
                        </h2>
                        {label.detail && (
                          <p className="order-title-detail">{label.detail}</p>
                        )}
                        <p className="muted order-id-secondary">
                          {formatOrderDate(order.createdAt)} · {order.user.email}{" "}
                          ·{" "}
                          <span className="order-id-chip">
                            ID {formatOrderIdShort(order.id)}
                          </span>
                        </p>
                        <p>
                          <StatusBadge status={order.status} /> · Suma:{" "}
                          <strong>
                            {formatPricePln(Number(order.totalPln.toString()))}
                          </strong>
                        </p>
                      </div>
                      {order.type === "CATALOG" && (
                        <AdminOrderStatusForm
                          orderId={order.id}
                          currentStatus={order.status}
                        />
                      )}
                    </div>

                    {order.type === "CATALOG" && (
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
                    )}

                    {order.type === "CUSTOM" && order.status === "NEW" && (
                      <AdminCustomReview
                        orderId={order.id}
                        payload={payload}
                        totalPln={Number(order.totalPln.toString())}
                      />
                    )}

                    {order.type === "CUSTOM" && order.status !== "NEW" && (
                      <div className="custom-admin-summary">
                        <p className="muted">
                          {payload.brandName} {payload.modelName} -{" "}
                          {payload.description}
                          {order.adminNote
                            ? ` · Notatka: ${order.adminNote}`
                            : ""}
                        </p>
                        {order.status === "IN_PROGRESS" && (
                          <AdminOrderStatusForm
                            orderId={order.id}
                            currentStatus={order.status}
                          />
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
