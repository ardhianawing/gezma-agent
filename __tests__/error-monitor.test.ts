import { describe, it, expect, beforeEach } from 'vitest';
import { captureException, captureMessage, getRecentErrors, getErrorStats, clearErrors } from '../src/lib/error-monitor';

describe('Error Monitor', () => {
  beforeEach(() => {
    clearErrors();
  });

  describe('captureException', () => {
    it('should return an error ID', () => {
      const id = captureException(new Error('test error'));
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('should handle non-Error objects', () => {
      const id = captureException('string error');
      expect(id).toBeTruthy();
    });

    it('should store error in buffer', () => {
      captureException(new Error('test'), { route: '/api/test' });
      const errors = getRecentErrors();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe('test');
      expect(errors[0].context.route).toBe('/api/test');
    });
  });

  describe('captureMessage', () => {
    it('should return a message ID', () => {
      const id = captureMessage('info message');
      expect(id).toBeTruthy();
    });

    it('should store message with correct level', () => {
      captureMessage('warning msg', 'warning');
      const errors = getRecentErrors();
      expect(errors[0].level).toBe('warning');
    });
  });

  describe('getRecentErrors', () => {
    it('should return errors in reverse chronological order', () => {
      captureException(new Error('first'));
      captureException(new Error('second'));
      captureException(new Error('third'));

      const errors = getRecentErrors();
      expect(errors[0].message).toBe('third');
      expect(errors[2].message).toBe('first');
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        captureException(new Error(`error ${i}`));
      }
      const errors = getRecentErrors(3);
      expect(errors.length).toBe(3);
    });
  });

  describe('getErrorStats', () => {
    it('should count correctly', () => {
      captureException(new Error('err1'));
      captureException(new Error('err2'));
      captureMessage('msg1', 'warning');

      const stats = getErrorStats();
      expect(stats.total).toBe(3);
      expect(stats.byLevel.error).toBe(2);
      expect(stats.byLevel.warning).toBe(1);
    });

    it('should count last 24h', () => {
      captureException(new Error('recent'));
      const stats = getErrorStats();
      expect(stats.last24h).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Buffer limit', () => {
    it('should not exceed 100 items', () => {
      for (let i = 0; i < 120; i++) {
        captureException(new Error(`error ${i}`));
      }
      const stats = getErrorStats();
      expect(stats.total).toBeLessThanOrEqual(100);
    });
  });
});
