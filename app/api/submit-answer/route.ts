import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, questionId, answer } = body;

    if (!studentId || !questionId || !answer) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const question = await db.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = question.answer.trim().toLowerCase() === answer.trim().toLowerCase();

    const saved = await db.studentAnswer.upsert({
      where: {
        studentId_questionId: {
          studentId,
          questionId,
        },
      },
      update: {
        answer,
        isCorrect,
      },
      create: {
        studentId,
        questionId,
        answer,
        isCorrect,
      },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error('❌ Error grading answer:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
