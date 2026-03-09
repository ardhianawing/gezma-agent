import { NextRequest, NextResponse } from 'next/server';

const mockReviews = [
  {
    id: 'review-001',
    rating: 5,
    comment: 'Sangat bermanfaat! Materi disampaikan dengan jelas dan mudah dipahami.',
    userName: 'Ahmad Hidayat',
    userId: 'user-001',
    createdAt: '2025-02-15T10:30:00Z',
  },
  {
    id: 'review-002',
    rating: 4,
    comment: 'Bagus, tapi bisa ditambah lebih banyak contoh praktik.',
    userName: 'Siti Rahmawati',
    userId: 'user-002',
    createdAt: '2025-02-10T14:20:00Z',
  },
  {
    id: 'review-003',
    rating: 5,
    comment: 'Instruktur sangat kompeten. Recommended untuk semua level.',
    userName: 'Budi Prasetyo',
    userId: 'user-003',
    createdAt: '2025-01-28T09:15:00Z',
  },
  {
    id: 'review-004',
    rating: 4,
    comment: 'Materinya lengkap dan terstruktur dengan baik.',
    userName: 'Dewi Anggraini',
    userId: 'user-004',
    createdAt: '2025-01-20T16:45:00Z',
  },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  await params; // consume params

  const totalRating = mockReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = Math.round((totalRating / mockReviews.length) * 10) / 10;

  return NextResponse.json({
    reviews: mockReviews,
    avgRating,
    totalReviews: mockReviews.length,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const body = await req.json();
  const { rating, comment } = body as { rating: number; comment?: string };

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating harus antara 1-5' }, { status: 400 });
  }

  return NextResponse.json(
    {
      id: `review-new-${Date.now()}`,
      rating,
      comment: comment || null,
      userName: 'Demo User',
      userId: 'demo-user',
      courseId,
      createdAt: new Date().toISOString(),
    },
    { status: 201 }
  );
}
