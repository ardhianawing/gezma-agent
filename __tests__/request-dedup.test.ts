import { describe, it, expect, beforeEach } from 'vitest';
import { checkDuplicate, cacheResponse, _resetDedupForTesting } from '@/lib/request-dedup';

describe('Request Deduplication', () => {
  beforeEach(() => {
    _resetDedupForTesting();
  });

  it('returns null for first request', () => {
    const result = checkDuplicate('key-1', '/api/test', 'POST');
    expect(result).toBeNull();
  });

  it('returns cached response for duplicate request', () => {
    const key = 'key-2';
    const cachedResponse = { status: 201, body: { id: 'abc' } };

    cacheResponse(key, '/api/test', 'POST', cachedResponse);
    const result = checkDuplicate(key, '/api/test', 'POST');

    expect(result).toEqual(cachedResponse);
  });

  it('differentiates requests by key', () => {
    cacheResponse('key-a', '/api/test', 'POST', { status: 200, body: { a: 1 } });

    const result = checkDuplicate('key-b', '/api/test', 'POST');
    expect(result).toBeNull();
  });

  it('differentiates requests by method', () => {
    cacheResponse('key-1', '/api/test', 'POST', { status: 200, body: {} });

    const result = checkDuplicate('key-1', '/api/test', 'PUT');
    expect(result).toBeNull();
  });

  it('differentiates requests by path', () => {
    cacheResponse('key-1', '/api/test-a', 'POST', { status: 200, body: {} });

    const result = checkDuplicate('key-1', '/api/test-b', 'POST');
    expect(result).toBeNull();
  });

  it('handles reset correctly', () => {
    cacheResponse('key-1', '/api/test', 'POST', { status: 200, body: {} });
    _resetDedupForTesting();

    const result = checkDuplicate('key-1', '/api/test', 'POST');
    expect(result).toBeNull();
  });
});
