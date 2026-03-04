/**
 * API Performance Metrics Tracker.
 * Tracks response times, request counts, and error rates per route.
 * In-memory store — for production, wire to a time-series DB (Prometheus, InfluxDB).
 */

interface RouteMetric {
  route: string;
  method: string;
  totalRequests: number;
  errorCount: number;
  totalDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  lastRequestAt: number;
  /** Last 100 response times for percentile calculation */
  recentDurations: number[];
}

const metrics = new Map<string, RouteMetric>();

/** Max recent durations to keep per route */
const MAX_RECENT = 100;

/** Cleanup: remove routes with no requests in 1 hour */
const STALE_THRESHOLD = 60 * 60 * 1000;

function getKey(method: string, route: string): string {
  return `${method}:${route}`;
}

/**
 * Record an API request's performance.
 */
export function recordApiMetric(
  method: string,
  route: string,
  durationMs: number,
  statusCode: number
): void {
  const key = getKey(method, route);
  let metric = metrics.get(key);

  if (!metric) {
    metric = {
      route,
      method,
      totalRequests: 0,
      errorCount: 0,
      totalDurationMs: 0,
      minDurationMs: Infinity,
      maxDurationMs: 0,
      lastRequestAt: Date.now(),
      recentDurations: [],
    };
    metrics.set(key, metric);
  }

  metric.totalRequests++;
  metric.totalDurationMs += durationMs;
  metric.lastRequestAt = Date.now();

  if (durationMs < metric.minDurationMs) metric.minDurationMs = durationMs;
  if (durationMs > metric.maxDurationMs) metric.maxDurationMs = durationMs;

  if (statusCode >= 400) metric.errorCount++;

  metric.recentDurations.push(durationMs);
  if (metric.recentDurations.length > MAX_RECENT) {
    metric.recentDurations.shift();
  }
}

/**
 * Calculate percentile from an array of numbers.
 */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

/**
 * Get metrics summary for all routes.
 */
export function getApiMetrics(): {
  routes: Array<{
    route: string;
    method: string;
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    avgDurationMs: number;
    minDurationMs: number;
    maxDurationMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
  }>;
  summary: {
    totalRequests: number;
    totalErrors: number;
    overallErrorRate: number;
    avgDurationMs: number;
    routeCount: number;
  };
} {
  const now = Date.now();
  const routes: Array<{
    route: string;
    method: string;
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    avgDurationMs: number;
    minDurationMs: number;
    maxDurationMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
  }> = [];

  let totalRequests = 0;
  let totalErrors = 0;
  let totalDuration = 0;

  // Clean stale entries and build results
  for (const [key, metric] of metrics.entries()) {
    if (now - metric.lastRequestAt > STALE_THRESHOLD) {
      metrics.delete(key);
      continue;
    }

    const avgMs = metric.totalRequests > 0 ? Math.round(metric.totalDurationMs / metric.totalRequests) : 0;
    const errorRate = metric.totalRequests > 0 ? Math.round((metric.errorCount / metric.totalRequests) * 100) / 100 : 0;

    routes.push({
      route: metric.route,
      method: metric.method,
      totalRequests: metric.totalRequests,
      errorCount: metric.errorCount,
      errorRate,
      avgDurationMs: avgMs,
      minDurationMs: metric.minDurationMs === Infinity ? 0 : metric.minDurationMs,
      maxDurationMs: metric.maxDurationMs,
      p50Ms: Math.round(percentile(metric.recentDurations, 50)),
      p95Ms: Math.round(percentile(metric.recentDurations, 95)),
      p99Ms: Math.round(percentile(metric.recentDurations, 99)),
    });

    totalRequests += metric.totalRequests;
    totalErrors += metric.errorCount;
    totalDuration += metric.totalDurationMs;
  }

  // Sort by total requests descending
  routes.sort((a, b) => b.totalRequests - a.totalRequests);

  return {
    routes,
    summary: {
      totalRequests,
      totalErrors,
      overallErrorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 100) / 100 : 0,
      avgDurationMs: totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 0,
      routeCount: routes.length,
    },
  };
}

/**
 * Get slow routes (avg > threshold ms).
 */
export function getSlowRoutes(thresholdMs: number = 500): Array<{ route: string; method: string; avgMs: number }> {
  const result: Array<{ route: string; method: string; avgMs: number }> = [];
  for (const metric of metrics.values()) {
    const avgMs = metric.totalRequests > 0 ? metric.totalDurationMs / metric.totalRequests : 0;
    if (avgMs > thresholdMs) {
      result.push({ route: metric.route, method: metric.method, avgMs: Math.round(avgMs) });
    }
  }
  return result.sort((a, b) => b.avgMs - a.avgMs);
}

/** Reset for testing */
export function _resetMetricsForTesting(): void {
  metrics.clear();
}
