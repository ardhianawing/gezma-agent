import { describe, it, expect } from 'vitest';
import { createServiceSchema, updateServiceSchema, createDocumentSchema } from '../../src/lib/validations/services';

describe('Service Validations', () => {
  describe('createServiceSchema', () => {
    it('should accept valid service data', () => {
      const result = createServiceSchema.safeParse({
        title: 'Konsultasi Legal',
        description: 'Pendampingan izin PPIU',
        category: 'legal',
        ctaText: 'Hubungi Legal',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = createServiceSchema.safeParse({
        title: '',
        description: 'Desc',
        category: 'legal',
        ctaText: 'CTA',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const result = createServiceSchema.safeParse({
        title: 'Test',
        description: 'Desc',
        category: 'invalid_category',
        ctaText: 'CTA',
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid categories', () => {
      const categories = ['legal', 'visa', 'dokumen', 'support', 'asuransi', 'komunitas'];
      for (const category of categories) {
        const result = createServiceSchema.safeParse({
          title: 'Test',
          description: 'Desc',
          category,
          ctaText: 'CTA',
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid hex color', () => {
      const result = createServiceSchema.safeParse({
        title: 'Test',
        description: 'Desc',
        category: 'legal',
        ctaText: 'CTA',
        color: 'not-a-color',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid hex color', () => {
      const result = createServiceSchema.safeParse({
        title: 'Test',
        description: 'Desc',
        category: 'legal',
        ctaText: 'CTA',
        color: '#2563EB',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateServiceSchema', () => {
    it('should accept partial update', () => {
      const result = updateServiceSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = updateServiceSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('createDocumentSchema', () => {
    it('should accept valid document data', () => {
      const result = createDocumentSchema.safeParse({
        name: 'Template Kontrak',
        format: 'PDF',
        fileSize: '245 KB',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid format', () => {
      const result = createDocumentSchema.safeParse({
        name: 'Test',
        format: 'TXT',
        fileSize: '100 KB',
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid formats', () => {
      for (const format of ['PDF', 'XLSX', 'DOCX']) {
        const result = createDocumentSchema.safeParse({
          name: 'Test',
          format,
          fileSize: '100 KB',
        });
        expect(result.success).toBe(true);
      }
    });

    it('should accept all valid categories', () => {
      for (const category of ['general', 'template', 'sop', 'checklist']) {
        const result = createDocumentSchema.safeParse({
          name: 'Test',
          format: 'PDF',
          fileSize: '100 KB',
          category,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
