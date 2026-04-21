import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: {
    template: '%s · Komunitas GEZMA',
    default: 'Komunitas Umrah & Haji · GEZMA',
  },
  description: 'Ruang diskusi untuk jemaah, calon jemaah, dan agen travel umrah/haji Indonesia.',
  keywords: 'forum umrah, komunitas haji, diskusi umrah, review travel umrah, tips jemaah, nusuk, ppiu, pihk',
  openGraph: {
    siteName: 'Komunitas GEZMA',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function KomunitasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      color: '#0A0A0A',
      fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '0.5px solid #E5E5E5',
      }}>
        <div style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '0 16px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <Link href="/komunitas" style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Image
              src="/gezma-forum-logo.png"
              alt="GEZMA Forum"
              width={100}
              height={40}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link href="/berita" style={{
              fontSize: 14,
              color: '#0A0A0A',
              textDecoration: 'none',
              fontWeight: 500,
              padding: '8px 12px',
            }}>
              Berita
            </Link>
            <Link href="/login" style={{
              fontSize: 14,
              color: '#FFFFFF',
              backgroundColor: '#0A0A0A',
              padding: '8px 16px',
              borderRadius: 999,
              textDecoration: 'none',
              fontWeight: 600,
            }}>
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '0 16px 80px',
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '0.5px solid #E5E5E5',
        padding: '32px 16px',
        marginTop: 40,
      }}>
        <div style={{
          maxWidth: 680,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          fontSize: 13,
          color: '#737373',
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/komunitas" style={{ color: '#737373', textDecoration: 'none' }}>Forum</Link>
            <Link href="/berita" style={{ color: '#737373', textDecoration: 'none' }}>Berita</Link>
            <Link href="/login" style={{ color: '#737373', textDecoration: 'none' }}>Masuk</Link>
            <Link href="/register" style={{ color: '#737373', textDecoration: 'none' }}>Daftar</Link>
          </div>
          <span>© {new Date().getFullYear()} GEZMA</span>
        </div>
      </footer>
    </div>
  );
}
