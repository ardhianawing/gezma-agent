import type { Metadata } from 'next';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s · GEZMA Komunitas',
    default: 'Komunitas Umrah & Haji Indonesia · GEZMA',
  },
  description: 'Ruang diskusi terpercaya untuk jemaah, calon jemaah, dan praktisi ibadah umrah & haji Indonesia. Tips, regulasi, pengalaman, dan peringatan.',
  keywords: 'forum umrah, komunitas haji, diskusi umrah, review travel umrah, tips jemaah, nusuk, ppiu, pihk',
  openGraph: {
    siteName: 'GEZMA Komunitas',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function KomunitasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={fraunces.variable} style={{
      minHeight: '100vh',
      backgroundColor: '#FAF6EE',
      color: '#1A1814',
      fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Atmospheric background — Islamic geometric pattern, very subtle */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='%230B5D4E' stroke-width='0.5' opacity='0.08'><path d='M30 0 L60 30 L30 60 L0 30 Z'/><circle cx='30' cy='30' r='15'/><path d='M15 15 L45 15 L45 45 L15 45 Z' transform='rotate(45 30 30)'/></g></svg>")`,
          backgroundSize: '60px 60px',
          opacity: 1,
          zIndex: 0,
        }}
      />

      {/* Noise overlay for warmth */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/></svg>")`,
          mixBlendMode: 'multiply',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(250, 246, 238, 0.85)',
        backdropFilter: 'saturate(160%) blur(14px)',
        WebkitBackdropFilter: 'saturate(160%) blur(14px)',
        borderBottom: '1px solid rgba(26, 24, 20, 0.08)',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <Link href="/komunitas" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#0B5D4E',
              fontStyle: 'italic',
            }}>
              Komunitas
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#BF9D63',
            }}>
              by GEZMA
            </span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Link href="/komunitas" style={{
              fontSize: 14,
              color: '#1A1814',
              textDecoration: 'none',
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}>Forum</Link>
            <Link href="/berita" style={{
              fontSize: 14,
              color: '#1A1814',
              textDecoration: 'none',
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}>Berita</Link>
            <Link href="/login" style={{
              fontSize: 13,
              color: '#FAF6EE',
              backgroundColor: '#0B5D4E',
              padding: '10px 22px',
              borderRadius: 2,
              textDecoration: 'none',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              borderBottom: '3px solid #08443A',
              transition: 'transform 0.15s ease',
            }}>Masuk</Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '40px 24px 80px',
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 1,
        backgroundColor: '#0B2A24',
        color: '#C9BFA8',
        paddingTop: 60,
        paddingBottom: 40,
        overflow: 'hidden',
      }}>
        {/* Ornamental divider */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}>
          <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, transparent, #BF9D6380)', maxWidth: 200 }} />
          <span style={{ color: '#BF9D63', fontSize: 18, fontWeight: 700 }}>۞</span>
          <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, transparent, #BF9D6380)', maxWidth: 200 }} />
        </div>

        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '30px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px 60px', marginBottom: 40 }}>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                color: '#FAF6EE',
                fontSize: 24,
                fontWeight: 800,
                fontStyle: 'italic',
                margin: '0 0 12px',
                letterSpacing: '-0.02em',
              }}>
                GEZMA Komunitas
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: '#A39882' }}>
                Wadah terpercaya untuk berbagi pengalaman, menanyakan regulasi, dan mempersiapkan perjalanan ibadah terbaik bersama sesama jemaah serta agen travel Indonesia.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#BF9D63', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 18px' }}>Jelajah</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <Link href="/komunitas" style={{ color: '#C9BFA8', textDecoration: 'none' }}>Forum Komunitas</Link>
                <Link href="/berita" style={{ color: '#C9BFA8', textDecoration: 'none' }}>Berita Umrah & Haji</Link>
                <Link href="/login" style={{ color: '#C9BFA8', textDecoration: 'none' }}>Masuk ke Dashboard</Link>
                <Link href="/register" style={{ color: '#C9BFA8', textDecoration: 'none' }}>Daftar Akun</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#BF9D63', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 18px' }}>Hubungi</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <span>support@gezma.id</span>
                <span>+62 812-3456-7890</span>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(191, 157, 99, 0.18)',
            paddingTop: 20,
            fontSize: 12,
            color: '#6F6556',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <span>© {new Date().getFullYear()} GEZMA. Made in Indonesia.</span>
            <span style={{ letterSpacing: '0.08em' }}>بارك الله فيكم</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
