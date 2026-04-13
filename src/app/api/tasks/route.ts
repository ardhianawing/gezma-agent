import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

const mockTasks = [
  { id: "task-1", title: "Verifikasi passport rombongan Maret", description: "Cek validitas passport 42 jamaah keberangkatan 15 Maret", status: "in_progress", priority: "high", dueDate: "2026-03-10", assignedTo: "user-1", assigneeName: "Ahmad Fauzi", createdBy: "Admin", createdAt: "2026-03-01T08:00:00Z", _source: 'mock' as const },
  { id: "task-2", title: "Booking hotel Madinah April", description: "Konfirmasi booking Shaza Al Madina untuk rombongan VIP April", status: "todo", priority: "medium", dueDate: "2026-03-15", assignedTo: "user-2", assigneeName: "Siti Rahayu", createdBy: "Admin", createdAt: "2026-03-02T10:00:00Z", _source: 'mock' as const },
  { id: "task-3", title: "Kirim reminder pelunasan", description: "WhatsApp blast ke 8 jamaah yang belum lunas pembayaran", status: "todo", priority: "high", dueDate: "2026-03-08", assignedTo: "user-3", assigneeName: "Budi Hartono", createdBy: "Admin", createdAt: "2026-03-03T09:00:00Z", _source: 'mock' as const },
  { id: "task-4", title: "Cetak manifes keberangkatan", description: "Print manifes dan boarding pass untuk group Maret", status: "todo", priority: "medium", dueDate: "2026-03-12", assignedTo: "user-1", assigneeName: "Ahmad Fauzi", createdBy: "Admin", createdAt: "2026-03-04T08:00:00Z", _source: 'mock' as const },
  { id: "task-5", title: "Follow up visa tertunda", description: "Hubungi kedutaan Saudi untuk 3 visa yang belum terbit", status: "in_progress", priority: "high", dueDate: "2026-03-09", assignedTo: "user-2", assigneeName: "Siti Rahayu", createdBy: "Admin", createdAt: "2026-03-01T14:00:00Z", _source: 'mock' as const },
  { id: "task-6", title: "Koordinasi bus Jeddah-Makkah", description: "Konfirmasi bus shalawat VIP untuk penjemputan di bandara", status: "done", priority: "medium", dueDate: "2026-03-05", assignedTo: "user-3", assigneeName: "Budi Hartono", createdBy: "Admin", createdAt: "2026-02-28T10:00:00Z", _source: 'mock' as const },
  { id: "task-7", title: "Briefing manasik online", description: "Siapkan materi dan Zoom meeting untuk manasik jamaah Maret", status: "done", priority: "low", dueDate: "2026-03-06", assignedTo: "user-1", assigneeName: "Ahmad Fauzi", createdBy: "Admin", createdAt: "2026-02-25T09:00:00Z", _source: 'mock' as const },
  { id: "task-8", title: "Update harga paket Ramadhan", description: "Sesuaikan harga paket umrah Ramadhan sesuai kurs terbaru", status: "todo", priority: "low", dueDate: "2026-03-20", assignedTo: "user-2", assigneeName: "Siti Rahayu", createdBy: "Admin", createdAt: "2026-03-05T11:00:00Z", _source: 'mock' as const },
];

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const status = req.nextUrl.searchParams.get('status') || undefined;
  const assignedTo = req.nextUrl.searchParams.get('assignedTo') || undefined;

  try {
    const whereClause: Record<string, unknown> = { agencyId: auth.agencyId };
    if (status) whereClause.status = status;
    if (assignedTo) whereClause.assignedTo = assignedTo;

    const dbTasks = await prisma.agencyTask.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    const dbMapped = dbTasks.map(t => ({ ...t, _source: 'db' as const }));

    // Hybrid: real DB tasks + mock fallback data
    let filteredMock = [...mockTasks];
    if (status) filteredMock = filteredMock.filter(t => t.status === status);
    if (assignedTo) filteredMock = filteredMock.filter(t => t.assignedTo === assignedTo);

    return NextResponse.json({ data: [...dbMapped, ...filteredMock] });
  } catch {
    // Fallback to mock only
    let filtered = [...mockTasks];
    if (status) filtered = filtered.filter(t => t.status === status);
    if (assignedTo) filtered = filtered.filter(t => t.assignedTo === assignedTo);

    return NextResponse.json({ data: filtered });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  try {
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Title wajib diisi' }, { status: 400 });
    }

    try {
      // Try real DB first
      const task = await prisma.agencyTask.create({
        data: {
          title: body.title,
          description: body.description || null,
          status: body.status || 'todo',
          priority: body.priority || 'medium',
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          assignedTo: body.assignedTo || null,
          assigneeName: body.assigneeName || null,
          createdBy: auth.userId,
          agencyId: auth.agencyId,
        },
      });

      return NextResponse.json({ ...task, _source: 'db' }, { status: 201 });
    } catch {
      // Fallback to mock response
      const task = {
        id: `task-${Date.now()}`,
        title: body.title || '',
        description: body.description || null,
        status: body.status || 'todo',
        priority: body.priority || 'medium',
        dueDate: body.dueDate || null,
        assignedTo: body.assignedTo || null,
        assigneeName: body.assigneeName || null,
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
        _source: 'mock',
      };

      return NextResponse.json(task, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
