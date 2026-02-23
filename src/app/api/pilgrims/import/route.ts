import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logActivity } from '@/lib/activity-logger';

interface ImportRow {
  nik?: string;
  name?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  postalCode?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  notes?: string;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

function validateRow(row: ImportRow, rowIndex: number): ImportError[] {
  const errors: ImportError[] = [];

  // Required fields
  const requiredFields: { key: keyof ImportRow; label: string }[] = [
    { key: 'nik', label: 'NIK' },
    { key: 'name', label: 'Nama' },
    { key: 'gender', label: 'Jenis Kelamin' },
    { key: 'birthPlace', label: 'Tempat Lahir' },
    { key: 'birthDate', label: 'Tanggal Lahir' },
    { key: 'address', label: 'Alamat' },
    { key: 'city', label: 'Kota' },
    { key: 'province', label: 'Provinsi' },
    { key: 'phone', label: 'Telepon' },
    { key: 'email', label: 'Email' },
  ];

  for (const { key, label } of requiredFields) {
    if (!row[key] || row[key]!.trim() === '') {
      errors.push({ row: rowIndex, field: key, message: `${label} harus diisi` });
    }
  }

  // NIK format: 16 digits
  if (row.nik && !/^\d{16}$/.test(row.nik.trim())) {
    errors.push({ row: rowIndex, field: 'nik', message: 'NIK harus 16 digit angka' });
  }

  // Gender validation
  if (row.gender && !['male', 'female'].includes(row.gender.trim().toLowerCase())) {
    errors.push({ row: rowIndex, field: 'gender', message: 'Gender harus "male" atau "female"' });
  }

  // Email format
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
    errors.push({ row: rowIndex, field: 'email', message: 'Format email tidak valid' });
  }

  // Phone format
  if (row.phone && !/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(row.phone.trim())) {
    errors.push({ row: rowIndex, field: 'phone', message: 'Format telepon tidak valid' });
  }

  // Birth date validation
  if (row.birthDate && row.birthDate.trim() !== '') {
    const d = new Date(row.birthDate.trim());
    if (isNaN(d.getTime())) {
      errors.push({ row: rowIndex, field: 'birthDate', message: 'Format tanggal lahir tidak valid' });
    }
  }

  return errors;
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { rows, skipDuplicates } = body as { rows: ImportRow[]; skipDuplicates: boolean };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Data import kosong' }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json({ error: 'Maksimal 500 baris per import' }, { status: 400 });
    }

    const allErrors: ImportError[] = [];
    const validRows: { index: number; data: ImportRow }[] = [];

    // Validate all rows
    for (let i = 0; i < rows.length; i++) {
      const rowErrors = validateRow(rows[i], i + 1); // 1-based row numbering
      if (rowErrors.length > 0) {
        allErrors.push(...rowErrors);
      } else {
        validRows.push({ index: i + 1, data: rows[i] });
      }
    }

    // Check NIK uniqueness within agency
    const niks = validRows.map((r) => r.data.nik!.trim());
    const existingPilgrims = await prisma.pilgrim.findMany({
      where: {
        agencyId: auth.agencyId,
        nik: { in: niks },
      },
      select: { nik: true },
    });
    const existingNiks = new Set(existingPilgrims.map((p) => p.nik));

    // Also check for duplicate NIKs within the import itself
    const niksSeen = new Set<string>();
    const deduplicatedRows: { index: number; data: ImportRow }[] = [];

    let skipped = 0;

    for (const row of validRows) {
      const nik = row.data.nik!.trim();

      if (existingNiks.has(nik) || niksSeen.has(nik)) {
        if (skipDuplicates) {
          skipped++;
          continue;
        } else {
          allErrors.push({
            row: row.index,
            field: 'nik',
            message: existingNiks.has(nik)
              ? 'NIK sudah terdaftar di agency ini'
              : 'NIK duplikat dalam file import',
          });
          continue;
        }
      }

      niksSeen.add(nik);
      deduplicatedRows.push(row);
    }

    // If there are validation errors and skipDuplicates is false, return early
    if (allErrors.length > 0 && !skipDuplicates) {
      return NextResponse.json(
        { imported: 0, skipped, errors: allErrors },
        { status: 200 }
      );
    }

    const defaultChecklist = {
      ktpUploaded: false,
      passportUploaded: false,
      passportValid: false,
      photoUploaded: false,
      dpPaid: false,
      fullPayment: false,
      visaSubmitted: false,
      visaReceived: false,
      healthCertificate: false,
    };

    // Batch create in transaction
    let imported = 0;

    if (deduplicatedRows.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const row of deduplicatedRows) {
          const d = row.data;
          await tx.pilgrim.create({
            data: {
              nik: d.nik!.trim(),
              name: d.name!.trim(),
              gender: d.gender!.trim().toLowerCase(),
              birthPlace: d.birthPlace!.trim(),
              birthDate: d.birthDate!.trim(),
              address: d.address!.trim(),
              city: d.city!.trim(),
              province: d.province!.trim(),
              postalCode: d.postalCode?.trim() || null,
              phone: d.phone!.trim(),
              email: d.email!.trim(),
              whatsapp: d.whatsapp?.trim() || null,
              emergencyContact: {
                name: d.emergencyName?.trim() || '',
                phone: d.emergencyPhone?.trim() || '',
                relation: d.emergencyRelation?.trim() || '',
              },
              checklist: defaultChecklist,
              status: 'lead',
              notes: d.notes?.trim() || null,
              createdBy: auth.userId,
              agencyId: auth.agencyId,
            },
          });
          imported++;
        }
      });
    }

    // Log activity
    logActivity({
      type: 'pilgrim',
      action: 'created',
      title: 'Import jemaah dari CSV',
      description: `${imported} jemaah diimport dari file CSV`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { imported, skipped, errors: allErrors.length },
    });

    return NextResponse.json({
      imported,
      skipped,
      errors: allErrors,
    });
  } catch (error) {
    console.error('POST /api/pilgrims/import error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
