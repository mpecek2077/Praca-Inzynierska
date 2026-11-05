import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const brands = await prisma.brand.findMany({
  orderBy: { name: "asc" },
  include: {
    models: {
      include: {
        generations: {
          include: { parts: true },
        },
      },
    },
  },
});

for (const brand of brands) {
  console.log(`Brand: ${brand.name}`);
  for (const model of brand.models) {
    console.log(`  Model: ${model.name}`);
    for (const generation of model.generations) {
      console.log(
        `    Gen: ${generation.name} (${generation.parts.length} parts)`,
      );
      for (const part of generation.parts) {
        console.log(`      - ${part.name} @ ${part.pricePln}`);
      }
    }
  }
}

await prisma.$disconnect();
