import { describe, it, expect } from 'vitest'
import {
  createNewsArticleSchema,
  updateNewsArticleSchema,
} from '@/lib/validations/news'

const validArticle = {
  title: 'Peraturan Baru Visa Umrah 2025',
  excerpt: 'Pemerintah Arab Saudi mengeluarkan regulasi baru untuk visa umrah.',
  content: 'Dalam peraturan baru ini, ada beberapa perubahan signifikan yang perlu diperhatikan oleh seluruh agen travel.',
  category: 'regulasi' as const,
  author: 'Admin Gezma',
  authorRole: 'System Admin',
}

describe('createNewsArticleSchema', () => {
  it('accepts valid article', () => {
    expect(createNewsArticleSchema.safeParse(validArticle).success).toBe(true)
  })

  it('rejects title shorter than 5 chars', () => {
    expect(createNewsArticleSchema.safeParse({ ...validArticle, title: 'Hi' }).success).toBe(false)
  })

  it('rejects title longer than 300 chars', () => {
    expect(createNewsArticleSchema.safeParse({ ...validArticle, title: 'x'.repeat(301) }).success).toBe(false)
  })

  it('rejects excerpt shorter than 10 chars', () => {
    expect(createNewsArticleSchema.safeParse({ ...validArticle, excerpt: 'Short' }).success).toBe(false)
  })

  it('rejects excerpt longer than 500 chars', () => {
    expect(createNewsArticleSchema.safeParse({ ...validArticle, excerpt: 'x'.repeat(501) }).success).toBe(false)
  })

  it('rejects content shorter than 20 chars', () => {
    expect(createNewsArticleSchema.safeParse({ ...validArticle, content: 'Terlalu pendek' }).success).toBe(false)
  })

  it('rejects invalid category', () => {
    expect(createNewsArticleSchema.safeParse({ ...validArticle, category: 'invalid' }).success).toBe(false)
  })

  it('accepts all valid categories', () => {
    for (const cat of ['regulasi', 'pengumuman', 'event', 'tips', 'peringatan']) {
      expect(createNewsArticleSchema.safeParse({ ...validArticle, category: cat }).success).toBe(true)
    }
  })

  it('rejects author shorter than 2 chars', () => {
    expect(createNewsArticleSchema.safeParse({ ...validArticle, author: 'A' }).success).toBe(false)
  })

  it('rejects authorRole shorter than 2 chars', () => {
    expect(createNewsArticleSchema.safeParse({ ...validArticle, authorRole: 'A' }).success).toBe(false)
  })

  it('rejects more than 10 tags', () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`)
    expect(createNewsArticleSchema.safeParse({ ...validArticle, tags }).success).toBe(false)
  })

  it('defaults readTime to 5', () => {
    const result = createNewsArticleSchema.safeParse(validArticle)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.readTime).toBe(5)
  })

  it('defaults isPublished to false', () => {
    const result = createNewsArticleSchema.safeParse(validArticle)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.isPublished).toBe(false)
  })
})

describe('updateNewsArticleSchema', () => {
  it('accepts partial update', () => {
    expect(updateNewsArticleSchema.safeParse({ title: 'Updated Title Here' }).success).toBe(true)
  })

  it('accepts empty object', () => {
    expect(updateNewsArticleSchema.safeParse({}).success).toBe(true)
  })

  it('still validates field constraints', () => {
    expect(updateNewsArticleSchema.safeParse({ title: 'Hi' }).success).toBe(false)
  })
})
