import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.json()
  const { studentId, answers } = body

  const formattedAnswers = await Promise.all(
    answers.map(async (entry: { questionId: number; selected: string }) => {
      const correct = await prisma.question.findUnique({
        where: { id: entry.questionId },
        select: { answer: true }
      })

      return {
        studentId,
        questionId: entry.questionId,
        selected: entry.selected,
        correctAnswer: correct?.answer || '',
      }
    })
  )

  // Save or update answers
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
    })
  }

  // Compute score
  const score = formattedAnswers.filter(ans => ans.selected === ans.correctAnswer).length
  const total = formattedAnswers.length

  return NextResponse.json({
    message: 'Answers submitted successfully',
    score,
    total,
  })
}
