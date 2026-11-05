import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <section className="hero">
      <h1>FLYDES</h1>
      <p>
        Wybierz części do samochodu z katalogu albo wyślij własny model do wyceny
        i zamówienia.
      </p>
      <div className="actions">
        <Link href="/konfigurator" className="btn">
          Konfigurator
        </Link>
        <Link href="/wycena" className="btn btn-secondary">
          Wycena
        </Link>
        {session?.user ? (
          <Link href="/zamowienia" className="btn btn-secondary">
            Konto
          </Link>
        ) : (
          <Link href="/login" className="btn btn-secondary">
            Logowanie
          </Link>
        )}
      </div>
    </section>
  );
}
