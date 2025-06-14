const { PrismaClient } = require('@prisma/client');
const database = new PrismaClient();

async function main() {
  try {
    // ✅ Seed categories
    await database.category.createMany({
      data: [
        { name: 'Beginner Level' },
        { name: 'Intermediate Level' },
        { name: 'Tutor Level' },
      ],
      skipDuplicates: true,
    });
  } catch (error) {
    console.error('❌ Error seeding the database:', error);
  } finally {
    await database.$disconnect();
  }
}

main();
