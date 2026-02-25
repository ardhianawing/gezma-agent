'use client';

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

const toastColors: Record<ToastType, { border: string; bg: string; icon: string }> = {
  success: { border: 'var(--success)', bg: 'var(--success-light)', icon: 'var(--success)' },
  error: { border: 'var(--error)', bg: 'var(--error-light)', icon: 'var(--error)' },
  warning: { border: 'var(--warning)', bg: 'var(--warning-light)', icon: 'var(--warning)' },
  info: { border: 'var(--info)', bg: 'var(--info-light)', icon: 'var(--info)' },
};

const iconMap: Record<ToastType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const colors = toastColors[toast.type];
  const Icon = iconMap[toast.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        padding: '16px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        minWidth: '300px',
        maxWidth: '400px',
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <Icon style={{ width: '20px', height: '20px', color: colors.icon }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: '500', fontSize: '14px', color: 'var(--charcoal)', margin: 0 }}>{toast.title}</p>
        {toast.description && (
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '4px', marginBottom: 0 }}>{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Tutup notifikasi"
        style={{
          flexShrink: 0,
          borderRadius: '8px',
          padding: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <X style={{ width: '16px', height: '16px', color: 'var(--gray-600)' }} />
      </button>
    </div>
  );
}

export { ToastContainer, ToastItem };
