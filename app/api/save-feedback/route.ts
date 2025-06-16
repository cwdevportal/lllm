// app/api/save-feedback/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Validate or save the feedback

  return NextResponse.json({ success: true });
}
