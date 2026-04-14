'use client';

import { useState, useEffect, useCallback } from 'react';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  Newspaper, Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Star, AlertTriangle, ChevronLeft, ChevronRight, X, Save,
} from 'lucide-react';

const cc = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  danger: '#DC2626',
  success: '#059669',
  warning: '#D97706',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  inputBg: '#F8FAFC',
};

const CATEGORIES = [
  { id: 'regulasi', label: 'Regulasi', icon: '📜', color: '#2563EB' },
  { id: 'pengumuman', label: 'Pengumuman', icon: '📢', color: '#7C3AED' },
  { id: 'event', label: 'Event', icon: '📅', color: '#059669' },
  { id: 'tips', label: 'Tips & Artikel', icon: '💡', color: '#D97706' },
  { id: 'peringatan', label: 'Peringatan', icon: '⚠️', color: '#DC2626' },
];

const CAT_COLOR: Record<string, { bg: string; text: string }> = {
  regulasi: { bg: '#EFF6FF', text: '#2563EB' },
  pengumuman: { bg: '#F5F3FF', text: '#7C3AED' },
  event: { bg: '#ECFDF5', text: '#059669' },
  tips: { bg: '#FFFBEB', text: '#D97706' },
  peringatan: { bg: '#FEF2F2', text: '#DC2626' },
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  emoji: string;
  tags: string[];
  author: string;
  authorRole: string;
  readTime: number;
  isBreaking: boolean;
  isOfficial: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

type FormData = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  emoji: string;
  tags: string;
  author: string;
  authorRole: string;
  readTime: number;
  isBreaking: boolean;
  isOfficial: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  imageUrl: string;
};

const emptyForm: FormData = {
  title: '', excerpt: '', content: '', category: 'pengumuman', emoji: '📰',
  tags: '', author: 'Tim Redaksi GEZMA', authorRole: 'Editor', readTime: 5,
  isBreaking: false, isOfficial: false, isFeatured: false, isPublished: false, imageUrl: '',
};

export default function CCNewsPage() {
  const { isMobile } = useResponsive();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const PER_PAGE = 10;

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);
      const res = await fetch(`/api/command-center/news?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setArticles(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const filtered = articles.filter(a => {
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowEditor(true);
  };

  const openEdit = (article: Article) => {
    setForm({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      emoji: article.emoji,
      tags: article.tags.join(', '),
      author: article.author,
      authorRole: article.authorRole,
      readTime: article.readTime,
      isBreaking: article.isBreaking,
      isOfficial: article.isOfficial,
      isFeatured: article.isFeatured,
      isPublished: article.isPublished,
      imageUrl: article.imageUrl || '',
    });
    setEditingId(article.id);
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.excerpt || !form.content) return;
    setSaving(true);
    try {
      const body = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        imageUrl: form.imageUrl || null,
      };

      const url = editingId ? `/api/command-center/news/${editingId}` : '/api/command-center/news';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (res.ok) {
        setShowEditor(false);
        fetchArticles();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan');
      }
    } catch {
      alert('Gagal menyimpan artikel');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus artikel ini?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/command-center/news/${id}`, { method: 'DELETE' });
      if (res.ok) fetchArticles();
    } catch {
      alert('Gagal menghapus artikel');
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (article: Article) => {
    try {
      const res = await fetch(`/api/command-center/news/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !article.isPublished }),
      });
      if (res.ok) fetchArticles();
    } catch {
      alert('Gagal mengubah status publish');
    }
  };

  const getCatInfo = (cat: string) => CATEGORIES.find(c => c.id === cat);

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', backgroundColor: cc.pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Newspaper style={{ width: '28px', height: '28px', color: cc.primary }} />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: cc.textPrimary, margin: 0 }}>Manajemen Berita</h1>
            <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>Kelola artikel berita untuk SEO & informasi publik</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            backgroundColor: cc.primary, color: '#FFFFFF', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} /> Buat Artikel
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px',
        flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center',
      }}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: cc.textMuted }} />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px',
              border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg, color: cc.textPrimary,
              fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flexWrap: 'nowrap' }}>
          <button
            onClick={() => { setFilterCategory(''); setPage(1); }}
            style={{
              padding: '8px 14px', borderRadius: '6px', border: `1px solid ${!filterCategory ? cc.primary : cc.border}`,
              backgroundColor: !filterCategory ? cc.primary : cc.cardBg, color: !filterCategory ? '#FFF' : cc.textSecondary,
              fontSize: '12px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Semua
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setFilterCategory(cat.id); setPage(1); }}
              style={{
                padding: '8px 14px', borderRadius: '6px',
                border: `1px solid ${filterCategory === cat.id ? cat.color : cc.border}`,
                backgroundColor: filterCategory === cat.id ? cat.color : cc.cardBg,
                color: filterCategory === cat.id ? '#FFF' : cc.textSecondary,
                fontSize: '12px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: articles.length, color: cc.primary },
          { label: 'Published', value: articles.filter(a => a.isPublished).length, color: cc.success },
          { label: 'Draft', value: articles.filter(a => !a.isPublished).length, color: cc.warning },
          { label: 'Breaking', value: articles.filter(a => a.isBreaking).length, color: cc.danger },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: '1 1 120px', backgroundColor: cc.cardBg, borderRadius: '8px',
            border: `1px solid ${cc.border}`, padding: '14px 16px',
          }}>
            <div style={{ fontSize: '12px', color: cc.textMuted, marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Articles Table */}
      <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: cc.textMuted }}>Loading...</div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: cc.textMuted }}>
            <Newspaper style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.3 }} />
            <p>Belum ada artikel</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${cc.border}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: cc.textMuted, fontWeight: 600, fontSize: '12px' }}>Artikel</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: cc.textMuted, fontWeight: 600, fontSize: '12px', width: '100px' }}>Kategori</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: cc.textMuted, fontWeight: 600, fontSize: '12px', width: '80px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: cc.textMuted, fontWeight: 600, fontSize: '12px', width: '80px' }}>Flags</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: cc.textMuted, fontWeight: 600, fontSize: '12px', width: '120px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(article => {
                  const catColors = CAT_COLOR[article.category] || { bg: '#F3F4F6', text: '#6B7280' };
                  return (
                    <tr key={article.id} style={{ borderBottom: `1px solid ${cc.borderLight}` }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{article.emoji}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: cc.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                              {article.title}
                            </div>
                            <div style={{ fontSize: '12px', color: cc.textMuted, marginTop: '2px' }}>
                              {article.author} &middot; {article.readTime} mnt &middot; {new Date(article.createdAt).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          backgroundColor: catColors.bg, color: catColors.text,
                        }}>
                          {getCatInfo(article.category)?.icon} {getCatInfo(article.category)?.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                          backgroundColor: article.isPublished ? '#ECFDF5' : '#FEF3C7',
                          color: article.isPublished ? '#059669' : '#D97706',
                        }}>
                          {article.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                          {article.isBreaking && <span title="Breaking" style={{ fontSize: '14px' }}>🔴</span>}
                          {article.isOfficial && <span title="Official" style={{ fontSize: '14px' }}>✅</span>}
                          {article.isFeatured && <span title="Featured" style={{ fontSize: '14px' }}>⭐</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => togglePublish(article)}
                            title={article.isPublished ? 'Unpublish' : 'Publish'}
                            style={{
                              padding: '6px', borderRadius: '6px', border: `1px solid ${cc.border}`,
                              backgroundColor: cc.cardBg, cursor: 'pointer', display: 'flex', alignItems: 'center',
                            }}
                          >
                            {article.isPublished ? <EyeOff style={{ width: '14px', height: '14px', color: cc.warning }} /> : <Eye style={{ width: '14px', height: '14px', color: cc.success }} />}
                          </button>
                          <button
                            onClick={() => openEdit(article)}
                            title="Edit"
                            style={{
                              padding: '6px', borderRadius: '6px', border: `1px solid ${cc.border}`,
                              backgroundColor: cc.cardBg, cursor: 'pointer', display: 'flex', alignItems: 'center',
                            }}
                          >
                            <Edit2 style={{ width: '14px', height: '14px', color: cc.primary }} />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            title="Hapus"
                            disabled={deleting === article.id}
                            style={{
                              padding: '6px', borderRadius: '6px', border: `1px solid ${cc.border}`,
                              backgroundColor: cc.cardBg, cursor: 'pointer', display: 'flex', alignItems: 'center',
                              opacity: deleting === article.id ? 0.5 : 1,
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px', color: cc.danger }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', borderTop: `1px solid ${cc.border}`,
          }}>
            <span style={{ fontSize: '13px', color: cc.textMuted }}>
              {filtered.length} artikel &middot; Halaman {page}/{totalPages}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  padding: '6px 10px', borderRadius: '6px', border: `1px solid ${cc.border}`,
                  backgroundColor: cc.cardBg, cursor: page <= 1 ? 'default' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: '6px 10px', borderRadius: '6px', border: `1px solid ${cc.border}`,
                  backgroundColor: cc.cardBg, cursor: page >= totalPages ? 'default' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1,
                }}
              >
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
          padding: isMobile ? '0' : '40px 20px', overflowY: 'auto',
        }}>
          <div style={{
            backgroundColor: cc.cardBg, borderRadius: isMobile ? '0' : '16px',
            width: '100%', maxWidth: '800px', maxHeight: isMobile ? '100vh' : '90vh',
            overflow: 'auto', position: 'relative',
          }}>
            {/* Editor Header */}
            <div style={{
              position: 'sticky', top: 0, backgroundColor: cc.cardBg, zIndex: 10,
              padding: '20px 24px', borderBottom: `1px solid ${cc.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: cc.textPrimary, margin: 0 }}>
                {editingId ? 'Edit Artikel' : 'Buat Artikel Baru'}
              </h2>
              <button onClick={() => setShowEditor(false)} style={{ padding: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: cc.textMuted }} />
              </button>
            </div>

            {/* Editor Form */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>Judul Artikel *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Judul artikel yang menarik..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                    color: cc.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Row: Category + Emoji + ReadTime */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>Kategori *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                      color: cc.textPrimary, fontSize: '14px', outline: 'none',
                    }}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '0 0 80px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>Emoji</label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                      color: cc.textPrimary, fontSize: '14px', outline: 'none', textAlign: 'center', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ flex: '0 0 100px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>Baca (mnt)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.readTime}
                    onChange={e => setForm(f => ({ ...f, readTime: parseInt(e.target.value) || 5 }))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                      color: cc.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>Ringkasan *</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Ringkasan singkat artikel (max 500 karakter)..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                    color: cc.textPrimary, fontSize: '14px', outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Content */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>Konten Artikel *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Tulis konten artikel lengkap di sini..."
                  rows={12}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                    color: cc.textPrimary, fontSize: '14px', outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Row: Author + AuthorRole */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>Penulis *</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                      color: cc.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>Role Penulis</label>
                  <input
                    type="text"
                    value={form.authorRole}
                    onChange={e => setForm(f => ({ ...f, authorRole: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                      color: cc.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>URL Gambar Cover</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                    color: cc.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: cc.textSecondary, marginBottom: '6px' }}>Tags (pisahkan koma)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Umrah, Regulasi, Saudi"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: `1px solid ${cc.border}`, backgroundColor: cc.inputBg,
                    color: cc.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Flags */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {([
                  { key: 'isPublished' as const, label: 'Publish', icon: <Eye style={{ width: '14px', height: '14px' }} />, color: cc.success },
                  { key: 'isFeatured' as const, label: 'Featured', icon: <Star style={{ width: '14px', height: '14px' }} />, color: cc.warning },
                  { key: 'isBreaking' as const, label: 'Breaking', icon: <AlertTriangle style={{ width: '14px', height: '14px' }} />, color: cc.danger },
                  { key: 'isOfficial' as const, label: 'Official', icon: <Eye style={{ width: '14px', height: '14px' }} />, color: cc.primary },
                ]).map(flag => (
                  <label key={flag.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: cc.textSecondary }}>
                    <input
                      type="checkbox"
                      checked={form[flag.key]}
                      onChange={e => setForm(f => ({ ...f, [flag.key]: e.target.checked }))}
                      style={{ width: '18px', height: '18px', accentColor: flag.color }}
                    />
                    {flag.icon} {flag.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Editor Footer */}
            <div style={{
              position: 'sticky', bottom: 0, backgroundColor: cc.cardBg,
              padding: '16px 24px', borderTop: `1px solid ${cc.border}`,
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
            }}>
              <button
                onClick={() => setShowEditor(false)}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: `1px solid ${cc.border}`,
                  backgroundColor: cc.cardBg, color: cc.textSecondary, fontSize: '14px',
                  fontWeight: 500, cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.excerpt || !form.content}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  backgroundColor: saving ? cc.textMuted : cc.primary, color: '#FFFFFF',
                  fontSize: '14px', fontWeight: 600, cursor: saving ? 'default' : 'pointer',
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
