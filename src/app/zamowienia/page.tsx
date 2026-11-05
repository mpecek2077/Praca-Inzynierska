import Link from "next/link";
import { redirect } from "next/navigation";
import { OrdersTabs, resolveOrdersTab } from "@/components/orders-tabs";
import { StatusBadge } from "@/components/status-badge";
import { auth } from "@/lib/auth";
import { formatPricePln } from "@/lib/catalog-types";
import {
  formatOrderDate,
  formatOrderIdShort,
  formatOrderListTitle,
} from "@/lib/order-labels";
import { prisma } from "@/lib/prisma";

type OrdersPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function OrdersListPage({ searchParams }: OrdersPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/zamowienia");
  }

  const tab = resolveOrdersTab((await searchParams).tab);

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          part: { select: { name: true } },
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
      <h1>Moje zamówienia</h1>
      <p className="lead">
        Zamówienia z konfiguratora i wyceny niestandardowe. Przy odrzuceniu
        zobaczysz notatkę.
      </p>

      {orders.length === 0 ? (
        <div className="panel">
          <p className="muted" style={{ marginBottom: "1rem" }}>
            Nie masz jeszcze zamówień.
          </p>
          <div className="actions">
            <Link href="/konfigurator" className="btn">
              Konfigurator
            </Link>
            <Link href="/wycena" className="btn btn-secondary">
              Wycena
            </Link>
          </div>
        </div>
      ) : (
        <>
          <OrdersTabs
            basePath="/zamowienia"
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
            <div className="panel">
              <ul className="orders-table">
                {visible.map((order) => {
                  const label = formatOrderListTitle(order);
                  const itemCount = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  );
                  return (
                    <li key={order.id}>
                      <div>
                        <Link
                          href={`/zamowienie/${order.id}`}
                          className="order-link"
                        >
                          {label.title}
                        </Link>
                        {label.detail && (
                          <p className="order-title-detail">{label.detail}</p>
                        )}
                        <p className="muted order-id-secondary">
                          {formatOrderDate(order.createdAt)}
                          {order.type === "CATALOG"
                            ? ` · ${itemCount} szt.`
                            : ""}
                          {" · "}
                          <span className="order-id-chip">
                            ID {formatOrderIdShort(order.id)}
                          </span>
                        </p>
                      </div>
                      <div className="orders-table-right">
                        <StatusBadge status={order.status} />
                        <strong>
                          {formatPricePln(Number(order.totalPln.toString()))}
                        </strong>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
