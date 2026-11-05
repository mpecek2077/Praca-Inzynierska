import { Configurator } from "@/components/configurator";
import { getCatalogTree } from "@/lib/catalog";

export default async function KonfiguratorPage() {
  const brands = await getCatalogTree();

  return (
    <section>
      <h1>Konfigurator</h1>
      <p className="lead">
        Wybierz pojazd krok po kroku: marka → model → generacja, a następnie
        dodaj kompatybilną część (lotka / spoiler) do koszyka.
      </p>
      <p className="muted catalog-disclaimer">
        Grafiki w katalogu są poglądowe (placeholdery). Nie pokazujemy oficjalnych
        logo ani znaków towarowych OEM — marki to inicjały i kolor w karcie.
      </p>
      <Configurator brands={brands} />
    </section>
  );
}
