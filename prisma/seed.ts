import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@flydes.local" },
    update: {},
    create: {
      email: "admin@flydes.local",
      name: "Administrator",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "user@flydes.local" },
    update: {},
    create: {
      email: "user@flydes.local",
      name: "Użytkownik demo",
      passwordHash: userPassword,
      role: Role.USER,
    },
  });

  // Marki: bez imageUrl / logo OEM — UI pokazuje inicjały + kolor.
  const bmw = await prisma.brand.upsert({
    where: { slug: "bmw" },
    update: { imageUrl: null },
    create: { name: "BMW", slug: "bmw", imageUrl: null },
  });

  const audi = await prisma.brand.upsert({
    where: { slug: "audi" },
    update: { imageUrl: null },
    create: { name: "Audi", slug: "audi", imageUrl: null },
  });

  const vw = await prisma.brand.upsert({
    where: { slug: "volkswagen" },
    update: { imageUrl: null },
    create: {
      name: "Volkswagen",
      slug: "volkswagen",
      imageUrl: null,
    },
  });

  const toyota = await prisma.brand.upsert({
    where: { slug: "toyota" },
    update: { imageUrl: null },
    create: { name: "Toyota", slug: "toyota", imageUrl: null },
  });

  const mercedes = await prisma.brand.upsert({
    where: { slug: "mercedes" },
    update: { imageUrl: null },
    create: { name: "Mercedes", slug: "mercedes", imageUrl: null },
  });

  const honda = await prisma.brand.upsert({
    where: { slug: "honda" },
    update: { imageUrl: null },
    create: { name: "Honda", slug: "honda", imageUrl: null },
  });

  const ford = await prisma.brand.upsert({
    where: { slug: "ford" },
    update: { imageUrl: null },
    create: { name: "Ford", slug: "ford", imageUrl: null },
  });

  // Modele: lokalne ilustracje sylwetki (SVG) — bez logo OEM.
  const m3 = await prisma.model.upsert({
    where: { brandId_slug: { brandId: bmw.id, slug: "m3" } },
    update: { imageUrl: "/parts/model-m3.svg" },
    create: {
      name: "M3",
      slug: "m3",
      brandId: bmw.id,
      imageUrl: "/parts/model-m3.svg",
    },
  });

  const a4 = await prisma.model.upsert({
    where: { brandId_slug: { brandId: audi.id, slug: "a4" } },
    update: { imageUrl: "/parts/model-a4.svg" },
    create: {
      name: "A4",
      slug: "a4",
      brandId: audi.id,
      imageUrl: "/parts/model-a4.svg",
    },
  });

  const golf = await prisma.model.upsert({
    where: { brandId_slug: { brandId: vw.id, slug: "golf" } },
    update: { imageUrl: "/parts/model-golf.svg" },
    create: {
      name: "Golf",
      slug: "golf",
      brandId: vw.id,
      imageUrl: "/parts/model-golf.svg",
    },
  });

  const supra = await prisma.model.upsert({
    where: { brandId_slug: { brandId: toyota.id, slug: "supra" } },
    update: { imageUrl: "/parts/model-supra.svg" },
    create: {
      name: "Supra",
      slug: "supra",
      brandId: toyota.id,
      imageUrl: "/parts/model-supra.svg",
    },
  });

  const cClass = await prisma.model.upsert({
    where: { brandId_slug: { brandId: mercedes.id, slug: "c-class" } },
    update: { imageUrl: "/parts/model-c-class.svg" },
    create: {
      name: "C-Class",
      slug: "c-class",
      brandId: mercedes.id,
      imageUrl: "/parts/model-c-class.svg",
    },
  });

  const civic = await prisma.model.upsert({
    where: { brandId_slug: { brandId: honda.id, slug: "civic" } },
    update: { imageUrl: "/parts/model-civic.svg" },
    create: {
      name: "Civic",
      slug: "civic",
      brandId: honda.id,
      imageUrl: "/parts/model-civic.svg",
    },
  });

  const mustang = await prisma.model.upsert({
    where: { brandId_slug: { brandId: ford.id, slug: "mustang" } },
    update: { imageUrl: "/parts/model-mustang.svg" },
    create: {
      name: "Mustang",
      slug: "mustang",
      brandId: ford.id,
      imageUrl: "/parts/model-mustang.svg",
    },
  });

  const focus = await prisma.model.upsert({
    where: { brandId_slug: { brandId: ford.id, slug: "focus" } },
    update: { imageUrl: "/parts/model-focus.svg" },
    create: {
      name: "Focus",
      slug: "focus",
      brandId: ford.id,
      imageUrl: "/parts/model-focus.svg",
    },
  });

  const m3G80 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: m3.id, slug: "g80" } },
    update: {},
    create: {
      name: "G80",
      slug: "g80",
      yearFrom: 2020,
      yearTo: null,
      modelId: m3.id,
    },
  });

  const m3F80 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: m3.id, slug: "f80" } },
    update: {},
    create: {
      name: "F80",
      slug: "f80",
      yearFrom: 2014,
      yearTo: 2020,
      modelId: m3.id,
    },
  });

  const a4B9 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: a4.id, slug: "b9" } },
    update: {},
    create: {
      name: "B9",
      slug: "b9",
      yearFrom: 2015,
      yearTo: 2023,
      modelId: a4.id,
    },
  });

  const golfMk8 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: golf.id, slug: "mk8" } },
    update: {},
    create: {
      name: "Mk8",
      slug: "mk8",
      yearFrom: 2019,
      yearTo: null,
      modelId: golf.id,
    },
  });

  const supraA90 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: supra.id, slug: "a90" } },
    update: {},
    create: {
      name: "A90",
      slug: "a90",
      yearFrom: 2019,
      yearTo: null,
      modelId: supra.id,
    },
  });

  const cClassW206 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: cClass.id, slug: "w206" } },
    update: {},
    create: {
      name: "W206",
      slug: "w206",
      yearFrom: 2021,
      yearTo: null,
      modelId: cClass.id,
    },
  });

  const civicFl5 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: civic.id, slug: "fl5" } },
    update: {},
    create: {
      name: "FL5",
      slug: "fl5",
      yearFrom: 2022,
      yearTo: null,
      modelId: civic.id,
    },
  });

  const civicFk8 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: civic.id, slug: "fk8" } },
    update: {},
    create: {
      name: "FK8",
      slug: "fk8",
      yearFrom: 2017,
      yearTo: 2021,
      modelId: civic.id,
    },
  });

  const mustangS550 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: mustang.id, slug: "s550" } },
    update: {},
    create: {
      name: "S550",
      slug: "s550",
      yearFrom: 2015,
      yearTo: 2023,
      modelId: mustang.id,
    },
  });

  const focusMk4 = await prisma.generation.upsert({
    where: { modelId_slug: { modelId: focus.id, slug: "mk4" } },
    update: {},
    create: {
      name: "Mk4",
      slug: "mk4",
      yearFrom: 2018,
      yearTo: null,
      modelId: focus.id,
    },
  });

  const parts = [
    {
      name: "Lotka dachowa G80",
      slug: "lotka-dachowa-g80",
      description: "Lotka dachowa w stylu CSL do BMW M3 G80.",
      pricePln: 890,
      imageUrl: "/parts/lotka.svg",
      modelUrl: "/models/universal_spoiler_1.glb",
      generationId: m3G80.id,
    },
    {
      name: "Spoiler tylny G80",
      slug: "spoiler-tylny-g80",
      description: "Spoiler krawędziowy bagażnika BMW M3 G80.",
      pricePln: 650,
      imageUrl: "/parts/spoiler.svg",
      modelUrl: "/models/car_spoiler.glb",
      generationId: m3G80.id,
    },
    {
      name: "Lotka dachowa F80",
      slug: "lotka-dachowa-f80",
      description: "Lotka dachowa do BMW M3 F80.",
      pricePln: 790,
      imageUrl: "/parts/lotka.svg",
      modelUrl: "/models/universal_spoiler_1.glb",
      generationId: m3F80.id,
    },
    {
      name: "Spoiler A4 B9",
      slug: "spoiler-a4-b9",
      description: "Spoiler tylny Audi A4 B9 Sedan.",
      pricePln: 520,
      imageUrl: "/parts/spoiler.svg",
      modelUrl: "/models/car_spoiler.glb",
      generationId: a4B9.id,
    },
    {
      name: "Lotka Golf Mk8",
      slug: "lotka-golf-mk8",
      description: "Lotka dachowa Volkswagen Golf Mk8.",
      pricePln: 480,
      imageUrl: "/parts/lotka.svg",
      modelUrl: "/models/universal_spoiler_1.glb",
      generationId: golfMk8.id,
    },
    {
      name: "Spoiler Golf Mk8 GTI",
      slug: "spoiler-golf-mk8-gti",
      description: "Spoiler w stylu GTI do Golfa Mk8.",
      pricePln: 560,
      imageUrl: "/parts/spoiler.svg",
      modelUrl: "/models/drag_spoiler.glb",
      generationId: golfMk8.id,
    },
    {
      name: "Lotka dachowa Supra A90",
      slug: "lotka-dachowa-supra-a90",
      description: "Lotka dachowa do Toyota Supra A90.",
      pricePln: 920,
      imageUrl: "/parts/lotka.svg",
      modelUrl: "/models/universal_spoiler_1.glb",
      generationId: supraA90.id,
    },
    {
      name: "Spoiler tylny Supra A90",
      slug: "spoiler-tylny-supra-a90",
      description: "Spoiler krawędziowy bagażnika Toyota Supra A90.",
      pricePln: 740,
      imageUrl: "/parts/spoiler.svg",
      modelUrl: "/models/car_spoiler.glb",
      generationId: supraA90.id,
    },
    {
      name: "Spoiler C-Class W206",
      slug: "spoiler-c-class-w206",
      description: "Spoiler tylny Mercedes C-Class W206 Sedan.",
      pricePln: 610,
      imageUrl: "/parts/spoiler.svg",
      modelUrl: "/models/car_spoiler.glb",
      generationId: cClassW206.id,
    },
    {
      name: "Lotka Civic FL5",
      slug: "lotka-civic-fl5",
      description: "Lotka dachowa Honda Civic Type R FL5.",
      pricePln: 680,
      imageUrl: "/parts/lotka.svg",
      modelUrl: "/models/universal_spoiler_1.glb",
      generationId: civicFl5.id,
    },
    {
      name: "Spoiler Civic FL5",
      slug: "spoiler-civic-fl5",
      description: "Spoiler tylny Honda Civic Type R FL5.",
      pricePln: 720,
      imageUrl: "/parts/spoiler.svg",
      modelUrl: "/models/drag_spoiler.glb",
      generationId: civicFl5.id,
    },
    {
      name: "Lotka Civic FK8",
      slug: "lotka-civic-fk8",
      description: "Lotka dachowa Honda Civic Type R FK8.",
      pricePln: 640,
      imageUrl: "/parts/lotka.svg",
      modelUrl: "/models/universal_spoiler_1.glb",
      generationId: civicFk8.id,
    },
    {
      name: "Spoiler Mustang S550",
      slug: "spoiler-mustang-s550",
      description: "Spoiler drag-style do Ford Mustang S550.",
      pricePln: 980,
      imageUrl: "/parts/spoiler.svg",
      modelUrl: "/models/drag_spoiler.glb",
      generationId: mustangS550.id,
    },
    {
      name: "Lotka Focus Mk4",
      slug: "lotka-focus-mk4",
      description: "Lotka dachowa Ford Focus Mk4.",
      pricePln: 450,
      imageUrl: "/parts/lotka.svg",
      modelUrl: "/models/universal_spoiler_1.glb",
      generationId: focusMk4.id,
    },
    {
      name: "Spoiler Focus Mk4 ST",
      slug: "spoiler-focus-mk4-st",
      description: "Spoiler w stylu ST do Ford Focus Mk4.",
      pricePln: 530,
      imageUrl: "/parts/spoiler.svg",
      modelUrl: "/models/car_spoiler.glb",
      generationId: focusMk4.id,
    },
  ] as const;

  for (const part of parts) {
    await prisma.part.upsert({
      where: {
        generationId_slug: {
          generationId: part.generationId,
          slug: part.slug,
        },
      },
      update: {
        name: part.name,
        description: part.description,
        pricePln: part.pricePln,
        imageUrl: part.imageUrl,
        modelUrl: part.modelUrl,
      },
      create: part,
    });
  }

  console.log("Seed OK:", {
    admin: admin.email,
    user: demoUser.email,
    brands: 7,
    models: 8,
    generations: 10,
    parts: parts.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
