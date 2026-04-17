import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    template: '%s | GEZMA Komunitas',
    default: 'Komunitas Umrah & Haji Indonesia | GEZMA',
  },
  description: 'Forum komunitas terbesar untuk jemaah, agen travel, dan praktisi ibadah umrah/haji di Indonesia. Diskusi, tips, review, dan peringatan penting.',
  keywords: 'forum umrah, komunitas haji, diskusi umrah, review travel umrah, tips jemaah, nusuk, ppiu',
  openGraph: {
    siteName: 'GEZMA Komunitas',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function KomunitasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif',
    }}>
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#F60000', letterSpacing: '-0.5px' }}>GEZMA</span>
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Komunitas</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/komunitas" style={{ fontSize: '14px', color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Forum</Link>
            <Link href="/berita" style={{ fontSize: '14px', color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Berita</Link>
            <Link href="/login" style={{
              fontSize: '14px',
              color: '#FFFFFF',
              backgroundColor: '#F60000',
              padding: '8px 18px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}>Masuk</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 60px' }}>
        {children}
      </main>

      <footer style={{
        backgroundColor: '#111827',
        color: '#9CA3AF',
        padding: '40px 16px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 250px' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>GEZMA</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>Platform B2B & komunitas untuk industri umrah dan haji Indonesia — jemaah, agen travel, dan praktisi ibadah.</p>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Jelajahi</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <Link href="/komunitas" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Forum Komunitas</Link>
                <Link href="/berita" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Berita Umrah & Haji</Link>
                <Link href="/login" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Masuk / Daftar</Link>
              </div>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Kontak</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <span>Email: support@gezma.id</span>
                <span>WhatsApp: +62 812-3456-7890</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #374151', paddingTop: '20px', fontSize: '13px', textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} GEZMA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
