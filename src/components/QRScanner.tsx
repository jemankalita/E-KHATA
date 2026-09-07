import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

export function QRScanner({
  active,
  payload,
}: {
  active: boolean
  payload: string
}) {
  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="relative aspect-square rounded-[28px] bg-card p-5">
        <span className="absolute top-3 left-3 h-8 w-8 rounded-tl-lg border-t-2 border-l-2 border-primary" />
        <span className="absolute top-3 right-3 h-8 w-8 rounded-tr-lg border-t-2 border-r-2 border-primary" />
        <span className="absolute bottom-3 left-3 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-primary" />
        <span className="absolute bottom-3 right-3 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-primary" />

        <div className="relative grid h-full place-items-center overflow-hidden rounded-[14px] bg-white p-3">
          <QRCodeSVG value={payload} size={188} level="M" bgColor="#ffffff" fgColor="#080B10" />
          {active ? (
            <motion.div
              className="pointer-events-none absolute inset-x-2 h-0.5 bg-primary shadow-[0_0_18px_rgba(216,203,184,0.75)]"
              initial={{ top: '12%' }}
              animate={{ top: ['12%', '86%', '12%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
