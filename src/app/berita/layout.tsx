import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    template: '%s | GEZMA Berita',
    default: 'Berita Umrah & Haji Terbaru | GEZMA',
  },
  description: 'Berita terkini seputar umrah, haji, regulasi Saudi Arabia, dan update industri travel ibadah. Informasi terpercaya untuk travel agent PPIU/PIHK.',
  keywords: 'berita umrah, berita haji, regulasi saudi, nusuk, ppiu, travel umrah, gezma',
  openGraph: {
    siteName: 'GEZMA',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function BeritaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif',
    }}>
      {/* Top Nav */}
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
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#F60000', letterSpacing: '-0.5px' }}>GEZMA</span>
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Berita</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/berita" style={{ fontSize: '14px', color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Semua Berita</Link>
            <Link href="/login" style={{
              fontSize: '14px',
              color: '#FFFFFF',
              backgroundColor: '#F60000',
              padding: '8px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}>Masuk</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 60px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#111827',
        color: '#9CA3AF',
        padding: '40px 16px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 250px' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>GEZMA</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>Platform B2B untuk Penyelenggara Perjalanan Ibadah Umrah (PPIU) dan Haji Khusus (PIHK) di Indonesia.</p>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Kategori</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <Link href="/berita?category=regulasi" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Regulasi</Link>
                <Link href="/berita?category=pengumuman" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Pengumuman</Link>
                <Link href="/berita?category=event" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Event</Link>
                <Link href="/berita?category=tips" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Tips & Artikel</Link>
                <Link href="/berita?category=peringatan" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Peringatan</Link>
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
