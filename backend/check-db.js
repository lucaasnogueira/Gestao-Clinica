const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.appointment.count();
  console.log('Total appointments:', count);
  const apps = await prisma.appointment.findMany({
    take: 5,
    include: { patient: true, doctor: true }
  });
  console.log('Last 5 appointments:', JSON.stringify(apps, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
