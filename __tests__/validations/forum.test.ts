import { describe, it, expect } from 'vitest'
import {
  createForumThreadSchema,
  updateForumThreadSchema,
  createForumReplySchema,
} from '@/lib/validations/forum'

const validThread = {
  title: 'Tips memilih hotel dekat Masjidil Haram',
  content: 'Berikut beberapa tips yang bisa membantu agen travel dalam memilih hotel.',
  category: 'sharing' as const,
  tags: ['hotel', 'makkah'],
}

describe('createForumThreadSchema', () => {
  it('accepts valid thread', () => {
    expect(createForumThreadSchema.safeParse(validThread).success).toBe(true)
  })

  it('rejects title shorter than 5 chars', () => {
    expect(createForumThreadSchema.safeParse({ ...validThread, title: 'Hi' }).success).toBe(false)
  })

  it('rejects title longer than 200 chars', () => {
    expect(createForumThreadSchema.safeParse({ ...validThread, title: 'x'.repeat(201) }).success).toBe(false)
  })

  it('rejects content shorter than 20 chars', () => {
    expect(createForumThreadSchema.safeParse({ ...validThread, content: 'Terlalu pendek' }).success).toBe(false)
  })

  it('rejects invalid category', () => {
    expect(createForumThreadSchema.safeParse({ ...validThread, category: 'invalid' }).success).toBe(false)
  })

  it('accepts all valid categories', () => {
    for (const cat of ['review', 'regulasi', 'operasional', 'sharing', 'scam', 'tanya']) {
      expect(createForumThreadSchema.safeParse({ ...validThread, category: cat }).success).toBe(true)
    }
  })

  it('rejects more than 5 tags', () => {
    expect(createForumThreadSchema.safeParse({ ...validThread, tags: ['a', 'b', 'c', 'd', 'e', 'f'] }).success).toBe(false)
  })

  it('defaults tags to empty array', () => {
    const { tags, ...noTags } = validThread
    const result = createForumThreadSchema.safeParse(noTags)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.tags).toEqual([])
  })
})

describe('updateForumThreadSchema', () => {
  it('accepts partial update', () => {
    expect(updateForumThreadSchema.safeParse({ title: 'Updated Title Here' }).success).toBe(true)
  })

  it('accepts empty object', () => {
    expect(updateForumThreadSchema.safeParse({}).success).toBe(true)
  })

  it('accepts boolean fields', () => {
    expect(updateForumThreadSchema.safeParse({ isSolved: true, isLocked: false }).success).toBe(true)
  })

  it('still validates title min length', () => {
    expect(updateForumThreadSchema.safeParse({ title: 'Hi' }).success).toBe(false)
  })
})

describe('createForumReplySchema', () => {
  it('accepts valid reply', () => {
    expect(createForumReplySchema.safeParse({ content: 'Terima kasih atas informasinya' }).success).toBe(true)
  })

  it('rejects content shorter than 3 chars', () => {
    expect(createForumReplySchema.safeParse({ content: 'Ok' }).success).toBe(false)
  })

  it('rejects content longer than 5000 chars', () => {
    expect(createForumReplySchema.safeParse({ content: 'x'.repeat(5001) }).success).toBe(false)
  })
})
