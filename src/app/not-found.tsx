import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
      }}
    >
      <p style={{ fontSize: '72px', fontWeight: '800', color: '#E2E8F0', margin: '0 0 8px 0' }}>
        404
      </p>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 8px 0' }}>
        Halaman Tidak Ditemukan
      </h2>
      <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 28px 0', maxWidth: '400px', lineHeight: '1.6' }}>
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#D32F2F',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          textDecoration: 'none',
        }}
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
