import Link from "next/link";
import { AdminPartForm } from "@/components/admin-part-form";
import { createPartAction } from "@/lib/admin-actions";
import { getGenerationOptions } from "@/lib/admin-catalog";

export default async function AdminNewPartPage() {
  const generations = await getGenerationOptions();

  return (
    <section>
      <h1>Nowa część</h1>
      <p className="lead">
        Dodaj lotkę / spoiler i powiąż z generacją pojazdu z katalogu.
      </p>
      <div className="panel">
        {generations.length === 0 ? (
          <p className="muted">
            Brak generacji w bazie - uruchom seed, zanim dodasz części.
          </p>
        ) : (
          <AdminPartForm
            mode="create"
            action={createPartAction}
            generations={generations}
          />
        )}
      </div>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/admin/czesci">← Wróć do listy</Link>
      </p>
    </section>
  );
}
