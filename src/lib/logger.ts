type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

function formatMessage(level: LogLevel, msg: string, meta?: LogMeta): string {
  const isProd = process.env.NODE_ENV === 'production';
  const timestamp = new Date().toISOString();

  if (isProd) {
    return JSON.stringify({ timestamp, level, msg, ...meta });
  }

  const prefix = `[${timestamp}] ${level.toUpperCase().padEnd(5)}`;
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${prefix} ${msg}${metaStr}`;
}

export const logger = {
  debug(msg: string, meta?: LogMeta) {
    if (process.env.NODE_ENV === 'production') return;
    console.debug(formatMessage('debug', msg, meta));
  },
  info(msg: string, meta?: LogMeta) {
    console.log(formatMessage('info', msg, meta));
  },
  warn(msg: string, meta?: LogMeta) {
    console.warn(formatMessage('warn', msg, meta));
  },
  error(msg: string, meta?: LogMeta) {
    console.error(formatMessage('error', msg, meta));
  },
};
