import { prisma } from "@/lib/prisma";
import type { CatalogBrand } from "@/lib/catalog-types";

export type {
  CatalogBrand,
  CatalogGeneration,
  CatalogModel,
  CatalogPart,
} from "@/lib/catalog-types";

export {
  formatGenerationYears,
  formatPricePln,
} from "@/lib/catalog-types";

function toPrice(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

/** Pełne drzewo katalogu z bazy - seed jest mały, wystarczy jedno zapytanie. */
export async function getCatalogTree(): Promise<CatalogBrand[]> {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      models: {
        orderBy: { name: "asc" },
        include: {
          generations: {
            orderBy: { yearFrom: "asc" },
            include: {
              parts: {
                where: { archivedAt: null },
                orderBy: { name: "asc" },
              },
            },
          },
        },
      },
    },
  });

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    imageUrl: brand.imageUrl,
    models: brand.models.map((model) => ({
      id: model.id,
      name: model.name,
      slug: model.slug,
      imageUrl: model.imageUrl,
      generations: model.generations.map((generation) => ({
        id: generation.id,
        name: generation.name,
        slug: generation.slug,
        yearFrom: generation.yearFrom,
        yearTo: generation.yearTo,
        parts: generation.parts.map((part) => ({
          id: part.id,
          name: part.name,
          slug: part.slug,
          description: part.description,
          pricePln: toPrice(part.pricePln),
          imageUrl: part.imageUrl,
          modelUrl: part.modelUrl,
        })),
      })),
    })),
  }));
}
