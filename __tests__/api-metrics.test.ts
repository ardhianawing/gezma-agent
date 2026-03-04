import { describe, it, expect, beforeEach } from 'vitest';
import { recordApiMetric, getApiMetrics, getSlowRoutes, _resetMetricsForTesting } from '@/lib/api-metrics';

describe('API Metrics', () => {
  beforeEach(() => {
    _resetMetricsForTesting();
  });

  it('records and retrieves metrics for a route', () => {
    recordApiMetric('/api/pilgrims', 'GET', 50, 200);
    recordApiMetric('/api/pilgrims', 'GET', 100, 200);
    recordApiMetric('/api/pilgrims', 'GET', 150, 500);

    const metrics = getApiMetrics();
    const pilgrimsGet = metrics.find(m => m.route === '/api/pilgrims' && m.method === 'GET');

    expect(pilgrimsGet).toBeDefined();
    expect(pilgrimsGet!.totalRequests).toBe(3);
    expect(pilgrimsGet!.errorCount).toBe(1);
    expect(pilgrimsGet!.minDuration).toBe(50);
    expect(pilgrimsGet!.maxDuration).toBe(150);
    expect(pilgrimsGet!.avgDuration).toBe(100);
  });

  it('separates metrics by route and method', () => {
    recordApiMetric('/api/pilgrims', 'GET', 50, 200);
    recordApiMetric('/api/pilgrims', 'POST', 100, 201);
    recordApiMetric('/api/users', 'GET', 75, 200);

    const metrics = getApiMetrics();
    expect(metrics.length).toBe(3);
  });

  it('returns slow routes ordered by avg duration', () => {
    recordApiMetric('/api/fast', 'GET', 10, 200);
    recordApiMetric('/api/slow', 'GET', 500, 200);
    recordApiMetric('/api/medium', 'GET', 200, 200);

    const slow = getSlowRoutes(2);
    expect(slow.length).toBe(2);
    expect(slow[0].route).toBe('/api/slow');
    expect(slow[1].route).toBe('/api/medium');
  });

  it('calculates percentiles correctly', () => {
    // Add 100 data points
    for (let i = 1; i <= 100; i++) {
      recordApiMetric('/api/test', 'GET', i, 200);
    }

    const metrics = getApiMetrics();
    const m = metrics.find(m => m.route === '/api/test')!;

    expect(m.totalRequests).toBe(100);
    expect(m.p50).toBe(50);
    expect(m.p95).toBe(95);
    expect(m.p99).toBe(99);
  });

  it('handles reset correctly', () => {
    recordApiMetric('/api/test', 'GET', 50, 200);
    _resetMetricsForTesting();

    const metrics = getApiMetrics();
    expect(metrics.length).toBe(0);
  });

  it('counts errors by status code', () => {
    recordApiMetric('/api/test', 'POST', 50, 200);
    recordApiMetric('/api/test', 'POST', 50, 400);
    recordApiMetric('/api/test', 'POST', 50, 500);

    const metrics = getApiMetrics();
    const m = metrics.find(m => m.route === '/api/test')!;
    expect(m.errorCount).toBe(2); // 400 and 500
  });
});
