const { PrismaClient } = require('@prisma/client');
const database = new PrismaClient();

async function main() {
  try {
    // ✅ Seed categories
 await database.category.createMany({
  data: [
    { name: 'Modules 1', order: 1 },
    { name: 'Modules 2', order: 2 },
    { name: 'Modules 3', order: 3 },
     { name: 'Modules 4', order: 4 },
      { name: 'Modules 5', order: 5 },
  ],
  skipDuplicates: true,
});

// Just in case they're already in DB but without order
await database.category.updateMany({
  where: { name: 'Modules 1' },
  data: { order: 1 },
});
await database.category.updateMany({
  where: { name: 'Modules 2' },
  data: { order: 2 },
});
await database.category.updateMany({
  where: { name: 'Modules 3' },
  data: { order: 3 },
});
await database.category.updateMany({
  where: { name: 'Modules 4' },
  data: { order: 4 },
});
await database.category.updateMany({
  where: { name: 'Modules 5' },
  data: { order: 5 },
});



  } catch (error) {
    console.error('❌ Error seeding the database:', error);
  } finally {
    await database.$disconnect();
  }
}

main(); 
