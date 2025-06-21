const { PrismaClient } = require('@prisma/client');
const database = new PrismaClient();

async function main() {
  try {
    // ✅ Seed categories
 await database.category.createMany({
  data: [
    { name: 'Beginner Level', order: 1 },
    { name: 'Intermediate Level', order: 2 },
    { name: 'Advanced Level', order: 3 },
  ],
  skipDuplicates: true,
});

// Just in case they're already in DB but without order
await database.category.updateMany({
  where: { name: 'Beginner Level' },
  data: { order: 1 },
});
await database.category.updateMany({
  where: { name: 'Intermediate Level' },
  data: { order: 2 },
});
await database.category.updateMany({
  where: { name: 'Advanced Level' },
  data: { order: 3 },
});


  } catch (error) {
    console.error('❌ Error seeding the database:', error);
  } finally {
    await database.$disconnect();
  }
}

main();
