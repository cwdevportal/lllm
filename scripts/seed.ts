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

    // ✅ Seed questions + options
    const question1 = await database.question.create({
      data: {
        question: 'What is the capital of France?',
        answer: 'Paris',
        options: {
          create: [
            { text: 'Paris' },
            { text: 'London' },
            { text: 'Berlin' },
            { text: 'Rome' },
          ],
        },
      },
    });

    const question2 = await database.question.create({
      data: {
        question: 'Which planet is known as the Red Planet?',
        answer: 'Mars',
        options: {
          create: [
            { text: 'Earth' },
            { text: 'Mars' },
            { text: 'Venus' },
            { text: 'Jupiter' },
          ],
        },
      },
    });

    console.log('✅ Seeded categories and questions!');
  } catch (error) {
    console.error('❌ Error seeding the database:', error);
  } finally {
    await database.$disconnect();
  }
}

main();
