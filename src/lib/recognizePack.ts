import { findProductInPackText } from '@/lib/resolveScannedCharge'
import type { Product } from '@/legacy/types'

export async function readPackText(imageUrl: string): Promise<string> {
  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng')
    try {
      const result = await worker.recognize(imageUrl)
      return result.data.text.trim()
    } finally {
      await worker.terminate()
    }
  } catch {
    return ''
  }
}

export async function recognizePackLabel(imageUrl: string): Promise<Product | null> {
  const text = await readPackText(imageUrl)
  return findProductInPackText(text)
}
