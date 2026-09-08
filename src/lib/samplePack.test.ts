import { describe, expect, it } from 'vitest'
import { samplePackFromFileName } from './samplePack'

describe('samplePackFromFileName', () => {
  it('maps the Maggi sample photo filename to Maggi OCR text', () => {
    expect(samplePackFromFileName('03-maggi.png')?.id).toBe('maggi')
    expect(samplePackFromFileName('03-maggi.png')?.ocrText).toContain('MAGGI')
  })

  it('maps a Windows download path and duplicate suffix', () => {
    expect(samplePackFromFileName('C:\\\\Users\\\\Jeman\\\\01-amul-milk.png')?.id).toBe('milk')
    expect(samplePackFromFileName('02-parle-g (1).png')?.id).toBe('parle-g')
  })

  it('ignores unrelated photos', () => {
    expect(samplePackFromFileName('screenshot.png')).toBeNull()
    expect(samplePackFromFileName(undefined)).toBeNull()
  })
})
