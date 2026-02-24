'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, Package, Plane, X } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface SearchResult {
  pilgrims: Array<{ id: string; name: string; nik: string; phone: string; status: string }>;
  packages: Array<{ id: string; name: string; category: string; publishedPrice: number; isActive: boolean }>;
  trips: Array<{ id: string; name: string; departureDate: string | null; status: string; registeredCount: number; capacity: number }>;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { c } = useTheme();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ pilgrims: [], packages: [], trips: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Build flat list of navigable items
  const flatItems: Array<{ type: string; id: string; label: string; sub: string; href: string }> = [];
  results.pilgrims.forEach((p) => flatItems.push({ type: 'pilgrim', id: p.id, label: p.name, sub: `NIK: ${p.nik} | ${p.phone}`, href: `/pilgrims/${p.id}` }));
  results.packages.forEach((p) => flatItems.push({ type: 'package', id: p.id, label: p.name, sub: p.category, href: `/packages/${p.id}` }));
  results.trips.forEach((t) => flatItems.push({ type: 'trip', id: t.id, label: t.name, sub: t.departureDate ? new Date(t.departureDate).toLocaleDateString('id-ID') : '-', href: `/trips/${t.id}` }));

  const totalResults = flatItems.length;
  const hasResults = totalResults > 0;
  const hasQuery = query.trim().length > 0;

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({ pilgrims: [], packages: [], trips: [] });
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ pilgrims: [], packages: [], trips: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalResults - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < totalResults) {
      e.preventDefault();
      navigateTo(flatItems[activeIndex].href);
    }
  };

  const navigateTo = (href: string) => {
    onClose();
    router.push(href);
  };

  // Global shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const getTypeIcon = (type: string) => {
    if (type === 'pilgrim') return <Users style={{ width: '16px', height: '16px', color: c.textMuted, flexShrink: 0 }} />;
    if (type === 'package') return <Package style={{ width: '16px', height: '16px', color: c.textMuted, flexShrink: 0 }} />;
    return <Plane style={{ width: '16px', height: '16px', color: c.textMuted, flexShrink: 0 }} />;
  };

  let itemIndex = -1;

  const renderSection = (title: string, items: typeof flatItems, sectionType: string) => {
    const sectionItems = items.filter((i) => i.type === sectionType);
    if (sectionItems.length === 0) return null;
    return (
      <div key={sectionType}>
        <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </div>
        {sectionItems.map((item) => {
          itemIndex++;
          const idx = itemIndex;
          const isActive = idx === activeIndex;
          return (
            <div
              key={item.id}
              onClick={() => navigateTo(item.href)}
              onMouseEnter={() => setActiveIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                cursor: 'pointer',
                backgroundColor: isActive ? c.primaryLight || '#EFF6FF' : 'transparent',
                borderRadius: '8px',
                margin: '0 8px',
                transition: 'background-color 0.1s',
              }}
            >
              {getTypeIcon(item.type)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '12px', color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Reset itemIndex before rendering
  itemIndex = -1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Dialog */}
      <div
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          margin: '0 16px',
          backgroundColor: c.cardBg,
          borderRadius: '16px',
          border: `1px solid ${c.border}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: `1px solid ${c.border}` }}>
          <Search style={{ width: '20px', height: '20px', color: c.textMuted, flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
            placeholder="Cari jamaah, paket, atau perjalanan..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '16px',
              color: c.textPrimary,
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: c.textMuted, display: 'flex' }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          )}
          <kbd style={{
            padding: '2px 8px',
            fontSize: '11px',
            color: c.textMuted,
            backgroundColor: c.pageBg,
            borderRadius: '6px',
            border: `1px solid ${c.border}`,
            fontFamily: 'inherit',
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px 0' }}>
          {loading && (
            <div style={{ padding: '24px', textAlign: 'center', fontSize: '14px', color: c.textMuted }}>
              Mencari...
            </div>
          )}

          {!loading && hasQuery && !hasResults && (
            <div style={{ padding: '24px', textAlign: 'center', fontSize: '14px', color: c.textMuted }}>
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && hasResults && (
            <>
              {renderSection('Jamaah', flatItems, 'pilgrim')}
              {renderSection('Paket', flatItems, 'package')}
              {renderSection('Perjalanan', flatItems, 'trip')}
            </>
          )}

          {!hasQuery && !loading && (
            <div style={{ padding: '24px', textAlign: 'center', fontSize: '14px', color: c.textMuted }}>
              Ketik untuk mulai mencari...
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: `1px solid ${c.border}`, display: 'flex', gap: '16px', fontSize: '11px', color: c.textMuted }}>
          <span><kbd style={{ padding: '1px 4px', borderRadius: '3px', border: `1px solid ${c.border}`, fontSize: '10px' }}>&#x2191;&#x2193;</kbd> Navigasi</span>
          <span><kbd style={{ padding: '1px 4px', borderRadius: '3px', border: `1px solid ${c.border}`, fontSize: '10px' }}>Enter</kbd> Buka</span>
          <span><kbd style={{ padding: '1px 4px', borderRadius: '3px', border: `1px solid ${c.border}`, fontSize: '10px' }}>Esc</kbd> Tutup</span>
        </div>
      </div>
    </div>
  );
}
