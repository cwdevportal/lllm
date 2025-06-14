import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();

  const {
    studentId,
    answers,
  }: {
    studentId: string;
    answers: { questionId: string | number; selected: string }[];
  } = body;

  if (!studentId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const filteredAnswers = answers.filter(
    (entry) => entry.questionId && entry.selected
  );

  console.log("Received payload:", body);


  const formattedAnswers = await Promise.all(
  filteredAnswers.map(async (entry) => {
    const questionId = String(entry.questionId); // 🔥 force it to string

    const correct = await prisma.question.findUnique({
      where: { id: questionId },
      select: { answer: true },
    });

    return {
      studentId: String(studentId),
      questionId,
      selected: entry.selected,
      correctAnswer: correct?.answer ?? '',
    };
  })
);


  for (const ans of formattedAnswers) {
    await prisma.studentAnswer.upsert({
      where: {
        studentId_questionId: {
          studentId: ans.studentId,
          questionId: ans.questionId,
        },
      },
      update: {
        answer: ans.selected,
      },
      create: {
        studentId: ans.studentId,
        questionId: ans.questionId,
        answer: ans.selected,
      },
    });
  }
console.log("Formatted Answers:", formattedAnswers);

  const score = formattedAnswers.filter(
    (ans) =>
      ans.selected.trim().toLowerCase() ===
      ans.correctAnswer.trim().toLowerCase()
  ).length;

  const total = await prisma.question.count(); // ✅ Use total questions in DB

  return NextResponse.json({
    message: 'Answers submitted successfully',
    score,
    total,
  });
}
