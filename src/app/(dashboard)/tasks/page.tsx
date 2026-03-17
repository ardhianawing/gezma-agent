'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, X, GripVertical, Trash2, Calendar, Flag, User, Loader2, CheckSquare } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useLanguage } from '@/lib/i18n';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: string | null;
  assigneeName: string | null;
  createdBy: string;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
}

// STATUS_COLUMNS and PRIORITY_CONFIG moved inside component for i18n

export default function TasksPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { user: authUser } = useAuth();
  const { t } = useLanguage();

  const STATUS_COLUMNS = [
    { key: 'todo', label: t.tasks.columnTodo, color: '#6B7280' },
    { key: 'in_progress', label: t.tasks.columnInProgress, color: '#F59E0B' },
    { key: 'done', label: t.tasks.columnDone, color: '#10B981' },
  ];

  const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: t.tasks.priorityLow, color: '#6B7280', bg: '#F3F4F6' },
    medium: { label: t.tasks.priorityMedium, color: '#F59E0B', bg: '#FEF3C7' },
    high: { label: t.tasks.priorityHigh, color: '#EF4444', bg: '#FEE2E2' },
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    assigneeName: '',
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (assigneeFilter) params.set('assignedTo', assigneeFilter);
      const res = await fetch(`/api/tasks?${params}`);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [assigneeFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch team members
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((json) => {
        const members = (json.data || json || []).map((u: { id: string; name: string }) => ({ id: u.id, name: u.name }));
        setTeamMembers(members);
      })
      .catch(() => {});
  }, []);

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
      else map.todo.push(t);
    });
    return map;
  }, [tasks]);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          assignedTo: form.assignedTo || undefined,
          assigneeName: form.assigneeName || undefined,
        }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [newTask, ...prev]);
        setShowModal(false);
        setForm({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', assigneeName: '' });
        addToast({ type: 'success', title: t.tasks.saveSuccess });
      }
    } catch {
      addToast({ type: 'error', title: t.tasks.saveError });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      }
    } catch {
      // silently fail
    }
  }

  async function handleDeleteTask() {
    if (!deleteTaskId) return;
    try {
      const res = await fetch(`/api/tasks/${deleteTaskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== deleteTaskId));
        addToast({ type: 'success', title: t.tasks.deleteSuccess });
      }
    } catch {
      addToast({ type: 'error', title: t.tasks.deleteError });
    } finally {
      setDeleteTaskId(null);
    }
  }

  function handleDrop(newStatus: string) {
    if (!draggedTask) return;
    const task = tasks.find((t) => t.id === draggedTask);
    if (task && task.status !== newStatus) {
      handleStatusChange(draggedTask, newStatus);
    }
    setDraggedTask(null);
  }

  function handleAssigneeSelect(memberId: string) {
    const member = teamMembers.find((m) => m.id === memberId);
    setForm((f) => ({ ...f, assignedTo: memberId, assigneeName: member?.name || '' }));
  }

  function formatDueDate(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (diffDays < 0) return { text: dateStr, color: '#EF4444' };
    if (diffDays <= 2) return { text: dateStr, color: '#F59E0B' };
    return { text: dateStr, color: c.textMuted };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {t.tasks.title}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
            {t.tasks.subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.cardBg,
              color: c.textPrimary,
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '160px',
            }}
          >
            <option value="">{t.tasks.filterAllMembers}</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: c.primary,
              color: 'white',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            {t.tasks.createTask}
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', minWidth: 'max-content' }}>
          {STATUS_COLUMNS.map((col) => {
            const colTasks = tasksByStatus[col.key] || [];
            return (
              <div
                key={col.key}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = c.primaryLight || '#EFF6FF'; }}
                onDragLeave={(e) => { e.currentTarget.style.backgroundColor = c.pageBg; }}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = c.pageBg; handleDrop(col.key); }}
                style={{
                  minWidth: isMobile ? '280px' : '320px',
                  width: isMobile ? '280px' : '320px',
                  backgroundColor: c.pageBg,
                  borderRadius: '12px',
                  border: `1px solid ${c.border}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'background-color 0.15s',
                }}
              >
                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px', borderBottom: `2px solid ${col.color}` }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: col.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', fontWeight: '700', color: c.textPrimary }}>{col.label}</span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: c.textMuted,
                    backgroundColor: c.cardBg,
                    padding: '2px 10px',
                    borderRadius: '10px',
                  }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks */}
                {loading ? (
                  <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: c.textMuted }}>
                    <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : colTasks.length === 0 ? (
                  <EmptyState icon={CheckSquare} title={t.tasks.empty} />
                ) : (
                  colTasks.map((task) => {
                    const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                    const due = task.dueDate ? formatDueDate(task.dueDate) : null;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggedTask(task.id)}
                        onDragEnd={() => setDraggedTask(null)}
                        style={{
                          backgroundColor: c.cardBg,
                          borderRadius: '10px',
                          border: `1px solid ${draggedTask === task.id ? c.primary : c.border}`,
                          padding: '14px',
                          cursor: 'grab',
                          opacity: draggedTask === task.id ? 0.5 : 1,
                          transition: 'border-color 0.15s, opacity 0.15s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        {/* Title + delete */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <GripVertical style={{ width: '16px', height: '16px', color: c.textMuted, flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, lineHeight: '1.4' }}>
                              {task.title}
                            </div>
                            {task.description && (
                              <div style={{ fontSize: '12px', color: c.textMuted, marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {task.description}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setDeleteTaskId(task.id)}
                            title="Hapus task"
                            aria-label="Hapus"
                            style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', color: c.textMuted, cursor: 'pointer', display: 'flex', flexShrink: 0 }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>

                        {/* Meta row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {/* Priority badge */}
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: priorityCfg.bg,
                            color: priorityCfg.color,
                          }}>
                            <Flag style={{ width: '10px', height: '10px' }} />
                            {priorityCfg.label}
                          </span>

                          {/* Due date */}
                          {due && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: due.color,
                            }}>
                              <Calendar style={{ width: '10px', height: '10px' }} />
                              {due.text}
                            </span>
                          )}

                          {/* Assignee */}
                          {task.assigneeName && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: c.textMuted,
                              marginLeft: 'auto',
                            }}>
                              <User style={{ width: '10px', height: '10px' }} />
                              {task.assigneeName}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 16px', backgroundColor: c.cardBg, borderRadius: '16px', border: `1px solid ${c.border}`, padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>{t.tasks.modalTitle}</h3>
              <button onClick={() => setShowModal(false)} style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: c.textMuted, display: 'flex' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: c.textMuted, marginBottom: '6px' }}>{t.tasks.fieldTitle}</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t.tasks.fieldTitlePlaceholder}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.inputBg || c.cardBg,
                    color: c.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: c.textMuted, marginBottom: '6px' }}>{t.tasks.fieldDescription}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t.tasks.fieldDescriptionPlaceholder}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.inputBg || c.cardBg,
                    color: c.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Priority + Due Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: c.textMuted, marginBottom: '6px' }}>{t.tasks.fieldPriority}</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: `1px solid ${c.border}`,
                      backgroundColor: c.inputBg || c.cardBg,
                      color: c.textPrimary,
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="low">{t.tasks.priorityLow}</option>
                    <option value="medium">{t.tasks.priorityMedium}</option>
                    <option value="high">{t.tasks.priorityHigh}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: c.textMuted, marginBottom: '6px' }}>{t.tasks.fieldDueDate}</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: `1px solid ${c.border}`,
                      backgroundColor: c.inputBg || c.cardBg,
                      color: c.textPrimary,
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: c.textMuted, marginBottom: '6px' }}>{t.tasks.fieldAssignee}</label>
                <select
                  value={form.assignedTo}
                  onChange={(e) => handleAssigneeSelect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${c.border}`,
                    backgroundColor: c.inputBg || c.cardBg,
                    color: c.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">{t.tasks.fieldAssigneeNone}</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px', fontSize: '14px', fontWeight: '500',
                    color: c.textSecondary, backgroundColor: c.cardBg, border: `1px solid ${c.border}`,
                    borderRadius: '12px', cursor: 'pointer',
                  }}
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '12px 24px', fontSize: '14px', fontWeight: '600',
                    color: 'white', backgroundColor: saving ? c.textMuted : c.primary,
                    border: 'none', borderRadius: '12px', cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {saving && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                    {saving ? t.common.saving : t.tasks.createTask}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteTask}
        title={t.tasks.deleteConfirmTitle}
        description={t.tasks.deleteConfirmDesc}
        confirmLabel={t.common.delete}
        variant="destructive"
      />

    </div>
  );
}
