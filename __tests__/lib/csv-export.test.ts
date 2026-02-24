import { describe, it, expect } from 'vitest'
import { generateCSV } from '@/lib/csv-export'

describe('generateCSV', () => {
  it('generates CSV with headers and rows', () => {
    const csv = generateCSV(['Name', 'Age'], [['Alice', '30'], ['Bob', '25']])
    expect(csv).toContain('Name,Age')
    expect(csv).toContain('Alice,30')
    expect(csv).toContain('Bob,25')
  })

  it('starts with UTF-8 BOM', () => {
    const csv = generateCSV(['A'], [['1']])
    expect(csv.charCodeAt(0)).toBe(0xFEFF)
  })

  it('escapes values containing commas', () => {
    const csv = generateCSV(['Name'], [['Doe, John']])
    expect(csv).toContain('"Doe, John"')
  })

  it('escapes values containing double quotes', () => {
    const csv = generateCSV(['Name'], [['He said "hello"']])
    expect(csv).toContain('"He said ""hello"""')
  })

  it('escapes values containing newlines', () => {
    const csv = generateCSV(['Desc'], [['Line1\nLine2']])
    expect(csv).toContain('"Line1\nLine2"')
  })

  it('handles empty rows', () => {
    const csv = generateCSV(['Name', 'Age'], [])
    // Should have only BOM + header line
    const lines = csv.substring(1).split('\n')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toBe('Name,Age')
  })

  it('handles empty headers', () => {
    const csv = generateCSV([], [])
    // BOM + empty line
    expect(csv).toBe('\uFEFF')
  })

  it('does not escape plain values', () => {
    const csv = generateCSV(['Name'], [['Alice']])
    expect(csv).not.toContain('"Alice"')
    expect(csv).toContain('Alice')
  })

  it('joins rows with newlines', () => {
    const csv = generateCSV(['A'], [['1'], ['2'], ['3']])
    const lines = csv.substring(1).split('\n')
    expect(lines).toHaveLength(4) // header + 3 rows
  })

  it('escapes headers containing commas', () => {
    const csv = generateCSV(['First, Last'], [['John']])
    expect(csv).toContain('"First, Last"')
  })
})
