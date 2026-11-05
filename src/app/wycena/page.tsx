import { WycenaForm } from "@/components/wycena-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function WycenaPage() {
  const session = await auth();
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      models: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });

  return (
    <section>
      <h1>Wycena części</h1>
      <p className="lead">
        Wybierz auto i parametry wydruku - od razu zobaczysz orientacyjną cenę.
        Po wysłaniu skontaktujemy się z potwierdzeniem.
      </p>
      <WycenaForm
        brands={brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          models: brand.models,
        }))}
        isLoggedIn={Boolean(session?.user?.id)}
      />
    </section>
  );
}
