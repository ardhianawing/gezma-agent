'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { Plus, Edit2, Trash2, X, Shield, Users, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { usePermission } from '@/lib/hooks/use-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { ROLE_PERMISSIONS, PERMISSION_GROUPS } from '@/lib/permissions';
import { useLanguage } from '@/lib/i18n';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string | null;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
  position: string;
  phone: string;
}

const ROLES = ['owner', 'admin', 'staff', 'marketing'];

const emptyForm: UserForm = { name: '', email: '', password: '', role: 'staff', position: '', phone: '' };

export default function UsersPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { can } = usePermission();
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserData[]>([]);
  const [showPermissions, setShowPermissions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{id: string, name: string} | null>(null);

  const fetchUsers = () => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((json) => setUsers(json.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (user: UserData) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      position: user.position || '',
      phone: user.phone || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        const res = await fetch(`/api/users/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            role: form.role,
            position: form.position || null,
            phone: form.phone || null,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Gagal menyimpan');
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Gagal menyimpan');
        }
      }
      setShowModal(false);
      addToast({ type: 'success', title: editingId ? 'User berhasil diperbarui' : 'User berhasil ditambahkan' });
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        addToast({ type: 'error', title: 'Gagal menghapus', description: data.error });
        return;
      }
      addToast({ type: 'success', title: 'User berhasil dihapus' });
      fetchUsers();
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan' });
    }
    setDeleteTarget(null);
  };

  const handleToggleActive = async (user: UserData) => {
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      fetchUsers();
    } catch {
      // silent fail
    }
  };

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return { bg: '#fef3c7', color: '#d97706' };
      case 'admin': return { bg: '#dbeafe', color: '#2563eb' };
      case 'marketing': return { bg: '#f3e8ff', color: '#7c3aed' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.settings.users}
        description={t.settings.teamDesc}
        actions={
          <button
            onClick={openCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: c.primary,
              color: 'white',
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Plus style={{ width: '20px', height: '20px' }} />
            <span>{t.common.add} User</span>
          </button>
        }
      />

      {/* User Table */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: c.textSecondary }}>{t.common.loadingData}</div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title={t.common.noData} description={t.common.noData} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>Nama</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>Jabatan</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const badge = roleBadgeColor(user.role);
                  return (
                    <tr key={user.id} style={{ borderBottom: `1px solid ${c.borderLight}` }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>{user.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: c.textSecondary }}>{user.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '12px', fontWeight: '500', padding: '2px 10px', borderRadius: '12px' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: c.textSecondary }}>{user.position || '-'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleActive(user)}
                          style={{
                            padding: '8px 12px',
                            minHeight: '36px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                            color: user.isActive ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {user.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openEdit(user)}
                            aria-label="Edit"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textSecondary }}
                          >
                            <Edit2 style={{ width: '16px', height: '16px' }} />
                          </button>
                          {can(PERMISSIONS.USERS_DELETE) && (
                            <button
                              onClick={() => setDeleteTarget({id: user.id, name: user.name})}
                              aria-label="Hapus"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}
                            >
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permission Matrix */}
      <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
        <button
          onClick={() => setShowPermissions(!showPermissions)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', minHeight: '56px', background: 'none', border: 'none', cursor: 'pointer', color: c.textPrimary,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield style={{ width: '18px', height: '18px', color: c.textMuted }} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Permission Matrix per Role</span>
          </div>
          <span style={{ fontSize: '12px', color: c.textMuted }}>{showPermissions ? t.common.close : t.common.view}</span>
        </button>
        {showPermissions && (
          <div style={{ overflowX: 'auto', borderTop: `1px solid ${c.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>Modul</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>Aksi</th>
                  {['owner', 'admin', 'staff', 'marketing'].map((role) => (
                    <th key={role} style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: c.textSecondary, textTransform: 'capitalize' }}>{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_GROUPS.map((group) =>
                  group.permissions.map((perm, i) => (
                    <tr key={perm.key} style={{ borderBottom: `1px solid ${c.borderLight}` }}>
                      {i === 0 && (
                        <td rowSpan={group.permissions.length} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '500', color: c.textPrimary, verticalAlign: 'top' }}>
                          {group.label}
                        </td>
                      )}
                      <td style={{ padding: '8px 16px', fontSize: '13px', color: c.textSecondary }}>{perm.label}</td>
                      {['owner', 'admin', 'staff', 'marketing'].map((role) => {
                        const has = (ROLE_PERMISSIONS[role] || []).includes(perm.key as never);
                        return (
                          <td key={role} style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '14px', color: has ? '#16a34a' : '#d1d5db' }}>
                              {has ? '\u2713' : '\u2717'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: isMobile ? '0' : '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              backgroundColor: c.cardBg,
              borderRadius: isMobile ? '0' : '16px',
              padding: isMobile ? '20px' : '24px',
              width: '100%',
              maxWidth: isMobile ? '100%' : '480px',
              maxHeight: isMobile ? '100%' : '90vh',
              height: isMobile ? '100%' : 'auto',
              overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
                {editingId ? `${t.common.edit} User` : `${t.common.add} User`}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '20px', height: '20px', color: c.textSecondary }} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: c.textPrimary, marginBottom: '6px' }}>Nama *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', minHeight: '46px', borderRadius: '8px', border: `1px solid ${c.border}`, fontSize: '14px', backgroundColor: c.cardBg, color: c.textPrimary, boxSizing: 'border-box' as const }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: c.textPrimary, marginBottom: '6px' }}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!!editingId}
                  style={{ width: '100%', padding: '10px 12px', minHeight: '46px', borderRadius: '8px', border: `1px solid ${c.border}`, fontSize: '14px', backgroundColor: editingId ? c.cardBgHover : c.cardBg, color: c.textPrimary, boxSizing: 'border-box' as const }}
                />
              </div>
              {!editingId && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: c.textPrimary, marginBottom: '6px' }}>Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 karakter"
                    style={{ width: '100%', padding: '10px 12px', minHeight: '46px', borderRadius: '8px', border: `1px solid ${c.border}`, fontSize: '14px', backgroundColor: c.cardBg, color: c.textPrimary, boxSizing: 'border-box' as const }}
                  />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: c.textPrimary, marginBottom: '6px' }}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', minHeight: '46px', borderRadius: '8px', border: `1px solid ${c.border}`, fontSize: '14px', backgroundColor: c.cardBg, color: c.textPrimary, boxSizing: 'border-box' as const }}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: c.textPrimary, marginBottom: '6px' }}>Jabatan</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="e.g. Admin Operasional"
                  style={{ width: '100%', padding: '10px 12px', minHeight: '46px', borderRadius: '8px', border: `1px solid ${c.border}`, fontSize: '14px', backgroundColor: c.cardBg, color: c.textPrimary, boxSizing: 'border-box' as const }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: c.textPrimary, marginBottom: '6px' }}>Telepon</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', minHeight: '46px', borderRadius: '8px', border: `1px solid ${c.border}`, fontSize: '14px', backgroundColor: c.cardBg, color: c.textPrimary, boxSizing: 'border-box' as const }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: isMobile ? 'stretch' : 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 20px', minHeight: '44px', borderRadius: '8px', border: `1px solid ${c.border}`, backgroundColor: 'transparent', color: c.textPrimary, fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '10px 20px', minHeight: '44px', borderRadius: '8px', border: 'none', backgroundColor: c.primary, color: 'white', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    {t.common.saving}
                  </span>
                ) : t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus user "${deleteTarget?.name}"?`}
        description="User akan dihapus permanen dan kehilangan akses."
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  );
}
