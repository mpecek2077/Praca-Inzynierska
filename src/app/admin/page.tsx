import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [partsActive, partsArchived, ordersNew, ordersTotal] = await Promise.all([
    prisma.part.count({ where: { archivedAt: null } }),
    prisma.part.count({ where: { archivedAt: { not: null } } }),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.count(),
  ]);

  return (
    <section>
      <h1>Panel administratora</h1>
      <p className="lead">
        Zarządzanie katalogiem części i statusami zamówień. Dostęp tylko dla roli
        ADMIN.
      </p>

      <div className="grid-2">
        <div className="panel">
          <h2>Części</h2>
          <p className="muted">
            Aktywne: <strong>{partsActive}</strong>
            {partsArchived > 0 ? ` · zarchiwizowane: ${partsArchived}` : ""}
          </p>
          <div className="actions" style={{ marginTop: "1rem" }}>
            <Link href="/admin/czesci" className="btn">
              Lista części
            </Link>
            <Link href="/admin/czesci/nowa" className="btn btn-secondary">
              Dodaj część
            </Link>
          </div>
        </div>

        <div className="panel">
          <h2>Zamówienia</h2>
          <p className="muted">
            Wszystkie: <strong>{ordersTotal}</strong> · nowe:{" "}
            <strong>{ordersNew}</strong>
          </p>
          <div className="actions" style={{ marginTop: "1rem" }}>
            <Link href="/admin/zamowienia" className="btn">
              Lista zamówień
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
