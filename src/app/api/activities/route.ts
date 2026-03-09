import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: [
      {
        id: 'act-1',
        type: 'pilgrim',
        action: 'created',
        title: 'Jamaah baru terdaftar',
        description: 'Ahmad Rizki mendaftar paket Umrah Reguler Maret',
        createdAt: '2026-03-08T10:30:00Z',
      },
      {
        id: 'act-2',
        type: 'payment',
        action: 'received',
        title: 'Pembayaran diterima',
        description: 'Siti Nurhaliza - Pelunasan Rp 15.000.000',
        createdAt: '2026-03-08T09:15:00Z',
      },
      {
        id: 'act-3',
        type: 'document',
        action: 'uploaded',
        title: 'Dokumen diupload',
        description: 'Passport Budi Santoso telah diverifikasi',
        createdAt: '2026-03-07T16:45:00Z',
      },
      {
        id: 'act-4',
        type: 'trip',
        action: 'updated',
        title: 'Trip diperbarui',
        description: 'Umrah VIP April - 2 jamaah baru ditambahkan',
        createdAt: '2026-03-07T14:20:00Z',
      },
      {
        id: 'act-5',
        type: 'visa',
        action: 'approved',
        title: 'Visa disetujui',
        description: 'Visa untuk rombongan Maret (12 orang) telah terbit',
        createdAt: '2026-03-07T11:00:00Z',
      },
      {
        id: 'act-6',
        type: 'payment',
        action: 'received',
        title: 'DP diterima',
        description: 'Keluarga Hasan - DP Rp 10.000.000 untuk Umrah Ramadhan',
        createdAt: '2026-03-06T15:30:00Z',
      },
      {
        id: 'act-7',
        type: 'pilgrim',
        action: 'status_changed',
        title: 'Status jamaah berubah',
        description: 'Dewi Kartika: dokumen → visa (semua dokumen lengkap)',
        createdAt: '2026-03-06T13:00:00Z',
      },
      {
        id: 'act-8',
        type: 'system',
        action: 'reminder',
        title: 'Pengingat otomatis',
        description: '3 jamaah belum melunasi pembayaran (jatuh tempo 15 Maret)',
        createdAt: '2026-03-06T08:00:00Z',
      },
    ],
  });
}
