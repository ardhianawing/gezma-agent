import { NextRequest, NextResponse } from 'next/server';
import { forumThreads } from '@/data/mock-forum';

const mockReplies = [
  {
    id: 'reply-001',
    author: 'ModRina',
    authorAvatar: 'MR',
    authorBadge: 'Moderator',
    content: 'Terima kasih sudah membuat thread ini. Sangat bermanfaat untuk komunitas.',
    createdAt: '2026-02-20T10:00:00Z',
    likeCount: 12,
  },
  {
    id: 'reply-002',
    author: 'AgenBandung',
    authorAvatar: 'AB',
    content: 'Setuju banget! Saya juga punya pengalaman serupa. Semoga bisa jadi pembelajaran bersama.',
    createdAt: '2026-02-20T11:30:00Z',
    likeCount: 8,
  },
  {
    id: 'reply-003',
    author: 'ProAgent99',
    authorAvatar: 'PA',
    authorBadge: 'Top Contributor',
    content: 'Kalau boleh nambahin, ada beberapa poin penting yang perlu diperhatikan juga. Nanti saya share detail-nya.',
    createdAt: '2026-02-20T14:15:00Z',
    likeCount: 5,
  },
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const thread = forumThreads.find((t) => t.id === id);

  if (!thread) {
    return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...thread,
      replies: mockReplies,
    },
  });
}
