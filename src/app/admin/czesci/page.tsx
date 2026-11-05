import Link from "next/link";
import {
  archivePartAction,
  deletePartAction,
  restorePartAction,
} from "@/lib/admin-actions";
import { formatPricePln } from "@/lib/catalog-types";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PartThumb } from "@/components/part-thumb";
import { prisma } from "@/lib/prisma";

export default async function AdminPartsPage() {
  const parts = await prisma.part.findMany({
    orderBy: [{ archivedAt: "asc" }, { name: "asc" }],
    include: {
      generation: {
        include: {
          model: {
            include: { brand: true },
          },
        },
      },
      _count: { select: { orderItems: true } },
    },
  });

  return (
    <section>
      <div className="admin-page-head">
        <div>
          <h1>Części</h1>
          <p className="lead">Katalog części powiązanych z generacją pojazdu.</p>
        </div>
        <Link href="/admin/czesci/nowa" className="btn">
          Dodaj część
        </Link>
      </div>

      {parts.length === 0 ? (
        <div className="panel">
          <p className="muted">Brak części w bazie.</p>
        </div>
      ) : (
        <div className="panel">
          <ul className="admin-table">
            {parts.map((part) => {
              const vehicle = `${part.generation.model.brand.name} ${part.generation.model.name} / ${part.generation.name}`;
              const archived = Boolean(part.archivedAt);
              const canHardDelete = part._count.orderItems === 0;
              return (
                <li
                  key={part.id}
                  className={`admin-part-row${archived ? " is-archived" : ""}`}
                >
                  <div className="admin-part-main">
                    <PartThumb
                      src={part.imageUrl}
                      alt={part.name}
                      className="part-thumb-sm admin-part-thumb"
                    />
                    <div>
                      <Link href={`/admin/czesci/${part.id}`} className="order-link">
                        {part.name}
                      </Link>
                      <p className="muted">
                        {vehicle} ·{" "}
                        {formatPricePln(Number(part.pricePln.toString()))}
                        {archived ? " · zarchiwizowana" : ""}
                        {part._count.orderItems > 0
                          ? ` · w ${part._count.orderItems} zamów.`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    <Link
                      href={`/admin/czesci/${part.id}`}
                      className="btn btn-secondary"
                    >
                      Edytuj
                    </Link>
                    {archived ? (
                      <form action={restorePartAction}>
                        <input type="hidden" name="id" value={part.id} />
                        <button type="submit" className="btn-ghost">
                          Przywróć
                        </button>
                      </form>
                    ) : (
                      <form action={archivePartAction}>
                        <input type="hidden" name="id" value={part.id} />
                        <button type="submit" className="btn-ghost">
                          Archiwizuj
                        </button>
                      </form>
                    )}
                    {canHardDelete ? (
                      <form action={deletePartAction}>
                        <input type="hidden" name="id" value={part.id} />
                        <ConfirmSubmitButton
                          className="btn-ghost danger-text"
                          confirmMessage={`Usunąć trwale „${part.name}”?`}
                        >
                          Usuń
                        </ConfirmSubmitButton>
                      </form>
                    ) : (
                      <span
                        className="muted"
                        title="Część użyta w zamówieniach - tylko archiwizacja"
                      >
                        Usuń niedostępne
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
