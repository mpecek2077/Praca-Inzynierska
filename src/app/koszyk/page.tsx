import { CartView } from "@/components/cart-view";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function KoszykPage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <section>
      <h1>Koszyk</h1>
      <p className="lead">Sprawdź pozycje i złóż zamówienie.</p>
      <CartView isLoggedIn={isLoggedIn} />
    </section>
  );
}
