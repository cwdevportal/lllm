import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { studentId: string } }) {
  try {
    const answers = await db.studentAnswer.findMany({
      where: { studentId: params.studentId },
      include: { question: true },
    });

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const total = answers.length;
    const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);

    return NextResponse.json({
      total,
      correctCount,
      percentage,
      answers,
    });
  } catch (error) {
    console.error("❌ Failed to fetch results:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
