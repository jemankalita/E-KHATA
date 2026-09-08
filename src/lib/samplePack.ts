import { SAMPLE_PACKS } from '@/data/catalog'

export type SamplePack = (typeof SAMPLE_PACKS)[number]

export function samplePackFromFileName(fileName: string | undefined): SamplePack | null {
  if (!fileName) return null
  const base = fileName.replace(/\\/g, '/').split('/').pop()?.toLowerCase() ?? ''
  const canonical = base.replace(/\s*\(\d+\)(?=\.[^.]+$)/, '')
  if (!canonical) return null
  return SAMPLE_PACKS.find((pack) => pack.image.split('/').pop()?.toLowerCase() === canonical) ?? null
}
