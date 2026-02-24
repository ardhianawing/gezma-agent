import { describe, it, expect } from 'vitest'
import { AppError, type ErrorCode } from '@/lib/errors'

describe('AppError', () => {
  it('creates error with correct properties', () => {
    const err = new AppError('NOT_FOUND', 'User not found')
    expect(err.message).toBe('User not found')
    expect(err.code).toBe('NOT_FOUND')
    expect(err.name).toBe('AppError')
  })

  it('is instance of Error', () => {
    const err = new AppError('NOT_FOUND', 'test')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
  })

  it('stores optional details', () => {
    const details = { field: 'email', reason: 'duplicate' }
    const err = new AppError('CONFLICT', 'Email exists', details)
    expect(err.details).toEqual(details)
  })

  it('has undefined details when not provided', () => {
    const err = new AppError('NOT_FOUND', 'test')
    expect(err.details).toBeUndefined()
  })

  const statusCases: [ErrorCode, number][] = [
    ['NOT_FOUND', 404],
    ['CONFLICT', 409],
    ['VALIDATION_ERROR', 400],
    ['UNAUTHORIZED', 401],
    ['FORBIDDEN', 403],
    ['BAD_REQUEST', 400],
  ]

  it.each(statusCases)('maps %s to status %d', (code, expectedStatus) => {
    const err = new AppError(code, 'test')
    expect(err.statusCode).toBe(expectedStatus)
  })

  it('VALIDATION_ERROR and BAD_REQUEST both map to 400', () => {
    expect(new AppError('VALIDATION_ERROR', 'a').statusCode).toBe(
      new AppError('BAD_REQUEST', 'b').statusCode
    )
  })

  it('has stack trace', () => {
    const err = new AppError('NOT_FOUND', 'test')
    expect(err.stack).toBeDefined()
    expect(err.stack).toContain('AppError')
  })
})
