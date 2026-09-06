import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sampleRate = 22050
const duration = 0.55
const samples = Math.floor(sampleRate * duration)
const buffer = Buffer.alloc(44 + samples * 2)

buffer.write('RIFF', 0)
buffer.writeUInt32LE(36 + samples * 2, 4)
buffer.write('WAVE', 8)
buffer.write('fmt ', 12)
buffer.writeUInt32LE(16, 16)
buffer.writeUInt16LE(1, 20)
buffer.writeUInt16LE(1, 22)
buffer.writeUInt32LE(sampleRate, 24)
buffer.writeUInt32LE(sampleRate * 2, 28)
buffer.writeUInt16LE(2, 32)
buffer.writeUInt16LE(16, 34)
buffer.write('data', 36)
buffer.writeUInt32LE(samples * 2, 40)

for (let i = 0; i < samples; i += 1) {
  const t = i / sampleRate
  const envelope = Math.sin(Math.PI * (i / samples))
  const sample = Math.sin(2 * Math.PI * 880 * t) * envelope * 0.28
  buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2)
}

const dir = join(dirname(fileURLToPath(import.meta.url)), '../public/audio')
mkdirSync(dir, { recursive: true })
writeFileSync(join(dir, 'confirm.wav'), buffer)
writeFileSync(join(dir, 'confirm.mp3'), buffer)
