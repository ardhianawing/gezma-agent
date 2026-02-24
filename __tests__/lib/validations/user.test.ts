import { describe, it, expect } from 'vitest'
import { createUserSchema, updateUserSchema } from '@/lib/validations/user'

describe('createUserSchema', () => {
  it('accepts valid user', () => {
    const result = createUserSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('defaults role to staff', () => {
    const result = createUserSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.role).toBe('staff')
    }
  })

  it('rejects empty name', () => {
    expect(createUserSchema.safeParse({
      name: '',
      email: 'john@example.com',
      password: 'password123',
    }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(createUserSchema.safeParse({
      name: 'John',
      email: 'not-email',
      password: 'password123',
    }).success).toBe(false)
  })

  it('rejects short password', () => {
    expect(createUserSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: '1234567',
    }).success).toBe(false)
  })

  it('accepts valid role', () => {
    const result = createUserSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
      role: 'admin',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.role).toBe('admin')
  })

  it('rejects invalid role', () => {
    expect(createUserSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
      role: 'superadmin',
    }).success).toBe(false)
  })
})

describe('updateUserSchema', () => {
  it('accepts partial update', () => {
    expect(updateUserSchema.safeParse({ name: 'Updated Name' }).success).toBe(true)
  })

  it('accepts empty object', () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true)
  })

  it('accepts isActive boolean', () => {
    expect(updateUserSchema.safeParse({ isActive: false }).success).toBe(true)
  })
})
