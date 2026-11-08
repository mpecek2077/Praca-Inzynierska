import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero hero-home">
      <div className="hero-copy" data-enter>
        <h1>FLYDES</h1>
        <p>
          Prywatny kanał zamówień B2B: konfiguruj części z katalogu albo wyślij
          własny model do wyceny.
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
      <div className="hero-visual" data-enter>
        <Image
          src="/parts/spoiler.png"
          alt="Lotka aerodynamiczna z katalogu FLYDES"
          width={960}
          height={600}
          priority
          className="hero-visual-img"
        />
      </div>
    </section>
  );
}
