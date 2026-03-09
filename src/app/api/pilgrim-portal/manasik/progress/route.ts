import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { lessonId, completed } = await req.json();

  if (!lessonId || typeof completed !== 'boolean') {
    return NextResponse.json({ error: 'lessonId dan completed diperlukan' }, { status: 400 });
  }

  // Mock: always return success without persisting
  return NextResponse.json({ success: true });
}
