// app/api/questions/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing question id' }, { status: 400 });
  }
  try {
    const question = await db.question.findUnique({
      where: { id },
      include: { options: true },
    });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json(question);
  } catch (error) {
    console.error('❌ Error fetching question:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing question id' }, { status: 400 });
  }
  try {
    const body = await req.json();
    const { question, answer, options } = body;
    if (!question || !answer || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    // Update question and its options: delete old options, create new ones
    const updated = await db.question.update({
      where: { id },
      data: {
        question,
        answer,
        options: {
          deleteMany: {}, // remove existing options
          create: options.map((text: string) => ({ text })),
        },
      },
      include: { options: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('❌ Error updating question:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing question id' }, { status: 400 });
  }
  try {
    await db.question.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting question:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
