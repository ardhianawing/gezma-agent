import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { awardPilgrimPoints } from '@/lib/services/pilgrim-gamification.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const VALID_DOC_TYPES = ['ktp', 'passport', 'photo', 'kk', 'vaccine', 'akta', 'book_nikah', 'surat_mahram'];

export async function POST(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('type') as string | null;

    if (!file || !docType) {
      return NextResponse.json({ error: 'File dan tipe dokumen wajib diisi' }, { status: 400 });
    }

    if (!VALID_DOC_TYPES.includes(docType)) {
      return NextResponse.json({ error: 'Tipe dokumen tidak valid' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    // Save file to disk
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents', payload.pilgrimId);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${docType}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/documents/${payload.pilgrimId}/${fileName}`;

    // Upsert PilgrimDocument
    const existing = await prisma.pilgrimDocument.findFirst({
      where: { pilgrimId: payload.pilgrimId, type: docType },
    });

    if (existing) {
      await prisma.pilgrimDocument.update({
        where: { id: existing.id },
        data: {
          status: 'uploaded',
          fileUrl,
          fileName: file.name,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.pilgrimDocument.create({
        data: {
          pilgrimId: payload.pilgrimId,
          type: docType,
          status: 'uploaded',
          fileUrl,
          fileName: file.name,
        },
      });
    }

    // Award points for uploading document
    awardPilgrimPoints(payload.pilgrimId, 'upload_document', `Mengunggah dokumen ${docType}`).catch(() => {});

    return NextResponse.json({ success: true, fileUrl, fileName: file.name });
  } catch (error) {
    console.error('POST /api/pilgrim-portal/documents error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const documents = await prisma.pilgrimDocument.findMany({
      where: { pilgrimId: payload.pilgrimId },
      orderBy: { type: 'asc' },
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error('GET /api/pilgrim-portal/documents error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
