'use client';

import Link from 'next/link';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockPilgrims } from '@/data/mock-pilgrims';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

export default function PilgrimsPage() {
  const { t } = useLanguage();
  const { c } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ==================== HEADER ==================== */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {t.pilgrims.title}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
            {t.pilgrims.description}
          </p>
        </div>

        {/* Button Add Pilgrim */}
        <Link href="/pilgrims/new">
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: c.primary,
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t.pilgrims.addPilgrim}
          </button>
        </Link>
      </div>

      {/* ==================== SEARCH & FILTER ==================== */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <div
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: c.textLight,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t.pilgrims.searchPlaceholder}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '52px',
              paddingRight: '16px',
              fontSize: '14px',
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: c.cardBg,
              color: c.textPrimary,
            }}
          />
        </div>

        {/* Filter Button */}
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            height: '44px',
            padding: '0 20px',
            fontSize: '14px',
            fontWeight: '500',
            color: c.textSecondary,
            backgroundColor: c.cardBg,
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {t.common.filter}
        </button>
      </div>

      {/* ==================== TABLE ==================== */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: `1px solid ${c.border}`,
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: c.cardBgHover, borderBottom: `1px solid ${c.border}` }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t.pilgrims.tableHeaders.pilgrim}
                </th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t.pilgrims.tableHeaders.contact}
                </th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t.pilgrims.tableHeaders.status}
                </th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t.pilgrims.tableHeaders.documents}
                </th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t.pilgrims.tableHeaders.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {mockPilgrims.map((pilgrim, index) => (
                <tr
                  key={pilgrim.id}
                  style={{
                    borderBottom: index < mockPilgrims.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                  }}
                >
                  {/* Pilgrim */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: c.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          flexShrink: 0,
                        }}
                      >
                        {pilgrim.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>
                          {pilgrim.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: c.textMuted }}>
                          {pilgrim.nik}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td style={{ padding: '16px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: c.textPrimary }}>
                      {pilgrim.email}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: c.textMuted }}>
                      {pilgrim.phone}
                    </p>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px' }}>
                    <StatusBadge status={pilgrim.status} size="sm" />
                  </td>

                  {/* Documents */}
                  <td style={{ padding: '16px' }}>
                    {(() => {
                      const completed = pilgrim.documents.filter(d => d.status === 'verified').length;
                      const total = 4;
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {Array.from({ length: total }).map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: i < completed ? c.success : c.border,
                              }}
                            />
                          ))}
                          <span style={{ marginLeft: '8px', fontSize: '12px', color: c.textSecondary }}>
                            {completed}/{total}
                          </span>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Link href={`/pilgrims/${pilgrim.id}`}>
                        <button
                          title={t.common.view}
                          style={{
                            padding: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: c.textLight,
                          }}
                        >
                          <Eye style={{ width: '18px', height: '18px' }} />
                        </button>
                      </Link>
                      <button
                        title={t.common.edit}
                        style={{
                          padding: '8px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: c.textLight,
                        }}
                      >
                        <Edit2 style={{ width: '18px', height: '18px' }} />
                      </button>
                      <button
                        title={t.common.delete}
                        style={{
                          padding: '8px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: c.textLight,
                        }}
                      >
                        <Trash2 style={{ width: '18px', height: '18px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderTop: `1px solid ${c.border}`,
            backgroundColor: c.cardBgHover
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: c.textSecondary }}>
            {t.pilgrims.showing} <span style={{ fontWeight: '500' }}>{mockPilgrims.length}</span> {t.pilgrims.pilgrimsLabel}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                color: c.textLight,
                backgroundColor: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '6px',
                cursor: 'not-allowed',
              }}
            >
              {t.common.previous}
            </button>
            <button
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                color: c.textSecondary,
                backgroundColor: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {t.common.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
