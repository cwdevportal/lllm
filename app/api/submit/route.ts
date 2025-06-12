import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const { studentId, answers } = body

  const submissions = answers.map((ans: any) => ({
    studentId,
    questionId: ans.questionId,
    selected: ans.selected,
  }))

  await prisma.studentAnswer.createMany({ data: submissions })

  return NextResponse.json({ message: 'Answers submitted!' })
}
