import { NextRequest, NextResponse } from 'next/server';
import { doaList } from '@/data/mock-doa';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let doas = doaList;

  if (category && category !== 'all') {
    doas = doas.filter((d) => d.category === category);
  }

  return NextResponse.json({
    doas: doas.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      arabic: d.arabic,
      latin: d.latin,
      translation: d.translation,
      occasion: d.occasion,
      source: d.source,
      emoji: d.emoji,
    })),
    favoriteIds: [],
  });
}
