/**
 * Error Monitoring Service
 * Lightweight error tracking with structured logging.
 * Set ERROR_MONITOR_DSN env var to enable external reporting (Sentry-compatible).
 */

import { logger } from './logger';

interface ErrorContext {
  userId?: string;
  agencyId?: string;
  route?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

interface ErrorEvent {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: ErrorContext;
  environment: string;
  release?: string;
}

const errorBuffer: ErrorEvent[] = [];
const MAX_BUFFER = 100;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function captureException(error: Error | unknown, context: ErrorContext = {}): string {
  const err = error instanceof Error ? error : new Error(String(error));
  const event: ErrorEvent = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    level: 'error',
    message: err.message,
    stack: err.stack,
    context,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION,
  };

  errorBuffer.push(event);
  if (errorBuffer.length > MAX_BUFFER) {
    errorBuffer.shift();
  }

  logger.error(`[ErrorMonitor] ${err.message}`, {
    errorId: event.id,
    ...context,
    stack: err.stack?.split('\n').slice(0, 3).join(' | '),
  });

  const dsn = process.env.ERROR_MONITOR_DSN;
  if (dsn) {
    sendToExternalService(dsn, event).catch(() => {});
  }

  return event.id;
}

export function captureMessage(message: string, level: 'warning' | 'info' = 'info', context: ErrorContext = {}): string {
  const event: ErrorEvent = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION,
  };

  errorBuffer.push(event);
  if (errorBuffer.length > MAX_BUFFER) {
    errorBuffer.shift();
  }

  if (level === 'warning') {
    logger.warn(`[ErrorMonitor] ${message}`, context as Record<string, unknown>);
  } else {
    logger.info(`[ErrorMonitor] ${message}`, context as Record<string, unknown>);
  }

  return event.id;
}

export function getRecentErrors(limit: number = 20): ErrorEvent[] {
  return errorBuffer.slice(-limit).reverse();
}

export function getErrorStats(): { total: number; last24h: number; byLevel: Record<string, number> } {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const last24h = errorBuffer.filter(e => now - new Date(e.timestamp).getTime() < day).length;
  const byLevel: Record<string, number> = {};
  for (const e of errorBuffer) {
    byLevel[e.level] = (byLevel[e.level] || 0) + 1;
  }
  return { total: errorBuffer.length, last24h, byLevel };
}

export function clearErrors(): void {
  errorBuffer.length = 0;
}

async function sendToExternalService(dsn: string, event: ErrorEvent): Promise<void> {
  try {
    await fetch(dsn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch {
    // Silently fail — don't let monitoring crash the app
  }
}
