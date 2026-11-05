import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const user = await prisma.user.findUnique({
  where: { email: "user@flydes.local" },
});
const part = await prisma.part.findFirst({ orderBy: { name: "asc" } });

if (!user || !part) {
  console.error("Brak usera demo lub części — uruchom seed.");
  process.exit(1);
}

const unitPrice = Number(part.pricePln.toString());
const quantity = 2;
const totalPln = unitPrice * quantity;

const order = await prisma.order.create({
  data: {
    userId: user.id,
    status: "NEW",
    totalPln,
    items: {
      create: [
        {
          partId: part.id,
          quantity,
          unitPrice,
        },
      ],
    },
  },
  include: { items: true },
});

console.log(
  JSON.stringify(
    {
      orderId: order.id,
      status: order.status,
      totalPln: Number(order.totalPln.toString()),
      items: order.items.length,
      part: part.name,
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
