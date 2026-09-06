import { useTheme } from '@/hooks/useTheme'
import { useEffect, useRef } from 'react'

type Theme = 'light' | 'dark'

type Star = {
  x: number
  y: number
  r: number
  twinkle: number
  twinkleSpeed: number
  driftX: number
  driftY: number
  depth: number
  tone: [number, number, number]
  flare: boolean
}

type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }

type Comet = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  kind: 'gold' | 'cyan'
  size: number
  sparks: Spark[]
}

type Cloud = {
  x: number
  y: number
  speed: number
  sprite: HTMLCanvasElement
}

type Nebula = {
  ox: number
  oy: number
  radius: number
  hue: string
  angle: number
  orbit: number
  spin: number
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function createGrainTile() {
  const tile = document.createElement('canvas')
  tile.width = 128
  tile.height = 128
  const ctx = tile.getContext('2d')
  if (!ctx) return tile
  const image = ctx.createImageData(128, 128)
  for (let i = 0; i < image.data.length; i += 4) {
    const n = 90 + Math.random() * 140
    image.data[i] = n
    image.data[i + 1] = n
    image.data[i + 2] = n
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  return tile
}

function puff(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, alpha: number) {
  const glow = ctx.createRadialGradient(x, y - ry * 0.35, rx * 0.08, x, y + ry * 0.15, rx)
  glow.addColorStop(0, `rgba(255,255,255,${alpha})`)
  glow.addColorStop(0.42, `rgba(255,255,255,${alpha * 0.72})`)
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

function createCloudBank(width: number, height: number, density: number) {
  const tile = document.createElement('canvas')
  tile.width = Math.max(640, Math.round(width))
  tile.height = Math.max(120, Math.round(height))
  const ctx = tile.getContext('2d')
  if (!ctx) return tile

  const count = Math.round((tile.width / 70) * density)
  for (let i = 0; i < count; i += 1) {
    const x = (i / count) * tile.width + rand(-18, 18)
    const y = tile.height * rand(0.38, 0.72)
    const rx = rand(48, 110)
    const ry = rx * rand(0.42, 0.62)
    puff(ctx, x, y, rx, ry, rand(0.55, 0.92))
    puff(ctx, x + rand(-24, 24), y + rand(6, 18), rx * 0.7, ry * 0.7, rand(0.35, 0.7))
  }

  ctx.globalCompositeOperation = 'source-atop'
  const shade = ctx.createLinearGradient(0, tile.height * 0.2, 0, tile.height)
  shade.addColorStop(0, 'rgba(255,255,255,0)')
  shade.addColorStop(1, 'rgba(186,208,230,0.28)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, tile.width, tile.height)
  ctx.globalCompositeOperation = 'source-over'
  return tile
}

function spawnComet(width: number, height: number): Comet {
  const fromRight = Math.random() > 0.28
  const x = fromRight ? rand(width * 0.4, width + 90) : rand(-50, width * 0.25)
  const y = fromRight ? rand(-90, height * 0.32) : rand(-50, height * 0.12)
  const speed = rand(3.4, 7.8)
  const angle = fromRight ? rand(2.22, 2.55) : rand(0.52, 0.86)
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: rand(95, 180),
    kind: Math.random() > 0.4 ? 'gold' : 'cyan',
    size: rand(1.3, 3.1),
    sparks: [],
  }
}

function seedStars(width: number, height: number): Star[] {
  const tones: Array<[number, number, number]> = [
    [255, 252, 245],
    [230, 238, 255],
    [255, 236, 210],
    [210, 230, 255],
  ]
  return Array.from({ length: 260 }, () => {
    const depth = rand(0.25, 1)
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: rand(0.35, 1.9) * depth,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: rand(0.008, 0.028),
      driftX: rand(-0.035, 0.035),
      driftY: rand(0.01, 0.055),
      depth,
      tone: tones[Math.floor(Math.random() * tones.length)],
      flare: Math.random() > 0.86 && depth > 0.7,
    }
  })
}

function seedScene(width: number, height: number, theme: Theme) {
  const stars = theme === 'dark' ? seedStars(width, height) : []
  const nebulae: Nebula[] =
    theme === 'dark'
      ? [
          { ox: width * 0.2, oy: height * 0.26, radius: Math.max(width, height) * 0.4, hue: '118, 86, 210', angle: 0, orbit: 36, spin: 0.0012 },
          { ox: width * 0.74, oy: height * 0.16, radius: Math.max(width, height) * 0.32, hue: '64, 118, 210', angle: 1.4, orbit: 48, spin: -0.0009 },
          { ox: width * 0.56, oy: height * 0.7, radius: Math.max(width, height) * 0.34, hue: '168, 82, 160', angle: 2.6, orbit: 30, spin: 0.001 },
        ]
      : []

  const clouds: Cloud[] =
    theme === 'light'
      ? [
          { x: 0, y: height * 0.58, speed: 0.18, sprite: createCloudBank(width * 1.35, height * 0.28, 0.9) },
          { x: -width * 0.2, y: height * 0.66, speed: 0.32, sprite: createCloudBank(width * 1.5, height * 0.32, 1.15) },
          { x: -width * 0.1, y: height * 0.74, speed: 0.48, sprite: createCloudBank(width * 1.6, height * 0.34, 1.3) },
        ]
      : []

  const comets = theme === 'dark' ? Array.from({ length: 5 }, () => spawnComet(width, height)) : []
  return { stars, nebulae, clouds, comets, grain: createGrainTile() }
}

function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number, theme: Theme, t: number) {
  if (theme === 'dark') {
    const sky = ctx.createRadialGradient(width * 0.55, height * 0.2, 20, width * 0.5, height * 0.45, height * 0.95)
    sky.addColorStop(0, '#14102a')
    sky.addColorStop(0.38, '#07060f')
    sky.addColorStop(1, '#000000')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, width, height)
    return
  }

  const sky = ctx.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, '#1f74c8')
  sky.addColorStop(0.28, '#3b94de')
  sky.addColorStop(0.58, '#6bb4ea')
  sky.addColorStop(0.82, '#9fd0f3')
  sky.addColorStop(1, '#cfe6f8')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, height)

  const sunX = width * 0.72
  const sunY = height * 0.16 + Math.sin(t * 0.0002) * 6
  const sun = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, width * 0.55)
  sun.addColorStop(0, 'rgba(255,248,220,0.95)')
  sun.addColorStop(0.12, 'rgba(255,230,170,0.38)')
  sun.addColorStop(1, 'rgba(255,220,150,0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, width, height)
}

function drawNebulae(ctx: CanvasRenderingContext2D, nebulae: Nebula[], t: number) {
  ctx.globalCompositeOperation = 'lighter'
  for (const nebula of nebulae) {
    nebula.angle += nebula.spin
    const x = nebula.ox + Math.cos(nebula.angle) * nebula.orbit
    const y = nebula.oy + Math.sin(nebula.angle * 0.85) * nebula.orbit * 0.55
    const pulse = 0.7 + Math.sin(t * 0.00035 + nebula.angle) * 0.08
    const glow = ctx.createRadialGradient(x, y, 0, x, y, nebula.radius)
    glow.addColorStop(0, `rgba(${nebula.hue},${0.16 * pulse})`)
    glow.addColorStop(0.4, `rgba(${nebula.hue},${0.07 * pulse})`)
    glow.addColorStop(1, `rgba(${nebula.hue},0)`)
    ctx.fillStyle = glow
    ctx.fillRect(x - nebula.radius, y - nebula.radius, nebula.radius * 2, nebula.radius * 2)
  }
  ctx.globalCompositeOperation = 'source-over'
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], width: number, height: number, moving: boolean) {
  for (const star of stars) {
    if (moving) {
      star.twinkle += star.twinkleSpeed
      star.x += star.driftX * star.depth
      star.y += star.driftY * star.depth
      if (star.x < -6) star.x = width + 6
      if (star.x > width + 6) star.x = -6
      if (star.y > height + 6) star.y = -6
    }
    const flicker = 0.28 + (Math.sin(star.twinkle) * 0.5 + 0.5) * 0.72
    const [r, g, b] = star.tone
    ctx.fillStyle = `rgba(${r},${g},${b},${flicker})`
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
    ctx.fill()

    if (star.flare) {
      const len = 4 + star.r * 5 * flicker
      ctx.globalAlpha = flicker * 0.45
      ctx.fillRect(star.x - len, star.y - 0.4, len * 2, 0.8)
      ctx.fillRect(star.x - 0.4, star.y - len, 0.8, len * 2)
      ctx.globalAlpha = 1
    }
  }
}

function drawComets(ctx: CanvasRenderingContext2D, comets: Comet[], width: number, height: number, moving: boolean) {
  for (let i = comets.length - 1; i >= 0; i -= 1) {
    const comet = comets[i]
    if (moving) {
      comet.x += comet.vx
      comet.y += comet.vy
      comet.life += 1
      if (Math.random() > 0.32) {
        comet.sparks.push({
          x: comet.x - comet.vx * rand(0, 7),
          y: comet.y - comet.vy * rand(0, 7),
          vx: comet.vx * 0.14 + rand(-0.55, 0.55),
          vy: comet.vy * 0.14 + rand(-0.55, 0.55),
          life: 0,
          maxLife: rand(12, 26),
        })
      }
    }

    const head = comet.kind === 'gold' ? '255,230,150' : '170,240,255'
    const trail = comet.kind === 'gold' ? '255,140,40' : '80,190,255'
    const fade = 1 - comet.life / comet.maxLife
    const tx = comet.x - comet.vx * 20
    const ty = comet.y - comet.vy * 20
    const streak = ctx.createLinearGradient(comet.x, comet.y, tx, ty)
    streak.addColorStop(0, `rgba(${head},${0.96 * fade})`)
    streak.addColorStop(0.4, `rgba(${trail},${0.5 * fade})`)
    streak.addColorStop(1, `rgba(${trail},0)`)
    ctx.strokeStyle = streak
    ctx.lineWidth = comet.size * (comet.kind === 'gold' ? 2.3 : 1.5)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(comet.x, comet.y)
    ctx.lineTo(tx, ty)
    ctx.stroke()

    ctx.fillStyle = `rgba(${head},${fade})`
    ctx.beginPath()
    ctx.arc(comet.x, comet.y, comet.size * 1.3, 0, Math.PI * 2)
    ctx.fill()

    for (let s = comet.sparks.length - 1; s >= 0; s -= 1) {
      const spark = comet.sparks[s]
      if (moving) {
        spark.x += spark.vx
        spark.y += spark.vy
        spark.life += 1
      }
      const alpha = 1 - spark.life / spark.maxLife
      ctx.fillStyle = `rgba(${trail},${alpha * 0.7})`
      ctx.fillRect(spark.x, spark.y, 1.3, 1.3)
      if (spark.life >= spark.maxLife) comet.sparks.splice(s, 1)
    }

    if (comet.x < -90 || comet.y > height + 90 || comet.x > width + 130 || comet.life > comet.maxLife) {
      comets[i] = spawnComet(width, height)
    }
  }

  if (moving && comets.length < 7 && Math.random() > 0.986) {
    comets.push(spawnComet(width, height))
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, clouds: Cloud[], width: number, moving: boolean) {
  for (const cloud of clouds) {
    if (moving) {
      cloud.x += cloud.speed
      cloud.bob += cloud.bobSpeed
    }
    if (cloud.x > width + 40) cloud.x = -cloud.sprite.width - 30
    const y = cloud.y + Math.sin(cloud.bob) * 8
    ctx.drawImage(cloud.sprite, cloud.x, y)
  }
}

function drawGrain(ctx: CanvasRenderingContext2D, tile: HTMLCanvasElement, width: number, height: number, theme: Theme) {
  ctx.save()
  ctx.globalAlpha = theme === 'dark' ? 0.16 : 0.2
  ctx.globalCompositeOperation = theme === 'dark' ? 'soft-light' : 'overlay'
  const pattern = ctx.createPattern(tile, 'repeat')
  if (pattern) {
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, width, height)
  }
  ctx.restore()
}

export function AtmosphericBackdrop() {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let width = 0
    let height = 0
    let frame = 0
    let scene = seedScene(1, 1, theme)
    const moving = !prefersReducedMotion()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = Math.max(window.innerHeight, 1)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scene = seedScene(width, height, theme)
    }

    resize()
    window.addEventListener('resize', resize)

    const tick = (t: number) => {
      drawSky(ctx, width, height, theme, t)
      if (theme === 'dark') {
        drawNebulae(ctx, scene.nebulae, t)
        drawStars(ctx, scene.stars, width, height, moving)
        drawComets(ctx, scene.comets, width, height, moving)
      } else {
        drawClouds(ctx, scene.clouds, width, moving)
      }
      drawGrain(ctx, scene.grain, width, height, theme)
      if (moving) frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(frame)
    }
  }, [theme])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
