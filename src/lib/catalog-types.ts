export type CatalogPart = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricePln: number;
  imageUrl: string | null;
  modelUrl: string | null;
};

export type CatalogGeneration = {
  id: string;
  name: string;
  slug: string;
  yearFrom: number | null;
  yearTo: number | null;
  parts: CatalogPart[];
};

export type CatalogModel = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  generations: CatalogGeneration[];
};

export type CatalogBrand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  models: CatalogModel[];
};

export function formatGenerationYears(
  yearFrom: number | null,
  yearTo: number | null,
): string | null {
  if (yearFrom && yearTo) {
    return `${yearFrom}-${yearTo}`;
  }
  if (yearFrom && !yearTo) {
    return `od ${yearFrom}`;
  }
  if (!yearFrom && yearTo) {
    return `do ${yearTo}`;
  }
  return null;
}

export function formatPricePln(price: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(price);
}
