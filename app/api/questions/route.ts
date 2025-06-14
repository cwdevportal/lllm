import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // make sure this is your Prisma client

// POST /api/questions -> create a question with options
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, answer, options } = body;

    if (!question || !answer || !options || options.length < 2) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    console.log(JSON.stringify(question, null, 2));


    const created = await db.question.create({
      data: {
        question,
        answer,
        options: {
          create: options.map((text: string) => ({ text })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('❌ Error creating question:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET /api/questions -> return list of all questions
export async function GET() {
  try {
    const questions = await db.question.findMany({
      include: { options: true },
      orderBy: { createdAt: 'desc' }, // optional: show latest first
    });

    console.log(JSON.stringify(questions, null, 2));


    return NextResponse.json(questions);
  } catch (error) {
    console.error('❌ Error fetching questions:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
