import jsQR from 'jsqr'

const MAX_EDGE = 1280

export function decodeQrFromRgba(data: Uint8ClampedArray, width: number, height: number): string | null {
  if (width < 1 || height < 1) return null
  const code = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })
  return code?.data ?? null
}

function drawSourceToImageData(source: CanvasImageSource, width: number, height: number): ImageData | null {
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height, 1))
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not open this photo.'))
    image.src = url
  })
}

async function blobToImageData(file: Blob): Promise<ImageData> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      const imageData = drawSourceToImageData(bitmap, bitmap.width, bitmap.height)
      bitmap.close?.()
      if (imageData) return imageData
    } catch {
      /* fall through to HTMLImageElement */
    }
  }

  const url = URL.createObjectURL(file)
  try {
    const image = await loadImage(url)
    const imageData = drawSourceToImageData(image, image.naturalWidth || image.width, image.naturalHeight || image.height)
    if (!imageData) throw new Error('Could not read this photo.')
    return imageData
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function decodeQrFromFile(file: Blob): Promise<string | null> {
  const imageData = await blobToImageData(file)
  return decodeQrFromRgba(imageData.data, imageData.width, imageData.height)
}

export function decodeQrFromVideoFrame(video: HTMLVideoElement): string | null {
  const width = video.videoWidth
  const height = video.videoHeight
  if (width < 2 || height < 2) return null
  const imageData = drawSourceToImageData(video, width, height)
  if (!imageData) return null
  return decodeQrFromRgba(imageData.data, imageData.width, imageData.height)
}
