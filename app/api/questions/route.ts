// app/api/questions/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const questions = await prisma.question.findMany({
    include: { options: true }
  })
  return NextResponse.json(questions)
}
