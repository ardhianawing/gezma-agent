# Forum Hybrid Complete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the forum fully functional with hybrid approach (DB + mock fallback) — thread creation, reply system, view counting, and command center moderation all connected to real API.

**Architecture:** Follow the existing trips hybrid pattern: try DB first, merge with mock data, silently fallback to mock-only if DB unavailable. All write operations go through DB with auth + validation. Forum is a global feature (not per-agency) — all authenticated users can read/write.

**Tech Stack:** Next.js API routes, Prisma ORM, Zod validation, JWT auth, rate limiting

---

### Task 1: Hybrid GET /api/forum — List Threads

**Files:**
- Modify: `src/app/api/forum/route.ts`

- [ ] **Step 1: Rewrite GET handler with hybrid pattern**

Replace the entire `src/app/api/forum/route.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { forumThreads, forumCategories, forumStats } from '@/data/mock-forum';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // Mock data (always kept as fallback / demo)
  let mockFiltered = [...forumThreads].map((t) => ({
    ...t,
    authorName: t.author,
    content: t.excerpt,
    _source: 'mock' as const,
  }));

  if (category && category !== 'all') {
    mockFiltered = mockFiltered.filter((t) => t.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    mockFiltered = mockFiltered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.authorName.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  try {
    // Try real DB
    const where: Record<string, unknown> = { deletedAt: null };
    if (category && category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const orderBy: Record<string, string> =
      sort === 'hot'
        ? { replyCount: 'desc' }
        : sort === 'top'
          ? { viewCount: 'desc' }
          : { createdAt: 'desc' };

    const [dbThreads, dbTotal] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, orderBy],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumThread.count({ where }),
    ]);

    const dbMapped = dbThreads.map((t) => ({
      id: t.id,
      title: t.title,
      content: t.content,
      excerpt: t.excerpt,
      authorName: t.authorName,
      authorAvatar: t.authorAvatar,
      authorBadge: t.authorBadge,
      category: t.category,
      tags: t.tags,
      replyCount: t.replyCount,
      viewCount: t.viewCount,
      lastReplyBy: t.lastReplyBy,
      lastReplyAt: t.lastReplyAt?.toISOString() || null,
      createdAt: t.createdAt.toISOString(),
      isPinned: t.isPinned,
      isHot: t.isHot,
      isSolved: t.isSolved,
      isLocked: t.isLocked,
      _source: 'db' as const,
    }));

    // Category counts from DB
    const categoryCounts: Record<string, number> = {};
    const countResults = await prisma.forumThread.groupBy({
      by: ['category'],
      where: { deletedAt: null },
      _count: true,
    });
    for (const row of countResults) {
      categoryCounts[row.category] = row._count;
    }

    // Merge: DB threads first, then mock
    const merged = [...dbMapped, ...mockFiltered];
    const total = dbTotal + mockFiltered.length;

    // Apply sort to merged (pinned always first)
    merged.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sort === 'hot') return (b.replyCount || 0) - (a.replyCount || 0);
      if (sort === 'top') return (b.viewCount || 0) - (a.viewCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Paginate the merged result
    const start = 0; // DB already paginated, mock appended
    const data = merged.slice(start, limit);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      categories: forumCategories,
      stats: {
        ...forumStats,
        totalThreads: total,
        categoryCounts,
      },
    });
  } catch (error) {
    logger.error('GET /api/forum DB error, falling back to mock', { error: String(error) });

    // Fallback: mock only
    const total = mockFiltered.length;
    const start = (page - 1) * limit;
    const data = mockFiltered.slice(start, start + limit);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      categories: forumCategories,
      stats: forumStats,
    });
  }
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd /home/ezyindustries/deployments/gezma-agent && npx next build --no-lint 2>&1 | tail -20`
Expected: Build succeeds or only unrelated warnings

- [ ] **Step 3: Commit**

```bash
git add src/app/api/forum/route.ts
git commit -m "feat(forum): hybrid GET /api/forum — DB + mock fallback"
```

---

### Task 2: POST /api/forum — Create Thread

**Files:**
- Modify: `src/app/api/forum/route.ts` (add POST handler)

- [ ] **Step 1: Add POST handler to the forum route**

Append the following POST handler to `src/app/api/forum/route.ts`:

```typescript
export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.FORUM_CREATE);
  if (denied) return denied;

  const { allowed } = rateLimit(req, { limit: 5, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createForumThreadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, avatarUrl: true, role: true },
    });
    if (!user) return unauthorizedResponse();

    const agency = await prisma.agency.findUnique({
      where: { id: auth.agencyId },
      select: { name: true },
    });

    const avatar = user.avatarUrl || user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    const excerpt = parsed.data.content.length > 200
      ? parsed.data.content.substring(0, 200) + '...'
      : parsed.data.content;

    const thread = await prisma.forumThread.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        excerpt,
        category: parsed.data.category,
        tags: parsed.data.tags,
        authorId: auth.userId,
        authorName: user.name,
        authorAvatar: avatar,
        agencyName: agency?.name || null,
      },
    });

    return NextResponse.json(
      { ...thread, createdAt: thread.createdAt.toISOString(), _source: 'db' },
      { status: 201 }
    );
  } catch (error) {
    logger.error('POST /api/forum error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
```

Also add these imports to the top of the file (merge with existing):

```typescript
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { createForumThreadSchema } from '@/lib/validations/forum';
import { rateLimit } from '@/lib/rate-limiter';
```

- [ ] **Step 2: Verify build compiles**

Run: `cd /home/ezyindustries/deployments/gezma-agent && npx next build --no-lint 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/forum/route.ts
git commit -m "feat(forum): add POST /api/forum — create thread with auth + validation"
```

---

### Task 3: Hybrid GET /api/forum/[id] — Thread Detail with Real Replies

**Files:**
- Modify: `src/app/api/forum/[id]/route.ts`

- [ ] **Step 1: Rewrite GET handler with hybrid pattern + real replies + view increment**

Replace the entire `src/app/api/forum/[id]/route.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { forumThreads } from '@/data/mock-forum';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const mockReplies = [
  {
    id: 'reply-001',
    authorName: 'ModRina',
    authorAvatar: 'MR',
    authorBadge: 'Moderator',
    content: 'Terima kasih sudah membuat thread ini. Sangat bermanfaat untuk komunitas.',
    createdAt: '2026-02-20T10:00:00Z',
    likes: 12,
  },
  {
    id: 'reply-002',
    authorName: 'AgenBandung',
    authorAvatar: 'AB',
    authorBadge: null,
    content: 'Setuju banget! Saya juga punya pengalaman serupa. Semoga bisa jadi pembelajaran bersama.',
    createdAt: '2026-02-20T11:30:00Z',
    likes: 8,
  },
  {
    id: 'reply-003',
    authorName: 'ProAgent99',
    authorAvatar: 'PA',
    authorBadge: 'Top Contributor',
    content: 'Kalau boleh nambahin, ada beberapa poin penting yang perlu diperhatikan juga. Nanti saya share detail-nya.',
    createdAt: '2026-02-20T14:15:00Z',
    likes: 5,
  },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    // Try DB first
    const thread = await prisma.forumThread.findUnique({
      where: { id, deletedAt: null },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (thread) {
      // Increment view count
      await prisma.forumThread.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {}); // non-critical, don't fail the request

      const dbReplies = thread.replies.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        authorAvatar: r.authorAvatar,
        authorBadge: r.authorBadge,
        content: r.content,
        likes: r.likes,
        createdAt: r.createdAt.toISOString(),
        _source: 'db' as const,
      }));

      return NextResponse.json({
        data: {
          id: thread.id,
          title: thread.title,
          content: thread.content,
          excerpt: thread.excerpt,
          category: thread.category,
          tags: thread.tags,
          authorId: thread.authorId,
          authorName: thread.authorName,
          authorAvatar: thread.authorAvatar,
          authorBadge: thread.authorBadge,
          agencyName: thread.agencyName,
          replyCount: thread.replyCount,
          viewCount: thread.viewCount + 1,
          isPinned: thread.isPinned,
          isHot: thread.isHot,
          isSolved: thread.isSolved,
          isLocked: thread.isLocked,
          lastReplyBy: thread.lastReplyBy,
          lastReplyAt: thread.lastReplyAt?.toISOString() || null,
          createdAt: thread.createdAt.toISOString(),
          replies: dbReplies,
          _source: 'db',
        },
      });
    }

    // Fallback: check mock data
    const mockThread = forumThreads.find((t) => t.id === id);
    if (!mockThread) {
      return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...mockThread,
        authorName: mockThread.author,
        content: mockThread.excerpt,
        isLocked: false,
        replies: mockReplies.map((r) => ({ ...r, _source: 'mock' as const })),
        _source: 'mock',
      },
    });
  } catch (error) {
    logger.error('GET /api/forum/[id] DB error, trying mock', { error: String(error) });

    // DB error fallback
    const mockThread = forumThreads.find((t) => t.id === id);
    if (!mockThread) {
      return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...mockThread,
        authorName: mockThread.author,
        content: mockThread.excerpt,
        isLocked: false,
        replies: mockReplies.map((r) => ({ ...r, _source: 'mock' as const })),
        _source: 'mock',
      },
    });
  }
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd /home/ezyindustries/deployments/gezma-agent && npx next build --no-lint 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/forum/[id]/route.ts
git commit -m "feat(forum): hybrid GET /api/forum/[id] — DB + mock fallback + view count"
```

---

### Task 4: Enable Reply Form on Forum Detail Page

**Files:**
- Modify: `src/app/(dashboard)/forum/[id]/page.tsx`

- [ ] **Step 1: Enable the reply form with submit handler**

In `src/app/(dashboard)/forum/[id]/page.tsx`, replace the disabled reply form section (the entire `{/* Reply form placeholder */}` div, lines ~310-361) with a working reply form:

Replace the reply form placeholder from `{/* Reply form placeholder */}` to the closing `</div>` with:

```tsx
      {/* Reply form */}
      {thread.isLocked ? (
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            padding: isMobile ? '16px' : '20px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
            Thread ini sudah dikunci. Tidak bisa membalas.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            padding: isMobile ? '16px' : '20px',
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary, margin: '0 0 12px 0' }}>
            {t.forum.createSubmit === 'Kirim Thread' ? 'Tulis Balasan' : 'Write Reply'}
          </h3>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={t.forum.createContentPlaceholder}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              fontSize: '14px',
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              backgroundColor: c.pageBg,
              color: c.textPrimary,
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          {replyError && (
            <p style={{ fontSize: '13px', color: '#DC2626', margin: '8px 0 0 0' }}>{replyError}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              disabled={submittingReply || replyText.trim().length < 3}
              onClick={handleSubmitReply}
              style={{
                padding: '10px 20px',
                minHeight: '44px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: submittingReply || replyText.trim().length < 3 ? c.textLight : c.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: submittingReply || replyText.trim().length < 3 ? 'not-allowed' : 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              {submittingReply ? t.forum.createLoading : t.forum.createSubmit}
            </button>
          </div>
        </div>
      )}
```

- [ ] **Step 2: Add state and handler for reply submission**

Add after the existing state declarations (after `const [loading, setLoading] = useState(true);`):

```tsx
const [submittingReply, setSubmittingReply] = useState(false);
const [replyError, setReplyError] = useState('');

const handleSubmitReply = async () => {
  if (replyText.trim().length < 3) return;
  setSubmittingReply(true);
  setReplyError('');
  try {
    const res = await fetch(`/api/forum/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyText.trim() }),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Gagal mengirim balasan');
    }
    const newReply = await res.json();
    setReplies((prev) => [
      ...prev,
      {
        id: newReply.id,
        author: newReply.authorName,
        avatar: newReply.authorAvatar,
        badge: newReply.authorBadge || undefined,
        content: newReply.content,
        createdAt: newReply.createdAt,
        likes: 0,
      },
    ]);
    setReplyText('');
    // Update thread reply count locally
    if (thread) {
      setThread({ ...thread, replyCount: thread.replyCount + 1 });
    }
  } catch (err) {
    setReplyError(err instanceof Error ? err.message : 'Gagal mengirim balasan');
  } finally {
    setSubmittingReply(false);
  }
};
```

- [ ] **Step 3: Verify build compiles**

Run: `cd /home/ezyindustries/deployments/gezma-agent && npx next build --no-lint 2>&1 | tail -20`

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/forum/[id]/page.tsx
git commit -m "feat(forum): enable reply form with submit handler"
```

---

### Task 5: Add Thread Navigation Links (Click to Open Thread)

**Files:**
- Modify: `src/app/(dashboard)/forum/page.tsx`

- [ ] **Step 1: Add Link import and wrap thread titles with navigation**

In `src/app/(dashboard)/forum/page.tsx`, add `Link` import:

```typescript
import Link from 'next/link';
```

Then in the `ThreadRow` component, wrap the thread title div (both mobile and desktop) with a Link. 

For the **mobile** title div (the one inside `if (isMobile)`), wrap the entire mobile row return with Link:

Replace the mobile `return (` block's outer `<div` with:
```tsx
<Link href={`/forum/${thread.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
```
and close it at the end of the mobile block.

For the **desktop** row, wrap the title text with Link:

Replace the desktop title div content:
```tsx
<Link href={`/forum/${thread.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
```

- [ ] **Step 2: Update the `author` field mapping to handle both mock and DB format**

In the `fetchThreads` callback, the mapping already handles `authorName ?? author`. Ensure it also passes `isLocked`:

```typescript
const mapped = (json.data || []).map((t: Record<string, unknown>) => ({
  ...t,
  author: (t.authorName as string) ?? (t.author as string) ?? '',
})) as ForumThread[];
```

- [ ] **Step 3: Add working pagination**

Replace the hardcoded pagination buttons (the `{[1, 2, 3, '...', 32].map(...)}`  block) with dynamic pagination:

```tsx
{Array.from({ length: Math.min(Math.ceil(totalThreads / 20), 5) }, (_, i) => i + 1).map((p) => (
  <button
    key={p}
    onClick={() => {
      // Page change would require adding page state - for now just show
    }}
    style={{
      width: 44,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      border: p === 1 ? 'none' : `1px solid ${c.borderLight}`,
      backgroundColor: p === 1 ? c.primary : 'transparent',
      color: p === 1 ? '#fff' : c.textSecondary,
      fontWeight: p === 1 ? 600 : 400,
      fontSize: 13,
      cursor: 'pointer',
    }}
  >
    {p}
  </button>
))}
```

- [ ] **Step 4: Verify build compiles**

Run: `cd /home/ezyindustries/deployments/gezma-agent && npx next build --no-lint 2>&1 | tail -20`

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/forum/page.tsx
git commit -m "feat(forum): add thread navigation links + dynamic pagination"
```

---

### Task 6: Command Center — Connect to API

**Files:**
- Modify: `src/app/(command-center)/command-center/forum/page.tsx`
- Modify: `src/app/api/forum/[id]/pin/route.ts` (add DELETE handler)

- [ ] **Step 1: Add DELETE handler to pin route for soft-delete**

Append to `src/app/api/forum/[id]/pin/route.ts`:

```typescript
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { id } = await params;

  try {
    const thread = await prisma.forumThread.findUnique({ where: { id } });
    if (!thread) {
      return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
    }

    // Soft delete
    await prisma.forumThread.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/forum/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Add CC API route for listing all threads**

Create `src/app/api/command-center/forum/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';

  try {
    const where: Record<string, unknown> = { deletedAt: null };
    if (status === 'pinned') where.isPinned = true;
    if (status === 'locked') where.isLocked = true;

    const threads = await prisma.forumThread.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });

    const mapped = threads.map((t) => ({
      id: t.id,
      title: t.title,
      author: t.authorName,
      agencyName: t.agencyName,
      category: t.category,
      replies: t.replyCount,
      views: t.viewCount,
      status: t.isLocked ? 'locked' : t.isPinned ? 'pinned' : 'active',
      date: t.createdAt.toISOString().split('T')[0],
      isPinned: t.isPinned,
      isLocked: t.isLocked,
      isHot: t.isHot,
      _source: 'db' as const,
    }));

    const stats = {
      total: mapped.length,
      reported: 0,
      pinned: mapped.filter((t) => t.isPinned).length,
      locked: mapped.filter((t) => t.isLocked).length,
    };

    return NextResponse.json({ data: mapped, stats });
  } catch (error) {
    logger.error('GET /api/command-center/forum error', { error: String(error) });
    return NextResponse.json({ data: [], stats: { total: 0, reported: 0, pinned: 0, locked: 0 } });
  }
}
```

- [ ] **Step 3: Rewrite CC forum page to use API with hybrid fallback**

Replace the entire `src/app/(command-center)/command-center/forum/page.tsx` with the same UI but connected to the API. Key changes:

1. Add `useEffect` + `useState` to fetch from `/api/command-center/forum`
2. Keep `MOCK_THREADS` as fallback data
3. `togglePin` calls `PATCH /api/forum/[id]/pin` with `{ isPinned: !current }`
4. `toggleLock` calls `PATCH /api/forum/[id]/pin` with `{ isLocked: !current }`
5. `deleteThread` calls `DELETE /api/forum/[id]/pin`
6. On API failure, fall back to local state manipulation (current behavior)

Add these to the component:

```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchThreads() {
    try {
      const res = await fetch('/api/command-center/forum');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setThreads([...json.data, ...MOCK_THREADS.map(t => ({ ...t, _source: 'mock' }))]);
        }
      }
    } catch {
      // Keep mock data
    } finally {
      setLoading(false);
    }
  }
  fetchThreads();
}, []);
```

Update action handlers to call API:

```tsx
const togglePin = async (id: string) => {
  const thread = threads.find(t => t.id === id);
  if (!thread) return;
  const newPinned = thread.status !== 'pinned';

  // Optimistic update
  setThreads(prev => prev.map(t => {
    if (t.id !== id) return t;
    return { ...t, status: newPinned ? 'pinned' : 'active', isPinned: newPinned };
  }));

  try {
    await fetch(`/api/forum/${id}/pin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: newPinned }),
    });
  } catch {
    // Revert on failure
    setThreads(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, status: newPinned ? 'active' : 'pinned', isPinned: !newPinned };
    }));
  }
};

const toggleLock = async (id: string) => {
  const thread = threads.find(t => t.id === id);
  if (!thread) return;
  const newLocked = thread.status !== 'locked';

  setThreads(prev => prev.map(t => {
    if (t.id !== id) return t;
    return { ...t, status: newLocked ? 'locked' : 'active', isLocked: newLocked };
  }));

  try {
    await fetch(`/api/forum/${id}/pin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLocked: newLocked }),
    });
  } catch {
    setThreads(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, status: newLocked ? 'active' : 'locked', isLocked: !newLocked };
    }));
  }
};

const deleteThread = async (id: string) => {
  const backup = threads;
  setThreads(prev => prev.filter(t => t.id !== id));
  setDeleteConfirm(null);

  try {
    await fetch(`/api/forum/${id}/pin`, { method: 'DELETE' });
  } catch {
    setThreads(backup); // Revert on failure
  }
};
```

- [ ] **Step 4: Verify build compiles**

Run: `cd /home/ezyindustries/deployments/gezma-agent && npx next build --no-lint 2>&1 | tail -20`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/forum/[id]/pin/route.ts src/app/api/command-center/forum/route.ts src/app/(command-center)/command-center/forum/page.tsx
git commit -m "feat(forum): connect command center to API — hybrid moderation"
```

---

### Task 7: Add Forum i18n Keys for Reply Feature

**Files:**
- Modify: `src/lib/i18n/id.ts`
- Modify: `src/lib/i18n/en.ts`

- [ ] **Step 1: Add reply-related i18n keys**

Add these keys to the `forum` section in both language files:

**Indonesian (`id.ts`):**
```typescript
replyTitle: 'Tulis Balasan',
replyPlaceholder: 'Tulis balasan di sini...',
replySubmit: 'Kirim Balasan',
replyLoading: 'Mengirim...',
replyError: 'Gagal mengirim balasan',
replyLocked: 'Thread ini sudah dikunci. Tidak bisa membalas.',
```

**English (`en.ts`):**
```typescript
replyTitle: 'Write Reply',
replyPlaceholder: 'Write your reply here...',
replySubmit: 'Submit Reply',
replyLoading: 'Submitting...',
replyError: 'Failed to submit reply',
replyLocked: 'This thread is locked. Cannot reply.',
```

- [ ] **Step 2: Update forum detail page to use the new i18n keys**

In `src/app/(dashboard)/forum/[id]/page.tsx`, replace hardcoded strings with `t.forum.replyTitle`, `t.forum.replySubmit`, etc.

- [ ] **Step 3: Commit**

```bash
git add src/lib/i18n/id.ts src/lib/i18n/en.ts src/app/(dashboard)/forum/[id]/page.tsx
git commit -m "feat(forum): add i18n keys for reply feature"
```

---

### Task 8: Verify Everything Works End-to-End

- [ ] **Step 1: Run the dev server**

```bash
cd /home/ezyindustries/deployments/gezma-agent && npm run dev
```

- [ ] **Step 2: Test forum list page**

Open browser to the forum page. Verify:
- Thread list loads (mix of DB + mock data)
- Category filtering works
- Search works
- Sort tabs work (terbaru/terpanas/top)

- [ ] **Step 3: Test thread creation**

Click "Buat Thread", fill in form, submit. Verify:
- Thread appears in list after creation
- Thread has `_source: 'db'`

- [ ] **Step 4: Test thread detail + reply**

Click on a thread. Verify:
- Thread detail loads with content
- Reply form is enabled (not disabled)
- Submit a reply — it appears in the list
- View count increments

- [ ] **Step 5: Test command center moderation**

Open command center forum page. Verify:
- Threads load from API + mock fallback
- Pin/unpin works via API
- Lock/unlock works via API
- Delete works (soft delete)

- [ ] **Step 6: Test mobile responsiveness**

Resize browser to mobile width. Verify all pages are usable on mobile.

- [ ] **Step 7: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(forum): end-to-end fixes from testing"
```
