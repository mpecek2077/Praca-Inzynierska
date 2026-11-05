import { prisma } from "@/lib/prisma";
import { formatGenerationYears } from "@/lib/catalog-types";

export type GenerationOption = {
  id: string;
  label: string;
};

export async function getGenerationOptions(): Promise<GenerationOption[]> {
  const generations = await prisma.generation.findMany({
    orderBy: [{ model: { brand: { name: "asc" } } }, { name: "asc" }],
    include: {
      model: {
        include: { brand: true },
      },
    },
  });

  return generations.map((generation) => {
    const years = formatGenerationYears(generation.yearFrom, generation.yearTo);
    const base = `${generation.model.brand.name} ${generation.model.name} / ${generation.name}`;
    return {
      id: generation.id,
      label: years ? `${base} (${years})` : base,
    };
  });
}
