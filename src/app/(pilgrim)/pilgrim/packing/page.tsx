'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_DARK = '#047857';

const STORAGE_KEY = 'gezma_packing';

interface PackingCategory {
  name: string;
  emoji: string;
  items: string[];
}

const DEFAULT_CATEGORIES: PackingCategory[] = [
  {
    name: 'Dokumen',
    emoji: '\u{1F4C4}',
    items: ['Paspor', 'KTP', 'Buku Nikah', 'Foto 4x6', 'Surat Keterangan Sehat', 'Kartu Vaksin'],
  },
  {
    name: 'Pakaian Ihram',
    emoji: '\u{1F54B}',
    items: ['Kain Ihram (2 set)', 'Sabuk Ihram', 'Sandal Ihram'],
  },
  {
    name: 'Obat-obatan',
    emoji: '\u{1F48A}',
    items: ['Obat Pribadi', 'Paracetamol', 'Obat Maag', 'Minyak Angin', 'Masker', 'Hand Sanitizer'],
  },
  {
    name: 'Toiletries',
    emoji: '\u{1F9F4}',
    items: ['Sabun', 'Sampo', 'Sikat Gigi', 'Pasta Gigi', 'Handuk', 'Tisu'],
  },
  {
    name: 'Elektronik',
    emoji: '\u{1F50C}',
    items: ['Charger HP', 'Power Bank', 'Adaptor Colokan (Type G)', 'Kabel USB'],
  },
  {
    name: 'Perlengkapan Ibadah',
    emoji: '\u{1F932}',
    items: ['Sajadah Travel', 'Mukenah/Sarung', 'Al-Quran Mini', 'Tasbih', 'Buku Doa'],
  },
  {
    name: 'Lain-lain',
    emoji: '\u{1F9F3}',
    items: ['Koper', 'Tas Kecil', 'Uang SAR', 'Kacamata Hitam', 'Payung Lipat'],
  },
];

interface PackingState {
  checked: Record<string, boolean>;
  customItems: Record<string, string[]>;
}

function getStorageKey(category: string, item: string): string {
  return category + '::' + item;
}

export default function PackingChecklistPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { addToast } = useToast();
  const [state, setState] = useState<PackingState>({ checked: {}, customItems: {} });
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(JSON.parse(saved));
      }
    } catch {
      addToast({ type: 'error', title: 'Gagal memuat data packing' });
    }
    setLoaded(true);
  }, []);

  const saveState = useCallback((newState: PackingState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      addToast({ type: 'error', title: 'Gagal menyimpan data packing' });
    }
  }, []);

  const toggleItem = (category: string, item: string) => {
    const key = getStorageKey(category, item);
    const newChecked = { ...state.checked, [key]: !state.checked[key] };
    saveState({ ...state, checked: newChecked });
  };

  const addCustomItem = (category: string) => {
    const text = (newItemInputs[category] || '').trim();
    if (!text) return;
    const existing = state.customItems[category] || [];
    if (existing.includes(text)) return;
    const newCustom = { ...state.customItems, [category]: [...existing, text] };
    saveState({ ...state, customItems: newCustom });
    setNewItemInputs({ ...newItemInputs, [category]: '' });
  };

  // Calculate totals
  let totalItems = 0;
  let checkedItems = 0;
  DEFAULT_CATEGORIES.forEach((cat) => {
    const allItems = [...cat.items, ...(state.customItems[cat.name] || [])];
    totalItems += allItems.length;
    allItems.forEach((item) => {
      if (state.checked[getStorageKey(cat.name, item)]) checkedItems++;
    });
  });
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  if (!loaded) return null;

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: 700,
          color: c.textPrimary,
          margin: '0 0 4px 0',
        }}>
          {'\u{1F9F3}'} Packing Checklist
        </h1>
        <p style={{
          fontSize: '14px',
          color: c.textMuted,
          margin: 0,
        }}>
          Pastikan semua perlengkapan umrah Anda sudah siap
        </p>
      </div>

      {/* Progress */}
      <div style={{
        backgroundColor: c.cardBg,
        border: '1px solid ' + c.border,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: c.textPrimary,
          }}>
            Progress Packing
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: 700,
            color: GREEN,
          }}>
            {checkedItems}/{totalItems} ({progressPercent}%)
          </span>
        </div>
        <div style={{
          height: '10px',
          backgroundColor: c.borderLight,
          borderRadius: '6px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: progressPercent + '%',
            height: '100%',
            backgroundColor: GREEN,
            borderRadius: '6px',
            transition: 'width 0.3s ease',
          }} />
        </div>
        {progressPercent === 100 && (
          <p style={{
            fontSize: '13px',
            color: GREEN,
            fontWeight: 600,
            margin: '10px 0 0 0',
            textAlign: 'center',
          }}>
            {'\u{2705}'} Semua perlengkapan sudah siap!
          </p>
        )}
      </div>

      {/* Print button */}
      <button
        onClick={() => window.print()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '12px',
          fontSize: '14px',
          fontWeight: 600,
          color: GREEN,
          backgroundColor: GREEN_LIGHT,
          border: '1px solid ' + GREEN,
          borderRadius: '10px',
          cursor: 'pointer',
          marginBottom: '16px',
        }}
      >
        {'\u{1F5A8}\u{FE0F}'} Cetak Checklist
      </button>

      {/* Categories */}
      {DEFAULT_CATEGORIES.map((cat) => {
        const allItems = [...cat.items, ...(state.customItems[cat.name] || [])];
        const catChecked = allItems.filter((item) => state.checked[getStorageKey(cat.name, item)]).length;

        return (
          <div key={cat.name} style={{
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.border,
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '12px',
          }}>
            {/* Category header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: c.textPrimary,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {cat.emoji} {cat.name}
              </h3>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: catChecked === allItems.length ? GREEN : c.textMuted,
                backgroundColor: catChecked === allItems.length ? GREEN_LIGHT : c.pageBg,
                padding: '3px 10px',
                borderRadius: '12px',
              }}>
                {catChecked}/{allItems.length}
              </span>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {allItems.map((item) => {
                const key = getStorageKey(cat.name, item);
                const isChecked = !!state.checked[key];
                return (
                  <label
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: isChecked ? GREEN_LIGHT : c.pageBg,
                      border: '1px solid ' + (isChecked ? GREEN : c.borderLight),
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(cat.name, item)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: GREEN,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: isChecked ? 500 : 400,
                      color: isChecked ? GREEN_DARK : c.textPrimary,
                      textDecoration: isChecked ? 'line-through' : 'none',
                    }}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Add custom item */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '10px',
            }}>
              <input
                type="text"
                placeholder="Tambah item..."
                value={newItemInputs[cat.name] || ''}
                onChange={(e) => setNewItemInputs({ ...newItemInputs, [cat.name]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustomItem(cat.name);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid ' + c.borderLight,
                  borderRadius: '8px',
                  backgroundColor: c.pageBg,
                  color: c.textPrimary,
                  outline: 'none',
                }}
              />
              <button
                onClick={() => addCustomItem(cat.name)}
                style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: GREEN,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Tambah
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
