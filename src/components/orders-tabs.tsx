import Link from "next/link";

export type OrdersTab = "active" | "done" | "rejected";

type OrdersTabsProps = {
  basePath: string;
  activeTab: OrdersTab;
  activeCount: number;
  doneCount: number;
  rejectedCount: number;
};

export function OrdersTabs({
  basePath,
  activeTab,
  activeCount,
  doneCount,
  rejectedCount,
}: OrdersTabsProps) {
  return (
    <div className="orders-tabs" role="tablist" aria-label="Filtr zamówień">
      <Link
        href={`${basePath}?tab=active`}
        className={activeTab === "active" ? "is-active" : undefined}
        role="tab"
        aria-selected={activeTab === "active"}
      >
        W trakcie ({activeCount})
      </Link>
      <Link
        href={`${basePath}?tab=done`}
        className={activeTab === "done" ? "is-active" : undefined}
        role="tab"
        aria-selected={activeTab === "done"}
      >
        Zakończone ({doneCount})
      </Link>
      <Link
        href={`${basePath}?tab=rejected`}
        className={activeTab === "rejected" ? "is-active" : undefined}
        role="tab"
        aria-selected={activeTab === "rejected"}
      >
        Odrzucone ({rejectedCount})
      </Link>
    </div>
  );
}

export function resolveOrdersTab(raw?: string): OrdersTab {
  if (raw === "done") return "done";
  if (raw === "rejected") return "rejected";
  return "active";
}
