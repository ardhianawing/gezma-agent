'use client';

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />,
  error: <AlertCircle className="h-5 w-5 text-[var(--error)]" />,
  warning: <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />,
  info: <Info className="h-5 w-5 text-[var(--info)]" />,
};

const toastStyles: Record<ToastType, string> = {
  success: "border-[var(--success)] bg-[var(--success-light)]",
  error: "border-[var(--error)] bg-[var(--error-light)]",
  warning: "border-[var(--warning)] bg-[var(--warning-light)]",
  info: "border-[var(--info)] bg-[var(--info-light)]",
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[12px] border p-4 shadow-lg animate-in slide-in-from-right-full duration-300 min-w-[300px] max-w-[400px]",
        toastStyles[toast.type]
      )}
    >
      <div className="flex-shrink-0">{toastIcons[toast.type]}</div>
      <div className="flex-1">
        <p className="font-medium text-sm text-[var(--charcoal)]">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-[var(--gray-600)] mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-[8px] p-1 hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4 text-[var(--gray-600)]" />
      </button>
    </div>
  );
}

export { ToastContainer, ToastItem };
